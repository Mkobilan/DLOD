"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, ShieldCheck, Zap, Globe } from "lucide-react";
import { toast } from "sonner";

export default function StepPaywall() {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create checkout session");
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
            <Card className="w-full max-w-4xl border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden relative">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px]" />
                </div>

                <div className="grid md:grid-cols-2 gap-0 relative z-10">
                    {/* Left Side: Sales Copy */}
                    <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center border-r border-white/5">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Unlock Unlimited Hiring Power
                            </h2>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                Hire a day laborer anywhere, anytime. No more restrictions. No more middleman fees eating into your budget.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="rounded-full bg-green-500/10 p-2 mt-1">
                                    <ShieldCheck className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg">Pay What They're Worth</h3>
                                    <p className="text-gray-400">No more paying a day labor agency $20/hr while the laborer only gets $12-15/hr. You set the rate.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="rounded-full bg-blue-500/10 p-2 mt-1">
                                    <Globe className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg">Anywhere, Anytime</h3>
                                    <p className="text-gray-400">No more relying on the location of a day labor agency. Find workers wherever your job site is.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="rounded-full bg-purple-500/10 p-2 mt-1">
                                    <Zap className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg">Direct Connection</h3>
                                    <p className="text-gray-400">Hire people at your own rate. Build your own network of reliable workers.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: CTA */}
                    <div className="p-8 md:p-12 flex flex-col justify-center items-center bg-white/5 space-y-8">
                        <div className="text-center space-y-2">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">Premium Access</span>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold text-white">$99</span>
                                <span className="text-xl text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-gray-400">Cancel anytime. No hidden fees.</p>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Unlimited Job Postings</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Direct Chat with Laborers</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Access to Verified Profiles</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Priority Support</span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all text-lg font-semibold h-14 shadow-lg shadow-primary/20"
                                onClick={handleSubscribe}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Start Hiring Now"
                                )}
                            </Button>
                            <p className="text-xs text-center text-gray-500">
                                Secure payment via Stripe. By subscribing, you agree to our Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
