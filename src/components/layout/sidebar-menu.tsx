"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { X, LayoutDashboard, UserCircle, Briefcase, Search, MessageSquare, ClipboardList, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, signOut } = useAuth();
    const userRole = profile?.role;

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["laborer", "contractor"] },
        { name: "My Profile", href: "/profile", icon: UserCircle, roles: ["laborer", "contractor"] },
        { name: "Jobs Board", href: "/jobs", icon: Briefcase, roles: ["laborer", "contractor"] },
        { name: "Find Laborers", href: "/contractor/search", icon: Search, roles: ["contractor"] },
        { name: "My Jobs", href: "/contractor/jobs", icon: ClipboardList, roles: ["contractor"] },
        { name: "Applications", href: "/contractor/applications", icon: ClipboardList, roles: ["contractor"] },
        { name: "Messages", href: "/messages", icon: MessageSquare, roles: ["laborer", "contractor"] },
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">Menu</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        {navItems.map((item) => {
                            if (!item.roles.includes(userRole || "")) return null;

                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary text-white"
                                            : "text-gray-400 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Section */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        <Link
                            href="/settings"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                pathname === "/settings"
                                    ? "bg-primary text-white"
                                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            <span className="font-medium">Settings</span>
                        </Link>
                        <Button
                            onClick={handleSignOut}
                            variant="ghost"
                            className="w-full justify-start text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
