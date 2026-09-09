import { SampleStyle } from '../types';

export const SAMPLE_STYLES: SampleStyle[] = [
  {
    id: 'european-suede-jacket',
    titleFa: 'کت جیر شکلاتی و عینک باریک (الگوی شما)',
    titleEn: 'European Suede & Narrow Sunglasses (Your Reference)',
    category: 'Luxury Streetwear',
    thumbnail: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
    descriptionFa: 'استایل خیابانی مینیمال اروپایی با کت چرم جیر قهوه‌ای تیره، دیوار کرم معماری و عینک آفتابی مستطیلی باریک',
    initialPromptSnippet: 'Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference...',
  },
  {
    id: 'parisian-overcoat',
    titleFa: 'پالتو پشمی پاییزی پاریسی',
    titleEn: 'Parisian Tailored Overcoat',
    category: 'Classic Editorial',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    descriptionFa: 'پالتوی بلند پشمی زغالی در خیابان‌های سنگ‌فرش پاریس با نور ملایم صبحگاهی و بوکه عمیق',
    initialPromptSnippet: 'Create a tailored editorial portrait with natural Parisian morning ambience...',
  },
  {
    id: 'minimal-architectural-beige',
    titleFa: 'مینیمالیسم مدرن با طیف رنگی بژ و شنی',
    titleEn: 'Monochrome Architectural Minimalist',
    category: 'High Fashion',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    descriptionFa: 'پرتره مجله‌ای استودیویی مدرن با بک‌دراپ بتنی صیقلی، یقه‌اسکی مشکی و نورپردازی جهت‌دار ملایم',
    initialPromptSnippet: 'Ultra-realistic modern high-fashion portrait against brutalist architectural concrete...',
  },
  {
    id: 'tokyo-cyber-editorial',
    titleFa: 'استریت‌استایل نئونی توکیو',
    titleEn: 'Tokyo Rainy Night Neon Street',
    category: 'Cinematic Urban',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    descriptionFa: 'باران ملایم شبانه، انعکاس محو نورهای نئونی ارغوانی و فیروزه‌ای روی آسفالت خیس و پافر چرمی مات',
    initialPromptSnippet: 'Cinematic atmospheric nighttime street portrait with restrained neon reflections...',
  },
  {
    id: 'old-money-knitwear',
    titleFa: 'اولد مانی و بافت یقه هفت کلاسیک',
    titleEn: 'Old Money Cashmere Aesthetic',
    category: 'Heritage Luxury',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    descriptionFa: 'بافت کشمیر کرم رنگ، پیراهن سفید آکسفورد، باغ پاییزی در پس‌زمینه و نور گرم اواخر روز',
    initialPromptSnippet: 'Heritage luxury editorial portrait with soft natural golden-hour backlighting...',
  },
];

