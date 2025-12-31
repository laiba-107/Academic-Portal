"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createPost, createReply } from "@/actions/forum-actions";
import { useAuthState } from "react-firebase-hooks/auth"; // Need to install or use native hook. I'll use native hook to save installs or simple custom hook. I used native in Navbar. I'll use native here.
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";
import { MessageSquare, ThumbsUp, User as UserIcon, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper Interface
interface Post {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorRole: string;
    createdAt: string;
    replyCount: number;
}

export default function ForumPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState("user");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [configError, setConfigError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Post Form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Auth & Data Listener
    useEffect(() => {
        // Safety check: Don't run if Firebase isn't initialized
        if (!auth || !db) {
            console.warn("Firebase not initialized. Please add credentials to .env.local");
            setConfigError(true);
            setLoading(false);
            return;
        }

        const unsubAuth = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                const token = await u.getIdTokenResult();
                setUserRole(token.claims.role as string || "user");
            }
        });

        const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
        const unsubData = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];
            setPosts(msgs);
            setLoading(false);
        });

        return () => {
            unsubAuth();
            unsubData();
        };
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to post.");
            return;
        }
        setSubmitting(true);
        try {
            await createPost(title, content, user.uid, (user as any).nickname || user.email?.split('@')[0] || "Anonymous", userRole);
            toast.success("Question posted!");
            setIsModalOpen(false);
            setTitle("");
            setContent("");
        } catch (e) {
            toast.error("Failed to post");
        } finally {
            setSubmitting(false);
        }
    };

    if (configError) {
        return (
            <div className="container py-8 max-w-4xl">
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                        <span className="mr-2">⚠️</span> Configuration Missing
                    </h3>
                    <p className="mb-4">
                        The forum feature requires Firebase configuration.
                        Please add your Firebase credentials to the <code className="bg-yellow-100 px-1 py-0.5 rounded">.env.local</code> file.
                    </p>
                    <p className="text-sm opacity-80">
                        Check the README.md for setup instructions.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Discussion Forum</h1>
                    <p className="text-muted-foreground">Ask questions and get help from mentors.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center"
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask Question
                </button>
            </div>

            <div className="space-y-4">
                {loading && <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-xl">
                        <p className="text-muted-foreground">No discussions yet. Be the first to ask!</p>
                    </div>
                )}

                {posts.map((post) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={post.id}
                        className="border border-border rounded-xl p-6 bg-card shadow-sm hover:border-primary/50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.authorRole === 'mentor' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {post.authorRole === 'mentor' ? 'Mentor' : 'Student'}
                                    </span>
                                    <span>{post.authorName}</span>
                                    <span>•</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm">{post.replyCount}</span>
                            </div>
                        </div>
                        <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                            {/* Reply button could act here, but for MVP just showing logic */}
                            <span className="text-xs text-muted-foreground italic">
                                Real-time updates active
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-background w-full max-w-lg rounded-xl border border-border shadow-xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-4">Ask a Question</h2>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full flex h-10 rounded-md border border-input bg-background px-3"
                                        placeholder="What's your question?"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Details</label>
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                                        placeholder="Describe your question in detail..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Post Question"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
