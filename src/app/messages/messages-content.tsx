"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    avatar_url: string | null;
}

export default function MessagesContent() {
    const searchParams = useSearchParams();
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

        // Check if there's a user parameter in the URL
        const userParam = searchParams.get('user');
        if (userParam) {
            setActiveConversation(userParam);
        }
    }, []);

    useEffect(() => {
        if (activeConversation && currentUserId) {
            console.log('Setting up subscription for:', { activeConversation, currentUserId });
            fetchMessages(activeConversation);

            // Subscribe to messages in this conversation (both sent and received)
            const channel = supabase
                .channel(`messages-${activeConversation}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                    },
                    (payload) => {
                        console.log('Realtime payload received:', payload);
                        const newMsg = payload.new as Message;
                        // Only add message if it's part of the active conversation
                        if (
                            (newMsg.sender_id === currentUserId && newMsg.receiver_id === activeConversation) ||
                            (newMsg.sender_id === activeConversation && newMsg.receiver_id === currentUserId)
                        ) {
                            console.log('Message matches active conversation, adding to state');
                            setMessages((prev) => {
                                // Avoid duplicates
                                if (prev.some(m => m.id === newMsg.id)) {
                                    console.log('Duplicate message detected, skipping');
                                    return prev;
                                }
                                return [...prev, newMsg];
                            });
                            fetchConversations();
                        } else {
                            console.log('Message does NOT match active conversation', {
                                msgSender: newMsg.sender_id,
                                msgReceiver: newMsg.receiver_id,
                                currentUserId,
                                activeConversation
                            });
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('Subscription status:', status);
                });

            return () => {
                console.log('Cleaning up subscription');
                supabase.removeChannel(channel);
            };
        }
    }, [activeConversation, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("messages")
            .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url),
        receiver:profiles!receiver_id(full_name, avatar_url)
      `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order("created_at", { ascending: false });

        if (data) {
            const convMap = new Map<string, Conversation>();

            data.forEach((msg: any) => {
                const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                const otherProfile = msg.sender_id === user.id ? msg.receiver : msg.sender;

                if (!convMap.has(otherUserId)) {
                    convMap.set(otherUserId, {
                        user_id: otherUserId,
                        full_name: otherProfile.full_name,
                        last_message: msg.content,
                        updated_at: msg.created_at,
                        avatar_url: otherProfile.avatar_url
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

            // Clear input - the real-time subscription will add the message
            setNewMessage("");
            // Update conversations list to show this as the latest message
            fetchConversations();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex gap-4">
            <Card className="w-1/3 border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Messages</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2">
                    {conversations.map((conv) => (
                        <div
                            key={conv.user_id}
                            className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10 flex items-center gap-3",
                                activeConversation === conv.user_id ? "bg-white/10 border border-primary/30" : ""
                            )}
                            onClick={() => setActiveConversation(conv.user_id)}
                        >
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                                {conv.avatar_url ? (
                                    <Image
                                        src={conv.avatar_url}
                                        alt={conv.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate">{conv.full_name}</div>
                                <div className="text-sm text-gray-400 truncate">{conv.last_message}</div>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className="text-center text-gray-500 mt-4">No conversations yet.</div>
                    )}
                </CardContent>
            </Card>

            <Card className="flex-1 border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
                {activeConversation ? (
                    <>
                        <CardHeader className="border-b border-white/10">
                            <CardTitle className="text-lg text-white flex items-center gap-3">
                                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                                    {conversations.find(c => c.user_id === activeConversation)?.avatar_url ? (
                                        <Image
                                            src={conversations.find(c => c.user_id === activeConversation)!.avatar_url!}
                                            alt="User"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <User className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                                {conversations.find(c => c.user_id === activeConversation)?.full_name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                const isCurrentUser = msg.sender_id === currentUserId;
                                const otherUser = conversations.find(c => c.user_id === activeConversation);

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex items-end gap-2",
                                            isCurrentUser ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {!isCurrentUser && (
                                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10 mb-1">
                                                {otherUser?.avatar_url ? (
                                                    <Image
                                                        src={otherUser.avatar_url}
                                                        alt="User"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[70%] rounded-lg px-4 py-2 text-sm",
                                                isCurrentUser
                                                    ? "bg-primary text-white"
                                                    : "bg-white/10 text-gray-200"
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
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
