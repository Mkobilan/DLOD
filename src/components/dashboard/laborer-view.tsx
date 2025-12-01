"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
import TutorialModal from "@/components/tutorial/tutorial-modal";


export default function LaborerDashboard({ profile, hasSeenTutorial }: { profile: any, hasSeenTutorial: boolean }) {
    const [isAvailable, setIsAvailable] = useState(profile.is_available);
    const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial);
    const supabase = createClient();
    const router = useRouter();

    const toggleAvailability = async (checked: boolean) => {
        setIsAvailable(checked);
        await supabase
            .from("profiles")
            .update({ is_available: checked })
            .eq("id", profile.id);
    };

    const handleTutorialComplete = async () => {
        setShowTutorial(false);
        await supabase
            .from("user_settings")
            .upsert({
                user_id: profile.id,
                has_seen_tutorial: true
            }, {
                onConflict: 'user_id'
            });

        router.refresh();
    };

    return (
        <div className="container mx-auto p-4 space-y-6 pb-20">
            {showTutorial && (
                <TutorialModal role="laborer" onComplete={handleTutorialComplete} />
            )}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hello, {profile.full_name}</h1>
                    <p className="text-gray-400">Ready to work today?</p>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <Switch
                        id="availability"
                        checked={isAvailable}
                        onCheckedChange={toggleAvailability}
                    />
                    <Label htmlFor="availability" className={isAvailable ? "text-green-400" : "text-gray-400"}>
                        {isAvailable ? "Available" : "Offline"}
                    </Label>
                </div>
            </header>



            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Find Work Nearby</h2>
                    <Link href="/jobs">
                        <Button variant="ghost" className="text-sm">View All Jobs</Button>
                    </Link>
                </div>
                <Link href="/jobs">
                    <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                        <p className="text-white font-semibold mb-2">Search for Jobs</p>
                        <p className="text-gray-400 text-sm">Click to browse available jobs in your area</p>
                    </div>
                </Link>
            </section>
        </div>
    );
}
