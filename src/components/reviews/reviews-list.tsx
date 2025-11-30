"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import Image from "next/image";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer: {
        id: string;
        full_name: string;
        avatar_url?: string;
        username: string;
    };
}

interface ReviewsListProps {
    userId: string;
}

export default function ReviewsList({ userId }: ReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select(`
                    id,
                    rating,
                    comment,
                    created_at,
                    profiles!reviews_reviewer_id_fkey(
                        id,
                        full_name,
                        avatar_url,
                        username
                    )
                `)
                .eq("reviewee_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching reviews:", error);
            } else {
                // Transform data to match Review interface
                const transformedData = data?.map(review => ({
                    ...review,
                    reviewer: Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
                })) || [];
                setReviews(transformedData as Review[]);
            }
            setLoading(false);
        };

        fetchReviews();
    }, [userId]);

    if (loading) {
        return (
            <div className="text-center text-gray-400 py-8">
                Loading reviews...
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <Card className="border-white/10 bg-[#3C3434] backdrop-blur-xl">
                <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No reviews yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Reviews will appear here once someone rates this user
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <Card key={review.id} className="border-white/10 bg-[#3C3434] backdrop-blur-xl">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            {/* Reviewer Avatar */}
                            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white/10 bg-slate-800 shrink-0">
                                {review.reviewer.avatar_url ? (
                                    <Image
                                        src={review.reviewer.avatar_url}
                                        alt={review.reviewer.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <User className="h-6 w-6" />
                                    </div>
                                )}
                            </div>

                            {/* Review Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {review.reviewer.full_name}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            @{review.reviewer.username}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-5 w-5 ${star <= review.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-600"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {review.comment && (
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {review.comment}
                                    </p>
                                )}

                                <p className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
