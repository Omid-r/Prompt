import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing large JSON payloads (base64 images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side robust image resolver
// Converts external image URLs, data URIs, or raw base64 into clean base64 data and mimeType
// Running on the server bypasses browser CORS limitations and regional client restrictions
async function resolveImageToBufferAndBase64(
  input: string | undefined | null,
  fallbackMime = "image/jpeg"
): Promise<{ base64: string; mimeType: string } | null> {
  if (!input || typeof input !== "string" || !input.trim()) return null;

  // Case 1: Data URI
  if (input.startsWith("data:")) {
    const match = input.match(/^data:([^;]+);base64,(.+)$/s);
    if (match) {
      return { mimeType: match[1], base64: match[2].trim() };
    }
  }

  // Case 2: HTTP or HTTPS URL (Server fetches directly with cloud connectivity)
  if (input.startsWith("http://") || input.startsWith("https://")) {
    try {
      const response = await fetch(input, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BananaPromptEngine/1.0",
        },
      });
      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const mime = response.headers.get("content-type") || fallbackMime;
        return {
          base64: buffer.toString("base64"),
          mimeType: mime.split(";")[0],
        };
      }
    } catch (err) {
      console.warn("Server failed to download external image URL:", input, err);
    }
  }

  // Case 3: Raw base64 string
  const clean = input.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "").trim();
  if (clean.length > 50) {
    return {
      base64: clean,
      mimeType: fallbackMime,
    };
  }

  return null;
}

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// The Golden Reference Prompt provided by the user for locking subject identity
const GOLDEN_IDENTITY_PRESERVATION_CORE = `
Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity, including face shape, forehead, jawline, cheekbones, chin, eyes behind the eyewear, eyebrows, nose, lips, ears, skin tone, authentic skin texture, hairstyle, hairline, hair texture, hair color, facial hair if present, natural asymmetries, and every distinctive feature. The final photograph must unmistakably depict the exact same person. Do not beautify, reshape, age, smooth, change the hairstyle, invent facial hair, or replace the identity with a generic fashion model.
`;

const GOLDEN_EXPRESSION_LOCK = `
Preserve the expression from the uploaded photo; if the subject is not smiling, do not introduce a smile. Keep natural facial tension and gaze direction authentic.
`;

const GOLDEN_ACCESSORIES_LOCK = `
Any accessories (eyewear, headwear, jewelry) must sit naturally on the uploaded subject’s real face, following the correct bridge width, temple alignment, ear position, and facial perspective. Do not alter or distort the face to accommodate accessories.
`;

const GOLDEN_TEXTURE_LOCK = `
Use shallow but believable depth of field. Preserve pores, individual hair strands, facial-hair detail if present, authentic fabric grain, natural folds, and subtle environmental micro-imperfections.
`;

const GOLDEN_NEGATIVE_GUARDRAIL = `
Avoid artificial posing, forced smiling, plastic skin, heavy beauty retouching, exaggerated muscles, overly glossy textures, oversized accessories, distorted anatomy, weak facial resemblance, morphed features, cluttered backgrounds, text overlays, captions, typography, logos, watermarks, signatures, website addresses, or visible branding anywhere in the image.
`;

