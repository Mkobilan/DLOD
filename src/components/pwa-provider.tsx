"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PWAContextType {
    installPrompt: any;
    isInstalled: boolean;
    installApp: () => void;
    checkForUpdates: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
    const context = useContext(PWAContext);
    if (!context) {
        throw new Error("usePWA must be used within a PWAProvider");
    }
    return context;
};

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // Register service worker
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("✅ Service Worker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.error("❌ Service Worker registration failed:", error);
                });

            // Listen for beforeinstallprompt
            const handleBeforeInstallPrompt = (e: any) => {
                console.log("🎉 beforeinstallprompt event fired!");
                e.preventDefault();
                setInstallPrompt(e);
            };

            window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

            // Listen for app installed
            const handleAppInstalled = () => {
                console.log("✅ App installed successfully");
                setIsInstalled(true);
                setInstallPrompt(null);
            };

            window.addEventListener("appinstalled", handleAppInstalled);

            // Check if already running as installed PWA
            if (window.matchMedia("(display-mode: standalone)").matches) {
                console.log("✅ App is running in standalone mode (already installed)");
                setIsInstalled(true);
            } else {
                console.log("ℹ️ App is running in browser mode (not installed)");
                console.log("ℹ️ Waiting for beforeinstallprompt event...");
            }

            // Cleanup
            return () => {
                window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
                window.removeEventListener("appinstalled", handleAppInstalled);
            };
        } else {
            console.warn("⚠️ Service Workers not supported in this browser");
        }
    }, []);

    const installApp = () => {
        if (installPrompt) {
            installPrompt.prompt();
            installPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("✅ User accepted the install prompt");
                } else {
                    console.log("❌ User dismissed the install prompt");
                }
                setInstallPrompt(null);
            });
        }
    };

    const checkForUpdates = async (): Promise<boolean> => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.update();

                if (registration.installing || registration.waiting) {
                    return true;
                }
            } catch (error) {
                console.error("Error checking for updates:", error);
            }
        }
        return false;
    };

    return (
        <PWAContext.Provider value={{ installPrompt, isInstalled, installApp, checkForUpdates }}>
            {children}
        </PWAContext.Provider>
    );
};
