import React, { useState } from 'react';
import {
  Wand2,
  RefreshCw,
  Camera,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Sliders,
  Download,
  Eye,
  Layers,
  HelpCircle,
  Maximize2,
  MessageSquare,
  ArrowLeft,
  Check,
  Zap,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface DirectorStudioProps {
  result: AnalysisResult;
  referenceImage: string | null;
  referenceMimeType: string;
  userFaceImage?: string | null;
  userFaceMimeType?: string;
  onRefinePrompt: (critique: string) => Promise<void>;
  isRefining: boolean;
  onGeneratePreview: () => Promise<void>;
  isGeneratingImage: boolean;
  previewImageUrl: string | null;
  apiKeyConfigured?: boolean;
}

export const DirectorStudio: React.FC<DirectorStudioProps> = ({
  result,
  referenceImage,
  referenceMimeType,
  userFaceImage,
  userFaceMimeType,
  onRefinePrompt,
  isRefining,
  onGeneratePreview,
  isGeneratingImage,
  previewImageUrl,
  apiKeyConfigured = true,
}) => {
  const [critiqueText, setCritiqueText] = useState('');
  const [lastAppliedCritique, setLastAppliedCritique] = useState<string | null>(null);
  const [activeCompareMode, setActiveCompareMode] = useState<'split' | 'rendered' | 'original' | 'user_face' | 'trio'>('split');
  const [showFullImageModal, setShowFullImageModal] = useState<string | null>(null);

  const quickPills = [
    { label: 'رنگ و جنس پارچه لباس شبیه نیست', text: 'رنگ و جنس پارچه لباس شبیه عکسم نیست، بافت دقیق و رنگ واقعی آن را تنظیم کن.' },
    { label: 'نورپردازی و زاویه نور فرق دارد', text: 'نورپردازی، جهت تابش نور و گرمی/سردی رنگ نور شبیه عکس مرجع نیست.' },
    { label: 'کادربندی یا زاویه سر و نگاه', text: 'کادربندی و زاویه سر و نگاه سوژه را دقیقاً مطابق عکس مرجع قرار بده.' },
    { label: 'عینک یا اکسسوری را اصلاح/حذف کن', text: 'عینک آفتابی را حذف کن و چشم‌های طبیعی را بدون عینک قرار بده.' },
    { label: 'پس‌زمینه و اتمسفر محیطی', text: 'پس‌زمینه و متریال دیوار و بافت محیطی عکس مرجع را با دقت بیشتری وارد پرامپت کن.' },
    { label: 'افزایش شدت قفل شباهت چهره', text: 'تاکید بر قفل صددرصدی چهره و عدم تغییر فرم بینی، چشم، گونه و حذف هرگونه رتوش را به بالاترین سطح برسان.' },
  ];

  const handleAddPill = (text: string) => {
    setCritiqueText((prev) => (prev ? `${prev}\n- ${text}` : text));
  };

  const handleSubmitCritique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!critiqueText.trim() || isRefining) return;
    const submitted = critiqueText;
    await onRefinePrompt(submitted);
    setLastAppliedCritique(submitted);
    setCritiqueText('');
  };

  const downloadRenderedImage = () => {
    if (!previewImageUrl) return;
    const link = document.createElement('a');
    link.href = previewImageUrl;
    link.download = `banana-render-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6 pt-4 text-right">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-stone-900 to-stone-900 border border-amber-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-stone-950 font-extrabold text-xs flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5" />
              <span>استودیوی کارگردانی و تست رندر</span>
            </span>
            <span className="text-xs text-amber-300/80 font-medium">
              بررسی موشکافانه نور، لباس، اپتیک و تست زنده با بنانا
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-stone-100">
            راضی نیستید؟ به هوش مصنوعی بگویید کجای عکس شباهت ندارد تا پرامپت را ارتقا دهد
          </h3>
        </div>

        {/* Banana Test Button */}
        <button
          type="button"
          onClick={onGeneratePreview}
          disabled={isGeneratingImage || isRefining}
          className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
            isGeneratingImage
              ? 'bg-stone-800 text-stone-400 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 hover:brightness-110 active:scale-95 shadow-amber-500/25'
          }`}
        >
          {isGeneratingImage ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
              <span>در حال رندر توسط موتور بنانا...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 text-stone-950" />
              <span>تست و تولید عکس با موتور بنانا (Live Test)</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Feedback Form (Left/Top) & Render Preview (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Critique & Refinement Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-stone-100">
                  کادر ثبت اشکالات و نکات مدنظر شما برای اصلاح:
                </h4>
              </div>
              <span className="text-[11px] text-stone-400">
                پاسخ توسط متخصص نور و کارگردانی
              </span>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-stone-400 font-medium">
                پیشنهادهای سریع (با کلیک اضافه می‌شوند):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPill(pill.text)}
                    className="px-2.5 py-1 rounded-xl bg-stone-800/80 hover:bg-amber-500/20 hover:text-amber-300 text-stone-300 text-[11px] font-medium border border-stone-700/60 transition-colors cursor-pointer"
                  >
                    + {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitCritique} className="space-y-3">
              <textarea
                value={critiqueText}
                onChange={(e) => setCritiqueText(e.target.value)}
                placeholder="توضیح دهید الان کجای پرامپت با عکس شما تفاوت دارد؟ (مثلاً: رنگ کت در عکسم مشکی مات است نه قهوه‌ای، کادر کلوزآپ باشد، عینک آفتابی حذف شود، نور غروب باشد، پس‌زمینه دیوار آجری است و ...)"
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!critiqueText.trim() || isRefining}
                  className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    !critiqueText.trim() || isRefining
                      ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 hover:brightness-110 shadow-amber-500/20 active:scale-[0.99]'
                  }`}
                >
                  {isRefining ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                      <span>در حال بازبینی موشکافانه عکس و اعمال اصلاحات توسط کارگردان...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-stone-950" />
                      <span>بررسی مجدد توسط متخصص و اصلاح پرامپت (Refine & Apply)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Success Banner for applied critique */}
            {lastAppliedCritique && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-extrabold text-emerald-200">
                    ✓ عیب اعلام‌شده با موفقیت بررسی و اعمال گردید:
                  </div>
                  <div className="text-emerald-300/95 leading-relaxed font-medium">
                    «{lastAppliedCritique}»
                  </div>
                  <div className="text-[11px] text-emerald-400/90 pt-0.5">
                    پرامپت مستر، مقادیر رنگ و نور به‌روز شدند و رندر زنده بازتولید شد.
                  </div>
                </div>
              </div>
            )}

            {/* Director Feedback / Notes History */}
            {result.directorNoteFa && !lastAppliedCritique && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-emerald-200">تغییرات اعمال‌شده توسط متخصص:</div>
                  <div className="text-emerald-300/90 leading-relaxed">
                    {result.directorNoteFa}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banana Live Image Preview Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-stone-100">
                  پیش‌نمایش رندر عکس با موتور Banana AI
                </h4>
              </div>

              {previewImageUrl && (
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 text-[11px]">
                  {userFaceImage && (
                    <button
                      type="button"
                      onClick={() => setActiveCompareMode('user_face')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        activeCompareMode === 'user_face' ? 'bg-emerald-500 text-stone-950' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      چهره شما vs رندر
                    </button>
                  )}
                  {userFaceImage && referenceImage && (
                    <button
                      type="button"
                      onClick={() => setActiveCompareMode('trio')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        activeCompareMode === 'trio' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      مقایسه ۳‌طرفه
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveCompareMode('split')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeCompareMode === 'split' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    استایل مرجع vs رندر
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCompareMode('rendered')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeCompareMode === 'rendered' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    فقط رندر
                  </button>
                  {referenceImage && (
                    <button
                      type="button"
                      onClick={() => setActiveCompareMode('original')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        activeCompareMode === 'original' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      عکس اصلی
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Display Area */}
            <div className="min-h-[290px] rounded-2xl bg-stone-950 border border-stone-800/80 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              {isGeneratingImage ? (
                <div className="text-center space-y-3 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto animate-pulse">
                    <Camera className="w-7 h-7 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-stone-100">
                      در حال ترکیب پرامپت و رندر تصویر در موتور بنانا...
                    </div>
                    <div className="text-xs text-stone-400">
                      شبیه‌سازی نور، لباس، ژست و بافت‌های عکاسی
                    </div>
                  </div>
                </div>
              ) : previewImageUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  {/* Image View based on mode */}
                  {activeCompareMode === 'user_face' && userFaceImage ? (
                    <div className="grid grid-cols-2 gap-3 w-full max-h-[320px]">
                      <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-stone-900">
                        <img
                          src={userFaceImage}
                          alt="چهره واقعی شما"
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[280px] object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-stone-950 text-[10px] font-extrabold shadow-md">
                          چهره واقعی شما (قفل هویت)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFullImageModal(userFaceImage)}
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-stone-900/80 text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="بزرگنمایی"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative group rounded-xl overflow-hidden border-2 border-amber-500/50 bg-stone-900">
                        <img
                          src={previewImageUrl}
                          alt="رندر بنانا"
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[280px] object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold shadow-md">
                          رندر بنانا با پرامپت و چهره شما
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFullImageModal(previewImageUrl)}
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-stone-900/80 text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="بزرگنمایی"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : activeCompareMode === 'trio' && userFaceImage && referenceImage ? (
                    <div className="grid grid-cols-3 gap-2 w-full max-h-[320px]">
                      {/* User Face */}
                      <div className="relative group rounded-xl overflow-hidden border border-emerald-500/50 bg-stone-900">
                        <img
                          src={userFaceImage}
                          alt="چهره شما"
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[280px] object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-stone-950 text-[9px] font-bold">
                          چهره شما
                        </span>
                      </div>
                      {/* Style Reference */}
                      <div className="relative group rounded-xl overflow-hidden border border-stone-700 bg-stone-900">
                        <img
                          src={referenceImage}
                          alt="استایل مرجع"
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[280px] object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-stone-950/80 text-stone-200 text-[9px] font-bold">
                          استایل مرجع
                        </span>
                      </div>
                      {/* Banana Render */}
                      <div className="relative group rounded-xl overflow-hidden border border-amber-500/50 bg-stone-900">
                        <img
                          src={previewImageUrl}
                          alt="رندر بنانا"
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[280px] object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-extrabold">
                          رندر بنانا
                        </span>
                      </div>
                    </div>
                  ) : activeCompareMode === 'split' && referenceImage ? (
                    <div className="grid grid-cols-2 gap-3 w-full max-h-[320px]">
                      <div className="relative group rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
                        <img
                          src={referenceImage}
                          alt="عکس اصلی شما"
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[280px] object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-950/80 text-[10px] text-stone-300 font-bold backdrop-blur-xs">
                          عکس مرجع شما
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFullImageModal(referenceImage)}
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-stone-900/80 text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="بزرگنمایی"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative group rounded-xl overflow-hidden border border-amber-500/40 bg-stone-900">
                        <img
                          src={previewImageUrl}
                          alt="رندر بنانا"
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[280px] object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold shadow-md">
                          رندر بنانا با پرامپت
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFullImageModal(previewImageUrl)}
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-stone-900/80 text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="بزرگنمایی"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : activeCompareMode === 'original' && referenceImage ? (
                    <div className="relative max-h-[320px] rounded-xl overflow-hidden border border-stone-800">
                      <img
                        src={referenceImage}
                        alt="عکس اصلی شما"
                        referrerPolicy="no-referrer"
                        className="max-h-[300px] object-contain rounded-xl"
                      />
                      <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-stone-950/80 text-xs text-stone-200 font-bold">
                        عکس مرجع شما
                      </span>
                    </div>
                  ) : (
                    <div className="relative max-h-[320px] rounded-xl overflow-hidden border border-amber-500/40">
                      <img
                        src={previewImageUrl}
                        alt="رندر بنانا"
                        referrerPolicy="no-referrer"
                        className="max-h-[300px] object-contain rounded-xl"
                      />
                      <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-extrabold shadow-md">
                        خروجی موتور هوش مصنوعی بنانا
                      </span>
                    </div>
                  )}

                  {/* Actions under image */}
                  <div className="flex items-center justify-between w-full pt-1 px-1">
                    <button
                      type="button"
                      onClick={downloadRenderedImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold border border-stone-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود تصویر رندرشده</span>
                    </button>

                    <button
                      type="button"
                      onClick={onGeneratePreview}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>رندر مجدد (Re-generate)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-6 max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 text-stone-400 border border-stone-800 flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-stone-200">
                      تست کیفیت پرامپت با موتور تولید عکس بنانا
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      با زدن دکمه زیر، هوش مصنوعی تصویر را بر اساس پرامپت فعلی رندر می‌کند تا بتوانید نتیجه را بسنجید و در صورت نیاز اصلاح کنید.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onGeneratePreview}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تولید و تست عکس همین الان</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 text-[11px] text-stone-400 leading-relaxed">
              💡 <strong className="text-stone-300">نکته تخصصی بنانا:</strong> وقتی این پرامپت را در ابزار بنانا یا Flux می‌گذارید، عکس چهره خودتان (Selfie) را به عنوان مرجع چهره انتخاب کنید تا هوش مصنوعی همین لباس، نور و فضا را بر روی چهره دقیق شما اعمال کند.
            </div>
          </div>
        </div>
      </div>

      {/* Modal for full image zoom */}
      {showFullImageModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl">
            <img
              src={showFullImageModal}
              alt="نمای بزرگ"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setShowFullImageModal(null)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-stone-950/80 text-stone-200 text-xs font-bold border border-stone-700 hover:bg-stone-900 cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