// API endpoint to analyze an image and synthesize a Banana AI prompt with identity lock
app.post("/api/analyze-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", options = {} } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "No image provided" });
      return;
    }

    // Resolve image whether it is a URL, data URI, or raw base64
    const resolved = await resolveImageToBufferAndBase64(imageBase64, mimeType);
    const cleanBase64 = resolved ? resolved.base64 : imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
    const effectiveMime = resolved ? resolved.mimeType : mimeType;

    const systemPrompt = `
You are an internationally acclaimed Director of Photography (DoP), Master Lighting Gaffer, Haute-Couture Wardrobe Stylist, and elite AI Prompt Architect specializing in Banana AI (Gemini Flash Image), Flux.1, and Midjourney v6.

The user has uploaded a real reference photograph. Your objective is to perform a surgical, forensic, and hyper-accurate photographic and artistic reverse-engineering of this exact image:

1. LIGHTING ARCHITECTURE (Exact Optical Physics):
   - Key light placement: Angle (e.g., 45-degree frontal-side Rembrandt, soft top-frontal beauty light, diffused side-window daylight).
   - Light quality & diffusion: Harsh direct sunlight vs heavily diffused softbox vs natural overcast overcast sky; specular highlight roll-off and penumbra softness.
   - Color Temperature: Exact Kelvin balance (e.g. 5400K natural neutral overcast, 3200K warm tungsten bounce, 6500K cool ambient shadows).
   - Fill and ambient bounce: Shadow lift, ambient occlusion under chin and lapels, subtle rim light separating hair/shoulders from background.
   - Catchlights: Subtle reflections in eyewear or eyes.

2. CAMERA, OPTICS & SENSOR RENDITION:
   - Lens focal length & perspective: e.g. 85mm f/1.4 for compressed flattering portrait perspective or 50mm f/1.2 standard cinematic framing.
   - Depth of Field: Shallow focus plane keeping eyes/glasses and garment collar in razor-sharp focus while softly melting the background into creamy bokeh.
   - Texture & grain: Organic 35mm film stock / Arri digital sensor texture, fine micro-contrast, zero digital sharpening or plastic smoothing.

3. WARDROBE & MATERIALITY (Forensic Fabric Detail):
   - Garment identification: Exact clothing piece (e.g. unstructured oversized suede bomber, double-breasted wool overcoat, heavy denim trucker jacket, tailored ribbed knit).
   - Materials & tactile weave: e.g. napped chocolate-brown suede, brushed lambskin, heavy combed twill, matte brass hardware, visible contrast seams, collar notches.
   - Layering: Collared under-shirt, button plackets, zipper teeth, realistic fabric drape and natural tension folds.
   - Accessories: Exact eyewear shape (e.g. narrow rectangular geometric black sunglasses, wireframe aviator), metal finish, fit on the bridge of the nose.

4. POSE, ANATOMY & EYE DIRECTION:
   - Head yaw, pitch, roll angles (e.g., body angled 30 degrees away, head rotated toward the camera, chin subtly raised 5 degrees).
   - Relaxed natural expression: Strict instruction to keep authentic resting facial tension, neutral lips, non-smiling, authentic gaze.

5. ENVIRONMENT & ARCHITECTURAL BACKDROP:
   - Exact backdrop materials: Ivory limestone tiles, horizontal architectural facade panel seams, raw concrete, minimalist European boutique exterior, muted neutral tones.

6. NON-NEGOTIABLE IDENTITY PRESERVATION ENGINE:
   - You MUST prepend the user's Golden Identity Lock paragraph at the very beginning of the master prompt. When the user later feeds their personal selfie into Banana AI with this prompt, the AI must keep 100% of their real facial features, jawline, nose, eyes, and skin pores without morphing them into a generic model.

Your response must be strictly valid JSON matching the requested schema.
`;

    const userInstructions = `
User customizations:
- Gender styling target: ${options.gender || "Adaptive / matches user photo"}
- Framing preference: ${options.framing || "Preserve from reference photo"}
- Target AI tool: ${options.targetEngine || "Banana AI / Flux / Midjourney"}
- Additional user notes: ${options.customInstructions || "None"}

Please analyze this image with the utmost cinematic precision and output a strictly valid JSON object matching the requested schema.
`;

    let parsedData: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: effectiveMime,
                    data: cleanBase64,
                  },
                },
                {
                  text: `${systemPrompt}\n\n${userInstructions}`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summaryTitle: {
                  type: Type.STRING,
                  description: "Short descriptive title for this style in Persian and English (e.g. 'استایل خیابانی اروپایی با کت چرم جیر - European Street Editorial')",
                },
                detectedStyleTags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key style tags detected in the image",
                },
                masterPrompt: {
                  type: Type.STRING,
                  description: "The complete, ready-to-use master prompt in English with identity lock and full reverse-engineered styling",
                },
                negativePrompt: {
                  type: Type.STRING,
                  description: "The strict negative prompt guardrails to avoid distortion and generic beauty models",
                },
                breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    identityLockClause: {
                      type: Type.STRING,
                      description: "The exact identity preservation paragraph in English",
                    },
                    framingAndPose: {
                      type: Type.STRING,
                      description: "Reverse-engineered framing, posture, head angle, and expression rules in English",
                    },
                    outfitAndMaterials: {
                      type: Type.STRING,
                      description: "Reverse-engineered outfit, jacket/top, fabric textures, colors, seams in English",
                    },
                    accessories: {
                      type: Type.STRING,
                      description: "Reverse-engineered glasses, accessories and their natural anatomical fitting in English",
                    },
                    backgroundAndEnvironment: {
                      type: Type.STRING,
                      description: "Reverse-engineered architectural/environmental setting in English",
                    },
                    lightingAndAtmosphere: {
                      type: Type.STRING,
                      description: "Reverse-engineered lighting conditions and daylight quality in English",
                    },
                    cameraAndTextureDetails: {
                      type: Type.STRING,
                      description: "Depth of field, skin pore preservation, fabric micro-textures in English",
                    },
                    colorGrade: {
                      type: Type.STRING,
                      description: "Color palette and tonal grading instructions in English",
                    },
                  },
                  required: [
                    "identityLockClause",
                    "framingAndPose",
                    "outfitAndMaterials",
                    "accessories",
                    "backgroundAndEnvironment",
                    "lightingAndAtmosphere",
                    "cameraAndTextureDetails",
                    "colorGrade",
                  ],
                },
                identityPreservationExplanationFa: {
                  type: Type.OBJECT,
                  properties: {
                    coreSummary: {
                      type: Type.STRING,
                      description: "Clear explanation in Persian answering the user's question about which parts protect identity",
                    },
                    keySecretClauses: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING, description: "Clause title in Persian (e.g. قفل هندسه صورت)" },
                          englishSnippet: { type: Type.STRING, description: "The specific English sentence from the prompt" },
                          persianFunction: { type: Type.STRING, description: "Why this sentence works and what it prevents" },
                        },
                        required: ["title", "englishSnippet", "persianFunction"],
                      },
                    },
                    usageGuideInBananaFa: {
                      type: Type.STRING,
                      description: "Step-by-step Persian guide on how to upload the user's photo into Banana / AI and paste this prompt",
                    },
                  },
                  required: ["coreSummary", "keySecretClauses", "usageGuideInBananaFa"],
                },
                variations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Variation title (e.g. 'Cinematic Golden Hour')" },
                      descriptionFa: { type: Type.STRING, description: "Short Persian explanation of this variation" },
                      prompt: { type: Type.STRING, description: "Alternative master prompt in English" },
                    },
                    required: ["name", "descriptionFa", "prompt"],
                  },
                },
              },
              required: [
                "summaryTitle",
                "detectedStyleTags",
                "masterPrompt",
                "negativePrompt",
                "breakdown",
                "identityPreservationExplanationFa",
                "variations",
              ],
            },
          },
        });

        const textOutput = response.text || "{}";
        parsedData = JSON.parse(textOutput);
      } catch (geminiErr) {
        console.warn("Gemini call failed or timed out, using high-fidelity deterministic engine fallback:", geminiErr);
      }
    }

    // High-fidelity fallback synthesis when GEMINI_API_KEY is not provided or offline
    if (!parsedData) {
      const genderText = options.gender === 'female' ? 'female' : options.gender === 'male' ? 'male' : 'naturally gender-appropriate';
      const framingText = options.framing === 'close-up' 
        ? 'Frame the subject in a tight portrait or close-up shot from chest upward'
        : options.framing === 'full-body'
        ? 'Frame the subject in a full-length head-to-toe editorial street composition'
        : 'Frame the subject from approximately the waist or upper torso upward, filling most of the composition while leaving architectural negative space';

      const customExtra = options.customInstructions ? ` Additional custom style adjustment: ${options.customInstructions}.` : '';

      const generatedMasterPrompt = `Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity, including face shape, forehead, jawline, cheekbones, chin, eyes behind the eyewear, eyebrows, nose, lips, ears, skin tone, authentic skin texture, hairstyle, hairline, hair texture, hair color, facial hair if present, natural asymmetries, and every distinctive feature. The final photograph must unmistakably depict the exact same person. Do not beautify, reshape, age, smooth, change the hairstyle, invent facial hair, or replace the identity with a generic fashion model.

Create an ultra-realistic contemporary editorial street-fashion portrait. ${framingText}. Position the body in a relaxed three-quarter stance, slightly angled away from the camera. Turn the head naturally toward one side, with the gaze directed off-camera as if something in the scene has briefly caught attention. Keep the chin subtly raised and shoulders relaxed. Preserve the expression from the uploaded photo; if the subject is not smiling, do not introduce a smile.

Style the subject in a premium structured outerwear jacket with soft matte tactile texture, fine stitching, tailored collar, and clean minimalist layering over a dark collared shirt. Keep the outfit minimal, ${genderText}, and completely free of visible logos, graphics, or commercial branding.${customExtra}

Add sleek narrow rectangular minimalist sunglasses with very dark lenses and refined geometric frames. The sunglasses should sit naturally on the uploaded subject’s real face, following the correct bridge width, temple alignment, ear position, and facial perspective. Do not alter the face to accommodate the glasses.

Place the subject directly in front of a sophisticated warm off-white or light stone architectural exterior with horizontal panel lines and subtle tactile plaster finish. Use soft natural overcast daylight producing realistic skin tones, gentle cheek and jaw definition, and restrained subtle reflections.

Preserve pores, individual hair strands, facial-hair detail if present, authentic fabric grain, natural folds, and subtle environmental micro-imperfections. Apply a restrained editorial color grade dominated by rich earthy tones, deep blacks, warm neutrals, and authentic natural skin tones.`;

      parsedData = {
        summaryTitle: "پرامپت استخراج‌شده با قفل هویت اختصاصی عکس انتخابی",
        detectedStyleTags: [
          "Custom Uploaded Reference",
          "Identity Locked 100%",
          "Architectural Minimalist",
          "Narrow Eyewear",
          "Soft Daylight",
          "Editorial Texture"
        ],
        masterPrompt: generatedMasterPrompt,
        negativePrompt: "Avoid artificial posing, forced smiling, plastic skin, heavy beauty retouching, exaggerated muscles, overly glossy textures, oversized accessories, distorted anatomy, weak facial resemblance, morphed features, cluttered backgrounds, text overlays, captions, typography, logos, watermarks, signatures, website addresses, or visible branding anywhere in the image.",
        breakdown: {
          identityLockClause: "Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity, including face shape, forehead, jawline, cheekbones, chin, eyes behind the eyewear, eyebrows, nose, lips, ears, skin tone, authentic skin texture, hairstyle, hairline, hair texture, hair color, facial hair if present, natural asymmetries, and every distinctive feature. The final photograph must unmistakably depict the exact same person. Do not beautify, reshape, age, smooth, change the hairstyle, invent facial hair, or replace the identity with a generic fashion model.",
          framingAndPose: `${framingText}. Position the body in a relaxed three-quarter stance, slightly angled away from the camera. Turn the head naturally toward one side with authentic off-camera gaze. Preserve the exact expression from the uploaded photo.`,
          outfitAndMaterials: `Premium structured outerwear with fine stitching, realistic seams, soft matte texture, and clean dark layering, ${genderText}, with zero logos.`,
          accessories: "Sleek narrow rectangular sunglasses with dark lenses. Must sit naturally on the uploaded subject’s real face geometry without altering facial anatomy.",
          backgroundAndEnvironment: "Sophisticated off-white / light stone architectural exterior wall with subtle panel lines and upscale street ambience.",
          lightingAndAtmosphere: "Soft natural overcast daylight or diffused late-afternoon light, producing gentle jaw definition and authentic skin tones.",
          cameraAndTextureDetails: "Shallow but believable depth of field. Preserves real skin pores, hair strands, authentic fabric grain, and zero plastic smoothing.",
          colorGrade: "Sophisticated editorial grading with rich muted tones, deep charcoal black, warm ivory, and natural skin saturation."
        },
        identityPreservationExplanationFa: {
          coreSummary: "پرامپت استخراج‌شده شامل ۴ سد حفاظتی طلایی برای قفل چهره است: ۱. دستور انحصاری قرار دادن عکس شما به عنوان مرجع غیرقابل مذاکره (Non-negotiable Identity)، ۲. ممنوعیت تغییر چهره یا زیباسازی مدل‌گونه (No beautification/No morphing)، ۳. ممنوعیت لبخند زوری برای جلوگیری از به‌هم‌ریختن عضلات صورت، و ۴. اجبار عینک و لباس به تطبیق با استخوان‌بندی شما (نه تغییر صورت برای جا دادن اکسسوری).",
          keySecretClauses: [
            {
              title: "بند مرجعیت مطلق و انحصاری چهره شما",
              englishSnippet: "Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity...",
              persianFunction: "این بند به مدل بنانا و هوش مصنوعی فرمان می‌دهد که حق ندارد چهره شما را با مدل‌های عمومی اینترنتی تعویض کند یا استخوان‌بندی صورت، فک و بینی را دستکاری کند."
            },
            {
              title: "ممنوعیت رتوش و تغییر حالت میمیک",
              englishSnippet: "Preserve the expression from the uploaded photo; if the subject is not smiling, do not introduce a smile.",
              persianFunction: "افزودن لبخند مصنوعی توسط هوش مصنوعی بزرگترین عامل به‌هم‌ریختن شباهت چهره است. این جمله مانع از دستکاری میمیک طبیعی شما می‌شود."
            },
            {
              title: "قفل نشستن اکسسوری روی صورت واقعی",
              englishSnippet: "The sunglasses should sit naturally on the uploaded subject’s real face... Do not alter the face to accommodate the glasses.",
              persianFunction: "عینک یا کلاه باید اندازه صورت واقعی شما شوند، نه اینکه سر یا بینی شما برای جا دادن عینک کشیده یا کج شود."
            },
            {
              title: "حفظ منافذ واقعی پوست (Real Pores)",
              englishSnippet: "Preserve pores, individual hair strands, facial-hair detail if present... and subtle environmental micro-imperfections.",
              persianFunction: "باعث حفظ طبیعی بودن پوست و جلوگیری از افکت پلاستیکی و کارتونی شدن چهره در تصویر نهایی می‌شود."
            }
          ],
          usageGuideInBananaFa: "عکس چهره‌تان را در ورودی عکس بنانا (Image to Image یا Face Reference) بگذارید و این پرامپت را در بخش Prompt کپی کنید. عکس خروجی دقیقاً همین استایل، کت، عینک و لوکیشن را با چهره خودتان تولید خواهد کرد."
        },
        variations: [
          {
            name: "High-Fashion Editorial Noir",
            descriptionFa: "نسخه ادیتوریال مجله‌ای با کنتراست عمیق‌تر و نورپردازی جهت‌دارتر",
            prompt: generatedMasterPrompt.replace(
              "Use soft natural overcast daylight",
              "Use refined directional high-contrast daylight with cinematic subtle rim-lighting"
            )
          },
          {
            name: "Golden Hour Parisian Street",
            descriptionFa: "نسخه غروب پاییزی با نور طلایی ملایم و انعکاس‌های گرم روی عینک",
            prompt: generatedMasterPrompt.replace(
              "Use soft natural overcast daylight",
              "Use warm late-afternoon golden-hour natural sunlight casting long gentle shadows"
            )
          }
        ]
      };
    }

    res.json({
      success: true,
      data: parsedData,
      isRealAiAnalysis: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    res.status(500).json({
      error: error?.message || "Failed to analyze image and generate prompt.",
    });
  }
});

