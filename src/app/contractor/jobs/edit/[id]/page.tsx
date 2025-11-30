"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function EditJobPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        pay_rate: "",
        city: "",
        state: "",
        requirements: "",
        status: "open",
    });

    useEffect(() => {
        fetchJob();
    }, []);

    const fetchJob = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: job, error } = await supabase
                .from("jobs")
                .select("*")
                .eq("id", params.id)
                .eq("contractor_id", user.id)
                .single();

            if (error) throw error;

            if (!job) {
                setError("Job not found or you don't have permission to edit it.");
                return;
            }

            setFormData({
                title: job.title || "",
                description: job.description || "",
                pay_rate: job.pay_rate || "",
                city: job.city || "",
                state: job.state || "",
                requirements: job.requirements || "",
                status: job.status || "open",
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from("jobs")
                .update({
                    title: formData.title,
                    description: formData.description,
                    pay_rate: formData.pay_rate,
                    city: formData.city,
                    state: formData.state,
                    requirements: formData.requirements,
                    status: formData.status,
                })
                .eq("id", params.id)
                .eq("contractor_id", user.id);

            if (error) throw error;

            router.push("/contractor/jobs");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 pb-20 max-w-2xl flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 pb-20 max-w-2xl">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Edit Job
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="General Laborer Needed"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Duties, etc.)</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="We need help moving materials..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pay_rate">Pay Rate</Label>
                            <Input
                                id="pay_rate"
                                value={formData.pay_rate}
                                onChange={handleChange}
                                required
                                placeholder="$20/hr"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements (Safety gear, etc.)</Label>
                            <Input
                                id="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="Steel toe boots, Hard hat"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-white/20 hover:bg-white/10"
                                onClick={() => router.push("/contractor/jobs")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
