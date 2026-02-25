
export type ProductType = 't-shirt' | 'hoodie' | 'mug' | 'cap' | 'tote-bag' | 'poster' | 'phone-case' | 'hat' | 'sticker';

export type AIModelId = 'gemini' | 'gpt' | 'grok' | 'claude' | 'stable-diffusion' | 'ling-v3';

export interface GeneratedMockup {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  product: ProductType;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  video?: string;
  type?: 'text' | 'image' | 'video';
}

export interface AppState {
  logo: string | null;
  product: ProductType;
  environment: string;
  isGenerating: boolean;
  history: GeneratedMockup[];
  currentMockup: GeneratedMockup | null;
  error: string | null;
  selectedModel: AIModelId;
}
