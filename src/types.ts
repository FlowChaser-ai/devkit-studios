export type ToolCategory =
  | 'formatters'
  | 'converters'
  | 'design'
  | 'generators'
  | 'media'
  | 'pdf';

export interface ToolDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  badge?: string;
  featured?: boolean;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ToastMessage {
  id: string;
  title: string;
  type?: 'success' | 'info' | 'error';
}

export type AgeGroupId = 'under-13' | '13-17' | '18-24' | '25-40' | '41+';

export interface AgeGroupDefinition {
  id: AgeGroupId;
  label: string;
  badge: string;
  description: string;
  guidance: string;
  recommendedToolIds: string[];
}

export type PdfActionTab = 'text-to-pdf' | 'images-to-pdf' | 'merge-pdfs' | 'compress-pdf';
