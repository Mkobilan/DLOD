import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProfileView from "@/components/profile/profile-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch profile data
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !profile) {
        notFound();
    }

    // Get current user to check ownership
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8">
            <ProfileView
                profile={profile}
                currentUserId={user?.id}
            />
        </div>
    );
}
