import { motion } from "framer-motion";

export default function CountryBlockedScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center p-6 overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#F5C542]/5 rounded-full blur-[80px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs w-full">

        {/* Icon ring */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 120 }}
          className="relative mb-8"
        >
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping scale-110" />
          {/* Middle ring */}
          <div className="absolute inset-0 rounded-full border border-red-500/20 scale-125" />

          {/* Icon container */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            {/* Globe with X */}
            <svg
              className="w-12 h-12"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Globe circle */}
              <circle cx="24" cy="24" r="18" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.6" />
              {/* Globe lines - horizontal */}
              <path d="M6 24 Q24 18 42 24" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
              <path d="M6 24 Q24 30 42 24" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
              {/* Globe lines - vertical */}
              <path d="M24 6 Q30 24 24 42" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
              <path d="M24 6 Q18 24 24 42" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
              {/* Big X */}
              <line x1="13" y1="13" x2="35" y2="35" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="35" y1="13" x2="13" y2="35" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 rounded-full px-3 py-1 mb-5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Access Restricted</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white font-black text-2xl tracking-tight leading-tight mb-3"
        >
          Not Available in<br />
          <span className="text-red-400">Your Region</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-sm leading-relaxed mb-8 font-medium"
        >
          Lightning Sats is currently not available in your country. Try using a VPN to access the app.
        </motion.p>

        {/* Divider with app branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full border-t border-white/5 pt-6 flex flex-col items-center gap-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#F5C542]/30">
              <img src="/btc-icon.jpg" alt="Lightning Sats" className="w-full h-full object-cover" />
            </div>
            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Lightning Sats</span>
          </div>
          <p className="text-white/10 text-[9px] uppercase tracking-widest font-semibold">Mine · Earn · Withdraw</p>
        </motion.div>

      </div>
    </div>
  );
}
