"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/ui/notification-bell";
import Image from "next/image";
import Link from "next/link";
import SidebarMenu from "./sidebar-menu";
import { usePWA } from "@/components/pwa-provider";
import { Download } from "lucide-react";

function InstallButton() {
    const { installPrompt, installApp } = usePWA();

    if (!installPrompt) return null;

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={installApp}
            className="hidden md:flex gap-2 border-primary text-primary hover:bg-primary hover:text-white"
        >
            <Download className="h-4 w-4" />
            Install App
        </Button>
    );
}

export default function Header() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { profile: userProfile } = useAuth();

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 z-50">
                <div className="h-full px-4 flex items-center justify-between">
                    {/* Left: Hamburger + Logo */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-400 hover:text-white"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <Link href="/dashboard" className="flex items-center">
                            <Image
                                src="/logo.jpg"
                                alt="DLOD Logo"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        </Link>
                    </div>

                    {/* Center: DLOD Text */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <h1 className="text-xl md:text-2xl font-bold text-white">DLOD</h1>
                    </div>

                    {/* Right: Notification Bell + Profile Picture */}
                    <div className="flex items-center gap-3">
                        <InstallButton />
                        <NotificationBell />
                        {userProfile && (
                            <Link href={`/profile/${userProfile.id}`}>
                                <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-primary transition-colors cursor-pointer">
                                    {userProfile.avatar_url ? (
                                        <Image
                                            src={userProfile.avatar_url}
                                            alt={userProfile.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-800 text-gray-400">
                                            <span className="text-sm font-semibold">
                                                {(userProfile.full_name || "U").charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Sidebar Menu */}
            <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
}
