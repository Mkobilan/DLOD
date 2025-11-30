"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function PostJobPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        pay_rate: "",
        city: "",
        state: "",
        zip_code: "",
        requirements: "",
        notes: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("No user found");
            }

            // Get contractor profile to verify role and get location if needed
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role !== "contractor") {
                throw new Error("Only contractors can post jobs.");
            }

            const { error } = await supabase
                .from("jobs")
                .insert({
                    contractor_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    pay_rate: formData.pay_rate,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zip_code,
                    requirements: formData.requirements,
                    notes: formData.notes,
                    status: "open",
                });

            if (error) {
                throw error;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 pb-20 max-w-2xl">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Post a New Job
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input id="title" value={formData.title} onChange={handleChange} required placeholder="General Laborer Needed" />
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
                            <Input id="pay_rate" value={formData.pay_rate} onChange={handleChange} required placeholder="$20/hr" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" value={formData.state} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip_code">Zip Code</Label>
                                <Input id="zip_code" value={formData.zip_code} onChange={handleChange} required placeholder="12345" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements (Safety gear, etc.)</Label>
                            <Input id="requirements" value={formData.requirements} onChange={handleChange} placeholder="Steel toe boots, Hard hat" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <textarea
                                id="notes"
                                className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional details about the job..."
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting Job...
                                </>
                            ) : (
                                "Post Job"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
