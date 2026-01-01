"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createPost, createReply } from "@/actions/forum-actions";
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";
import { MessageSquare, ThumbsUp, User as UserIcon, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorRole: string;
    createdAt: string;
    replyCount: number;
}

interface Reply {
    id: string;
    content: string;
    authorName: string;
    authorRole: string;
    createdAt: string;
}

function PostItem({ post, user, userRole }: { post: Post, user: User | null, userRole: string }) {
    const [expanded, setExpanded] = useState(false);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        let unsubscribe: () => void;
        if (expanded && db) {
            setLoadingReplies(true);
            const q = query(collection(db, "discussions", post.id, "replies"), orderBy("createdAt", "asc"));
            unsubscribe = onSnapshot(q, (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reply));
                setReplies(msgs);
                setLoadingReplies(false);
            });
        }
        return () => unsubscribe && unsubscribe();
    }, [expanded, post.id]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Login to reply");
            return;
        }
        if (!replyContent.trim()) return;

        setSubmittingReply(true);
        try {
            const result = await createReply(post.id, replyContent, user.uid, (user as any).displayName || "Anonymous", userRole);
            if (result.success) {
                toast.success("Reply sent");
                setReplyContent("");
            } else {
                toast.error(result.error || "Failed to send reply");
            }
        } catch (e) {
            toast.error("Failed to send reply");
        } finally {
            setSubmittingReply(false);
        }
    };

    return (
        <motion.div
            layout // Enable layout animation for smooth expanding
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border rounded-xl bg-card shadow-sm overflow-hidden"
        >
            <div className="p-6">
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
                </div>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <MessageSquare className="h-4 w-4" />
                        {post.replyCount} Replies
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-muted/30 border-t border-border"
                    >
                        <div className="p-6 space-y-4">
                            {loadingReplies ? (
                                <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
                            ) : replies.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-4">No replies yet. Be the first!</p>
                            ) : (
                                <div className="space-y-4">
                                    {replies.map(reply => (
                                        <div key={reply.id} className="bg-background border border-border rounded-lg p-4">
                                            <div className="flex justify-between items-start text-xs text-muted-foreground mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${reply.authorRole === 'mentor' ? 'text-indigo-600' : ''}`}>
                                                        {reply.authorName}
                                                        {reply.authorRole === 'mentor' && " (Mentor)"}
                                                    </span>
                                                </div>
                                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {user ? (
                                <form onSubmit={handleReply} className="flex gap-2 mt-4">
                                    <input
                                        value={replyContent}
                                        onChange={e => setReplyContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submittingReply || !replyContent.trim()}
                                        className="inline-flex items-center justify-center rounded-md bg-primary w-10 h-10 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {submittingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </form>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-2">Please login to reply.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function ForumPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState("user");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!auth || !db) return;

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
        if (!user) return;
        setSubmitting(true);
        try {
            const result = await createPost(title, content, user.uid, (user as any).displayName || "Anonymous", userRole);
            if (result.success) {
                toast.success("Question posted!");
                setIsModalOpen(false);
                setTitle("");
                setContent("");
            } else {
                toast.error(result.error || "Failed to post");
            }
        } catch (e) {
            toast.error("Failed to post");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Discussion Forum</h1>
                    <p className="text-muted-foreground">Ask questions and get help from mentors.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center font-medium"
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask Question
                </button>
            </div>

            <div className="space-y-6">
                {loading && <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-xl">
                        <p className="text-muted-foreground">No discussions yet. Be the first to ask!</p>
                    </div>
                )}

                {posts.map((post) => (
                    <PostItem key={post.id} post={post} user={user} userRole={userRole} />
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
