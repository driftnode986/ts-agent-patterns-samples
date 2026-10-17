// src/mastra/models.ts
// #region anthropic
// Anthropic Claude
import { anthropic } from '@ai-sdk/anthropic';
export const claudeModel = anthropic('claude-sonnet-4-6');
// #endregion

// #region openai
// OpenAI GPT
import { openai } from '@ai-sdk/openai';
export const gptModel = openai('gpt-4o');
// #endregion

// #region google
// Google Gemini
import { google } from '@ai-sdk/google';
export const geminiModel = google('gemini-2.5-flash');
// #endregion
