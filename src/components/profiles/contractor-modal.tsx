"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Need to create Dialog
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail } from "lucide-react";

interface ContractorProfile {
    id: string;
    full_name: string;
    bio: string;
    city: string;
    state: string;
    rating: number;
    review_count: number;
    email: string;
    phone: string;
}

interface ContractorModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractor: ContractorProfile | null;
}

export function ContractorModal({ isOpen, onClose, contractor }: ContractorModalProps) {
    if (!contractor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{contractor.full_name}</DialogTitle>
                    <DialogDescription className="text-gray-400 flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {contractor.city}, {contractor.state}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="font-bold">{contractor.rating?.toFixed(1) || "New"}</span>
                        <span className="text-gray-400">({contractor.review_count} reviews)</span>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg">About Us</h4>
                        <p className="text-gray-300 text-sm">{contractor.bio || "No bio available."}</p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/10">
                        <h4 className="font-semibold text-lg">Contact Info</h4>
                        <p className="text-gray-400 text-xs italic mb-2">
                            Contact info is only available after hiring. (Mocked for now)
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="h-4 w-4 text-primary" /> {contractor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Phone className="h-4 w-4 text-secondary" /> {contractor.phone}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
