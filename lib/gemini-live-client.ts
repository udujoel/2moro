/**
 * Gemini Live Client for browser-side real-time audio streaming
 * Handles WebSocket connection, audio encoding/decoding, and playback
 */

export interface GeminiLiveConfig {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onAudioReceived?: (audioData: Float32Array) => void;
    onError?: (error: string) => void;
    onInterrupted?: () => void;
    onSpeakingStart?: () => void;
    onSpeakingEnd?: () => void;
}

export class GeminiLiveClient {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private audioWorklet: AudioWorkletNode | null = null;
    private isConnected = false;
    private isRecording = false;
    private config: GeminiLiveConfig;
    private audioQueue: Float32Array[] = [];
    private isPlaying = false;

    constructor(config: GeminiLiveConfig = {}) {
        this.config = config;
    }

    /**
     * Connect to the Gemini Live WebSocket endpoint
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Use SSE-based connection for better Next.js compatibility
                this.audioContext = new AudioContext({ sampleRate: 24000 });
                this.isConnected = true;
                this.config.onConnect?.();
                resolve();
            } catch (error: any) {
                this.config.onError?.(error.message);
                reject(error);
            }
        });
    }

    /**
     * Start recording from microphone with optional device selection
     */
    async startRecording(deviceId?: string): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
        }

        try {
            // Build audio constraints with optional device ID
            const audioConstraints: MediaTrackConstraints = {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
            };

            // If a specific device is requested, add it to constraints
            if (deviceId) {
                audioConstraints.deviceId = { exact: deviceId };
            }

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: audioConstraints
            });

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);

            // Create a script processor for audio capture
            // Note: ScriptProcessorNode is deprecated but widely supported
            // For production, use AudioWorklet
            const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
                if (!this.isRecording) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32 to Int16 PCM
                const pcmData = this.float32ToInt16(inputData);
                // Convert to base64
                const base64 = this.arrayBufferToBase64(pcmData.buffer);

                // Send audio chunk
                this.sendAudioChunk(base64);
            };

            source.connect(processor);
            processor.connect(this.audioContext.destination);

            this.isRecording = true;
            console.log("[GeminiLive] Recording started");

        } catch (error: any) {
            console.error("[GeminiLive] Error starting recording:", error);
            this.config.onError?.(error.message);
            throw error;
        }
    }

    /**
     * Stop recording
     */
    stopRecording(): void {
        this.isRecording = false;
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        console.log("[GeminiLive] Recording stopped");
    }

    /**
     * Send audio chunk to the server
     */
    private async sendAudioChunk(base64Audio: string): Promise<void> {
        // For SSE-based approach, we accumulate audio and send in batches
        // This is a simplified implementation
        if (!this.isConnected) return;

        try {
            const response = await fetch("/api/oracle/live", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio: base64Audio })
            });

            if (!response.ok) {
                throw new Error("Failed to send audio");
            }

            // Handle SSE response
            const reader = response.body?.getReader();
            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                const lines = text.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            this.handleServerMessage(data);
                        } catch (e) {
                            // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            }

        } catch (error: any) {
            console.error("[GeminiLive] Send error:", error);
        }
    }

    /**
     * Send a text message (for typing input)
     */
    async sendText(text: string): Promise<string> {
        if (!text.trim()) return "";

        try {
            const response = await fetch("/api/oracle/live", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error("Failed to send text");
            }

            // Collect audio responses
            const audioChunks: string[] = [];
            const reader = response.body?.getReader();
            if (!reader) return "";

            this.config.onSpeakingStart?.();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                const lines = text.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === "audio" && data.data) {
                                audioChunks.push(data.data);
                                // Play audio as it arrives
                                await this.playAudioChunk(data.data);
                            } else if (data.type === "error") {
                                this.config.onError?.(data.message);
                            } else if (data.type === "complete") {
                                this.config.onSpeakingEnd?.();
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }

            this.config.onSpeakingEnd?.();
            return "Response received";

        } catch (error: any) {
            console.error("[GeminiLive] Send text error:", error);
            this.config.onError?.(error.message);
            return "";
        }
    }

    /**
     * Handle incoming server messages
     */
    private handleServerMessage(data: any): void {
        switch (data.type) {
            case "connected":
                this.isConnected = true;
                this.config.onConnect?.();
                break;
            case "audio":
                if (data.data) {
                    this.playAudioChunk(data.data);
                    this.config.onSpeakingStart?.();
                }
                break;
            case "interrupted":
                this.audioQueue = [];
                this.config.onInterrupted?.();
                break;
            case "complete":
                this.config.onSpeakingEnd?.();
                break;
            case "error":
                this.config.onError?.(data.message);
                break;
        }
    }

    /**
     * Play an audio chunk (base64 PCM at 24kHz)
     */
    private async playAudioChunk(base64Audio: string): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
        }

        try {
            // Decode base64 to ArrayBuffer
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert Int16 PCM to Float32
            const int16Array = new Int16Array(bytes.buffer);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768;
            }

            // Create audio buffer and play
            const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
            audioBuffer.getChannelData(0).set(float32Array);

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();

        } catch (error) {
            console.error("[GeminiLive] Audio playback error:", error);
        }
    }

    /**
     * Convert Float32Array to Int16Array (PCM)
     */
    private float32ToInt16(float32Array: Float32Array): Int16Array {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }

    /**
     * Convert ArrayBuffer to base64 string
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Disconnect from the server
     */
    disconnect(): void {
        this.stopRecording();
        this.isConnected = false;
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.config.onDisconnect?.();
        console.log("[GeminiLive] Disconnected");
    }

    /**
     * Check if connected
     */
    get connected(): boolean {
        return this.isConnected;
    }

    /**
     * Check if recording
     */
    get recording(): boolean {
        return this.isRecording;
    }
}

// Audio device type
export interface AudioInputDevice {
    deviceId: string;
    label: string;
}

// Get list of available audio input devices
export async function getAudioInputDevices(): Promise<AudioInputDevice[]> {
    try {
        // Request permission to access devices (needed to get labels)
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();

        return devices
            .filter(device => device.kind === 'audioinput')
            .map(device => ({
                deviceId: device.deviceId,
                label: device.label || `Microphone ${device.deviceId.substring(0, 8)}`
            }));
    } catch (error) {
        console.error('[GeminiLive] Error getting audio devices:', error);
        return [];
    }
}

// Factory function for creating client instance
export function createGeminiLiveClient(config: GeminiLiveConfig = {}): GeminiLiveClient {
    return new GeminiLiveClient(config);
}
