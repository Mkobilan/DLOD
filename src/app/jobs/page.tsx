import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JobBoard from "@/components/jobs/job-board";

export default async function JobsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch jobs
    const { data: jobs } = await supabase
        .from("jobs")
        .select("*, profiles(full_name, rating, review_count)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

    return <JobBoard jobs={jobs || []} userId={user.id} />;
}
