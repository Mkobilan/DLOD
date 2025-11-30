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

    if (profile.role === "laborer") {
        return <LaborerDashboard profile={profile} />;
    } else if (profile.role === "contractor") {
        return <ContractorDashboard profile={profile} />;
    }

    return <div>Unknown role</div>;
}
