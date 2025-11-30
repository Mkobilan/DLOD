"use server";

import { createClient } from "@/lib/supabase/server";

export async function requestChat(targetUserId: string, targetUserName: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Get current user's profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return { error: "Profile not found" };
    }

    // Insert notification
    const { error } = await supabase
        .from("notifications")
        .insert({
            user_id: targetUserId,
            type: "chat_request",
            content: `${profile.full_name} wants to chat with you`,
            related_id: user.id,
        });

    if (error) {
        console.error("Error creating notification:", error);
        return { error: "Failed to send chat request" };
    }

    return { success: true };
}

export async function checkChatPermission(viewerId: string, profileId: string, profileRole: string) {
    const supabase = await createClient();

    // Get viewer's profile
    const { data: viewerProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", viewerId)
        .single();

    if (!viewerProfile) {
        return { canChat: false, needsRequest: false };
    }

    // Laborer viewing Laborer -> Always can chat
    if (viewerProfile.role === "laborer" && profileRole === "laborer") {
        return { canChat: true, needsRequest: false };
    }

    // Contractor viewing Laborer -> Always can chat
    if (viewerProfile.role === "contractor" && profileRole === "laborer") {
        return { canChat: true, needsRequest: false };
    }

    // Laborer viewing Contractor -> Check if hired/approved
    if (viewerProfile.role === "laborer" && profileRole === "contractor") {
        // Check if the laborer has been approved for any job by this contractor
        const { data: applications } = await supabase
            .from("applications")
            .select("status, jobs!inner(contractor_id)")
            .eq("laborer_id", viewerId)
            .eq("jobs.contractor_id", profileId)
            .eq("status", "approved");

        if (applications && applications.length > 0) {
            return { canChat: true, needsRequest: false };
        }

        return { canChat: false, needsRequest: true };
    }

    // Contractor viewing Contractor -> Need request
    if (viewerProfile.role === "contractor" && profileRole === "contractor") {
        return { canChat: false, needsRequest: true };
    }

    return { canChat: false, needsRequest: false };
}
