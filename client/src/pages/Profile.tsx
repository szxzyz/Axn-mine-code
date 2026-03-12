import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { 
  Copy, 
  ShieldCheck, 
  FileText, 
  Check, 
  ChevronRight, 
  ArrowLeftRight,
  Headphones,
  Shield,
  ScrollText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { showNotification } from "@/components/AppNotification";
import { motion, AnimatePresence } from "framer-motion";
import TransactionsOverlay from "@/components/TransactionsOverlay";
import TopUpPopup from "@/components/TopUpPopup";
import WithdrawalPopup from "@/components/WithdrawalPopup";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [copied, setCopied] = React.useState(false);
  const [selectedLegal, setSelectedLegal] = React.useState<string | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = React.useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = React.useState(false);

  const uid = (user as any)?.referralCode || (user as any)?.id?.slice(0, 8) || '00000';
  const tonWithdrawBalance = Math.floor(parseFloat((user as any)?.balance || "0"));

  const copyUid = () => {
    navigator.clipboard.writeText(uid);
    setCopied(true);
    showNotification(t('copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const openLink = (url: string) => {
    if ((window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const legalContent: Record<string, { title: string, content: React.ReactNode }> = {
    terms: {
      title: t('terms_conditions'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p className="text-[#B9FF66] font-bold">Last Updated: January 21, 2026</p>
          <p>Welcome to Money AXN. By accessing or using this app, you agree to comply with these Terms & Conditions. If you do not agree, please do not use the app.</p>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">1. Eligibility</h4>
            <p>Users must be at least 13 years old. You represent that you are of legal age to form a binding contract. You are responsible for maintaining the confidentiality of your account and all activities that occur under your account.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">2. AXN Mining & Rewards</h4>
            <p>Money AXN is a free AXN mining application. Users can mine AXN tokens through free mining activities and boost their mining speed through optional investments. Mined AXN is credited to your virtual balance and can be converted to TON for withdrawal.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">3. Mining Boost & Investment</h4>
            <p>Users can optionally invest TON to boost their mining speed. Mining boosts are time-limited and increase the rate at which AXN is mined. Investment in mining boosts is voluntary and subject to the terms displayed at the time of purchase.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">4. Withdrawals</h4>
            <p>AXN tokens can be converted to TON and withdrawn to your personal wallet. Withdrawals are subject to system verification, minimum limits, and available liquidity. Users must provide valid wallet addresses. We reserve the right to delay or cancel withdrawals for security audits or suspected fraudulent activity.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">5. Account Suspension & Bans</h4>
            <p>We reserve the right to suspend or permanently ban accounts without prior notice if we detect violations of our policies, including but not limited to: multiple accounts, bot usage, script automation, or exploitation of system bugs.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">6. Fraud & Abuse</h4>
            <p>Any attempt to manipulate the mining system, exploit technical vulnerabilities, or provide false information during verification will result in immediate termination of the account and forfeiture of all accumulated rewards.</p>
          </div>
        </div>
      )
    },
    privacy: {
      title: t('privacy_policy'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p>Money AXN respects your privacy and is committed to protecting your personal data.</p>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">1. Data Collection</h4>
            <p>We collect essential data to provide our AXN mining services, including your Telegram User ID (UID), device information (model, OS version), IP address, app usage statistics, and mining activity history.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">2. Data Storage & Security</h4>
            <p>Your data is stored securely using industry-standard encryption. We retain your information for as long as your account is active or as needed to provide you with our services and comply with legal obligations.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">3. Third-Party Services</h4>
            <p>We integrate with third-party payment gateways for processing TON transactions. These services may collect non-personal data according to their own privacy policies for the purpose of transaction processing.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">4. Your Rights</h4>
            <p>You have the right to access, correct, or request the deletion of your data. Contact our support team for any privacy-related inquiries.</p>
          </div>
        </div>
      )
    },
    acceptable: {
      title: t('acceptable_use'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p>To maintain a fair AXN mining ecosystem for all users, you must adhere to the following rules:</p>
          <div>
            <h4 className="text-rose-400 font-bold mb-1 flex items-center gap-2 italic uppercase tracking-tighter">
              Prohibited Actions
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Creating or managing multiple accounts for a single user.</li>
              <li>Using automated bots, scripts, or any third-party software to simulate mining activity.</li>
              <li>Exploiting technical vulnerabilities or bugs for unauthorized gain.</li>
              <li>Attempting to manipulate the AXN mining or conversion rates.</li>
              <li>Reverse-engineering, decompiling, or attempting to extract source code from the app.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 flex items-center gap-2 italic uppercase tracking-tighter">
              <ShieldCheck className="w-4 h-4 text-[#B9FF66]" />
              Multi-Account Abuse
            </h4>
            <p>Our system employs advanced detection for multi-account activity. Users found operating multiple profiles to inflate referral rewards or mining earnings will face permanent bans across all linked accounts.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 flex items-center gap-2 italic uppercase tracking-tighter">
              <Check className="w-4 h-4 text-green-500" />
              Compliance
            </h4>
            <p>All users must use the app in compliance with applicable local and international laws. We cooperate with law enforcement agencies in cases of suspected illegal activity.</p>
          </div>
        </div>
      )
    }
  };

  const photoUrl = typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;

  return (
    <Layout>
      <main className="max-w-md mx-auto px-4 pt-6 pb-24 overflow-y-auto bg-[#050505]">
        
        {/* Centered Profile Hero Section */}
        <div className="flex flex-col items-center mb-6">
          {/* Large centered profile photo */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#B9FF66]/40 flex items-center justify-center overflow-hidden shadow-xl shadow-[#B9FF66]/10 mb-3">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#B9FF66] to-[#80B542] flex items-center justify-center text-black font-black text-3xl">
                {(user as any)?.firstName?.[0] || 'U'}
              </div>
            )}
          </div>

          {/* User Name */}
          <span className="text-white font-black text-xl leading-none tracking-tight mb-1">
            {(user as any)?.firstName || (user as any)?.username || 'User'}
          </span>

          {/* User ID with copy button */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#8E8E93] text-xs font-semibold">
              ID: <span className="text-[#B9FF66] font-black">{uid}</span>
            </span>
            <button 
              onClick={copyUid}
              className="bg-[#1a1a1a] p-1.5 rounded-lg border border-white/5 hover:bg-white/5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3 h-3 text-[#B9FF66]" /> : <Copy className="w-3 h-3 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Transactions - compact row */}
        <button 
          onClick={() => setIsTransactionsOpen(true)}
          className="w-full bg-[#141414] rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all active:scale-[0.98] mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
            </div>
            <span className="text-white font-bold text-sm">Transactions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        {/* Contact Support - compact row */}
        <button 
          onClick={() => openLink('https://t.me/+fahpWJGmJEowZGQ1')}
          className="w-full bg-[#141414] rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all active:scale-[0.98] mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
            </div>
            <span className="text-white font-bold text-sm">Contact Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        {/* Legal & Info - compact list */}
        <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden mb-2">
          <div className="px-4 pt-2.5 pb-1">
            <span className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest">Legal & Info</span>
          </div>
          <CompactItem 
            icon={<Shield className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />}
            label="Terms & Conditions"
            onClick={() => setSelectedLegal('terms')}
          />
          <div className="mx-4 h-[1px] bg-white/5" />
          <CompactItem 
            icon={<ScrollText className="w-3.5 h-3.5 text-orange-400" strokeWidth={1.5} />}
            label="Privacy Policy"
            onClick={() => setSelectedLegal('privacy')}
          />
          <div className="mx-4 h-[1px] bg-white/5" />
          <CompactItem 
            icon={<AlertCircle className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />}
            label="Acceptable Use"
            onClick={() => setSelectedLegal('acceptable')}
          />
          {(user as any)?.isAdmin && (
            <>
              <div className="mx-4 h-[1px] bg-white/5" />
              <CompactItem 
                icon={<ShieldCheck className="w-3.5 h-3.5 text-red-500" strokeWidth={1.5} />}
                label="Admin Panel"
                onClick={() => navigate('/admin')}
              />
            </>
          )}
        </div>

        <AnimatePresence>
          {selectedLegal && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-[#050505] z-[100] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">
                  {legalContent[selectedLegal].title}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {legalContent[selectedLegal].content}
              </div>
              <div className="p-6 border-t border-white/5">
                <Button 
                  className="w-full h-14 bg-[#141414] border border-white/5 rounded-2xl font-black uppercase italic tracking-wider text-white"
                  onClick={() => setSelectedLegal(null)}
                >
                  {t('back')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TransactionsOverlay 
          open={isTransactionsOpen} 
          onOpenChange={setIsTransactionsOpen} 
        />

        <TopUpPopup
          open={isTopUpOpen}
          onOpenChange={setIsTopUpOpen}
          telegramId={(user as any)?.telegram_id || (user as any)?.id || ""}
        />

        <WithdrawalPopup
          open={isWithdrawOpen}
          onOpenChange={setIsWithdrawOpen}
          tonBalance={tonWithdrawBalance}
        />
      </main>
    </Layout>
  );
}

function CompactItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-semibold text-[13px] text-gray-300">{label}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
    </button>
  );
}

function ProfileItem({ icon, label, value, onClick }: { icon: React.ReactNode, label: string, value?: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-bold text-[13px] text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[10px] font-black text-[#B9FF66] bg-[#B9FF66]/10 px-2.5 py-1 rounded-lg uppercase">{value}</span>}
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </div>
    </button>
  );
}
