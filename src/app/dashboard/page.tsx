import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LaborerDashboard from "@/components/dashboard/laborer-view";
import ContractorDashboard from "@/components/dashboard/contractor-view";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        // Profile doesn't exist yet, redirect to onboarding
        redirect("/onboarding");
    }

    const { data: userSettings } = await supabase
        .from("user_settings")
        .select("has_seen_tutorial")
        .eq("user_id", user.id)
        .single();

    const hasSeenTutorial = userSettings?.has_seen_tutorial ?? false;

    if (profile.role === "laborer") {
        return <LaborerDashboard profile={profile} hasSeenTutorial={hasSeenTutorial} />;
    } else if (profile.role === "contractor") {
        return <ContractorDashboard profile={profile} hasSeenTutorial={hasSeenTutorial} />;
    }

    return <div>Unknown role</div>;
}
