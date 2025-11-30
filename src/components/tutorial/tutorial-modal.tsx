"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Hammer, Briefcase, Search, CheckCircle, MessageSquare, Users, FileText } from "lucide-react";

interface TutorialModalProps {
    role: "laborer" | "contractor";
    onComplete: () => void;
}

export default function TutorialModal({ role, onComplete }: TutorialModalProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    const laborerSteps = [
        {
            title: "Welcome to DLOD!",
            description: "We're glad you're here. Let's get you ready to find work.",
            icon: <Hammer className="h-12 w-12 text-primary mb-4" />,
        },
        {
            title: "Find Jobs",
            description: "Go to the Jobs Board to browse available jobs in your area.",
            icon: <Search className="h-12 w-12 text-primary mb-4" />,
        },
        {
            title: "Apply for Work",
            description: "Found a job you like? Apply instantly and wait for approval.",
            icon: <FileText className="h-12 w-12 text-primary mb-4" />,
        },
        {
            title: "Chat & Connect",
            description: "Once approved, you can chat directly with the contractor or business owner.",
            icon: <MessageSquare className="h-12 w-12 text-primary mb-4" />,
        },
    ];

    const contractorSteps = [
        {
            title: "Welcome to DLOD!",
            description: "Ready to hire? Let's show you how to find the best workers.",
            icon: <Briefcase className="h-12 w-12 text-secondary mb-4" />,
        },
        {
            title: "Post a Job",
            description: "Create a job posting to let laborers know what you need.",
            icon: <FileText className="h-12 w-12 text-secondary mb-4" />,
        },
        {
            title: "Find Laborers",
            description: "Search our database of skilled laborers and invite them to your jobs.",
            icon: <Search className="h-12 w-12 text-secondary mb-4" />,
        },
        {
            title: "Manage Applications",
            description: "Review applications, approve workers, and get the job done.",
            icon: <Users className="h-12 w-12 text-secondary mb-4" />,
        },
        {
            title: "Chat & Coordinate",
            description: "Communicate directly with your approved workers to coordinate details.",
            icon: <MessageSquare className="h-12 w-12 text-secondary mb-4" />,
        },
    ];

    const steps = role === "laborer" ? laborerSteps : contractorSteps;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setIsOpen(false);
        onComplete();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] text-center">
                <DialogHeader>
                    <div className="flex justify-center">
                        {steps[currentStep].icon}
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">
                        {steps[currentStep].title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        {steps[currentStep].description}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center gap-1 mt-4 mb-4">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 w-2 rounded-full transition-colors ${index === currentStep ? (role === "laborer" ? "bg-primary" : "bg-secondary") : "bg-gray-600"
                                }`}
                        />
                    ))}
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={handleNext} className="w-full sm:w-auto min-w-[120px]">
                        {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
