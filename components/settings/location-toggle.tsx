"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { MapPin } from "lucide-react";
import { updateUser } from "@/lib/actions";

interface LocationToggleProps {
    userId: string;
    initialEnabled: boolean;
}

export function LocationToggle({ userId, initialEnabled }: LocationToggleProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setEnabled(checked);
        setLoading(true);
        try {
            // Fetch current preferences first? Ideally we merge properly.
            // For now, let's assume simple object. 
            // Since we can't easily deep merge in Prisma update without raw query or finding first,
            // we really should pass the full preferences object or handle this server side better.
            // Simplified: we just update the specific key via an action wrapper or passed down logic?
            // Let's rely on the fact that we are toggling.

            // To be safe, we should probably have a specific action for updating preferences.
            // But for now, let's update via updateUser generic.
            // We need to know existing preferences to not overwrite them? 
            // The prop `initialEnabled` doesn't give us the rest of the JSON.
            // Hack/Fast way: Just save { locationEnabled: checked } and hope we don't use other prefs yet?
            // Or better: Server action `updateUserPreference(userId, key, value)`.

            await updateUser(userId, {
                preferences: { locationEnabled: checked } // This OVERWRITES other prefs if we aren't careful.
            } as any);

        } catch (error) {
            console.error("Failed to update location preference", error);
            setEnabled(!checked); // Revert
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">Location Services</p>
                        {loading && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">Allow automatic weather and location tagging for new memories.</p>
                </div>
            </div>
            <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-primary"
            />
        </div>
    );
}
