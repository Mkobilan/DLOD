"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, Search, Briefcase, Crown, Loader2 } from "lucide-react";
import TutorialModal from "@/components/tutorial/tutorial-modal";
import { toast } from "sonner";


import { useState, useEffect } from "react";

export default function ContractorDashboard({ profile, hasSeenTutorial }: { profile: any, hasSeenTutorial: boolean }) {
    const router = useRouter();
    const supabase = createClient();
    const [activeJobsCount, setActiveJobsCount] = useState(0);
    const [savedWorkersCount, setSavedWorkersCount] = useState(0);
    const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial);
    const [cancelingSubscription, setCancelingSubscription] = useState(false);

    // Check subscription status for contractors
    useEffect(() => {
        if (profile.role === "contractor" && profile.subscription_status !== "active") {
            router.push("/onboarding/contractor");
        }
    }, [profile, router]);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch active jobs count
            const { count: jobsCount } = await supabase
                .from("jobs")
                .select("*", { count: "exact", head: true })
                .eq("contractor_id", profile.id)
                .eq("status", "open");

            if (jobsCount !== null) setActiveJobsCount(jobsCount);

            // Fetch saved workers count
            const { count: workersCount } = await supabase
                .from("saved_workers")
                .select("*", { count: "exact", head: true })
                .eq("contractor_id", profile.id);

            if (workersCount !== null) setSavedWorkersCount(workersCount);
        };

        fetchData();
    }, [profile.id, supabase]);

    const handleTutorialComplete = async () => {
        setShowTutorial(false);
        await supabase
            .from("user_settings")
            .update({ has_seen_tutorial: true })
            .eq("user_id", profile.id);

        router.refresh();
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.")) {
            return;
        }

        setCancelingSubscription(true);
        try {
            const response = await fetch("/api/stripe/cancel", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to cancel subscription");
            }

            toast.success("Subscription will be canceled at the end of your billing period");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel subscription. Please try again.");
        } finally {
            setCancelingSubscription(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6 pb-20">
            {showTutorial && (
                <TutorialModal role="contractor" onComplete={handleTutorialComplete} />
            )}
            <header className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                        {profile.subscription_status === "active" && (
                            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 px-3 py-1 rounded-full">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs font-semibold text-yellow-500">PRO</span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-400">Manage your jobs and workers</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                        onClick={handleCancelSubscription}
                        disabled={cancelingSubscription}
                    >
                        {cancelingSubscription ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Canceling...
                            </>
                        ) : (
                            "Unsubscribe"
                        )}
                    </Button>
                    <Link href="/contractor/jobs">
                        <Button variant="outline" className="border-white/20 hover:bg-white/10">
                            <Briefcase className="mr-2 h-4 w-4" />
                            My Jobs
                        </Button>
                    </Link>
                    <Link href="/contractor/jobs/new">
                        <Button className="bg-primary hover:bg-primary/90">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Post Job
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">
                            Active Jobs
                        </CardTitle>
                        <BriefcaseIcon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{activeJobsCount}</div>
                        <p className="text-xs text-gray-400">
                            Open positions
                        </p>
                    </CardContent>
                </Card>

                <Link href="/contractor/saved-workers">
                    <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">
                                Saved Workers
                            </CardTitle>
                            <Users className="h-4 w-4 text-secondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{savedWorkersCount}</div>
                            <p className="text-xs text-gray-400">
                                Laborers you've saved
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Find Laborers</h2>
                    <Link href="/contractor/search">
                        <Button variant="ghost" className="text-sm">View All</Button>
                    </Link>
                </div>

                <Link href="/contractor/search">
                    <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Click to search for laborers</p>
                    </div>
                </Link>
            </section>
        </div>
    );
}

function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
