"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Pencil } from "lucide-react";
import AvatarUpload from "./avatar-upload";

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

interface EditProfileModalProps {
    profile: Profile;
    onUpdate: () => void;
}

export default function EditProfileModal({ profile, onUpdate }: EditProfileModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        city: profile.city || "",
        state: profile.state || "",
        phone: profile.phone || "",
        skills: profile.skills?.join(", ") || "",
        avatar_url: profile.avatar_url || null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleAvatarUpload = (url: string) => {
        setFormData(prev => ({ ...prev, avatar_url: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates: any = {
                full_name: formData.full_name,
                username: formData.username,
                bio: formData.bio,
                city: formData.city,
                state: formData.state,
                phone: formData.phone,
                avatar_url: formData.avatar_url,
                updated_at: new Date().toISOString(),
            };

            if (profile.role === "laborer") {
                updates.skills = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
            }

            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", profile.id);

            if (error) throw error;

            onUpdate();
            setOpen(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Make changes to your public profile here.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <AvatarUpload
                        uid={profile.id}
                        url={formData.avatar_url}
                        onUpload={handleAvatarUpload}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Name</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="bg-black/20 border-white/10 min-h-[100px]"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="bg-black/20 border-white/10"
                        />
                    </div>

                    {profile.role === "laborer" && (
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma separated)</Label>
                            <Input
                                id="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="bg-black/20 border-white/10"
                                placeholder="Carpentry, Painting, etc."
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