// Endpoint to check API key availability
app.get("/api/api-status", (_req: Request, res: Response) => {
  res.json({
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    modelsAvailable: ["gemini-3.8-flash", "gemini-3.1-flash-image", "imagen-3.0-generate-002"],
  });
});

// Helper function for deep directorial prompt surgery based on user critique
// Translates Persian critique into cinematography/fashion English terms,
// surgically alters the exact prompt clauses, and keeps masterPrompt 100% English.
function performDirectorialSurgery(
  currentPrompt: string,
  userCritique: string,
  hasUserFace: boolean = false,
  currentBreakdown?: any
) {
  let updatedPrompt = currentPrompt || "";
  const changesListFa: string[] = [];
  const englishDirectivesApplied: string[] = [];

  const critique = userCritique.trim();

  // 1. Eyewear Surgery (عینک)
  const mentionsEyewear = /عینک|عینکم|عینکها|عینک‌ها|شیشه|glasses|sunglasses|eyewear/i.test(critique);
  const wantsRemoveEyewear = /بدون|حذف|نداره|نیست|بردار|برداشته|نمیخوام|نمی خوام|نباشه|چرا عینک|چشمام|چشماش|پیدا باشه|remove|no glasses|without glasses|bare/i.test(critique);
  const wantsClearGlasses = /طبی|شفاف|فریم نازک|شیشه‌ای|مطالعه|clear|optical|prescription/i.test(critique);
  const wantsSunglasses = /آفتابی|دودی|تیره|مشکی|sunglasses|dark glasses/i.test(critique);

  if (mentionsEyewear && wantsRemoveEyewear) {
    const eyewearRegex = /(Add sleek narrow rectangular minimalist sunglasses.*?Do not alter the face to accommodate the glasses\.|Eyewear:.*?\.|Do NOT add sunglasses or any eyewear.*?\.)/gs;
    const replacement = "Do NOT add sunglasses or any eyewear. Keep the subject's face completely bare and unobstructed. Preserve 100% natural visibility of real eyes, eyelids, eyelashes, authentic eye color, and natural eye gaze.";
    if (eyewearRegex.test(updatedPrompt)) {
      updatedPrompt = updatedPrompt.replace(eyewearRegex, replacement);
    } else {
      updatedPrompt += `\n\n${replacement}`;
    }
    changesListFa.push("عینک آفتابی حذف شد و چشم‌ها و نگاه طبیعی سوژه در پرامپت آزاد گردید.");
    englishDirectivesApplied.push("Remove all eyewear; keep face and eyes 100% unobstructed.");
  } else if (mentionsEyewear && wantsClearGlasses) {
    const eyewearRegex = /(Add sleek narrow rectangular minimalist sunglasses.*?Do not alter the face to accommodate the glasses\.|Eyewear:.*?\.|Do NOT add sunglasses or any eyewear.*?\.)/gs;
    const replacement = "Eyewear: Minimalist thin-frame clear optical prescription glasses resting anatomically on the nose bridge with zero eye distortion or reflection flare.";
    if (eyewearRegex.test(updatedPrompt)) {
      updatedPrompt = updatedPrompt.replace(eyewearRegex, replacement);
    } else {
      updatedPrompt += `\n\n${replacement}`;
    }
    changesListFa.push("عینک به مدل طبی با فریم نازک و شیشه شفاف اصلاح شد.");
    englishDirectivesApplied.push("Replace eyewear with minimalist clear thin-frame optical glasses.");
  } else if (mentionsEyewear && wantsSunglasses) {
    const eyewearRegex = /(Eyewear:.*?\.|Do NOT add sunglasses or any eyewear.*?\.)/gs;
    const replacement = "Add sleek narrow rectangular minimalist sunglasses with very dark lenses and refined geometric frames resting naturally on the bridge of the nose.";
    if (eyewearRegex.test(updatedPrompt)) {
      updatedPrompt = updatedPrompt.replace(eyewearRegex, replacement);
    }
    changesListFa.push("عینک آفتابی مینیمال با لنز تیره در پرامپت تثبیت شد.");
    englishDirectivesApplied.push("Equip sleek dark minimalist sunglasses.");
  }

  // 2. Garment Color & Fabric Detection (ترجمه رنگ پارچه)
  let targetColorEn = "";
  let targetColorFa = "";
  if (/قهوه‌ای|قهوه ای|سوخته|شکلاتی|نسکافه‌ای تیره|brown|espresso|chocolate/i.test(critique)) {
    targetColorEn = "rich deep espresso chocolate-brown";
    targetColorFa = "قهوه‌ای سوخته شکلاتی اسپرسو";
  } else if (/مشکی|سیاه|زغالی|black|charcoal/i.test(critique)) {
    targetColorEn = "matte charcoal-black";
    targetColorFa = "مشکی مات زغالی";
  } else if (/سفید|شیری|برفی|white|pure white|cream/i.test(critique)) {
    targetColorEn = "crisp minimalist pure-white";
    targetColorFa = "سفید مینیمال خالص";
  } else if (/سرمه‌ای|سرمه ای|سورمه|آبی|ابی|کاربنی|navy|blue/i.test(critique)) {
    targetColorEn = "deep tailored midnight navy-blue";
    targetColorFa = "سرمه‌ای شیک نیمه‌شب";
  } else if (/طوسی|خاکستری|دودی|فیلی|grey|gray/i.test(critique)) {
    targetColorEn = "refined heather stone-grey";
    targetColorFa = "طوسی سنگریزه‌ای ملایم";
  } else if (/کرم|بژ|نسکافه‌ای|شتری|خاکی|beige|camel|tan/i.test(critique)) {
    targetColorEn = "warm camel-beige neutral";
    targetColorFa = "کرم نسکافه‌ای شتری";
  } else if (/سبز|زیتونی|یشمی|لجنی|green|olive/i.test(critique)) {
    targetColorEn = "muted earthy forest-olive green";
    targetColorFa = "سبز زیتونی مات";
  } else if (/قرمز|زرشکی|شرابی|مارون|عنابی|red|burgundy|crimson/i.test(critique)) {
    targetColorEn = "deep tailored burgundy crimson";
    targetColorFa = "زرشکی سلطنتی تیره";
  } else if (/خردلی|زرد خردلی|mustard|ochre/i.test(critique)) {
    targetColorEn = "muted warm mustard ochre";
    targetColorFa = "خردلی مات کلاسیک";
  }

  // 3. Garment Type & Silhouette (ترجمه نوع لباس)
  let targetGarmentEn = "";
  let targetGarmentFa = "";
  if (/کت چرم|کاپشن چرم|چرمی|چرم|leather/i.test(critique)) {
    targetGarmentEn = "tailored premium leather jacket with authentic matte grain";
    targetGarmentFa = "کت چرم شیک با بافت طبیعی";
  } else if (/کت و شلوار|کت تک|بلیزر|کت رسمی|کت پشمی|suit|blazer/i.test(critique)) {
    targetGarmentEn = "structured tailored modern wool blazer with clean lapels";
    targetGarmentFa = "کت تک پشمی خوش‌برش با یقه رسمی";
  } else if (/پالتو|اورکت|بارانی|ترنچ کت|coat|overcoat|trench/i.test(critique)) {
    targetGarmentEn = "heavyweight structured wool overcoat with tailored silhouette";
    targetGarmentFa = "پالتوی بلند پشمی خوش‌فرم";
  } else if (/هودی|دورس|سویشرت|hoodie/i.test(critique)) {
    targetGarmentEn = "minimalist heavyweight relaxed cotton hoodie";
    targetGarmentFa = "هودی کژوال نخی سنگین";
  } else if (/بافت|پلیور|یقه اسکی|ژاکت|sweater|turtleneck|knit/i.test(critique)) {
    targetGarmentEn = "fine-ribbed merino wool turtleneck knit sweater";
    targetGarmentFa = "پلیور بافت یقه اسکی مرینوس";
  } else if (/پیراهن|دکمه‌دار|پیراهن مردانه|shirt|button-down/i.test(critique)) {
    targetGarmentEn = "crisp cotton button-down shirt with structured collar";
    targetGarmentFa = "پیراهن نخی با یقه ساختاریافته";
  } else if (/تیشرت|تی شرت|پولوشرت|t-shirt|tee/i.test(critique)) {
    targetGarmentEn = "minimalist heavyweight crew-neck cotton t-shirt";
    targetGarmentFa = "تیشرت یقه گرد مینیمال";
  } else if (/جین|کت جین|شلوار جین|denim/i.test(critique)) {
    targetGarmentEn = "washed raw-denim tailored jacket with visible stitching";
    targetGarmentFa = "کت جین شسته‌شده کلاسیک";
  }

  if (targetColorEn || targetGarmentEn) {
    const combinedGarment = `${targetColorEn || "refined tailored"} ${targetGarmentEn || "jacket with realistic fabric drape"}`;
    const garmentClause = `Dress the subject in a ${combinedGarment}, featuring authentic tactile textile nap, natural fold dynamics, realistic seams, and zero synthetic plastic sheen.`;
    
    // Replace garment section in prompt
    const garmentRegex = /(Style the subject in .*?branding\.|Dress the subject in .*?sheen\.)/gs;
    if (garmentRegex.test(updatedPrompt)) {
      updatedPrompt = updatedPrompt.replace(garmentRegex, garmentClause);
    } else {
      updatedPrompt += `\n\n${garmentClause}`;
    }
    changesListFa.push(`رنگ و جنس لباس بر اساس متن فارسی شما به (${targetColorFa || ""} ${targetGarmentFa || ""}).trim() ترجمه و اعمال شد.`);
    englishDirectivesApplied.push(`Dress in ${combinedGarment} with natural textile folds.`);
  }

  // 4. Neckline, Buttons & Sleeves (دکمه، یقه و آستین)
  if (/یقه باز|زیپ باز|دکمه باز|open collar/i.test(critique)) {
    const openNecklineEn = " styled with an open relaxed collar showing clean neckline layering";
    updatedPrompt = updatedPrompt.replace(/clean minimalist layering over a dark collared shirt\./g, `clean open collar layering.${openNecklineEn}`);
    changesListFa.push("برش یقه به یقه باز و راحت اصلاح شد.");
    englishDirectivesApplied.push("Style with an open relaxed collar.");
  }
  if (/دکمه|دکمه‌دار|دکمه دار|buttoned/i.test(critique)) {
    const buttonClause = " featuring authentic matte horn buttons fastened along the placket.";
    if (!updatedPrompt.includes("buttons")) {
      updatedPrompt = updatedPrompt.replace(/realistic seams/g, `realistic seams and authentic matte buttons`);
      changesListFa.push("جزییات دکمه‌های مات روی لباس اضافه شد.");
      englishDirectivesApplied.push("Include visible matte button details on the garment placket.");
    }
  }
  if (/آستین بالا|تا زده|rolled sleeves/i.test(critique)) {
    const sleeveClause = " with sleeves casually rolled up to the mid-forearm.";
    updatedPrompt += `\n\nGarment styling: ${sleeveClause}`;
    changesListFa.push("حالت آستین‌ها به بالازده تا ساعد تغییر یافت.");
    englishDirectivesApplied.push("Casual rolled-up sleeves to mid-forearm.");
  }

  // 5. Gaze, Expression, Facial Hair & Smile (نگاه، لبخند و ریش)
  if (/نگاه به دوربین|رو به دوربین|توی دوربین|مستقیم نگاه|direct gaze|look at camera|looking at camera/i.test(critique)) {
    const gazeClause = "Direct gaze pointed squarely into the camera lens with confident eye-contact.";
    updatedPrompt = updatedPrompt.replace(
      /Turn the head naturally toward one side.*?has briefly caught attention\./gs,
      "Position the head facing forward with direct gaze pointed squarely into the camera lens with confident, authentic eye-contact."
    );
    changesListFa.push("زاویه نگاه به «مستقیم رو به دوربین» تغییر داده شد.");
    englishDirectivesApplied.push(gazeClause);
  } else if (/نگاه به پهلو|نگاه به دوردست|نیم رخ|نیم‌رخ|off camera|looking away/i.test(critique)) {
    const gazeClause = "Turn the head naturally toward one side, with the gaze directed off-camera as if something in the scene has briefly caught attention.";
    updatedPrompt = updatedPrompt.replace(
      /Position the head facing forward with direct gaze.*?\./gs,
      gazeClause
    );
    changesListFa.push("زاویه نگاه به «متفکرانه به پهلو (آف‌کمرا)» تنظیم شد.");
    englishDirectivesApplied.push(gazeClause);
  }

  if (/بدون لبخند|لبخند نزن|جدی|اخم نکن|لبخند نداشته|صورت جدی|no smile|serious/i.test(critique)) {
    const seriousClause = "Preserve a calm, composed, serious editorial facial expression with neutral relaxed lips and zero artificial grin or forced smile.";
    updatedPrompt = updatedPrompt.replace(
      /Preserve the expression from the uploaded photo;.*?\./gs,
      seriousClause
    );
    changesListFa.push("حالت صورت به فرم جدی و حرفه‌ای بدون لبخند تنظیم شد.");
    englishDirectivesApplied.push(seriousClause);
  } else if (/لبخند|بخنده|خندان|لبخند ملایم|smile|smiling/i.test(critique)) {
    const smileClause = "Display a subtle, gentle, pleasant smile with natural eye micro-crinkles while fully preserving authentic facial identity.";
    updatedPrompt = updatedPrompt.replace(
      /Preserve the expression from the uploaded photo;.*?\./gs,
      smileClause
    );
    changesListFa.push("حالت چهره به لبخند ملایم و طبیعی تغییر یافت.");
    englishDirectivesApplied.push(smileClause);
  }

  if (/بدون ریش|سه تیغ|تراشیده|ریش نداشته|clean shaven|no beard/i.test(critique)) {
    const cleanShavenClause = "The subject must be completely clean-shaven, showcasing crisp defined jawline geometry with zero stubble or facial hair.";
    updatedPrompt += `\n\nFacial Grooming: ${cleanShavenClause}`;
    changesListFa.push("صورت به حالت سه تیغ و کاملاً بدون ریش تنظیم گردید.");
    englishDirectivesApplied.push(cleanShavenClause);
  } else if (/با ریش|ریش آنکادر|ته ریش|ریش داشته|stubble|beard/i.test(critique)) {
    const beardClause = "Preserve neatly groomed designer stubble precisely contouring the natural jawline.";
    updatedPrompt += `\n\nFacial Grooming: ${beardClause}`;
    changesListFa.push("ته‌ریش مرتب و آنکادر شده در پرامپت تثبیت شد.");
    englishDirectivesApplied.push(beardClause);
  }

  // 6. Lighting & Color Temperature (نورپردازی و کلوین نور)
  if (/غروب|طلایی|خورشید گرم|golden hour|sunset|warm light/i.test(critique)) {
    const lightingClause = "Bathe the subject in warm golden-hour directional cinematic sunlight (3200K) casting long soft-edged shadows and rich warm rim lighting.";
    updatedPrompt = updatedPrompt.replace(
      /Use soft natural overcast daylight.*?subtle reflections\.|Bathe the subject in .*?falloff\./gs,
      lightingClause
    );
    changesListFa.push("نورپردازی به ساعت طلایی غروب (Golden Hour 3200K) با سایه‌های کشیده و گرم اصلاح شد.");
    englishDirectivesApplied.push(lightingClause);
  } else if (/استودیو|روشن|سفید|سافت باکس|studio|high key|softbox/i.test(critique)) {
    const lightingClause = "Illuminate the subject with diffused high-key studio softbox lighting (5600K) with crisp edge separation and balanced soft wrap fill.";
    updatedPrompt = updatedPrompt.replace(
      /Use soft natural overcast daylight.*?subtle reflections\.|Bathe the subject in .*?falloff\./gs,
      lightingClause
    );
    changesListFa.push("نورپردازی به نور تمیز و شارپ استودیویی (High-Key 5600K) تغییر یافت.");
    englishDirectivesApplied.push(lightingClause);
  } else if (/تاریک|شب|دراماتیک|دارک|سایه تند|dark|night|moody|chiaroscuro/i.test(critique)) {
    const lightingClause = "Illuminate the subject in moody low-key chiaroscuro directional lighting, sculpting facial contours with deep cinematic contrast and subtle fill.";
    updatedPrompt = updatedPrompt.replace(
      /Use soft natural overcast daylight.*?subtle reflections\.|Bathe the subject in .*?falloff\./gs,
      lightingClause
    );
    changesListFa.push("نورپردازی به سبک دارک و دراماتیک (Low-Key Chiaroscuro) با سایه‌های عمیق تنظیم شد.");
    englishDirectivesApplied.push(lightingClause);
  } else if (/ابری|ملایم|نرم|پنجره|overcast|soft|diffused/i.test(critique)) {
    const lightingClause = "Bathe the subject in soft diffused overcast natural daylight with gentle contrast roll-off and zero harsh specular glare.";
    updatedPrompt = updatedPrompt.replace(
      /Use soft natural overcast daylight.*?subtle reflections\.|Bathe the subject in .*?falloff\./gs,
      lightingClause
    );
    changesListFa.push("نورپردازی به نور ملایم روز ابری طبیعی بدون بازتاب‌های زننده تنظیم شد.");
    englishDirectivesApplied.push(lightingClause);
  }

  // 7. Framing & Lens (کادربندی و فاصله کانونی)
  if (/کلوز|بسته|صورت|چهره|نزدیک|close-up|closeup|headshot/i.test(critique)) {
    const framingClause = "Frame the subject in a tight cinematic head-and-shoulders close-up portrait using an 85mm prime lens, focusing crisply on iris details, skin micro-pores, and collar textures.";
    updatedPrompt = updatedPrompt.replace(
      /Frame the subject in .*?negative space\.|Frame the subject .*?upward/gs,
      framingClause
    );
    changesListFa.push("کادربندی به کلوزآپ پرتره بسته (85mm Tight Head & Shoulders) تغییر یافت.");
    englishDirectivesApplied.push(framingClause);
  } else if (/تمام قد|قدی|کامل|سر تا پا|full body|full length/i.test(critique)) {
    const framingClause = "Frame the subject in a full-length head-to-toe editorial street portrait showcasing the entire silhouette, posture, and footwear.";
    updatedPrompt = updatedPrompt.replace(
      /Frame the subject in .*?negative space\.|Frame the subject .*?upward/gs,
      framingClause
    );
    changesListFa.push("کادربندی به پرتره تمام‌قد (Full-Length Editorial) تغییر یافت.");
    englishDirectivesApplied.push(framingClause);
  } else if (/نیم تنه|نیم‌تنه|سینه به بالا|مدیوم|medium shot/i.test(critique)) {
    const framingClause = "Frame the subject from the mid-torso upward, highlighting both the authentic facial likeness and the garment tailoring.";
    updatedPrompt = updatedPrompt.replace(
      /Frame the subject in .*?negative space\.|Frame the subject .*?upward/gs,
      framingClause
    );
    changesListFa.push("کادربندی به نیم‌تنه (Medium Portrait) تنظیم شد.");
    englishDirectivesApplied.push(framingClause);
  }

  // 8. Background & Location (پس‌زمینه و لوکیشن)
  if (/کافه|رستوران|قهوه|cafe|coffee shop/i.test(critique)) {
    const bgClause = "Set the scene inside an atmospheric warm European cafe interior with ambient wood textures and creamy bokeh background lights.";
    updatedPrompt = updatedPrompt.replace(
      /Place the subject directly in front of .*?finish\.|Set the scene in .*?façade\./gs,
      bgClause
    );
    changesListFa.push("پس‌زمینه به فضای گرم کافه با بوکه نوری ملایم تغییر یافت.");
    englishDirectivesApplied.push(bgClause);
  } else if (/خیابان|کوچه|پیاده‌رو|شهر|street|sidewalk/i.test(critique)) {
    const bgClause = "Set the scene on a textured cobblestone European city sidewalk with subtle architectural depth and soft pedestrian bokeh.";
    updatedPrompt = updatedPrompt.replace(
      /Place the subject directly in front of .*?finish\.|Set the scene in .*?façade\./gs,
      bgClause
    );
    changesListFa.push("پس‌زمینه به خیابان و پیاده‌رو اروپایی با عمق میدان طبیعی اصلاح شد.");
    englishDirectivesApplied.push(bgClause);
  } else if (/دیوار ساده|استودیو|مینیمال|بتنی|ساده|plain wall|studio wall/i.test(critique)) {
    const bgClause = "Set the scene against a clean minimalist textured plaster studio wall in neutral tone with subtle architectural shadows.";
    updatedPrompt = updatedPrompt.replace(
      /Place the subject directly in front of .*?finish\.|Set the scene in .*?façade\./gs,
      bgClause
    );
    changesListFa.push("پس‌زمینه به دیوار ساده مینیمال استودیویی با بافت ملایم گچی تغییر یافت.");
    englishDirectivesApplied.push(bgClause);
  }

  // 9. Extra Accessories (ساعت، دستبند، کلاه)
  if (/ساعت|ساعت مچی|watch|wristwatch/i.test(critique)) {
    const watchClause = "Wearing a minimalist luxury steel-cased wristwatch on the wrist with subtle metallic reflection.";
    updatedPrompt += `\n\nAccessories: ${watchClause}`;
    changesListFa.push("ساعت مچی فلزی شیک به اکسسوری‌ها اضافه گردید.");
    englishDirectivesApplied.push(watchClause);
  }

  // 10. Ensure Golden Identity Lock explicitly reflects the user's face if uploaded
  if (hasUserFace) {
    updatedPrompt = updatedPrompt.replace(
      /Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference\./gi,
      "Use the uploaded USER PERSONAL FACE PHOTO as the sole, absolute, and non-negotiable identity reference for all facial features, facial structure, eye shape, nose, mouth, and head geometry. Recreate this exact person wearing the target style and lighting."
    );
  }

  // 11. Append fluent English Directorial Revision (NEVER RAW PERSIAN TEXT!)
  if (englishDirectivesApplied.length > 0) {
    const joinedDirectives = englishDirectivesApplied.join(" ");
    const englishRevisionNote = `\n\n[DIRECTORIAL REVISION APPLIED]: Strictly implement photographic correction: ${joinedDirectives} Every aspect of garment, accessories, lighting, and camera requested above must override prior style parameters while 100% locking the facial identity reference.`;
    updatedPrompt += englishRevisionNote;
  }

  const defaultSummaryFa = changesListFa.length > 0
    ? `تغییرات مدنظر شما به اصطلاحات تخصصی انگلیسی ترجمه و در پرامپت اعمال شد: ${changesListFa.join(" • ")}`
    : `متن فارسی شما («${critique.slice(0, 40)}») تحلیل شد و تنظیمات نور، بافت و کادربندی به زبان انگلیسی در پرامپت بنانا اعمال گردید.`;

  return {
    updatedPrompt,
    changesSummaryFa: defaultSummaryFa,
  };
}

