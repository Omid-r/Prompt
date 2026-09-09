import React, { useState } from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Eye,
  Camera,
  Maximize2,
  Info,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface PromptResultsProps {
  result: AnalysisResult;
  onOpenGuideModal: () => void;
  onOpenTemplateModal: () => void;
  onTestBananaRender?: () => void;
  onJumpToCritique?: () => void;
}

export const PromptResults: React.FC<PromptResultsProps> = ({
  result,
  onOpenGuideModal,
  onOpenTemplateModal,
  onTestBananaRender,
  onJumpToCritique,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'master' | 'breakdown' | 'identity-fa' | 'variations'>('master');
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2200);
  };

  const downloadPromptTxt = () => {
    const content = `=====================================================
BANANA AI & FLUX PROMPT (IDENTITY PRESERVED)
=====================================================
Title: ${result.summaryTitle}
Tags: ${result.detectedStyleTags.join(', ')}

-----------------------------------------------------
[1] MASTER PROMPT FOR BANANA / FLUX / MIDJOURNEY:
-----------------------------------------------------
${result.masterPrompt}

-----------------------------------------------------
[2] NEGATIVE PROMPT (ANTI-DISTORTION GUARDRAILS):
-----------------------------------------------------
${result.negativePrompt}

-----------------------------------------------------
[3] WHY THIS LOCKS YOUR IDENTITY (PERSIAN EXPLANATION):
-----------------------------------------------------
${result.identityPreservationExplanationFa.coreSummary}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `banana-prompt-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = result.masterPrompt.trim().split(/\s+/).length;
  const charCount = result.masterPrompt.length;

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Result Header */}
      <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                پرامپت استخراج‌شده با قفل ۱۰۰٪ هویت
              </span>
              <span className="text-xs text-stone-500">
                {wordCount} کلمه • حدود {Math.round(wordCount * 1.3)} توکن
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-100">
              {result.summaryTitle}
            </h2>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onTestBananaRender && (
              <button
                type="button"
                onClick={onTestBananaRender}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                title="تست مستقیم تولید عکس با موتور بنانا"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>تست عکس در بنانا</span>
              </button>
            )}

            {onJumpToCritique && (
              <button
                type="button"
                onClick={onJumpToCritique}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-all cursor-pointer"
                title="ناراضی هستید؟ اعلام ایراد به کارگردان"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>اصلاح توسط کارگردان</span>
              </button>
            )}

            <button
              onClick={() => copyText(result.masterPrompt, 'master-top')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              {copiedType === 'master-top' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>کپی پرامپت بنانا</span>
                </>
              )}
            </button>

            <button
              onClick={downloadPromptTxt}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
              title="دانلود فایل متنی (.txt)"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detected style tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-stone-400">تگ‌های استخراج‌شده:</span>
          {result.detectedStyleTags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-800/80 text-stone-300 border border-stone-700/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'master'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>پرامپت نهایی بنانا (Master Prompt)</span>
        </button>

        <button
          onClick={() => setActiveTab('identity-fa')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'identity-fa'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>تحلیل قفل چهره (کدام بخش‌ها هویت را حفظ می‌کنند؟)</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'breakdown'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>تفکیک لایه‌های بصری (لباس، نور، معماری)</span>
        </button>

        <button
          onClick={() => setActiveTab('variations')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'variations'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>نسخه‌های جایگزین ({result.variations.length})</span>
        </button>
      </div>

      {/* TAB 1: MASTER PROMPT */}
      {activeTab === 'master' && (
        <div className="space-y-6">
          {/* Master Box */}
          <div className="relative rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-2xl">
            <div className="px-5 py-3 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>متن پرامپت آماده برای کپی و استفاده مستقیم در بنانا</span>
              </div>
              <button
                onClick={() => copyText(result.masterPrompt, 'master-box')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
              >
                {copiedType === 'master-box' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی پرامپت کامل</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 font-mono text-xs sm:text-sm text-stone-200 leading-relaxed text-left bg-stone-950 select-all whitespace-pre-wrap max-h-[440px] overflow-y-auto" dir="ltr">
              {result.masterPrompt}
            </div>

            <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-xs text-stone-400">
              <span>دستور قفل چهره در اولین پاراگراف قرار داده شده است تا هوش مصنوعی بیشترین اولویت را به آن بدهد.</span>
              <button
                onClick={onOpenGuideModal}
                className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>چگونه در بنانا استفاده کنم؟</span>
              </button>
            </div>
          </div>

          {/* Negative Prompt Box */}
          <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>نگاتیو پرامپت (Negative Prompt - سدهای ضد دیستورشن و حفظ شباهت)</span>
              </div>
              <button
                onClick={() => copyText(result.negativePrompt, 'negative-box')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
              >
                {copiedType === 'negative-box' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی نگاتیو پرامپت</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 font-mono text-xs text-rose-200/80 leading-relaxed text-left bg-stone-950 select-all whitespace-pre-wrap" dir="ltr">
              {result.negativePrompt}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IDENTITY PRESERVATION EXPLANATION IN PERSIAN */}
      {activeTab === 'identity-fa' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
              <ShieldCheck className="w-5 h-5" />
              <span>پاسخ مستقیم به سوال شما در مورد بخش‌های حفظ سوژه و چهره:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              {result.identityPreservationExplanationFa.coreSummary}
            </p>
          </div>

          {/* Key Clauses Extracted */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>جملات طلایی تزریق‌شده در این پرامپت برای قفل ساختار چهره:</span>
            </h3>

            {result.identityPreservationExplanationFa.keySecretClauses.map((clause, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-stone-100">{clause.title}</h4>
                  </div>
                  <button
                    onClick={() => copyText(clause.englishSnippet, `clause-${idx}`)}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {copiedType === `clause-${idx}` ? (
                      <span className="text-emerald-400">کپی شد!</span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی این عبارت</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-left font-mono text-xs text-amber-300 select-all" dir="ltr">
                  "{clause.englishSnippet}"
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  <strong className="text-stone-100">چرا این بخش مانع تغییر چهره می‌شود؟ </strong>
                  {clause.persianFunction}
                </p>
              </div>
            ))}
          </div>

          {/* Usage Guide In Banana */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>نحوه عملکرد با عکس سلفی شما در بنانا:</span>
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {result.identityPreservationExplanationFa.usageGuideInBananaFa}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: VISUAL BREAKDOWN DECONSTRUCTION */}
      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Identity Clause */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>۱. بند قفل هویت و آناتومی (Identity Lock)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.identityLockClause, 'bd-identity')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-identity' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.identityLockClause}
            </div>
          </div>

          {/* Framing & Pose */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>۲. کادربندی، زاویه و ژست سوژه (Framing & Pose)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.framingAndPose, 'bd-pose')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-pose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.framingAndPose}
            </div>
          </div>

          {/* Outfit & Materials */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>۳. پوشش، جنس پارچه و دوخت‌ها (Outfit & Materials)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.outfitAndMaterials, 'bd-outfit')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-outfit' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.outfitAndMaterials}
            </div>
          </div>

          {/* Accessories */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>۴. عینک و اکسسوری‌ها (Accessories & Real Fit)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.accessories, 'bd-acc')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.accessories}
            </div>
          </div>

          {/* Background Architecture */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4" />
                <span>۵. دیوار، معماری و محیط پس‌زمینه (Environment)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.backgroundAndEnvironment, 'bd-bg')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-bg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.backgroundAndEnvironment}
            </div>
          </div>

          {/* Lighting */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>۶. نورپردازی و اتمسفر (Lighting & Atmosphere)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.lightingAndAtmosphere, 'bd-light')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-light' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.lightingAndAtmosphere}
            </div>
          </div>

          {/* Camera Details */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>۷. بافت منافذ پوست و فوکوس (Micro-Textures)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.cameraAndTextureDetails, 'bd-camera')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-camera' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.cameraAndTextureDetails}
            </div>
          </div>

          {/* Color Grade */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>۸. پالت رنگی و ادیتوریال گرید (Color Grade)</span>
              </span>
              <button
                onClick={() => copyText(result.breakdown.colorGrade, 'bd-color')}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedType === 'bd-color' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-xs font-mono text-stone-300 text-left select-all max-h-36 overflow-y-auto" dir="ltr">
              {result.breakdown.colorGrade}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VARIATIONS */}
      {activeTab === 'variations' && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-stone-800 pb-2 overflow-x-auto">
            {result.variations.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariationIdx(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  selectedVariationIdx === idx
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          {result.variations[selectedVariationIdx] && (
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-100">
                    {result.variations[selectedVariationIdx].name}
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {result.variations[selectedVariationIdx].descriptionFa}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyText(
                      result.variations[selectedVariationIdx].prompt,
                      `variation-${selectedVariationIdx}`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer hover:bg-amber-400"
                >
                  {copiedType === `variation-${selectedVariationIdx}` ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی این نسخه</span>
                    </>
                  )}
                </button>
              </div>

              <div
                className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-left font-mono text-xs text-stone-200 leading-relaxed select-all whitespace-pre-wrap max-h-96 overflow-y-auto"
                dir="ltr"
              >
                {result.variations[selectedVariationIdx].prompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
