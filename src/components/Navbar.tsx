import React from 'react';
import { Sparkles, ShieldCheck, HelpCircle, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenTemplateModal: () => void;
  onOpenGuideModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTemplateModal, onOpenGuideModal }) => {
  return (
    <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-black text-xl">
            🍌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-1.5">
                <span>مهندسی معکوس پرامپت بنانا</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Identity Lock
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              استخراج پرامپت با قفل ۱۰۰٪ هویت و آناتومی چهره برای Banana AI و Flux
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenTemplateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm"
            title="تحلیل خط‌به‌خط پرامپت الگو و بخش‌های حفظ چهره"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">تحلیل پرامپت الگو</span>
            <span className="md:hidden">پرامپت الگو</span>
          </button>

          <button
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>راهنمای بنانا</span>
          </button>
        </div>
      </div>
    </header>
  );
};
