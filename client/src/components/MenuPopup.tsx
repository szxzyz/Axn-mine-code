import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Receipt, ChevronRight, Shield, ArrowLeft, Clock, CheckCircle,
  XCircle, Loader2, Trophy, Video, CheckSquare, Square,
  Plus, Youtube, Instagram, Info,
} from "lucide-react";
import { format } from "date-fns";

const ACCENT = "#00E676";
const ACCENT_DIM = "rgba(0,230,118,0.10)";

interface MenuPopupProps {
  onClose: () => void;
  onAboutClick?: () => void;
}

type View = "main" | "transactions" | "legal" | "contest";

const VIEW_RANGES = [
  { label: "100 – 999 Views", value: "100-999", reward: "100 ANX" },
  { label: "1K – 4.9K Views", value: "1k-4.9k", reward: "250 ANX" },
  { label: "5K – 9.9K Views", value: "5k-9.9k", reward: "500 ANX" },
  { label: "10K – 49.9K Views", value: "10k-49.9k", reward: "1K ANX" },
  { label: "50K – 99.9K Views", value: "50k-99.9k", reward: "5K ANX" },
  { label: "100K – 499.9K Views", value: "100k-499.9k", reward: "10K ANX" },
  { label: "500K – 999.9K Views", value: "500k-999.9k", reward: "25K ANX" },
  { label: "1M+ Views", value: "1m+", reward: "100K ANX" },
];

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke={ACCENT} strokeWidth="1.8" />
      <path d="M2 20c0-3 3-5.5 7-5.5s7 2.5 7 5.5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="8" r="2.5" stroke={ACCENT} strokeWidth="1.8" />
      <path d="M22 20c0-2.5-2-4.5-4-4.5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function OnlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill={ACCENT} />
      <circle cx="12" cy="12" r="6" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="10" stroke={ACCENT} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function WithdrawIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-2" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 12h6M19 9l3 3-3 3" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="12" r="2" stroke={ACCENT} strokeWidth="1.8" />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke={ACCENT} strokeWidth="1.8" />
      <path d="M3 9h18" stroke={ACCENT} strokeWidth="1.8" />
      <path d="M8 4V2M16 4V2" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 13h4M7 16h2" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function MenuPopup({ onClose, onAboutClick }: MenuPopupProps) {
  const [view, setView] = useState<View>("main");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [link, setLink] = useState("");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 60000,
  });

  const { data: txData, isLoading: txLoading } = useQuery<any>({
    queryKey: ["/api/withdrawals"],
    enabled: view === "transactions",
    retry: false,
  });

  const { data: projectStats } = useQuery<{
    totalUsers: number;
    onlineUsers: number;
    totalWithdrawn: number;
    projectDays: number;
  }>({
    queryKey: ["/api/project-stats"],
    retry: false,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const telegramUser =
    typeof window !== "undefined"
      ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user
      : null;

  const photoUrl = telegramUser?.photo_url || user?.profileImageUrl || null;
  const displayName = user?.firstName || telegramUser?.first_name || "User";
  const username = user?.telegramUsername || telegramUser?.username || null;
  const telegramId = user?.telegramId || telegramUser?.id?.toString() || null;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  const withdrawals = txData?.withdrawals || [];

  const contestMutation = useMutation({
    mutationFn: async (data: { link: string; viewsRange: string }) => {
      const res = await fetch("/api/contest/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Submission failed");
      }
      return res.json();
    },
    onSuccess: () => setSubmitted(true),
  });

  const canSubmit = link.trim() !== "" && selectedRange !== null && check1 && check2 && check3;

  const handleContestSubmit = () => {
    if (!canSubmit) return;
    contestMutation.mutate({ link: link.trim(), viewsRange: selectedRange! });
  };

  const resetContestForm = () => {
    setLink(""); setSelectedRange(null);
    setCheck1(false); setCheck2(false); setCheck3(false);
    setSubmitted(false); setShowSubmitForm(false);
  };

  const goBack = () => {
    if (showSubmitForm) {
      resetContestForm();
    } else {
      setView("main");
    }
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase();
    if (s?.includes("approved") || s?.includes("success") || s?.includes("paid"))
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (s?.includes("reject") || s?.includes("failed"))
      return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4" style={{ color: ACCENT }} />;
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s?.includes("approved") || s?.includes("success") || s?.includes("paid")) return "text-green-400";
    if (s?.includes("reject") || s?.includes("failed")) return "text-red-400";
    return "";
  };

  const isSubView = view !== "main" || showSubmitForm;

  const viewTitle: Record<View, string> = {
    main: "Menu",
    transactions: "Transactions",
    legal: "Legal Info",
    contest: "Contest",
  };

  const currentTitle = showSubmitForm ? "Submit Content" : viewTitle[view];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          style={{ background: "#000" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 pt-14 pb-4 flex-shrink-0"
            style={{ borderBottom: "1px solid #111" }}
          >
            {isSubView ? (
              <button
                onClick={goBack}
                className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            )}
            <h1 className="text-white font-black text-base">{currentTitle}</h1>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ─── Main View ─── */}
            {view === "main" && (
              <div className="px-4 py-4 space-y-3">
                {/* Account Info */}
                <div className="rounded-2xl p-4" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#333" }}>Account</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={{ border: `2px solid rgba(0,230,118,0.25)`, background: "#1a1a1a" }}
                    >
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{displayName}</p>
                      {username && <p className="text-[11px] mt-0.5" style={{ color: "#555" }}>@{username}</p>}
                      {telegramId && <p className="text-[10px] mt-0.5 font-mono" style={{ color: "#333" }}>ID: {telegramId}</p>}
                      {memberSince && (
                        <p className="text-[10px] mt-0.5" style={{ color: "#333" }}>
                          Member since: <span style={{ color: "#555" }}>{memberSince}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Statistics */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#333" }}>Project Statistics</p>
                  </div>
                  <div className="divide-y" style={{ borderColor: "#131313" }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UsersIcon />
                        <span className="text-white/60 text-sm font-medium">Users</span>
                      </div>
                      <span className="text-white font-black text-sm">
                        {projectStats?.totalUsers !== undefined ? projectStats.totalUsers.toLocaleString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <OnlineIcon />
                        <span className="text-white/60 text-sm font-medium">Online Now</span>
                      </div>
                      <span className="font-black text-sm" style={{ color: ACCENT }}>
                        {projectStats?.onlineUsers !== undefined ? projectStats.onlineUsers.toLocaleString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <WithdrawIcon />
                        <span className="text-white/60 text-sm font-medium">Total Withdrawals</span>
                      </div>
                      <span className="text-white font-black text-sm">
                        {projectStats?.totalWithdrawn !== undefined
                          ? `${projectStats.totalWithdrawn.toLocaleString()} ANX`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <ProjectIcon />
                        <span className="text-white/60 text-sm font-medium">Project Age</span>
                      </div>
                      <span className="text-white font-black text-sm">
                        {projectStats?.projectDays !== undefined
                          ? `${projectStats.projectDays} day${projectStats.projectDays !== 1 ? "s" : ""}`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* About ANX */}
                <button
                  onClick={() => { onAboutClick?.(); onClose(); }}
                  className="w-full flex items-center justify-between rounded-2xl p-4 transition-all active:scale-[0.99]"
                  style={{ background: "#181818", border: "1px solid #252525", boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-bold text-sm">About ANX</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </button>

                {/* Contest */}
                <button
                  onClick={() => setView("contest")}
                  className="w-full flex items-center justify-between rounded-2xl p-4 transition-all active:scale-[0.99]"
                  style={{ background: "#181818", border: "1px solid #252525", boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5" style={{ color: ACCENT }} />
                    <span className="text-white font-bold text-sm">Contest</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </button>

                {/* Transactions */}
                <button
                  onClick={() => setView("transactions")}
                  className="w-full flex items-center justify-between rounded-2xl p-4 transition-all active:scale-[0.99]"
                  style={{ background: "#181818", border: "1px solid #252525", boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-green-400" />
                    <span className="text-white font-bold text-sm">Transactions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </button>

                {/* Legal Info */}
                <button
                  onClick={() => setView("legal")}
                  className="w-full flex items-center justify-between rounded-2xl p-4 transition-all active:scale-[0.99]"
                  style={{ background: "#181818", border: "1px solid #252525", boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-bold text-sm">Legal Info</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </button>
              </div>
            )}

            {/* ─── Transactions View ─── */}
            {view === "transactions" && (
              <div className="px-4 py-4">
                {txLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: ACCENT }} />
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12 text-white/30 text-sm">No transactions yet.</div>
                ) : (
                  <div className="space-y-2">
                    {withdrawals.map((w: any) => (
                      <div
                        key={w.id}
                        className="rounded-xl p-3 flex items-center justify-between"
                        style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(w.status)}
                          <div>
                            <p className="text-white text-xs font-bold">{w.method || "Withdrawal"}</p>
                            <p className="text-white/40 text-[10px] mt-0.5">
                              {w.createdAt ? format(new Date(w.createdAt), "dd MMM yyyy") : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-xs font-bold">{parseFloat(w.amount || "0").toLocaleString()} ANX</p>
                          <p className={`text-[10px] font-semibold capitalize ${getStatusColor(w.status)}`}>{w.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Legal View ─── */}
            {view === "legal" && (
              <div className="px-4 py-4 space-y-3">
                {[
                  { title: "Terms of Use", text: "By using this app, you agree to our terms. Rewards are in ANX and are subject to availability. Rewards may change at any time without prior notice." },
                  { title: "Privacy Policy", text: "We collect only your Telegram user data (name, username, ID) to identify your account. We do not share your data with third parties. Your data is securely stored and used solely to operate the app." },
                  { title: "Disclaimer", text: "This app is not affiliated with Telegram. Withdrawals are subject to minimum balance requirements and admin review." },
                ].map(({ title, text }) => (
                  <div key={title} className="rounded-2xl p-4" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                    <p className="text-white/80 font-bold mb-2 text-sm">{title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Contest View ─── */}
            {view === "contest" && !showSubmitForm && (
              <div className="px-4 py-4 space-y-4">
                <div
                  className="relative rounded-2xl overflow-hidden p-4"
                  style={{ background: ACCENT_DIM, border: `1px solid rgba(0,230,118,0.18)` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl" style={{ background: "rgba(0,230,118,0.08)" }} />
                  <div className="relative z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: "rgba(0,230,118,0.12)", border: "1px solid rgba(0,230,118,0.25)" }}
                    >
                      <Trophy className="w-5 h-5" style={{ color: ACCENT }} />
                    </div>
                    <p className="text-white font-black text-sm leading-snug">
                      Tell others about ANX, and get up to{" "}
                      <span style={{ color: ACCENT }}>10,000,000 ANX</span> for each video.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#333" }}>Rules</p>

                  <div className="rounded-2xl p-3.5 space-y-2" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0" style={{ background: ACCENT_DIM, color: ACCENT }}>1</span>
                      <p className="text-white font-bold text-xs">Create Content</p>
                    </div>
                    <p className="text-white/50 text-[11px] leading-relaxed pl-7">Make a fun video about ANX and post it on:</p>
                    <div className="flex gap-1.5 flex-wrap pl-7">
                      <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <Youtube className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 text-[10px] font-bold">YouTube Shorts</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>
                        <Instagram className="w-3 h-3 text-pink-400" />
                        <span className="text-pink-400 text-[10px] font-bold">Instagram Reels</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                        <Video className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-400 text-[10px] font-bold">TikTok</span>
                      </div>
                    </div>
                  </div>

                  {[
                    { num: 2, title: "Include Your ID or Invite Link", desc: "Attach your ID or Invite Link in the video description." },
                    { num: 3, title: "Send the Link", desc: "Once your video reaches 100+ views, send us the link." },
                    { num: 4, title: "Earn Rewards", desc: "The more views your video gets, the bigger the reward. Up to 10,000,000 ANX per video." },
                  ].map(({ num, title, desc }) => (
                    <div key={num} className="rounded-2xl p-3.5" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0 mt-0.5" style={{ background: ACCENT_DIM, color: ACCENT }}>{num}</span>
                        <div>
                          <p className="text-white font-bold text-xs">{title}</p>
                          <p className="text-white/50 text-[11px] leading-relaxed mt-1">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="w-full flex items-center justify-center gap-2 font-black text-sm text-black rounded-2xl py-3.5 transition-all active:scale-[0.98]"
                  style={{ background: ACCENT, boxShadow: "0 0 20px rgba(0,230,118,0.2)" }}
                >
                  <Plus className="w-4 h-4" />
                  Add Content and Earn
                </button>
                <div className="h-4" />
              </div>
            )}

            {/* ─── Contest Submission Form ─── */}
            {view === "contest" && showSubmitForm && (
              <div className="px-4 py-4 space-y-4">
                {submitted ? (
                  <div className="flex flex-col items-center gap-4 text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.3)" }}>
                      <Trophy className="w-8 h-8" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <p className="text-white font-black text-base">Submitted!</p>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed">Your submission has been sent for review. You'll be notified once it's verified.</p>
                    </div>
                    <button
                      onClick={resetContestForm}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-black"
                      style={{ background: ACCENT }}
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#333" }}>Video Link</p>
                        <input
                          value={link}
                          onChange={e => setLink(e.target.value)}
                          placeholder="https://youtube.com/shorts/..."
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none"
                          style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#333" }}>View Range</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {VIEW_RANGES.map(r => (
                            <button
                              key={r.value}
                              onClick={() => setSelectedRange(r.value)}
                              className="rounded-xl px-3 py-2 text-left transition-all"
                              style={{
                                background: selectedRange === r.value ? ACCENT_DIM : "#0d0d0d",
                                border: `1px solid ${selectedRange === r.value ? "rgba(0,230,118,0.3)" : "#1e1e1e"}`,
                              }}
                            >
                              <p className="text-[10px] font-bold" style={{ color: selectedRange === r.value ? ACCENT : "#555" }}>{r.label}</p>
                              <p className="text-[10px] font-black" style={{ color: selectedRange === r.value ? ACCENT : "#444" }}>{r.reward}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl p-4 space-y-3" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#333" }}>Confirm</p>
                        {[
                          { state: check1, setState: setCheck1, label: "The video is about ANX" },
                          { state: check2, setState: setCheck2, label: "My ID/invite link is in the description" },
                          { state: check3, setState: setCheck3, label: "The video has 100+ views" },
                        ].map(({ state, setState, label }) => (
                          <button
                            key={label}
                            onClick={() => setState(!state)}
                            className="w-full flex items-center gap-3 text-left"
                          >
                            {state
                              ? <CheckSquare className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                              : <Square className="w-4 h-4 flex-shrink-0 text-white/20" />
                            }
                            <span className="text-xs font-medium" style={{ color: state ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleContestSubmit}
                      disabled={!canSubmit || contestMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 font-black text-sm text-black rounded-2xl py-3.5 transition-all active:scale-[0.98] disabled:opacity-40"
                      style={{ background: ACCENT }}
                    >
                      {contestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Review"}
                    </button>
                    {contestMutation.isError && (
                      <p className="text-red-400 text-xs text-center">{(contestMutation.error as Error).message}</p>
                    )}
                    <div className="h-4" />
                  </>
                )}
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
