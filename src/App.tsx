import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { UserFaceUploader } from './components/UserFaceUploader';
import { OptionsPanel } from './components/OptionsPanel';
import { PromptResults } from './components/PromptResults';
import { DirectorStudio } from './components/DirectorStudio';
import { TemplateAnalysisModal } from './components/TemplateAnalysisModal';
import { BananaGuideModal } from './components/BananaGuideModal';
import { AnalysisOptions, AnalysisResult, SampleStyle } from './types';
import { SAMPLE_STYLES, ORIGINAL_USER_TEMPLATE } from './data/sampleStyles';
import { Sparkles, ShieldCheck, HelpCircle, AlertCircle, ArrowDown, Camera, Wand2 } from 'lucide-react';

const INITIAL_DEFAULT_RESULT: AnalysisResult = {
  summaryTitle: 'استایل خیابانی اروپایی با کت جیر شکلاتی و عینک باریک (الگوی شما)',
  detectedStyleTags: [
    'Chocolate Brown Suede',
    'European Editorial',
    'Narrow Sunglasses',
    'Ivory Architectural Wall',
    'Overcast Daylight',
    'Muted Tones',
    'Identity Locked',
  ],
  masterPrompt: ORIGINAL_USER_TEMPLATE,
  negativePrompt:
    'Avoid artificial posing, forced smiling, plastic skin, heavy beauty retouching, exaggerated muscles, overly glossy leather, oversized sunglasses, distorted anatomy, weak facial resemblance, morphed features, cluttered backgrounds, text overlays, captions, typography, logos, watermarks, signatures, website addresses, or visible branding anywhere in the image.',
  breakdown: {
    identityLockClause:
      'Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity, including face shape, forehead, jawline, cheekbones, chin, eyes behind the eyewear, eyebrows, nose, lips, ears, skin tone, authentic skin texture, hairstyle, hairline, hair texture, hair color, facial hair if present, natural asymmetries, and every distinctive feature. The final photograph must unmistakably depict the exact same person. Do not beautify, reshape, age, smooth, change the hairstyle, invent facial hair, or replace the identity with a generic fashion model.',
    framingAndPose:
      'Frame the subject from approximately the waist or upper torso upward, filling most of the composition while leaving a small amount of architectural negative space around the head and shoulders. Position the body in a relaxed three-quarter stance, slightly angled away from the camera. Turn the head naturally toward one side, with the gaze directed off-camera. Preserve the expression from the uploaded photo; if the subject is not smiling, do not introduce a smile.',
    outfitAndMaterials:
      'Style the subject in a premium dark chocolate-brown suede or brushed-leather jacket with a structured oversized collar, realistic seams, subtle zipper details, and authentic soft matte texture. Layer it over a clean black button-up shirt or refined black collared top. Keep the entire outfit minimal, masculine or naturally gender-appropriate, and completely free of visible logos or branding.',
    accessories:
      'Add sleek narrow rectangular black sunglasses with very dark lenses and a refined minimalist frame. The sunglasses should sit naturally on the uploaded subject’s real face, following the correct bridge width, temple alignment, ear position, and facial perspective. Do not alter the face to accommodate the glasses.',
    backgroundAndEnvironment:
      'Place the subject directly in front of a sophisticated off-white or warm ivory architectural wall with broad horizontal panel lines and subtle plaster or stone texture. Keep the background simple, upscale, and realistic, like the exterior of a luxury boutique or European building.',
    lightingAndAtmosphere:
      'Use soft natural overcast daylight or diffused late-afternoon light, producing realistic skin tones, gentle cheek and jaw definition, restrained reflections on the sunglasses, and beautiful texture across the brown jacket. Avoid dramatic studio lighting.',
    cameraAndTextureDetails:
      'Use shallow but believable depth of field, keeping the face, sunglasses, jacket collar, and upper torso crisp while the architectural wall softens only slightly. Preserve pores, individual hair strands, facial-hair detail if present, realistic suede grain, and subtle imperfections.',
    colorGrade:
      'Apply a restrained editorial color grade dominated by rich chocolate brown, deep black, warm ivory, and natural skin tones. Keep contrast sophisticated and slightly muted rather than overly saturated or cinematic.',
  },
  identityPreservationExplanationFa: {
    coreSummary:
      'در پرامپت شما ۵ بخش طلایی وجود دارد که مستقیماً مسئول فریز کردن چهره و جلوگیری از تغییر شکل آن در بنانا هستند: ۱. بند قفل هویت مطلق (عدم تغییر ساختار استخوان و عدم رتوش)، ۲. قفل میمیک (عدم اضافه کردن لبخند مصنوعی)، ۳. دستور انطباق عینک بر صورت (و نه تغییر صورت برای جا دادن عینک)، ۴. شبیه‌سازی منافذ پوست و بافت طبیعی (فرار از افکت پلاستیکی)، و ۵. سدهای نگاتیو پرامپت.',
    keySecretClauses: [
      {
        title: 'بند قفل انحصاری و غیرقابل مذاکره هویت',
        englishSnippet:
          'Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity...',
        persianFunction:
          'این بند به موتور بنانا و هوش مصنوعی اعلام می‌کند تصویر آپلودی تنها مرجع چهره است و حق جایگزینی صورت با مدل‌های ژنریک یا فیلترهای زیبایی (Beautification) را ندارد.',
      },
      {
        title: 'قفل میمیک و ممنوعیت لبخند زوری',
        englishSnippet:
          'Preserve the expression from the uploaded photo; if the subject is not smiling, do not introduce a smile.',
        persianFunction:
          'لبخند زدن عضلات گونه و چشم را جابجا می‌کند و چهره را از شباهت خارج می‌کند. این جمله حالت صورت شما را دست‌نخورده حفظ می‌کند.',
      },
      {
        title: 'انطباق عینک بر استخوان‌بندی واقعی',
        englishSnippet:
          'The sunglasses should sit naturally on the uploaded subject’s real face... Do not alter the face to accommodate the glasses.',
        persianFunction:
          'مانع کشیده شدن بینی یا تغییر عرض سر برای عینک آفتابی می‌شود و عینک را مجبور به تطبیق با صورت واقعی می‌کند.',
      },
      {
        title: 'تکسچر و منافذ واقعی پوست (Pores)',
        englishSnippet:
          'Preserve pores, individual hair strands, facial-hair detail if present... and subtle environmental imperfections.',
        persianFunction:
          'باعث می‌شود عکس خروجی حالت فتوشاپ مصنوعی یا عروسک مومی به خود نگیرد و عین یک عکس واقعی دوربین عکاسی دیده شود.',
      },
    ],
    usageGuideInBananaFa:
      'عکس چهره خود را در بنانا آپلود کنید، سپس این پرامپت را در فیلد Prompt قرار دهید. هوش مصنوعی تمام این استایل کت چرم، عینک، نور و دیوار را پیاده‌سازی می‌کند اما صورت شما را با دقت بالا روی آن سوار می‌نماید.',
  },
  variations: [
    {
      name: 'High-Fashion Editorial Noir',
      descriptionFa: 'نسخه ادیتوریال مجله‌ای با کنتراست عمیق‌تر و نورپردازی جهت‌دارتر',
      prompt: ORIGINAL_USER_TEMPLATE.replace(
        'Use soft natural overcast daylight',
        'Use refined directional high-contrast daylight with cinematic subtle rim-lighting'
      ),
    },
    {
      name: 'Golden Hour Parisian Street',
      descriptionFa: 'نسخه غروب پاییزی با نور طلایی ملایم و انعکاس‌های گرم روی عینک',
      prompt: ORIGINAL_USER_TEMPLATE.replace(
        'Use soft natural overcast daylight or diffused late-afternoon light',
        'Use warm late-afternoon golden-hour natural sunlight casting long gentle shadows and golden accents'
      ),
    },
  ],
};

