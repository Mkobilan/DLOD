import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Get or create user settings
        let { data: settings, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // If no settings exist, create default settings
        if (error && error.code === "PGRST116") {
            const { data: newSettings, error: insertError } = await supabase
                .from("user_settings")
                .insert({ user_id: user.id })
                .select()
                .single();

            if (insertError) {
                console.error("Error creating settings:", insertError);
                return NextResponse.json({ error: "Failed to create settings" }, { status: 500 });
            }

            settings = newSettings;
        } else if (error) {
            console.error("Error fetching settings:", error);
            return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const updates = await request.json();

        // Remove fields that shouldn't be updated directly
        delete updates.id;
        delete updates.user_id;
        delete updates.created_at;
        delete updates.updated_at;

        const { data: settings, error } = await supabase
            .from("user_settings")
            .update(updates)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating settings:", error);
            return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