export const ORIGINAL_USER_TEMPLATE = `Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity, including face shape, forehead, jawline, cheekbones, chin, eyes behind the eyewear, eyebrows, nose, lips, ears, skin tone, authentic skin texture, hairstyle, hairline, hair texture, hair color, facial hair if present, natural asymmetries, and every distinctive feature. The final photograph must unmistakably depict the exact same person. Do not beautify, reshape, age, smooth, change the hairstyle, invent facial hair, or replace the identity with a generic fashion model.

Create an ultra-realistic contemporary street-fashion portrait with a refined European editorial aesthetic. Frame the subject from approximately the waist or upper torso upward, filling most of the composition while leaving a small amount of architectural negative space around the head and shoulders.

Position the body in a relaxed three-quarter stance, slightly angled away from the camera. Turn the head naturally toward one side, with the gaze directed off-camera as if something in the street has briefly caught the subject’s attention. Keep the chin subtly raised and the shoulders relaxed. Preserve the expression from the uploaded photo; if the subject is not smiling, do not introduce a smile. The mood should feel calm, confident, sophisticated, and effortlessly cool.

Style the subject in the same strong fashion direction as the reference: a premium dark chocolate-brown suede or brushed-leather jacket with a structured oversized collar, realistic seams, subtle zipper details, and authentic soft matte texture. Layer it over a clean black button-up shirt or refined black collared top. Keep the entire outfit minimal, masculine or naturally gender-appropriate, and completely free of visible logos, writing, patches, or branding.

Add sleek narrow rectangular black sunglasses with very dark lenses and a refined minimalist frame. The sunglasses should sit naturally on the uploaded subject’s real face, following the correct bridge width, temple alignment, ear position, and facial perspective. Do not alter the face to accommodate the glasses.

Place the subject directly in front of a sophisticated off-white or warm ivory architectural wall with broad horizontal panel lines and subtle plaster or stone texture. Keep the background simple, upscale, and realistic, like the exterior of a luxury boutique, gallery, or elegant European building. Do not add storefront signs, readable plaques, pedestrians, cars, or unnecessary environmental clutter.

Use soft natural overcast daylight or diffused late-afternoon light, producing realistic skin tones, gentle cheek and jaw definition, restrained reflections on the sunglasses, and beautiful texture across the brown jacket. Avoid dramatic studio lighting. The photograph should feel like it was naturally captured outdoors during a high-end street-style shoot.

Maintain the refined visual standard associated with prompteg.com through precise identity preservation, premium styling, restrained composition, and authentic photographic realism; prompteg.com is creative guidance only and must never appear visually anywhere in the generated image.

Use shallow but believable depth of field, keeping the face, sunglasses, jacket collar, and upper torso crisp while the architectural wall softens only slightly. Preserve pores, individual hair strands, facial-hair detail if present, realistic suede grain, zipper reflections, natural fabric folds, and subtle environmental imperfections.

Apply a restrained editorial color grade dominated by rich chocolate brown, deep black, warm ivory, and natural skin tones. Keep contrast sophisticated and slightly muted rather than overly saturated or cinematic.

The final result should feel like a premium menswear or luxury street-fashion campaign: understated, expensive, confident, modern, masculine or naturally adapted to the uploaded subject, and completely photorealistic.

Avoid artificial posing, forced smiling, plastic skin, heavy beauty retouching, exaggerated muscles, overly glossy leather, oversized sunglasses, distorted anatomy, weak facial resemblance, cluttered backgrounds, text overlays, captions, typography, logos, watermarks, signatures, website addresses, or visible branding anywhere in the image.`;

