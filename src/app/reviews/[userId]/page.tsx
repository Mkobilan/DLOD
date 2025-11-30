import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReviewsList from "@/components/reviews/reviews-list";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        userId: string;
    };
}

export default async function ReviewsPage({ params }: PageProps) {
    const supabase = await createClient();

    // Fetch user profile
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, role, avatar_url")
        .eq("id", params.userId)
        .single();

    if (error || !profile) {
        notFound();
    }

    // Fetch review statistics
    const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", params.userId);

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
        ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            {/* Back Button */}
            <Link
                href={`/profile/${profile.username}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
            </Link>

            {/* Header Card */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl mb-6">
                <CardHeader>
                    <h1 className="text-3xl font-bold text-white">
                        Reviews for {profile.full_name}
                    </h1>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-6 w-6 ${star <= Math.round(averageRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-2xl font-bold text-white">
                                {averageRating.toFixed(1)}
                            </span>
                        </div>
                        <span className="text-gray-400">
                            ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                        </span>
                    </div>
                </CardHeader>
            </Card>

            {/* Reviews List */}
            <ReviewsList userId={params.userId} />
        </div>
    );
}
