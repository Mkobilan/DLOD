"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: string;
    content: string;
    related_id: string | null;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const setupNotifications = async () => {
            // Get current user first
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch initial notifications
            fetchNotifications();

            // Subscribe to new notifications for this user only
            const channel = supabase
                .channel("notifications")
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log("New notification received:", payload);
                        const newNotif = payload.new as Notification;
                        setNotifications((prev) => [newNotif, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                    }
                )
                .subscribe((status) => {
                    console.log("Notification subscription status:", status);
                });

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupNotifications();
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.is_read).length);
        }
    };

    const markAsRead = async (notificationId: string) => {
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notificationId);

        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
    };

    const handleNotificationClick = async (notification: Notification) => {
        await markAsRead(notification.id);

        // Handle navigation based on notification type
        if (notification.type === "chat_request") {
            // Navigate to messages with the related user
            if (notification.related_id) {
                router.push(`/messages?user=${notification.related_id}`);
            }
        } else if (notification.type === "message") {
            // Navigate to messages
            router.push("/messages");
        } else if (notification.type === "application_received") {
            // Navigate to contractor applications page
            router.push("/contractor/applications");
        } else if (notification.type === "application_status") {
            // Navigate to jobs page (laborer view)
            router.push("/jobs");
        }

        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-400 hover:text-white"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-slate-900 border-white/10" align="end">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs text-primary hover:text-primary/80 hover:bg-white/5"
                        >
                            Mark As Read
                        </Button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${!notification.is_read ? "bg-primary/5" : ""
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <p className="text-sm text-white">{notification.content}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.created_at).toLocaleDateString()} at{" "}
                                    {new Date(notification.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
