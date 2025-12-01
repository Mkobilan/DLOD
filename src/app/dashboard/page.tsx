"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import LaborerDashboard from "@/components/dashboard/laborer-view";
import ContractorDashboard from "@/components/dashboard/contractor-view";
import { Loader2 } from "lucide-react";

function DashboardContent() {
    const { user, profile, loading, refreshProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
    const [checkingSettings, setCheckingSettings] = useState(true);
    const [verifyingSession, setVerifyingSession] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Verify Stripe session if returning from checkout
    useEffect(() => {
        const verifySession = async () => {
            const sessionId = searchParams.get("session_id");

            if (sessionId && user && !verifyingSession) {
                setVerifyingSession(true);
                try {
                    const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);

                    if (response.ok) {
                        // Refresh the profile to get updated subscription status
                        await refreshProfile();
                        // Remove session_id from URL
                        router.replace("/dashboard");
                    }
                } catch (error) {
                    console.error("Error verifying session:", error);
                } finally {
                    setVerifyingSession(false);
                }
            }
        };

        if (user && !loading) {
            verifySession();
        }
    }, [user, loading, searchParams]);

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

    if (loading || checkingSettings || verifyingSession) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                {verifyingSession && <span className="ml-2 text-gray-400">Activating subscription...</span>}
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-400">Loading profile...</span>
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

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
