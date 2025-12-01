"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, Lock, Eye, Palette, Type, HelpCircle, Smartphone, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePWA } from "@/components/pwa-provider";
import { toast } from "sonner";

interface UserSettings {
    notification_chat_request: boolean;
    notification_message: boolean;
    notification_application: boolean;
    notification_review: boolean;
    notification_system: boolean;
    hide_phone_number: boolean;
    theme: "dark" | "light";
    text_size: "small" | "medium" | "large";
    has_seen_tutorial: boolean;
}

export default function SettingsPage() {
    const router = useRouter();
    const { checkForUpdates } = usePWA();
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        checkAuth();
        fetchSettings();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/");
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/settings");
            if (response.ok) {
                const data = await response.json();
                setSettings(data);

                // Apply theme
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(data.theme);

                // Apply text size
                document.documentElement.classList.remove("text-small", "text-medium", "text-large");
                document.documentElement.classList.add(`text-${data.text_size}`);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates: Partial<UserSettings>) => {
        if (!settings) return;

        setSaving(true);
        try {
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updatedSettings = await response.json();
                setSettings(updatedSettings);

                // Apply theme if changed
                if (updates.theme) {
                    document.documentElement.classList.remove("light", "dark");
                    document.documentElement.classList.add(updates.theme);
                }

                // Apply text size if changed
                if (updates.text_size) {
                    document.documentElement.classList.remove("text-small", "text-medium", "text-large");
                    document.documentElement.classList.add(`text-${updates.text_size}`);
                }
            }
        } catch (error) {
            console.error("Error updating settings:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCheckForUpdates = async () => {
        setCheckingUpdate(true);
        try {
            const hasUpdate = await checkForUpdates();
            if (hasUpdate) {
                toast.success("New version available! Reloading...");
                window.location.reload();
            } else {
                toast.info("App is up to date");
            }
        } catch (error) {
            toast.error("Failed to check for updates");
        } finally {
            setCheckingUpdate(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await fetch("/api/settings/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordSuccess("Password updated successfully!");
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                setPasswordError(data.error || "Failed to update password");
            }
        } catch (error) {
            setPasswordError("An error occurred. Please try again.");
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading || !settings) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your account preferences and settings</p>
                </div>

                {/* Notification Settings */}
                <Card className="bg-slate-800/50 border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-chat" className="text-white font-medium">Chat Requests</Label>
                                <p className="text-sm text-gray-400">Receive notifications when someone wants to chat</p>
                            </div>
                            <Switch
                                id="notif-chat"
                                checked={settings.notification_chat_request}
                                onCheckedChange={(checked) => updateSettings({ notification_chat_request: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-message" className="text-white font-medium">Messages</Label>
                                <p className="text-sm text-gray-400">Receive notifications for new messages</p>
                            </div>
                            <Switch
                                id="notif-message"
                                checked={settings.notification_message}
                                onCheckedChange={(checked) => updateSettings({ notification_message: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-application" className="text-white font-medium">Job Applications</Label>
                                <p className="text-sm text-gray-400">Receive notifications about job applications</p>
                            </div>
                            <Switch
                                id="notif-application"
                                checked={settings.notification_application}
                                onCheckedChange={(checked) => updateSettings({ notification_application: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-review" className="text-white font-medium">Reviews</Label>
                                <p className="text-sm text-gray-400">Receive notifications when you get a review</p>
                            </div>
                            <Switch
                                id="notif-review"
                                checked={settings.notification_review}
                                onCheckedChange={(checked) => updateSettings({ notification_review: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notif-system" className="text-white font-medium">System Notifications</Label>
                                <p className="text-sm text-gray-400">Receive important system updates</p>
                            </div>
                            <Switch
                                id="notif-system"
                                checked={settings.notification_system}
                                onCheckedChange={(checked) => updateSettings({ notification_system: checked })}
                            />
                        </div>
                    </div>
                </Card>

                {/* Privacy Settings */}
                <Card className="bg-slate-800/50 border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Eye className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold text-white">Privacy</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="hide-phone" className="text-white font-medium">Hide Phone Number</Label>
                            <p className="text-sm text-gray-400">Hide your phone number on your public profile</p>
                        </div>
                        <Switch
                            id="hide-phone"
                            checked={settings.hide_phone_number}
                            onCheckedChange={(checked) => updateSettings({ hide_phone_number: checked })}
                        />
                    </div>
                </Card>

                {/* Appearance Settings */}
                <Card className="bg-slate-800/50 border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Palette className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold text-white">Appearance</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white font-medium mb-3 block">Theme</Label>
                            <div className="flex gap-3">
                                <Button
                                    variant={settings.theme === "dark" ? "default" : "outline"}
                                    onClick={() => updateSettings({ theme: "dark" })}
                                    className="flex-1"
                                >
                                    Dark
                                </Button>
                                <Button
                                    variant={settings.theme === "light" ? "default" : "outline"}
                                    onClick={() => updateSettings({ theme: "light" })}
                                    className="flex-1"
                                >
                                    Light
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label className="text-white font-medium mb-3 block flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Text Size
                            </Label>
                            <div className="flex gap-3">
                                <Button
                                    variant={settings.text_size === "small" ? "default" : "outline"}
                                    onClick={() => updateSettings({ text_size: "small" })}
                                    className="flex-1"
                                >
                                    Small
                                </Button>
                                <Button
                                    variant={settings.text_size === "medium" ? "default" : "outline"}
                                    onClick={() => updateSettings({ text_size: "medium" })}
                                    className="flex-1"
                                >
                                    Medium
                                </Button>
                                <Button
                                    variant={settings.text_size === "large" ? "default" : "outline"}
                                    onClick={() => updateSettings({ text_size: "large" })}
                                    className="flex-1"
                                >
                                    Large
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tutorial Settings */}
                <Card className="bg-slate-800/50 border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold text-white">Tutorial</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-white font-medium">App Tour</Label>
                            <p className="text-sm text-gray-400">View the welcome tutorial again</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await updateSettings({ has_seen_tutorial: false });
                                router.push("/dashboard");
                            }}
                        >
                            Take the Tour
                        </Button>
                    </div>
                </Card>

                {/* App Info & Updates */}
                <Card className="bg-slate-800/50 border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Smartphone className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold text-white">App Info</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-white font-medium">App Version</Label>
                            <p className="text-sm text-gray-400">Check for the latest updates</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleCheckForUpdates}
                            disabled={checkingUpdate}
                        >
                            {checkingUpdate ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                "Check for Updates"
                            )}
                        </Button>
                    </div>
                </Card>

                {/* Security Settings */}
                <Card className="bg-slate-800/50 border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold text-white">Security</h2>
                    </div>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <Label htmlFor="current-password" className="text-white font-medium">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                className="bg-slate-700/50 border-white/10 text-white mt-2"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-password" className="text-white font-medium">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="bg-slate-700/50 border-white/10 text-white mt-2"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirm-password" className="text-white font-medium">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="bg-slate-700/50 border-white/10 text-white mt-2"
                                required
                            />
                        </div>
                        {passwordError && (
                            <p className="text-red-500 text-sm">{passwordError}</p>
                        )}
                        {passwordSuccess && (
                            <p className="text-green-500 text-sm">{passwordSuccess}</p>
                        )}
                        <Button type="submit" disabled={passwordLoading} className="w-full">
                            {passwordLoading ? "Updating..." : "Change Password"}
                        </Button>
                    </form>
                </Card>

                {saving && (
                    <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
                        Saving settings...
                    </div>
                )}
            </div>
        </div>
    );
}