export default function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(SAMPLE_STYLES[0].thumbnail);
  const [currentMimeType, setCurrentMimeType] = useState<string>('image/jpeg');
  const [userFaceImage, setUserFaceImage] = useState<string | null>(null);
  const [userFaceMimeType, setUserFaceMimeType] = useState<string>('image/jpeg');
  const [options, setOptions] = useState<AnalysisOptions>({
    gender: 'adaptive',
    framing: 'as-reference',
    targetEngine: 'banana',
    lockStrictness: 'ultra-strict',
    customInstructions: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(true);
  const [result, setResult] = useState<AnalysisResult | null>(INITIAL_DEFAULT_RESULT);
  const [error, setError] = useState<string | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Check API key status on mount
  useEffect(() => {
    fetch('/api/api-status')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.geminiKeyConfigured === 'boolean') {
          setApiKeyConfigured(data.geminiKeyConfigured);
        }
      })
      .catch(() => {});
  }, []);

  const handleImageSelected = (base64: string, mimeType: string, _sample?: SampleStyle) => {
    setCurrentImage(base64);
    setCurrentMimeType(mimeType);
    setError(null);
    setPreviewImageUrl(null);
  };

  const handleUserFaceSelected = (base64: string, mimeType: string) => {
    setUserFaceImage(base64);
    setUserFaceMimeType(mimeType);
    setError(null);
  };

  const handleClearUserFace = () => {
    setUserFaceImage(null);
  };

  const scrollToDirectorStudio = () => {
    setTimeout(() => {
      const element = document.getElementById('director-studio-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAnalyze = async () => {
    if (!currentImage) return;

    setIsLoading(true);
    setError(null);
    setPreviewImageUrl(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: currentImage,
          mimeType: currentMimeType,
          options,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'خطا در تحلیل تصویر');
      }

      setResult(json.data);

      // Smooth scroll to results
      setTimeout(() => {
        const element = document.getElementById('results-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(
        err.message || 'خطا در ارتباط با سرور یا پردازش تصویر. لطفاً مجدداً تلاش کنید.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Live Preview Generation in Banana AI
  const handleGeneratePreview = async (promptOverride?: string) => {
    const targetPrompt = promptOverride || result?.masterPrompt;
    if (!targetPrompt) return;

    setIsGeneratingImage(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-preview-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: targetPrompt,
          referenceImageBase64: currentImage,
          userFaceImage,
          mimeType: currentMimeType,
          userFaceMimeType,
        }),
      });

      const json = await response.json();

      if (json.imageUrl) {
        setPreviewImageUrl(json.imageUrl);
        scrollToDirectorStudio();
      } else if (!response.ok || !json.success) {
        setError(json.error || 'خطا در برقراری ارتباط با سرویس تولید تصویر.');
      }
    } catch (err: any) {
      console.warn('Image generation request notice:', err?.message);
      setError('امکان بارگذاری تصویر از سرور میسر نشد. لطفاً مجدداً امتحان کنید.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handler for Director Prompt Refinement & Immediate Preview Re-rendering
  const handleRefinePrompt = async (userCritique: string) => {
    if (!result) return;

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: currentImage,
          userFaceImage,
          mimeType: currentMimeType,
          userFaceMimeType,
          currentPrompt: result.masterPrompt,
          userCritique,
          options,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'خطا در بازبینی و اصلاح پرامپت');
      }

      // Update the master result with the refined prompt and breakdown
      setResult(json.data);

      // Immediately trigger live image generation with the refined prompt!
      if (json.data?.masterPrompt) {
        await handleGeneratePreview(json.data.masterPrompt);
      }

      // Scroll to director studio so the user can immediately observe the updated prompt and render!
      scrollToDirectorStudio();
    } catch (err: any) {
      console.error('Refinement error:', err);
      setError(err.message || 'خطا در اصلاح پرامپت توسط متخصص.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Banner */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 shadow-xl relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>موتور هوشمند استخراج پرامپت بنانا با حفظ ۱۰۰٪ هویت و چهره</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-stone-100 leading-tight">
              هر عکسی را به پرامپت بنانا تبدیل کنید، با حفظ کامل چهره شما!
            </h1>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              عکس هر استایلی که دوست دارید (لباس، کت چرم، عینک، نورپردازی و بک‌گراند) را وارد کنید. سیستم ما با مهندسی معکوس هوشمند و تزریق فرمول طلایی <strong className="text-amber-300">Identity Lock</strong> پرامپتی می‌سازد که وقتی عکس چهره خودتان را به بنانا بدهید، دقیقاً این عکس را با صورت واقعی خودتان تولید می‌کند.
            </p>

            {/* Direct answer button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>پاسخ به سوال شما: کدام بخش‌های پرامپت هویت را حفظ می‌کنند؟</span>
              </button>

              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>نحوه بارگذاری عکس در بنانا</span>
              </button>
            </div>
          </div>
        </section>

        {/* Upload & Select Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>مرحله ۱: انتخاب یا بارگذاری عکس مرجع استایل و نور (Reference Style)</span>
            </h2>
          </div>

          <ImageUploader
            currentImage={currentImage}
            onImageSelected={handleImageSelected}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </section>

        {/* User Personal Face Target Section (Selfie / My Face) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>عکس چهره خودتان را بگذارید (برای مشاهده نتیجه نهایی با صورت خودتان)</span>
            </h2>
            <span className="text-xs text-emerald-400 font-medium">موتور قفل شباهت چهره (Identity Lock)</span>
          </div>

          <UserFaceUploader
            userFaceImage={userFaceImage}
            userFaceMimeType={userFaceMimeType}
            onUserFaceSelected={handleUserFaceSelected}
            onClearUserFace={handleClearUserFace}
            onRenderWithUserFace={() => handleGeneratePreview()}
            isGeneratingImage={isGeneratingImage}
          />
        </section>

        {/* Options Section */}
        <section>
          <OptionsPanel options={options} onChange={setOptions} />
        </section>

        {/* Error notification if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start justify-between gap-3 text-right">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <strong className="font-bold block text-rose-200">توجه:</strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-stone-400 hover:text-stone-200 p-1 text-sm font-bold cursor-pointer"
              title="بستن"
            >
              ✕
            </button>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <section id="results-section" className="pt-4 space-y-4">
            <div className="flex items-center justify-between border-t border-stone-800 pt-6">
              <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>مرحله ۳: پرامپت اختصاصی بنانا با قفل هویت (Banana AI Prompt)</span>
              </h2>
              <span className="text-xs text-stone-400">آماده کپی و اجرا در هوش مصنوعی</span>
            </div>

            <PromptResults
              result={result}
              onOpenGuideModal={() => setIsGuideModalOpen(true)}
              onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
              onTestBananaRender={handleGeneratePreview}
              onJumpToCritique={scrollToDirectorStudio}
            />

            {/* Step 4: Director Feedback & Banana Test Studio */}
            <div id="director-studio-section" className="pt-4">
              <DirectorStudio
                result={result}
                referenceImage={currentImage}
                referenceMimeType={currentMimeType}
                userFaceImage={userFaceImage}
                userFaceMimeType={userFaceMimeType}
                onRefinePrompt={handleRefinePrompt}
                isRefining={isRefining}
                onGeneratePreview={handleGeneratePreview}
                isGeneratingImage={isGeneratingImage}
                previewImageUrl={previewImageUrl}
                apiKeyConfigured={apiKeyConfigured}
              />
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <TemplateAnalysisModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />

      <BananaGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>سیستم تخصصی مهندسی معکوس عکس به پرامپت با Identity Lock برای Banana AI و Flux</span>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            مشاهده بخش‌های قفل چهره پرامپت الگو
          </button>
        </div>
      </footer>
    </div>
  );
}
