import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, UserCheck, Crop, Cpu, ShieldCheck } from 'lucide-react';
import { AnalysisOptions } from '../types';

interface OptionsPanelProps {
  options: AnalysisOptions;
  onChange: (options: AnalysisOptions) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateField = <K extends keyof AnalysisOptions>(key: K, value: AnalysisOptions[K]) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="border border-stone-800/80 rounded-2xl bg-stone-900/40 backdrop-blur-sm overflow-hidden">
      {/* Header / Accordion trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-right hover:bg-stone-900/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-800 text-amber-400 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-stone-200">تنظیمات شخصی‌سازی پرامپت بنانا</span>
            <span className="text-xs text-stone-400 mr-2 hidden sm:inline">
              (جنسیت، کادربندی، موتور هوش مصنوعی و شدت قفل هویت)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-stone-400 text-xs">
          <span className="hidden md:inline">
            {options.targetEngine === 'banana' ? '🍌 بنانا' : options.targetEngine.toUpperCase()} •{' '}
            {options.gender === 'adaptive' ? 'سازگار با چهره' : options.gender}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable options */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-stone-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
          {/* Target Engine */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>موتور تولید تصویر</span>
            </label>
            <select
              value={options.targetEngine}
              onChange={(e) => updateField('targetEngine', e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="banana">🍌 Banana AI (توصیه شده)</option>
              <option value="flux">⚡ Flux.1 [dev / LoRA]</option>
              <option value="midjourney">🎨 Midjourney v6 (--cref)</option>
              <option value="sdxl">🖼️ Stable Diffusion XL</option>
            </select>
          </div>

          {/* Gender Adaptation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>تطبیق استایل با جنسیت</span>
            </label>
            <select
              value={options.gender}
              onChange={(e) => updateField('gender', e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="adaptive">طبیعی / خودکار (بر اساس عکس شما)</option>
              <option value="masculine">مردانه (Menswear / مشابه الگو)</option>
              <option value="feminine">زنانه (Womenswear متناسب)</option>
              <option value="neutral">جنسیت خنثی / بدون محدودیت</option>
            </select>
          </div>

          {/* Framing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Crop className="w-3.5 h-3.5 text-amber-400" />
              <span>کادربندی تصویر</span>
            </label>
            <select
              value={options.framing}
              onChange={(e) => updateField('framing', e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="as-reference">دقیقاً مشابه عکس مرجع (توصیه شده)</option>
              <option value="waist-up">نیم‌تنه به بالا (Waist / Torso)</option>
              <option value="close-up">پرتره کلوزآپ سر و گردن</option>
              <option value="full-body">تمام‌قد (Full Body Fashion)</option>
            </select>
          </div>

          {/* Strictness */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>شدت قفل هندسه صورت</span>
            </label>
            <select
              value={options.lockStrictness}
              onChange={(e) => updateField('lockStrictness', e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="ultra-strict">🔒 قفل ۱۰۰٪ ساختار چهره و میمیک</option>
              <option value="balanced">⚖️ متوازن (حفظ چهره + انعطاف نور)</option>
            </select>
          </div>

          {/* Custom user instructions */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-1">
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              یادداشت یا تغییر دلخواه اضافه در استایل (اختیاری):
            </label>
            <input
              type="text"
              value={options.customInstructions}
              onChange={(e) => updateField('customInstructions', e.target.value)}
              placeholder="مثال: رنگ کت سورمه‌ای باشد، عینک برداشته شود یا ساعت مچی اضافه گردد..."
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
