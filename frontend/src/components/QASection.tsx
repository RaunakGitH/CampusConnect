// frontend/src/components/QASection.tsx
import { useState, useEffect } from "react";
import { MessageCircleQuestion, Send, CheckCircle2, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { getToken } from "@/services/api";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Question {
  _id: string;
  question: string;
  askedByName: string;
  askedBy: string;
  answer: string;
  answeredByName: string;
  answeredAt: string | null;
  isAnswered: boolean;
  createdAt: string;
}

interface Props {
  listingId: string;
  listingOwnerId?: string;
  onAuthRequired: () => void;
}

// FIX: Use central getToken() instead of directly reading localStorage
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data.data as T;
}

const QASection = ({ listingId, listingOwnerId, onAuthRequired }: Props) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isOwner = user && listingOwnerId && user._id === listingOwnerId;

  useEffect(() => {
    fetch(`${BASE}/qa?listingId=${listingId}`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.data?.questions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [listingId]);

  const handleAsk = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!question.trim() || question.trim().length < 5) {
      setError("Question must be at least 5 characters."); return;
    }
    setError("");
    setAsking(true);
    try {
      const { question: q } = await apiFetch<{ question: Question }>("/qa", {
        method: "POST",
        body: JSON.stringify({ listingId, question: question.trim() }),
      });
      setQuestions((prev) => [q, ...prev]);
      setQuestion("");
    } catch (e: any) {
      setError(e.message || "Failed to post question.");
    } finally { setAsking(false); }
  };

  const handleAnswer = async (qId: string) => {
    const text = answerText[qId]?.trim();
    if (!text) return;
    setSubmittingAnswer(qId);
    try {
      const { question: updated } = await apiFetch<{ question: Question }>(`/qa/${qId}/answer`, {
        method: "POST",
        body: JSON.stringify({ answer: text }),
      });
      setQuestions((prev) => prev.map((q) => q._id === qId ? updated : q));
      setAnswerText((prev) => ({ ...prev, [qId]: "" }));
    } catch (e: any) {
      alert(e.message);
    } finally { setSubmittingAnswer(null); }
  };

  const handleDelete = async (qId: string) => {
    if (!confirm("Remove this question?")) return;
    try {
      await apiFetch(`/qa/${qId}`, { method: "DELETE" });
      setQuestions((prev) => prev.filter((q) => q._id !== qId));
    } catch (e: any) { alert(e.message); }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircleQuestion className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-foreground">
          Questions & Answers
          {questions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({questions.length})</span>
          )}
        </h2>
      </div>

      {/* Ask a question */}
      <div className="rounded-xl border border-border bg-card p-4 mb-5">
        <p className="text-sm font-medium text-foreground mb-3">Ask a question about this listing</p>
        {error && (
          <p className="mb-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-1.5">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder={user ? "e.g. Is electricity included in rent?" : "Sign in to ask a question..."}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            disabled={asking}
          />
          <button
            onClick={handleAsk}
            disabled={asking || !question.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask
          </button>
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-border">
          <MessageCircleQuestion className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isExpd = expanded.has(q._id);
            const canDelete = user && (user._id === q.askedBy || user.role === "admin");
            return (
              <div key={q._id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Question */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {q.askedByName[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{q.askedByName}</span>
                        <span className="text-xs text-muted-foreground/60">
                          · {new Date(q.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">Q: {q.question}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {q.isAnswered && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" /> Answered
                        </span>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(q._id)} className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(q.isAnswered || isOwner) && (
                        <button onClick={() => toggleExpand(q._id)} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
                          {isExpd ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer — show when expanded or always show if answered */}
                {(q.isAnswered || isExpd) && (
                  <div className="border-t border-border bg-muted/30 px-4 py-3">
                    {q.isAnswered ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-bold text-green-700 dark:text-green-400">
                            {q.answeredByName?.[0]?.toUpperCase() || "O"}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{q.answeredByName} (Owner)</span>
                          {q.answeredAt && (
                            <span className="text-xs text-muted-foreground/60">
                              · {new Date(q.answeredAt).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">A: {q.answer}</p>
                      </div>
                    ) : isOwner && !q.isAnswered ? (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Write your answer:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={answerText[q._id] || ""}
                            onChange={(e) => setAnswerText((p) => ({ ...p, [q._id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleAnswer(q._id)}
                            placeholder="Type your answer..."
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <button
                            onClick={() => handleAnswer(q._id)}
                            disabled={submittingAnswer === q._id || !answerText[q._id]?.trim()}
                            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {submittingAnswer === q._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Reply
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QASection;
