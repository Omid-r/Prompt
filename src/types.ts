export interface AnalysisOptions {
  gender: 'adaptive' | 'masculine' | 'feminine' | 'neutral';
  framing: 'waist-up' | 'close-up' | 'full-body' | 'as-reference';
  targetEngine: 'banana' | 'flux' | 'midjourney' | 'sdxl';
  lockStrictness: 'ultra-strict' | 'balanced';
  customInstructions: string;
}

export interface PromptBreakdown {
  identityLockClause: string;
  framingAndPose: string;
  outfitAndMaterials: string;
  accessories: string;
  backgroundAndEnvironment: string;
  lightingAndAtmosphere: string;
  cameraAndTextureDetails: string;
  colorGrade: string;
}

export interface SecretClause {
  title: string;
  englishSnippet: string;
  persianFunction: string;
}

export interface IdentityExplanationFa {
  coreSummary: string;
  keySecretClauses: SecretClause[];
  usageGuideInBananaFa: string;
}

export interface PromptVariation {
  name: string;
  descriptionFa: string;
  prompt: string;
}

export interface AnalysisResult {
  summaryTitle: string;
  detectedStyleTags: string[];
  masterPrompt: string;
  negativePrompt: string;
  breakdown: PromptBreakdown;
  identityPreservationExplanationFa: IdentityExplanationFa;
  variations: PromptVariation[];
  isRealAiAnalysis?: boolean;
  directorNoteFa?: string;
  critiqueHistory?: string[];
  generatedPreviewImageUrl?: string;
}

export interface SampleStyle {
  id: string;
  titleFa: string;
  titleEn: string;
  category: string;
  thumbnail: string;
  descriptionFa: string;
  initialPromptSnippet: string;
}
