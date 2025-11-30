"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, MapPin, Star } from "lucide-react";

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
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
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
                    <Card key={app.id} className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg text-white">{app.profiles.full_name}</CardTitle>
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
                                        onClick={() => handleStatusUpdate(app.id, "approved")}
                                    >
                                        <Check className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        onClick={() => handleStatusUpdate(app.id, "rejected")}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Deny
                                    </Button>
                                </div>
                            )}

                            {app.status === "approved" && (
                                <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90">
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
        </div>
    );
}
