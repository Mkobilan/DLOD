"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PWAContextType {
    installPrompt: any;
    isInstalled: boolean;
    installApp: () => void;
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
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("Service Worker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.error("Service Worker registration failed:", error);
                });

            window.addEventListener("beforeinstallprompt", (e) => {
                e.preventDefault();
                setInstallPrompt(e);
                console.log("beforeinstallprompt event captured");
            });

            window.addEventListener("appinstalled", () => {
                setIsInstalled(true);
                setInstallPrompt(null);
                console.log("App installed");
            });

            if (window.matchMedia("(display-mode: standalone)").matches) {
                setIsInstalled(true);
            }
        }
    }, []);

    const installApp = () => {
        if (installPrompt) {
            installPrompt.prompt();
            installPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the install prompt");
                } else {
                    console.log("User dismissed the install prompt");
                }
                setInstallPrompt(null);
            });
        }
    };

    return (
        <PWAContext.Provider value={{ installPrompt, isInstalled, installApp }}>
            {children}
        </PWAContext.Provider>
    );
};
