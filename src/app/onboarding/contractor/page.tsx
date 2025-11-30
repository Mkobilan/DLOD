"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function ContractorOnboarding() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        username: "",
        full_name: "", // Business Name
        phone: "",
        city: "",
        state: "",
        zip: "",
        bio: "", // Company Bio
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            const { error } = await supabase
                .from("profiles")
                .update({
                    username: formData.username,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    bio: formData.bio,
                })
                .eq("id", user.id);

            if (error) {
                throw error;
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
            <Card className="w-full max-w-2xl border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Company Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Tell us about your business
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={formData.username} onChange={handleChange} required placeholder="@acmeconstruction" />
                            <p className="text-xs text-gray-400">This will be used for search and identification</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="full_name">Business Name</Label>
                            <Input id="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Acme Construction" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Contact Phone</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} required placeholder="(555) 555-5555" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-1">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2 col-span-1">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" value={formData.state} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2 col-span-1">
                                <Label htmlFor="zip">Zip Code</Label>
                                <Input id="zip" value={formData.zip} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Company Bio / Description</Label>
                            <Input id="bio" value={formData.bio} onChange={handleChange} required placeholder="We are a general contracting firm..." />
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
                                    Saving Profile...
                                </>
                            ) : (
                                "Complete Profile"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
