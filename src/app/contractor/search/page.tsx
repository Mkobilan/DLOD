"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Hammer, MessageSquare } from "lucide-react";

interface Laborer {
    id: string;
    full_name: string;
    city: string;
    state: string;
    skills: string[];
    is_available: boolean;
    avatar_url: string | null;
}

export default function LaborerSearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [laborers, setLaborers] = useState<Laborer[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchLaborers();
    }, []);

    const fetchLaborers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "laborer");

        if (data) {
            setLaborers(data);
        }
        setLoading(false);
    };

    const filteredLaborers = laborers.filter((laborer) =>
        laborer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laborer.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laborer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto p-4 space-y-6 pb-20">
            <header className="space-y-4">
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Find Laborers
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, city, or skill..."
                        className="pl-10 bg-white/5 border-white/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredLaborers.map((laborer) => (
                    <Card key={laborer.id} className="flex flex-col border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <Link href={`/profile/${laborer.id}`} className="cursor-pointer">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                                    {laborer.avatar_url ? (
                                        <Image
                                            src={laborer.avatar_url}
                                            alt={laborer.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/20 text-primary font-bold text-xl">
                                            {laborer.full_name?.[0] || "?"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-white hover:text-primary transition-colors">
                                        {laborer.full_name}
                                    </CardTitle>
                                    <div className="flex items-center text-gray-400 text-xs mt-1">
                                        <MapPin className="h-3 w-3 mr-1 text-secondary" />
                                        {laborer.city}, {laborer.state}
                                    </div>
                                </div>
                            </CardHeader>
                        </Link>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {laborer.skills?.map((skill, index) => (
                                    <span key={index} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className={laborer.is_available ? "text-green-400" : "text-gray-500"}>
                                    {laborer.is_available ? "● Available Now" : "○ Offline"}
                                </span>
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Link href={`/messages?user=${laborer.id}`}>
                                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Message
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
                {!loading && filteredLaborers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No laborers found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
