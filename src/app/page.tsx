import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, MessageSquare, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Day Labor On Demand
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect with skilled laborers or find your next job opportunity instantly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <Briefcase className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-white">Find Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Browse available jobs in your area and apply instantly.</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <Users className="h-12 w-12 text-secondary mb-4" />
              <CardTitle className="text-white">Hire Laborers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Find skilled workers ready to start immediately.</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-accent mb-4" />
              <CardTitle className="text-white">Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Communicate directly with contractors or laborers.</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <Star className="h-12 w-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Reviews & Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Build trust through verified reviews and ratings.</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center space-x-4 text-gray-400">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/disclaimer" className="hover:text-white transition-colors">
            Disclaimer
          </Link>
        </div>
      </div>
    </div>
  );
}
