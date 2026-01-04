"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: "user" | "bot";
    content: string;
    timestamp: Date;
}

export default function ChatbotPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            content: "Hi there! I'm your **Academic Assistant**. I can help you find information about:\n\n• University admissions & requirements\n• Scholarships & financial aid\n• Application deadlines & fees\n• General study guidance\n\nWhat can I help you with today?",
            timestamp: new Date()
        }
    ]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u: any) => {
            if (!u) {
                window.location.href = "/login";
            } else {
                setUser(u);
                setLoading(false);
            }
        });
        return () => unsub();
    }, []);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, history: messages })
            });

            const data = await response.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: data.reply || "I'm sorry, I couldn't process that. Please try again.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: "Oops! Something went wrong. Check your connection or try later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#f0f9ff]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#f0f9ff] flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 flex flex-col h-[75vh] overflow-hidden relative">

                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Bot className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-tight">Academic AI</h1>
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Online & Ready to Help
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </Link>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5"
                >
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex items-start gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-primary text-white shadow-lg shadow-primary/20"
                                        }`}>
                                        {msg.role === "user" ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                                    </div>
                                    <div className={`p-6 rounded-[2rem] shadow-sm border ${msg.role === "user"
                                        ? "bg-slate-900 text-white rounded-tr-none border-slate-800"
                                        : "bg-white text-slate-700 rounded-tl-none border-slate-100"
                                        }`}>
                                        {msg.role === "bot" ? (
                                            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-extrabold prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:marker:text-primary prose-a:text-primary prose-a:font-semibold hover:prose-a:underline">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-3 text-slate-400 font-bold text-sm bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-100">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Academic Assistant is thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-8 pt-0 bg-white">
                    <form
                        onSubmit={handleSendMessage}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about NUST admissions, fully-funded scholarships, or IBA fees..."
                            className="w-full pl-8 pr-20 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-3 p-4 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send className="h-6 w-6" />
                        </button>
                    </form>
                    <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Powered by Portal Intelligence • Search real-time data
                    </p>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {[
                    "What are the fees for NUST Engineering?",
                    "Find fully funded undergraduate scholarships",
                    "How to apply for IBA Karachi?"
                ].map((tip) => (
                    <button
                        key={tip}
                        onClick={() => setInput(tip)}
                        className="p-5 bg-white border border-slate-100 rounded-2xl text-left text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                        "{tip}"
                    </button>
                ))}
            </div>
        </main>
    );
}
