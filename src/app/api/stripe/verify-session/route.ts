import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return new NextResponse("No session ID provided", { status: 400 });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return new NextResponse("Session not found", { status: 404 });
        }

        const userId = session.metadata?.userId;

        if (!userId) {
            return new NextResponse("No user ID in session", { status: 400 });
        }

        // Update the user's profile
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_status: "active",
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
            })
            .eq("id", userId);

        if (error) {
            console.error("Error updating profile:", error);
            return new NextResponse("Failed to update profile", { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[STRIPE_VERIFY_SESSION]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
