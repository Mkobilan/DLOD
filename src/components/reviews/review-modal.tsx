"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Need to create
import { Star, Loader2 } from "lucide-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    revieweeId: string;
    revieweeName: string;
}

export function ReviewModal({ isOpen, onClose, revieweeId, revieweeName }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from("reviews")
                .insert({
                    reviewer_id: user.id,
                    reviewee_id: revieweeId,
                    rating,
                    comment,
                });

            if (error) throw error;

            // Update profile rating (trigger or manual update needed ideally, but for MVP we just insert review)
            // A database trigger would be best to update the average rating on the profile.

            onClose();
            alert("Review submitted successfully!");
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rate {revieweeName}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Share your experience working with this person.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <Textarea
                        placeholder="Write a quick review (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-black/20 border-white/10 text-white"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || rating === 0}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
