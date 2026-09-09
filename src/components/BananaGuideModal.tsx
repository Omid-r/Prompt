import React from 'react';
import { X, Upload, Sliders, Play, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface BananaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BananaGuideModal: React.FC<BananaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
              🍌
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                راهنمای گام‌به‌گام استفاده در بنانا (Banana AI / Flux / Midjourney)
              </h2>
              <p className="text-xs text-stone-400">
                چگونه عکستان را در بنانا بگذارید تا با این پرامپت دقیقاً همین استایل را به دست آورید
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {/* Step 1 */}
          <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
              ۱
            </div>
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>بارگذاری عکس خودتان (Image Reference 1)</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                وارد بنانا (یا بات تلگرام / پلتفرم وب هوش مصنوعی خود) شوید. در بخش <strong>Image to Image</strong> یا <strong>Face Reference</strong>، یک عکس باکیفیت و واضح از چهره خودتان (یا سوژه مورد نظر) با نور طبیعی بارگذاری کنید. مطمئن شوید چهره پوشیده نباشد.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
              ۲
            </div>
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>قرار دادن پرامپت استخراج‌شده در کادر Prompt</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                پرامپت کاملی که سیستم ما برای عکس مورد علاقه‌تان ساخته را با یک کلیک کپی کرده و در کادر پرامپت بنانا جای‌گذاری (Paste) کنید. این پرامپت در ابتدای خود شامل دستور صریح قفل هویت است و سپس تمام جزییات لباس، دیوار، زاویه بدن و نور استخراج‌شده را دیکته می‌کند.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
              ۳
            </div>
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>جای‌گذاری نگاتیو پرامپت (Negative Prompt)</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                اگر بنانا یا ابزار مورد استفاده شما کادر <strong>Negative Prompt</strong> دارد، کادر نگاتیو پرامپت را در آن قرار دهید. این بخش مانع پلاستیکی شدن پوست، لبخند زوری یا رتوش عروسکی می‌شود.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
              ۴
            </div>
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>تنظیم وزن شباهت چهره (Denoise / Strength)</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                در صورت وجود اسلایدر شباهت چهره (Face Weight یا Denoising Strength):
              </p>
              <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside bg-stone-900 p-3 rounded-lg border border-stone-800">
                <li>برای بیشترین شباهت چهره: مقدار بین <strong>0.75 الی 0.85</strong> قرار دهید.</li>
                <li>در میدجرنی v6: از پارامتر <code>--cref [لینک عکس شما] --cw 100</code> استفاده کنید.</li>
                <li>در Flux / LoRA: از وزن <strong>0.8</strong> استفاده کنید.</li>
              </ul>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-2 text-amber-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>نکته کلیدی برای حفظ عینک و مو:</span>
            </div>
            <p className="leading-relaxed text-stone-300">
              اگر عکس چهره شما کچل است یا عینک ندارد، نگران نباشید! عبارات درون این پرامپت جوری طراحی شده‌اند که عینک آفتابی باریک و لباس را کاملاً ارگانیک روی چهره طبیعی شما سوار می‌کنند بدون اینکه فرم فک و استخوان‌بندی تغییر کند.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer"
          >
            عالیه، شروع کنیم
          </button>
        </div>
      </div>
    </div>
  );
};
