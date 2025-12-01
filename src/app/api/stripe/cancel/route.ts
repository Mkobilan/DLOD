import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get the user's profile to find their subscription ID
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("stripe_subscription_id")
            .eq("id", user.id)
            .single();

        if (profileError || !profile?.stripe_subscription_id) {
            return new NextResponse("No active subscription found", { status: 404 });
        }

        // Cancel the subscription at period end
        await stripe.subscriptions.update(profile.stripe_subscription_id, {
            cancel_at_period_end: true,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[STRIPE_CANCEL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