export const KEY_IDENTITY_SECTIONS = [
  {
    id: 'identity-core',
    badgeFa: 'هسته اصلی قفل هویت (کلمات کلیدی حیاتی)',
    badgeColor: 'purple',
    englishText: 'Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity, including face shape, forehead, jawline, cheekbones, chin, eyes behind the eyewear, eyebrows, nose, lips, ears, skin tone, authentic skin texture, hairstyle, hairline, hair texture, hair color, facial hair if present, natural asymmetries, and every distinctive feature. The final photograph must unmistakably depict the exact same person. Do not beautify, reshape, age, smooth, change the hairstyle, invent facial hair, or replace the identity with a generic fashion model.',
    explanationFa: 'این دقیق‌ترین و مهم‌ترین بخش است! عبارات «sole, exclusive, and non-negotiable identity reference» و برشمردن تک‌تک اجزای صورت (خط فک، استخوان گونه، مو، عدم تقارن طبیعی) مانع از این می‌شود که هوش مصنوعی بنانا یا میدجرنی چهره را با چهره‌های استوک یا زیباترشده جایگزین کند. جمله انتهایی «Do not beautify, reshape, age, smooth...» جادوی اصلی برای جلوگیری از فیلترهای صاف‌کننده و تغییر چهره است.',
    whyItWorksFa: 'موتورهای تصویری معمولاً تمایل دارند چهره‌ها را به سمت میانگین زیبایی (Beauty Bias) ببرند؛ این پاراگراف دقیقاً جلوی این سوگیری را می‌گیرد.',
  },
  {
    id: 'expression-lock',
    badgeFa: 'قفل میمیک و حالت روحی چهره',
    badgeColor: 'blue',
    englishText: 'Preserve the expression from the uploaded photo; if the subject is not smiling, do not introduce a smile. The mood should feel calm, confident, sophisticated, and effortlessly cool.',
    explanationFa: 'مدل‌های هوش مصنوعی وقتی دستور استایل فشن می‌گیرند، معمولاً یک پوزخند یا لبخند مصنوعی روی چهره می‌گذارند که بلافاصله شباهت با صاحب عکس را نابود می‌کند. جمله «if the subject is not smiling, do not introduce a smile» حالت طبیعی صورت شخص را دقیقاً مانند عکس ورودی فریز می‌کند.',
    whyItWorksFa: 'لبخند فرم گونه‌ها، لب‌ها و چشم‌ها را تغییر می‌دهد. قفل میمیک تضمین می‌کند خطوط طبیعی صورت همانند عکس اصلی بماند.',
  },
  {
    id: 'accessory-lock',
    badgeFa: 'انطباق طبیعی اکسسوری روی آناتومی واقعی',
    badgeColor: 'emerald',
    englishText: 'The sunglasses should sit naturally on the uploaded subject’s real face, following the correct bridge width, temple alignment, ear position, and facial perspective. Do not alter the face to accommodate the glasses.',
    explanationFa: 'یکی از بزرگ‌ترین باگ‌های تولید عکس با عینک یا کلاه این است که هوش مصنوعی عرض صورت یا فرم گوش و بینی را تغییر می‌دهد تا عینک را روی آن بنشاند! عبارت «Do not alter the face to accommodate the glasses» و دستور به رعایت زاویه و پرسپکتیو گوش و پل بینی صورت شخص، ساختار چهره را دست‌نخورده نگه می‌دارد.',
    whyItWorksFa: 'اکسسوری موظف به تطبیق با استخوان‌بندی شخص می‌شود، نه برعکس.',
  },
  {
    id: 'texture-lock',
    badgeFa: 'حفظ منافذ طبیعی پوست و مو',
    badgeColor: 'amber',
    englishText: 'Preserve pores, individual hair strands, facial-hair detail if present, realistic suede grain, zipper reflections, natural fabric folds, and subtle environmental imperfections.',
    explanationFa: 'دستور صریح به حفظ منافذ پوست (pores)، تارهای جداگانه مو و ریش و عیوب ریز پوستی (environmental imperfections). وقتی هوش مصنوعی این بافت‌های میکروسکوپی را شبیه‌سازی می‌کند، دیگر عکس به شکل کارتون یا پلاستیک رتوش‌شده درنمی‌آید.',
    whyItWorksFa: 'حفظ تکسچر واقعی پوست بالاترین فاکتور باورپذیری و هویت در عکس‌های خروجی بنانا و فلکس است.',
  },
  {
    id: 'negative-guardrails',
    badgeFa: 'سدهای محافظتی نگاتیو (Anti-Distortion)',
    badgeColor: 'rose',
    englishText: 'Avoid artificial posing, forced smiling, plastic skin, heavy beauty retouching, exaggerated muscles, overly glossy leather, oversized sunglasses, distorted anatomy, weak facial resemblance...',
    explanationFa: 'این لیست ضد-دیستورشن، خط قرمزهایی است که هرگونه لغزش مدل را خنثی می‌کند: ممنوعیت پوست پلاستیکی، لبخند زوری، روتوش غلیظ و از همه مهم‌تر عبارت «weak facial resemblance» که خطای عدم شباهت را به حداقل می‌رساند.',
    whyItWorksFa: 'کاهش نرخ پرتی تولیدات با فیلتر کردن حالت‌های غیرواقعی.',
  },
];
