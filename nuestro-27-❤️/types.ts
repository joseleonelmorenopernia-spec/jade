
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AppConfig {
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundValue: string;
  anniversaryDay: number;
  notificationsEnabled: boolean;
}

export interface Memory {
  id: string;
  url: string;
  date: number;
}

export enum AppView {
  CHAT = 'chat',
  IMAGE_GEN = 'image_gen',
  SEARCH = 'search',
  VISION = 'vision'
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
  groundingSources?: Array<{
    uri: string;
    title: string;
  }>;
}
