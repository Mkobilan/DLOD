"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Job {
    id: string;
    title: string;
    description: string;
    pay_rate: string;
    city: string;
    state: string;
    requirements: string;
    status: string;
    created_at: string;
}

export default function MyJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("contractor_id", user.id)
            .order("created_at", { ascending: false });

        if (data) {
            setJobs(data);
        }
        setLoading(false);
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm("Are you sure you want to delete this job?")) return;

        setDeleting(jobId);
        try {
            const { error } = await supabase
                .from("jobs")
                .delete()
                .eq("id", jobId);

            if (error) throw error;

            setJobs(jobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete job");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        My Posted Jobs
                    </h1>
                    <p className="text-gray-400">Manage your job listings</p>
                </div>
                <Link href="/contractor/jobs/new">
                    <Button className="bg-primary hover:bg-primary/90">
                        Post New Job
                    </Button>
                </Link>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : jobs.length === 0 ? (
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-400">You haven't posted any jobs yet.</p>
                        <Link href="/contractor/jobs/new">
                            <Button className="mt-4 bg-primary hover:bg-primary/90">
                                Post Your First Job
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Card key={job.id} className="flex flex-col border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                                    <Badge variant={job.status === "open" ? "default" : "secondary"}>
                                        {job.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="flex items-center text-gray-400 text-sm">
                                    <MapPin className="h-4 w-4 mr-2 text-secondary" />
                                    {job.city}, {job.state}
                                </div>
                                <div className="flex items-center text-green-400 font-semibold">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    {job.pay_rate}
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-3">
                                    {job.description}
                                </p>
                                {job.requirements && (
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                                            {job.requirements}
                                        </span>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-4">
                                    <Link href={`/contractor/jobs/edit/${job.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleDelete(job.id)}
                                        disabled={deleting === job.id}
                                    >
                                        {deleting === job.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
