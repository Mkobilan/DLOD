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

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new NextResponse("No signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error("No userId in session metadata");
                    break;
                }

                // Get the subscription ID from the session
                const subscriptionId = session.subscription as string;

                // Update the user's profile
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "active",
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscriptionId,
                    })
                    .eq("id", userId);

                if (error) {
                    console.error("Error updating profile:", error);
                }

                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Update subscription status
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: subscription.status,
                    })
                    .eq("stripe_customer_id", customerId);

                if (error) {
                    console.error("Error updating subscription status:", error);
                }

                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Update subscription status to canceled
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "canceled",
                    })
                    .eq("stripe_customer_id", customerId);

                if (error) {
                    console.error("Error updating subscription status:", error);
                }

                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Error processing webhook:", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }
}
