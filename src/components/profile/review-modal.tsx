"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviewerId: string;
    revieweeId: string;
    revieweeName: string;
    onReviewSubmitted: () => void;
}

export function ReviewModal({ isOpen, onClose, reviewerId, revieweeId, revieweeName, onReviewSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from("reviews")
                .insert({
                    reviewer_id: reviewerId,
                    reviewee_id: revieweeId,
                    rating,
                    comment,
                });

            if (error) throw error;

            alert("Review submitted successfully!");
            onReviewSubmitted();
            onClose();
            setRating(0);
            setComment("");
        } catch (error: any) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Review {revieweeName}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Share your experience working with {revieweeName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">
                            Notes (Optional)
                        </label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value.slice(0, 250))}
                            placeholder="Write a brief review..."
                            className="bg-white/5 border-white/10 min-h-[100px] resize-none"
                        />
                        <div className="text-xs text-gray-500 text-right">
                            {comment.length}/250
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
