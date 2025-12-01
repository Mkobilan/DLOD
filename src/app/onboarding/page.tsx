"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Briefcase, Loader2, AlertCircle } from "lucide-react";

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleRoleSelection = async (role: "laborer" | "contractor") => {
        setLoading(true);
        setError(null);

        try {
            // Try to get the user, with a retry mechanism
            let user = null;
            let attempts = 0;
            const maxAttempts = 3;

            while (!user && attempts < maxAttempts) {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (currentUser) {
                    user = currentUser;
                    break;
                }
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                }
            }

            if (!user) {
                throw new Error("No user session found. Please try logging in again.");
            }

            // Check if profile already exists
            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .single();

            if (existingProfile) {
                // Profile exists, just navigate
                router.push(role === "laborer" ? "/onboarding/laborer" : "/onboarding/contractor");
                return;
            }

            // Create new profile
            const { error } = await supabase
                .from("profiles")
                .insert({
                    id: user.id,
                    role: role,
                    email: user.email,
                });

            if (error) {
                throw error;
            }

            // Force full reload to ensure AuthProvider fetches the new profile
            window.location.href = role === "laborer" ? "/onboarding/laborer" : "/onboarding/contractor";
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
            <Card className="w-full max-w-2xl border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Who are you?
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-400">
                        Select your role to get started
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 p-8">
                    <Button
                        variant="outline"
                        className="h-auto flex-col gap-4 p-8 border-white/10 hover:bg-white/5 hover:border-primary/50 transition-all group"
                        onClick={() => handleRoleSelection("laborer")}
                        disabled={loading}
                    >
                        <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                            <Hammer className="h-12 w-12 text-primary" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="font-bold text-xl text-white">I am a Laborer</h3>
                            <p className="text-sm text-gray-400">
                                I want to find work for the day.
                            </p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto flex-col gap-4 p-8 border-white/10 hover:bg-white/5 hover:border-secondary/50 transition-all group"
                        onClick={() => handleRoleSelection("contractor")}
                        disabled={loading}
                    >
                        <div className="rounded-full bg-secondary/10 p-4 group-hover:bg-secondary/20 transition-colors">
                            <Briefcase className="h-12 w-12 text-secondary" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="font-bold text-xl text-white">I am a Contractor</h3>
                            <p className="text-sm text-gray-400">
                                I want to hire workers for the day.
                            </p>
                        </div>
                    </Button>
                </CardContent>
                {error && (
                    <div className="px-8 pb-6">
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20 justify-center">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}
                {loading && (
                    <div className="px-8 pb-6 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
            </Card>
        </div>
    );
}
