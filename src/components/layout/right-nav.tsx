"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard,
    UserCircle,
    Briefcase,
    Search,
    MessageSquare,
    ClipboardList,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RightNav() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const getUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role);
                }
            }
        };
        getUserRole();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["laborer", "contractor"] },
        { name: "My Profile", href: "/profile", icon: UserCircle, roles: ["laborer", "contractor"] },
        { name: "Jobs Board", href: "/jobs", icon: Briefcase, roles: ["laborer", "contractor"] },
        { name: "Find Laborers", href: "/contractor/search", icon: Search, roles: ["contractor"] },
        { name: "My Jobs", href: "/contractor/jobs", icon: ClipboardList, roles: ["contractor"] },
        { name: "Chats", href: "/messages", icon: MessageSquare, roles: ["laborer", "contractor"] },
    ];

    // Don't show nav on auth pages
    if (pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/onboarding") || pathname === "/") {
        return null;
    }

    return (
        <nav className="fixed right-0 top-0 h-screen w-20 bg-slate-900/95 backdrop-blur-sm border-l border-white/10 flex flex-col items-center py-6 gap-4 z-50">
            {navItems.map((item) => {
                // Filter based on user role
                if (!item.roles.includes(userRole || "")) return null;

                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all group relative",
                            isActive
                                ? "bg-primary text-white"
                                : "text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <Icon className="h-6 w-6" />
                        <span className="text-[10px] mt-1 font-medium">{item.name.split(" ")[0]}</span>

                        {/* Tooltip */}
                        <div className="absolute right-full mr-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {item.name}
                        </div>
                    </Link>
                );
            })}

            {/* Sign Out Button */}
            <button
                onClick={handleSignOut}
                className="mt-auto flex flex-col items-center justify-center w-16 h-16 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all group relative"
            >
                <LogOut className="h-6 w-6" />
                <span className="text-[10px] mt-1 font-medium">Logout</span>

                {/* Tooltip */}
                <div className="absolute right-full mr-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Sign Out
                </div>
            </button>
        </nav>
    );
}
