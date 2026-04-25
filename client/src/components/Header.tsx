import { forwardRef } from "react";

const Header = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-40 bg-[#0f0f0f]/95 border-b border-white/5 backdrop-blur-md"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <div className="max-w-md mx-auto px-4 py-3 flex items-center">
        <span className="text-white font-black text-base tracking-wide">Dashboard</span>
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
