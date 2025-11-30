"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import LaborerDashboard from "@/components/dashboard/laborer-view";
import ContractorDashboard from "@/components/dashboard/contractor-view";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
    const [checkingSettings, setCheckingSettings] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const checkSettings = async () => {
            if (user) {
                try {
                    const { data: userSettings, error } = await supabase
                        .from("user_settings")
                        .select("has_seen_tutorial")
                        .eq("user_id", user.id)
                        .single();

                    if (error) {
                        console.error("Error fetching user settings:", error);
                    }

                    if (userSettings) {
                        setHasSeenTutorial(userSettings.has_seen_tutorial);
                    }
                } catch (error) {
                    console.error("Error in checkSettings:", error);
                } finally {
                    setCheckingSettings(false);
                }
            }
        };

        if (user) {
            checkSettings();
        } else if (!loading) {
            setCheckingSettings(false);
        }
    }, [user, loading]);

    if (loading || checkingSettings) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center gap-4">
                <p className="text-red-500">Error: User profile not found.</p>
                <p className="text-sm text-gray-400">Please try signing out and signing in again.</p>
            </div>
        );
    }

    if (profile.role === "laborer") {
        return <LaborerDashboard profile={profile} hasSeenTutorial={hasSeenTutorial} />;
    } else if (profile.role === "contractor") {
        return <ContractorDashboard profile={profile} hasSeenTutorial={hasSeenTutorial} />;
    }

    return <div>Unknown role</div>;
}
