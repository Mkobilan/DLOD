"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Briefcase, Hammer, User, MessageSquare, Star, Bookmark, BookmarkCheck } from "lucide-react";
import Image from "next/image";
import EditProfileModal from "./edit-profile-modal";
import { Button } from "@/components/ui/button";
import { checkChatPermission, requestChat } from "@/app/actions";
import { ReviewModal } from "./review-modal";
import { createClient } from "@/lib/supabase/client";

interface Profile {
    id: string;
    username: string;
    full_name: string;
    role: "laborer" | "contractor";
    bio?: string;
    skills?: string[];
    city?: string;
    state?: string;
    avatar_url?: string;
    phone?: string;
}

interface ProfileViewProps {
    profile: Profile;
    currentUserId?: string;
}

export default function ProfileView({ profile: initialProfile, currentUserId }: ProfileViewProps) {
    const [profile, setProfile] = useState(initialProfile);
    const [canChat, setCanChat] = useState(false);
    const [needsRequest, setNeedsRequest] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const router = useRouter();
    const isOwner = currentUserId === profile.id;
    const supabase = createClient();

    useEffect(() => {
        const fetchUserRole = async () => {
            if (currentUserId) {
                const { data } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", currentUserId)
                    .single();
                if (data) {
                    setCurrentUserRole(data.role);
                }
            }
        };

        fetchUserRole();

        if (currentUserId && !isOwner) {
            checkChatPermission(currentUserId, profile.id, profile.role).then((result) => {
                setCanChat(result.canChat);
                setNeedsRequest(result.needsRequest);
            });

            // Check if saved
            if (currentUserRole === 'contractor' && profile.role === 'laborer') {
                supabase
                    .from("saved_workers")
                    .select("id")
                    .eq("contractor_id", currentUserId)
                    .eq("worker_id", profile.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setIsSaved(true);
                    });
            }
        }
    }, [currentUserId, profile.id, profile.role, isOwner, currentUserRole, supabase]);

    const handleUpdate = () => {
        router.refresh();
        // In a real app we might refetch data here, but router.refresh() should reload the server component
        // For client-side updates we can also update local state if we returned the new profile from the modal
        window.location.reload(); // Simple way to ensure data is fresh
    };

    const handleChatRequest = async () => {
        const result = await requestChat(profile.id, profile.full_name);
        if (result.success) {
            setRequestSent(true);
        } else {
            alert(result.error || "Failed to send chat request");
        }
    };

    const handleChat = () => {
        router.push(`/messages?user=${profile.id}`);
    };

    const handleSaveWorker = async () => {
        if (!currentUserId) return;
        setSaveLoading(true);

        if (isSaved) {
            // Unsave
            const { error } = await supabase
                .from("saved_workers")
                .delete()
                .eq("contractor_id", currentUserId)
                .eq("worker_id", profile.id);

            if (!error) setIsSaved(false);
        } else {
            // Save
            const { error } = await supabase
                .from("saved_workers")
                .insert({
                    contractor_id: currentUserId,
                    worker_id: profile.id
                });

            if (!error) setIsSaved(true);
        }
        setSaveLoading(false);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                    {/* Cover image placeholder */}
                </div>

                <CardHeader className="relative px-6 pb-6 pt-0">
                    <div className="flex flex-col md:flex-row items-start gap-6 -mt-12 mb-4">
                        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 shrink-0">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.full_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    <User className="h-12 w-12" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-1 md:pt-12">
                            <h1 className="text-3xl font-bold text-white">{profile.full_name}</h1>
                            <div className="flex items-center gap-2 text-gray-400">
                                <span className="font-medium text-primary">@{profile.username}</span>
                                <span>•</span>
                                <span className="capitalize flex items-center gap-1">
                                    {profile.role === "laborer" ? <Hammer className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                                    {profile.role}
                                </span>
                            </div>
                            {(profile.city || profile.state) && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span>
                                        {[profile.city, profile.state].filter(Boolean).join(", ")}
                                    </span>
                                </div>
                            )}
                        </div>


                        <div className="mt-4 md:mt-12 flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                            {isOwner && (
                                <EditProfileModal profile={profile} onUpdate={handleUpdate} />
                            )}

                            {/* 1. Chat Actions */}
                            {!isOwner && currentUserId && canChat && (
                                <Button
                                    onClick={handleChat}
                                    className="bg-primary hover:bg-primary/90 w-full"
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Chat
                                </Button>
                            )}
                            {!isOwner && currentUserId && needsRequest && !requestSent && (
                                <Button
                                    onClick={handleChatRequest}
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary/10 w-full"
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Request Chat
                                </Button>
                            )}
                            {!isOwner && currentUserId && requestSent && (
                                <Button
                                    disabled
                                    variant="outline"
                                    className="border-gray-500 text-gray-500 w-full"
                                >
                                    Request Sent
                                </Button>
                            )}

                            {/* 2. Save Worker */}
                            {!isOwner && currentUserId && currentUserRole === 'contractor' && profile.role === 'laborer' && (
                                <Button
                                    onClick={handleSaveWorker}
                                    variant="outline"
                                    className={`border-primary/50 w-full ${isSaved ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                                    disabled={saveLoading}
                                >
                                    {isSaved ? (
                                        <>
                                            <BookmarkCheck className="mr-2 h-4 w-4" />
                                            Saved
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark className="mr-2 h-4 w-4" />
                                            Save Worker
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* 3. Review & Read Reviews */}
                            {!isOwner && currentUserId && currentUserRole && currentUserRole !== profile.role && (
                                <>
                                    <Button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        variant="secondary"
                                        className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/50 w-full"
                                    >
                                        <Star className="mr-2 h-4 w-4" />
                                        Review
                                    </Button>
                                    <Button
                                        onClick={() => router.push(`/reviews/${profile.id}`)}
                                        variant="outline"
                                        className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 w-full"
                                    >
                                        <Star className="mr-2 h-4 w-4" />
                                        Read Reviews
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8 px-6 pb-8">
                    {/* Bio Section */}
                    {profile.bio && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">About</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        </div>
                    )}

                    {/* Contact Info */}
                    {profile.phone && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">Contact</h3>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>{profile.phone}</span>
                            </div>
                        </div>
                    )}

                    {/* Skills Section (Laborer only) */}
                    {profile.role === "laborer" && profile.skills && profile.skills.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-white">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-white/10 hover:bg-white/20 text-gray-200 border-none px-3 py-1"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                reviewerId={currentUserId || ""}
                revieweeId={profile.id}
                revieweeName={profile.full_name}
                onReviewSubmitted={handleUpdate}
            />
        </div >
    );
}
