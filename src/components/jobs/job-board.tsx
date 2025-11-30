"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Search, Briefcase, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface Job {
    id: string;
    title: string;
    description: string;
    pay_rate: string;
    city: string;
    state: string;
    requirements: string;
    contractor_id: string;
    profiles: {
        full_name: string;
        rating: number;
        review_count: number;
        bio: string;
        city: string;
        state: string;
        email: string;
        phone: string;
    };
}

export default function JobBoard({ jobs, userId }: { jobs: Job[]; userId: string }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [applying, setApplying] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const filteredJobs = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApply = async (jobId: string) => {
        setApplying(jobId);
        try {
            const { error } = await supabase
                .from("applications")
                .insert({
                    job_id: jobId,
                    laborer_id: userId,
                    status: "pending",
                });

            if (error) {
                if (error.code === "23505") {
                    alert("You have already applied to this job.");
                } else {
                    throw error;
                }
            } else {
                alert("Application sent successfully!");
            }
        } catch (error: any) {
            alert("Error applying for job: " + error.message);
        } finally {
            setApplying(null);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6 pb-20">
            <header className="space-y-4">
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Find Work
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search jobs by title, keyword, or city..."
                        className="pl-10 bg-white/5 border-white/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                    <Card key={job.id} className="flex flex-col border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                                    <button
                                        onClick={() => router.push(`/profile/${job.contractor_id}`)}
                                        className="text-sm text-primary mt-1 hover:underline text-left"
                                    >
                                        {job.profiles.full_name}
                                    </button>
                                </div>
                                <div className="flex items-center text-yellow-400 text-xs">
                                    <Star className="h-3 w-3 fill-current mr-1" />
                                    {job.profiles.rating?.toFixed(1) || "New"} ({job.profiles.review_count})
                                </div>
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
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={() => handleApply(job.id)}
                                disabled={applying === job.id}
                            >
                                {applying === job.id ? "Applying..." : "Apply Now"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {filteredJobs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No jobs found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