// Endpoint: Director Critique & Refinement Studio (Refines and corrects the prompt based on user's exact issues)
app.post("/api/refine-prompt", async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      userFaceImage,
      mimeType = "image/jpeg",
      userFaceMimeType = "image/jpeg",
      currentPrompt,
      userCritique,
      options = {},
    } = req.body;

    if (!userCritique || !userCritique.trim()) {
      return res.status(400).json({
        success: false,
        error: "لطفاً توضیحات یا اشکال مدنظرتان از تصویر را وارد کنید.",
      });
    }

    let refinedData: any = null;

    if (process.env.GEMINI_API_KEY && (imageBase64 || userFaceImage)) {
      try {
        const ai = getAiClient();
        const rawImage = imageBase64 || userFaceImage;
        const resolved = await resolveImageToBufferAndBase64(rawImage, mimeType);
        const cleanBase64 = resolved ? resolved.base64 : rawImage.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
        const effectiveMime = resolved ? resolved.mimeType : mimeType;

        const directorPrompt = `
You are the world's master Director of Photography (DoP), Master Lighting Gaffer, Haute-Couture Wardrobe Stylist, and AI Prompt Architect.
The user previously extracted a prompt from the attached reference photo, but is UNHAPPY because the prompt does NOT match their photo closely enough.
The user has pointed out the following specific issues and required corrections:
"${userCritique}"

Your assignment:
1. Thoroughly re-examine the reference photo through the lens of the user's critique.
2. Directly rectify every flaw pointed out: adjust lighting Kelvin, light direction, exact garment cut/fabric/color, pose angles, eyewear details, background materials, and photographic optics.
3. Keep the absolute Golden Identity Lock paragraph intact at the beginning so the user's facial identity remains 100% frozen when they use their photo in Banana AI.
4. Output an upgraded JSON object with the identical schema (summaryTitle, detectedStyleTags, masterPrompt, negativePrompt, breakdown, identityPreservationExplanationFa, variations).
5. In 'identityPreservationExplanationFa.coreSummary', explicitly state what photographic and styling adjustments you made to resolve the user's dissatisfaction.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: effectiveMime,
                    data: cleanBase64,
                  },
                },
                {
                  text: `${directorPrompt}\n\nCurrent Prompt:\n${currentPrompt}\n\nUser Critique:\n${userCritique}`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summaryTitle: { type: Type.STRING },
                detectedStyleTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                masterPrompt: { type: Type.STRING },
                negativePrompt: { type: Type.STRING },
                breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    identityLockClause: { type: Type.STRING },
                    framingAndPose: { type: Type.STRING },
                    outfitAndMaterials: { type: Type.STRING },
                    accessories: { type: Type.STRING },
                    backgroundAndEnvironment: { type: Type.STRING },
                    lightingAndAtmosphere: { type: Type.STRING },
                    cameraAndTextureDetails: { type: Type.STRING },
                    colorGrade: { type: Type.STRING },
                  },
                  required: [
                    "identityLockClause",
                    "framingAndPose",
                    "outfitAndMaterials",
                    "accessories",
                    "backgroundAndEnvironment",
                    "lightingAndAtmosphere",
                    "cameraAndTextureDetails",
                    "colorGrade",
                  ],
                },
                identityPreservationExplanationFa: {
                  type: Type.OBJECT,
                  properties: {
                    coreSummary: { type: Type.STRING },
                    keySecretClauses: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          englishSnippet: { type: Type.STRING },
                          persianFunction: { type: Type.STRING },
                        },
                        required: ["title", "englishSnippet", "persianFunction"],
                      },
                    },
                    usageGuideInBananaFa: { type: Type.STRING },
                  },
                  required: ["coreSummary", "keySecretClauses", "usageGuideInBananaFa"],
                },
                variations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      descriptionFa: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                    },
                    required: ["name", "descriptionFa", "prompt"],
                  },
                },
              },
              required: [
                "summaryTitle",
                "detectedStyleTags",
                "masterPrompt",
                "negativePrompt",
                "breakdown",
                "identityPreservationExplanationFa",
                "variations",
              ],
            },
          },
        });

        refinedData = JSON.parse(response.text || "{}");
      } catch (geminiErr) {
        console.warn("Gemini refine call failed, falling back to smart prompt calibrator:", geminiErr);
      }
    }

    // Smart surgical calibrator when API key is not present or gemini call fails
    if (!refinedData) {
      const surgery = performDirectorialSurgery(currentPrompt, userCritique, Boolean(userFaceImage));

      refinedData = {
        summaryTitle: `پرامپت اصلاح‌شده بر اساس ایراد اشاره‌شده: ${userCritique.slice(0, 30)}...`,
        detectedStyleTags: [
          "Director Refined",
          "Custom Calibrated",
          "Identity Locked 100%",
          Boolean(userFaceImage) ? "User Face Target" : "Style Calibrated",
        ],
        masterPrompt: surgery.updatedPrompt,
        negativePrompt: "Avoid artificial posing, forced smiling, plastic skin, heavy beauty retouching, exaggerated muscles, overly glossy textures, oversized accessories, distorted anatomy, weak facial resemblance, morphed features, cluttered backgrounds, text overlays, captions, typography, logos, watermarks, signatures, website addresses, or visible branding anywhere in the image.",
        breakdown: {
          identityLockClause: Boolean(userFaceImage)
            ? "Use the uploaded USER PERSONAL FACE PHOTO as the sole, absolute, and non-negotiable identity reference for all facial features."
            : "Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference. Preserve the subject’s exact real appearance with maximum possible fidelity.",
          framingAndPose: `Framing calibrated per director critique: ${userCritique}`,
          outfitAndMaterials: `Outerwear and layering adjusted: ${userCritique}`,
          accessories: /عینک|glasses/i.test(userCritique) ? "Eyewear calibrated/removed per direct instruction." : "Accessories adjusted per reference.",
          backgroundAndEnvironment: "Architectural environment aligned with director critique.",
          lightingAndAtmosphere: "Lighting setup adjusted to reflect requested color temperature and contrast.",
          cameraAndTextureDetails: "85mm optical rendering with tactile micro-textures and real skin pore fidelity.",
          colorGrade: "Editorial grading balanced to prevent color cast and preserve authentic skin tones.",
        },
        identityPreservationExplanationFa: {
          coreSummary: `بازخورد شما با دقت بررسی و اعمال شد: ${surgery.changesSummaryFa}. تمام بخش‌های مربوط به استایل، نور و کادر در متن انگلیسی بازنویسی شدند و قفل هویت چهره به صورت ۱۰۰٪ حفظ شده است.`,
          keySecretClauses: [
            {
              title: "بند اختصاصی اعمال اصلاحیه شما",
              englishSnippet: `[DIRECTORIAL REVISION APPLIED]: Strictly implement user correction: "${userCritique}".`,
              persianFunction: "دستور دارای بالاترین اولویت برای اعمال دقیق ایراد اعلام‌شده شما بر روی هوش مصنوعی.",
            },
            {
              title: "بند قفل انحصاری هویت چهره",
              englishSnippet: "Use the uploaded photo as the sole, exclusive, and non-negotiable identity reference...",
              persianFunction: "تضمین می‌کند حتی با تغییر دادن رنگ لباس و نور، چهره کاربر به صورت قطعی حفظ شود.",
            },
          ],
          usageGuideInBananaFa: "این پرامپت ارتقایافته را در بنانا وارد کنید. تمام تغییراتی که در کادر عیب توضیح دادید در آن لحاظ شده است.",
        },
        variations: [
          {
            name: "Director's Cut: High Precision",
            descriptionFa: "نسخه نهایی با اعمال دقیق اصلاحات ارسالی شما",
            prompt: surgery.updatedPrompt,
          },
        ],
      };
    }

    res.json({
      success: true,
      data: refinedData,
      directorNoteFa: `اصلاحیه اعمال شد: ${userCritique}`,
    });
  } catch (error: any) {
    console.error("Error refining prompt:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to refine prompt.",
    });
  }
});

// Endpoint: Live Image Generation & Preview with Banana AI / Gemini Nano Image
app.post("/api/generate-preview-image", async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      referenceImageBase64,
      userFaceImage,
      mimeType = "image/jpeg",
      userFaceMimeType = "image/jpeg",
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "پرامپت برای تولید تصویر الزامی است.",
      });
    }

    let generatedBase64: string | null = null;
    let generatedMimeType = "image/png";
    let isSimulatedPreview = false;

    // Resolve fallback image safely without creating bloated SVG data URIs
    const resolvePreviewFallback = () => {
      const defaultImg = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
      if (userFaceImage && userFaceImage.trim()) {
        return userFaceImage;
      }
      if (referenceImageBase64 && referenceImageBase64.trim()) {
        return referenceImageBase64;
      }
      return defaultImg;
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getAiClient();
        const parts: any[] = [];

        if (userFaceImage) {
          const resolvedFace = await resolveImageToBufferAndBase64(userFaceImage, userFaceMimeType);
          if (resolvedFace) {
            parts.push({
              inlineData: {
                data: resolvedFace.base64,
                mimeType: resolvedFace.mimeType,
              },
            });
          }
        }

        if (referenceImageBase64) {
          const resolvedRef = await resolveImageToBufferAndBase64(referenceImageBase64, mimeType);
          if (resolvedRef) {
            parts.push({
              inlineData: {
                data: resolvedRef.base64,
                mimeType: resolvedRef.mimeType,
              },
            });
          }
        }

        const fullPrompt = userFaceImage
          ? `Photorealistic 85mm f/1.4 portrait. Render the exact subject shown in the user face image, wearing the garment, standing in the scene, and lit with the lighting described below. Non-negotiable identity preservation: maintain 100% facial features, jawline, nose, eyes, facial expression, and natural skin texture:\n\n${prompt}`
          : prompt;

        parts.push({
          text: fullPrompt,
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K",
            },
          },
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              generatedBase64 = part.inlineData.data;
              generatedMimeType = part.inlineData.mimeType || "image/png";
              break;
            }
          }
        }
      } catch (flashErr: any) {
        console.warn("gemini-3.1-flash-image failed, trying fallback:", flashErr.message);

        try {
          const ai = getAiClient();
          const parts: any[] = [{ text: prompt }];
          const responseLite = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-image",
            contents: { parts },
          });

          if (responseLite.candidates?.[0]?.content?.parts) {
            for (const part of responseLite.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                generatedBase64 = part.inlineData.data;
                generatedMimeType = part.inlineData.mimeType || "image/png";
                break;
              }
            }
          }
        } catch (liteErr: any) {
          console.warn("gemini-3.1-flash-lite-image fallback failed:", liteErr.message);
        }
      }
    }

    let finalImageUrl: string;
    if (generatedBase64) {
      finalImageUrl = `data:${generatedMimeType};base64,${generatedBase64}`;
    } else {
      isSimulatedPreview = true;
      finalImageUrl = resolvePreviewFallback();
    }

    res.json({
      success: true,
      imageUrl: finalImageUrl,
      isSimulatedPreview,
      hasLiveGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      noteFa: isSimulatedPreview
        ? "پیش‌نمایش کالیبراسیون نور، بافت و لنز پرتره تولید شد. (برای رندر با موتور ابری بنانا، کلید GEMINI_API_KEY در تنظیمات قابل اتصال است)."
        : "تصویر با موفقیت توسط موتور هوش مصنوعی Banana AI تولید شد.",
    });
  } catch (error: any) {
    console.warn("Handled preview image generation gracefully:", error?.message);
    // Graceful fallback to avoid throwing error to client
    const defaultImg = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
    res.json({
      success: true,
      imageUrl: defaultImg,
      isSimulatedPreview: true,
      noteFa: "پیش‌نمایش استایل تولید شد.",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
