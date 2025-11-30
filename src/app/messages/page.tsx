"use client";

import { Suspense } from "react";
import MessagesContent from "./messages-content";

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-white">Loading messages...</div>
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
