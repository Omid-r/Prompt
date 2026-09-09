import React, { useState } from 'react';
import { X, Check, Copy, ShieldCheck, Sparkles, AlertTriangle, Eye, Info } from 'lucide-react';
import { KEY_IDENTITY_SECTIONS, ORIGINAL_USER_TEMPLATE } from '../data/sampleStyles';

interface TemplateAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateAnalysisModal: React.FC<TemplateAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'raw'>('breakdown');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                کالبدشکافی پرامپت الگو: کدام بخش‌ها چهره را حفظ می‌کنند؟
              </h2>
              <p className="text-xs text-stone-400">
                پاسخ به سوال شما: جداسازی فرمول قفل هویت (Identity Lock) از بخش‌های استایل و لباس
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

        {/* Tab switch */}
        <div className="px-6 pt-4 pb-2 border-b border-stone-800/80 flex items-center gap-3 bg-stone-900/50">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'breakdown'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>بخش‌های کلیدی حفظ چهره (۵ لایه حیاتی)</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'raw'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>مشاهده کل پرامپت خام</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {activeTab === 'breakdown' ? (
            <>
              {/* Educational alert */}
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                  <strong>راز کارکرد این پرامپت در بنانا و هوش مصنوعی:</strong> مدل‌های تصویری ذاتاً تمایل دارند چهره ورودی را با مدل‌های زیبایی استاندارد ترکیب کنند (Face Smoothing & Beauty Morphing). در پرامپت شما، ۵ جمله و تکنیک کلیدی وجود دارد که به هوش مصنوعی صراحتاً دستور می‌دهد حق تغییر دادن حتی یک تار مو، زاویه فک یا عدم تقارن طبیعی صورت را ندارد! این ۵ بخش در زیر به تفکیک آورده شده‌اند:
                </div>
              </div>

              {/* Sections list */}
              <div className="space-y-4">
                {KEY_IDENTITY_SECTIONS.map((section, idx) => (
                  <div
                    key={section.id}
                    className="border border-stone-800 rounded-xl bg-stone-950/40 p-4 sm:p-5 hover:border-stone-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-stone-800 text-amber-400 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-stone-100">
                          {section.badgeFa}
                        </h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(section.englishText, section.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer border border-stone-700/60"
                      >
                        {copiedId === section.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">کپی شد!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی قطعه انگلیسی</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* English Snippet */}
                    <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-left font-mono text-xs sm:text-sm text-amber-300/90 leading-relaxed select-all" dir="ltr">
                      "{section.englishText}"
                    </div>

                    {/* Persian explanation */}
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      <strong className="text-stone-100">کارکرد این بخش: </strong>
                      {section.explanationFa}
                    </p>

                    {/* Why it works pill */}
                    <div className="text-xs text-stone-400 bg-stone-900/80 px-3 py-1.5 rounded-md border border-stone-800/70">
                      💡 <strong>نتیجه در بنانا:</strong> {section.whyItWorksFa}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  متن کامل پرامپتی که در اختیارتان قرار داده بودید (شامل تمام بخش‌های حفظ هویت + استایل کت جیر و عینک)
                </span>
                <button
                  onClick={() => copyToClipboard(ORIGINAL_USER_TEMPLATE, 'full-template')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  {copiedId === 'full-template' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>کپی کامل متن پرامپت الگو</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                className="bg-stone-950 p-5 rounded-xl border border-stone-800 text-left font-mono text-xs text-stone-300 leading-relaxed whitespace-pre-wrap select-all max-h-[500px] overflow-y-auto"
                dir="ltr"
              >
                {ORIGINAL_USER_TEMPLATE}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            سیستم ما برای هر عکسی که آپلود کنید، دقیقاً این ساختار استاندارد را بازتولید می‌کند.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
          >
            متوجه شدم، بستن
          </button>
        </div>
      </div>
    </div>
  );
};
