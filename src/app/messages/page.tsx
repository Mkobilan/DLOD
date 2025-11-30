"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
}

interface Conversation {
    user_id: string;
    full_name: string;
    last_message: string;
    updated_at: string;
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        getUser();
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation);

            const channel = supabase
                .channel('messages')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `receiver_id=eq.${currentUserId}`, // Listen for incoming messages
                    },
                    (payload) => {
                        // If the message is from the active conversation, add it
                        if (payload.new.sender_id === activeConversation) {
                            setMessages((prev) => [...prev, payload.new as Message]);
                        }
                        // Refresh conversations list to update last message
                        fetchConversations();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [activeConversation, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        // This is a complex query to get unique conversations. 
        // For simplicity in this MVP, we might need a better approach or a dedicated table/view.
        // Here we'll fetch all messages involving the user and process them client-side (not efficient for scale but works for MVP)

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("messages")
            .select(`
        *,
        sender:profiles!sender_id(full_name),
        receiver:profiles!receiver_id(full_name)
      `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order("created_at", { ascending: false });

        if (data) {
            const convMap = new Map<string, Conversation>();

            data.forEach((msg: any) => {
                const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                const otherUserName = msg.sender_id === user.id ? msg.receiver.full_name : msg.sender.full_name;

                if (!convMap.has(otherUserId)) {
                    convMap.set(otherUserId, {
                        user_id: otherUserId,
                        full_name: otherUserName,
                        last_message: msg.content,
                        updated_at: msg.created_at
                    });
                }
            });

            setConversations(Array.from(convMap.values()));
        }
    };

    const fetchMessages = async (otherUserId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
            .order("created_at", { ascending: true });

        if (data) {
            setMessages(data);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !currentUserId) return;

        try {
            const { error } = await supabase
                .from("messages")
                .insert({
                    sender_id: currentUserId,
                    receiver_id: activeConversation,
                    content: newMessage,
                });

            if (error) throw error;

            // Optimistic update
            const optimisticMsg: Message = {
                id: Date.now().toString(),
                sender_id: currentUserId,
                receiver_id: activeConversation,
                content: newMessage,
                created_at: new Date().toISOString()
            };
            setMessages((prev) => [...prev, optimisticMsg]);
            setNewMessage("");
            fetchConversations(); // Update last message in sidebar
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex gap-4">
            {/* Sidebar */}
            <Card className="w-1/3 border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Messages</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2">
                    {conversations.map((conv) => (
                        <div
                            key={conv.user_id}
                            className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10",
                                activeConversation === conv.user_id ? "bg-white/10 border border-primary/30" : ""
                            )}
                            onClick={() => setActiveConversation(conv.user_id)}
                        >
                            <div className="font-semibold text-white">{conv.full_name}</div>
                            <div className="text-sm text-gray-400 truncate">{conv.last_message}</div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className="text-center text-gray-500 mt-4">No conversations yet.</div>
                    )}
                </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
                {activeConversation ? (
                    <>
                        <CardHeader className="border-b border-white/10">
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {conversations.find(c => c.user_id === activeConversation)?.full_name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex",
                                        msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[70%] rounded-lg px-4 py-2 text-sm",
                                            msg.sender_id === currentUserId
                                                ? "bg-primary text-white"
                                                : "bg-white/10 text-gray-200"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </CardContent>
                        <div className="p-4 border-t border-white/10">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-black/20 border-white/10"
                                />
                                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}
            </Card>
        </div>
    );
}
