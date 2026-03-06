import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Languages } from "lucide-react";
import { useLocation } from "wouter";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/hooks/useLanguage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  
  const [, setLocation] = useLocation();
  const { isAdmin } = useAdmin();
  const { setLanguage, t } = useLanguage();

  const tonBalance = parseFloat(user?.tonBalance || "0");
  const hrumBalance = parseFloat(user?.balance || "0");
  const tonAppBalance = parseFloat(user?.tonAppBalance || "0");

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(1) + 'M';
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(1) + 'k';
    }
    return Math.round(balance).toLocaleString();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 pt-[max(env(safe-area-inset-top),10px)]">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="bg-[#141414] rounded-2xl p-1.5 flex items-center justify-between border border-white/5">
          {/* AXN Balance */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 border-r border-white/5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <img src="/images/hrum-logo.jpg" alt="AXN" className="w-3.5 h-3.5 rounded-full" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AXN</span>
            </div>
            <span className="text-sm text-white font-black tabular-nums">
              {formatBalance(hrumBalance)}
            </span>
          </div>

          {/* TON Balance */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 border-r border-white/5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <img src="/images/ton.png" alt="TON" className="w-3.5 h-3.5 rounded-full" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TON</span>
            </div>
            <span className="text-sm text-white font-black tabular-nums">
              {tonBalance.toFixed(2)}
            </span>
          </div>

          {/* App TON Balance */}
          <div className="flex-1 flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <img src="/images/ton.png" alt="APP" className="w-3.5 h-3.5 rounded-full" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">APP TON</span>
            </div>
            <span className="text-sm text-[#B9FF66] font-black tabular-nums">
              {tonAppBalance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
