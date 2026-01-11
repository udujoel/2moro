"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader for particles
const particleVertexShader = `
  uniform float uTime;
  uniform float uSize;
  
  attribute float aScale;
  attribute vec3 aRandomness;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Organic movement using sin waves
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.3;
    angle += angleOffset;
    
    modelPosition.x = cos(angle) * distanceToCenter + sin(uTime * 0.5 + aRandomness.x * 6.28) * aRandomness.x * 0.15;
    modelPosition.z = sin(angle) * distanceToCenter + cos(uTime * 0.4 + aRandomness.z * 6.28) * aRandomness.z * 0.15;
    modelPosition.y += sin(uTime * 0.6 + aRandomness.y * 6.28) * aRandomness.y * 0.1;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);
    
    // Pass color based on position (rainbow gradient)
    float hue = atan(position.x, position.z) / 6.28318 + 0.5;
    hue += position.y * 0.3;
    hue = fract(hue + uTime * 0.05);
    
    // HSL to RGB conversion
    float h = hue * 6.0;
    float c = 1.0;
    float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
    
    if (h < 1.0) vColor = vec3(c, x, 0.0);
    else if (h < 2.0) vColor = vec3(x, c, 0.0);
    else if (h < 3.0) vColor = vec3(0.0, c, x);
    else if (h < 4.0) vColor = vec3(0.0, x, c);
    else if (h < 5.0) vColor = vec3(x, 0.0, c);
    else vColor = vec3(c, 0.0, x);
    
    vAlpha = 0.6 + aScale * 0.4;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Circular particle
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    
    // Soft glow
    float strength = 1.0 - (distanceToCenter * 2.0);
    strength = pow(strength, 1.5);
    
    gl_FragColor = vec4(vColor, strength * vAlpha);
  }
`;

interface ParticleOrbProps {
    state: "idle" | "listening" | "speaking";
    particleCount?: number;
}

function ParticleOrb({ state, particleCount = 8000 }: ParticleOrbProps) {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, scales, randomness } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);
        const randomness = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Spherical distribution
            const radius = 0.8 + Math.random() * 0.4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            scales[i] = 0.5 + Math.random() * 0.5;

            randomness[i3] = (Math.random() - 0.5) * 0.5;
            randomness[i3 + 1] = (Math.random() - 0.5) * 0.5;
            randomness[i3 + 2] = (Math.random() - 0.5) * 0.5;
        }

        return { positions, scales, randomness };
    }, [particleCount]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSize: { value: 25 },
    }), []);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        uniforms.uTime.value += delta * (state === "speaking" ? 2.5 : state === "listening" ? 1.5 : 0.8);

        // Adjust particle size based on state
        const targetSize = state === "speaking" ? 35 : state === "listening" ? 30 : 25;
        uniforms.uSize.value += (targetSize - uniforms.uSize.value) * 0.1;

        pointsRef.current.rotation.y += delta * 0.1;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    args={[scales, 1]}
                />
                <bufferAttribute
                    attach="attributes-aRandomness"
                    args={[randomness, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={particleVertexShader}
                fragmentShader={particleFragmentShader}
                uniforms={uniforms}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// Inner glowing core
function GlowingCore({ state }: { state: "idle" | "listening" | "speaking" }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.3;

        const scale = state === "speaking"
            ? 0.5 + Math.sin(Date.now() * 0.005) * 0.08
            : state === "listening"
                ? 0.48 + Math.sin(Date.now() * 0.003) * 0.04
                : 0.45;
        meshRef.current.scale.setScalar(scale);
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.6}
            />
        </mesh>
    );
}

interface ThreeOrbProps {
    state?: "idle" | "listening" | "speaking";
    size?: number;
    className?: string;
    onClick?: () => void;
}

export function ThreeOrb({
    state = "idle",
    size = 200,
    className = "",
    onClick
}: ThreeOrbProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                cursor: onClick ? "pointer" : "default",
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent" }}
            >
                <ParticleOrb state={isHovered ? "listening" : state} />
            </Canvas>
        </div>
    );
}
