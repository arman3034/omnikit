import React from 'react';

export type ToolCategory = 'text' | 'utility' | 'ai';

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface Tool {
  id: string;
  name: string;
  description: string;
  instructions?: string; // New field for the detailed guide
  icon: React.ComponentType<any>;
  category: ToolCategory;
  path: string;
  component: React.ReactNode;
}

export interface FeedbackData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}