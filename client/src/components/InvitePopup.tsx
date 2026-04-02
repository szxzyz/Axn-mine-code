import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Copy, Share2, Users, Zap, CheckCircle, XCircle, Loader2,
  Link2, Sparkles, UserCheck, RefreshCw,
} from "lucide-react";
import { showNotification } from "@/components/AppNotification";
import { motion, AnimatePresence } from "framer-motion";

interface ReferralItem {
  refereeId: string;
  name: string;
  username?: string;
  totalSatsEarned: number;
  referralStatus: string;
  channelMember: boolean;
  groupMember: boolean;
  isActive: boolean;
  miningBoost: number;
}

interface InvitePopupProps {
  onClose: () => void;
}

export default function InvitePopup({ onClose }: InvitePopupProps) {
  const [isSharing, setIsSharing] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 60000,
  });

  const { data: referralData, isLoading: referralsLoading } = useQuery<{ referrals: ReferralItem[] }>({
    queryKey: ["/api/referrals/list"],
    retry: false,
    staleTime: 30000,
  });

  const syncBoostsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/referrals/sync-boosts", {
        method: "POST",
        credentials: "include",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  useEffect(() => {
    syncBoostsMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: botInfo } = useQuery<{ username: string }>({
    queryKey: ["/api/bot-info"],
    staleTime: 60 * 60 * 1000,
  });
  const botUsername = botInfo?.username || "bot";
  const referralLink = user?.referralCode
    ? `https://t.me/${botUsername}?start=${user.referralCode}`
    : "";

  const referrals = referralData?.referrals || [];
  const activeReferrals = referrals.filter((r) => r.isActive);
  const totalBoost = activeReferrals.length * 0.02;

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    showNotification("Link copied!", "success");
  };

  const shareLink = async () => {
    if (!referralLink || isSharing) return;
    setIsSharing(true);
    try {
      const tgWebApp = (window as any).Telegram?.WebApp;
      const shareTitle = "💵 Earn SAT by completing tasks and watching ads.";
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareTitle)}`;
      if (tgWebApp?.openTelegramLink) {
        tgWebApp.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, "_blank");
      }
    } catch {}
    setIsSharing(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] bg-[#0a0a0a] flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
          <h2 className="text-white font-black text-base uppercase tracking-tight italic">Invite Friends</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Active Boost Banner */}
          {activeReferrals.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-black text-sm">
                  Active Boost: +{totalBoost.toFixed(2)}/h
                </p>
                <p className="text-white/50 text-xs">
                  {activeReferrals.length} active friend{activeReferrals.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* How it works */}
          <div>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2.5 px-0.5">How It Works</p>
            <div className="space-y-2">
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-3.5 flex items-start gap-3">
                <Link2 className="w-4 h-4 text-[#F5C542] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-bold">Share your link</p>
                  <p className="text-white/50 text-xs mt-0.5">Send your unique invite link to friends.</p>
                </div>
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-3.5 flex items-start gap-3">
                <UserCheck className="w-4 h-4 text-[#F5C542] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-bold">Friend joins &amp; stays active</p>
                  <p className="text-white/50 text-xs mt-0.5">They must join the channel to count.</p>
                </div>
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#F5C542] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-bold">You earn +0.02 SAT/h per friend</p>
                  <p className="text-white/50 text-xs mt-0.5">More friends = faster mining, up to 100/h Sats.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invite link */}
          <div>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2.5 px-0.5">Your Invite Link</p>
            <div className="bg-[#141414] border border-white/5 rounded-2xl px-4 py-3 text-xs text-white/60 font-mono mb-3 break-all">
              {referralLink || "Loading..."}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={copyLink}
                disabled={!referralLink}
                className="h-11 flex items-center justify-center gap-2 bg-white/[0.07] hover:bg-white/10 border border-white/5 text-white rounded-2xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </button>
              <button
                onClick={shareLink}
                disabled={!referralLink || isSharing}
                className="h-11 flex items-center justify-center gap-2 bg-[#F5C542] hover:bg-[#F5C542]/90 text-black rounded-2xl text-xs font-black transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {isSharing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                {isSharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>

          {/* Referral list */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Your Friends ({referrals.length})
              </p>
              {referrals.length > 0 && (
                <button
                  onClick={() => syncBoostsMutation.mutate()}
                  disabled={syncBoostsMutation.isPending}
                  className="text-white/30 hover:text-white/50 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncBoostsMutation.isPending ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>

            {referralsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm font-bold">No friends invited yet</p>
                <p className="text-white/20 text-xs mt-1">Share your link to start boosting!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl px-4 py-3.5 border ${r.isActive ? "bg-green-500/5 border-green-500/15" : "bg-[#141414] border-white/5"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-sm font-bold truncate">{r.name}</span>
                          {r.isActive ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400/60 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-white/35 text-[10px] mt-0.5">ID: {r.refereeId}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {r.isActive && <p className="text-green-400 text-xs font-semibold">+0.02/h</p>}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.isActive ? "bg-green-500/15 text-green-400"
                          : r.referralStatus === "completed" ? "bg-red-500/15 text-red-400"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}>
                        {r.isActive ? "Active" : r.referralStatus === "pending" ? "Pending" : "Inactive"}
                      </span>
                      {!r.channelMember && (
                        <span className="text-[10px] text-red-400/60">Left channel</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="px-5 py-4 border-t border-white/5 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full h-12 bg-[#141414] border border-white/8 rounded-2xl font-black uppercase tracking-wider text-white text-sm hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            Back
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
