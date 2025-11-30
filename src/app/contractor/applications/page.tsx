"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, X, MessageSquare, MapPin, Star, User } from "lucide-react";

interface Application {
    id: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    jobs: {
        title: string;
    };
    profiles: {
        id: string;
        full_name: string;
        rating: number;
        review_count: number;
        city: string;
        state: string;
        skills: string[];
    };
}

export default function ApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<Application | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch applications for jobs posted by this contractor
        const { data, error } = await supabase
            .from("applications")
            .select(`
        *,
        jobs (title, contractor_id),
        profiles (id, full_name, rating, review_count, city, state, skills)
      `)
            .eq("jobs.contractor_id", user.id) // This filtering might need to be done client-side or with a better query if RLS allows
            .order("created_at", { ascending: false });

        if (data) {
            // Filter out applications where the job doesn't belong to the user (if RLS doesn't catch it or if the query structure returns nulls)
            const myApps = data.filter((app: any) => app.jobs?.contractor_id === user.id);
            setApplications(myApps);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (appId: string, newStatus: "approved" | "rejected") => {
        try {
            const { error } = await supabase
                .from("applications")
                .update({ status: newStatus })
                .eq("id", appId);

            if (error) throw error;

            setApplications(apps => apps.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Manage Applications
                </h1>
                <p className="text-gray-400">Review and respond to worker applications</p>
            </header>

            <div className="space-y-4">
                {applications.map((app) => (
                    <Card
                        key={app.id}
                        className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => setSelectedProfile(app)}
                    >
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    {app.profiles.full_name}
                                    <User className="h-4 w-4 text-gray-400" />
                                </CardTitle>
                                <p className="text-sm text-primary">Applying for: {app.jobs.title}</p>
                            </div>
                            <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                                {app.status.toUpperCase()}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 md:grid-cols-2 mb-4">
                                <div className="flex items-center text-gray-400 text-sm">
                                    <MapPin className="h-4 w-4 mr-2 text-secondary" />
                                    {app.profiles.city}, {app.profiles.state}
                                </div>
                                <div className="flex items-center text-yellow-400 text-sm">
                                    <Star className="h-4 w-4 mr-2 fill-current" />
                                    {app.profiles.rating?.toFixed(1) || "New"} ({app.profiles.review_count})
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {app.profiles.skills?.map((skill, index) => (
                                    <span key={index} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {app.status === "pending" && (
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(app.id, "approved");
                                        }}
                                    >
                                        <Check className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(app.id, "rejected");
                                        }}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Deny
                                    </Button>
                                </div>
                            )}

                            {app.status === "approved" && (
                                <Button
                                    className="w-full mt-4 bg-secondary hover:bg-secondary/90"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/messages?user=${app.profiles.id}`);
                                    }}
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {!loading && applications.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No applications found.
                    </div>
                )}
            </div>

            {/* Worker Profile Modal */}
            <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[500px]">
                    {selectedProfile && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                    {selectedProfile.profiles.full_name}
                                </DialogTitle>
                                <DialogDescription className="text-gray-400 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {selectedProfile.profiles.city}, {selectedProfile.profiles.state}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span className="font-bold">
                                        {selectedProfile.profiles.rating?.toFixed(1) || "New"}
                                    </span>
                                    <span className="text-gray-400">
                                        ({selectedProfile.profiles.review_count} reviews)
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-lg">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProfile.profiles.skills?.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="text-sm bg-primary/20 px-3 py-1 rounded-full text-primary border border-primary/30"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    <h4 className="font-semibold text-lg">Application Details</h4>
                                    <p className="text-sm text-gray-400">
                                        Applied for: <span className="text-primary font-medium">{selectedProfile.jobs.title}</span>
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Status: <Badge variant={selectedProfile.status === "approved" ? "default" : selectedProfile.status === "rejected" ? "destructive" : "secondary"}>
                                            {selectedProfile.status.toUpperCase()}
                                        </Badge>
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Applied on: {new Date(selectedProfile.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                {selectedProfile.status === "pending" && (
                                    <>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                                handleStatusUpdate(selectedProfile.id, "approved");
                                                setSelectedProfile(null);
                                            }}
                                        >
                                            <Check className="mr-2 h-4 w-4" /> Approve
                                        </Button>
                                        <Button
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => {
                                                handleStatusUpdate(selectedProfile.id, "rejected");
                                                setSelectedProfile(null);
                                            }}
                                        >
                                            <X className="mr-2 h-4 w-4" /> Deny
                                        </Button>
                                    </>
                                )}
                                <Button variant="secondary" onClick={() => setSelectedProfile(null)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
