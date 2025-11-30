"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin, Briefcase, User, Search, LogOut } from "lucide-react";
import NotificationBell from "@/components/ui/notification-bell";


export default function LaborerDashboard({ profile }: { profile: any }) {
    const [isAvailable, setIsAvailable] = useState(profile.is_available);
    const supabase = createClient();
    const router = useRouter();

    const toggleAvailability = async (checked: boolean) => {
        setIsAvailable(checked);
        await supabase
            .from("profiles")
            .update({ is_available: checked })
            .eq("id", profile.id);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="container mx-auto p-4 space-y-6 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hello, {profile.full_name}</h1>
                    <p className="text-gray-400">Ready to work today?</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                        <Switch
                            id="availability"
                            checked={isAvailable}
                            onCheckedChange={toggleAvailability}
                        />
                        <Label htmlFor="availability" className={isAvailable ? "text-green-400" : "text-gray-400"}>
                            {isAvailable ? "Available" : "Offline"}
                        </Label>
                    </div>
                    <NotificationBell />
                    <Button
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">
                            Job Requests
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                        <p className="text-xs text-gray-400">
                            Active job invitations
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">
                            Profile Views
                        </CardTitle>
                        <User className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                        <p className="text-xs text-gray-400">
                            Contractors viewed you today
                        </p>
                    </CardContent>
                </Card>
            </div>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Find Work Nearby</h2>
                    <Link href="/jobs">
                        <Button variant="ghost" className="text-sm">View All Jobs</Button>
                    </Link>
                </div>
                <Link href="/jobs">
                    <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                        <p className="text-white font-semibold mb-2">Search for Jobs</p>
                        <p className="text-gray-400 text-sm">Click to browse available jobs in your area</p>
                    </div>
                </Link>
            </section>
        </div>
    );
}
