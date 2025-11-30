"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    onUpload: (url: string) => void;
}

export default function AvatarUpload({ uid, url, onUpload }: AvatarUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(url);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${uid}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

            setPreviewUrl(data.publicUrl);
            onUpload(data.publicUrl);
        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("Error uploading avatar!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-white/10 bg-white/5">
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <Upload className="h-8 w-8" />
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="relative border-white/10 hover:bg-white/5"
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Change Photo"}
                    <Input
                        type="file"
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                </Button>
            </div>
        </div>
    );
}
