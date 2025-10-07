import { z } from 'zod';

// Google Trends Schemas
export const GoogleTrendKeywordSchema = z.object({
  term: z.string(),
  value: z.number(),
  growth: z.number(),
});

export const GoogleTrendsDataSchema = z.object({
  keywords: z.array(GoogleTrendKeywordSchema),
  relatedQueries: z.array(z.string()),
  timestamp: z.date(),
});

// Reddit Schemas
export const RedditPostSchema = z.object({
  title: z.string(),
  subreddit: z.string(),
  upvotes: z.number(),
  url: z.string(),
  createdAt: z.date(),
});

export const RedditDataSchema = z.object({
  topPosts: z.array(RedditPostSchema),
  keyMentions: z.array(z.string()),
  timestamp: z.date(),
});

// OpenAI Analysis Schemas
export const AIAnalysisSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  timestamp: z.date(),
});

// Main Trend Document Schema
export const TrendInsightsSchema = z.object({
  topKeywords: z.array(z.string()),
  risingStyles: z.array(z.string()),
  popularColors: z.array(z.string()),
  recommendations: z.array(z.string()),
  trendScore: z.number().min(0).max(100),
});

export const TrendSourcesSchema = z.object({
  googleTrends: GoogleTrendsDataSchema.optional(),
  reddit: RedditDataSchema.optional(),
  aiAnalysis: AIAnalysisSchema.optional(),
});

export const TrendStatusSchema = z.enum(['processing', 'completed', 'failed']);

export const TrendDocumentSchema = z.object({
  _id: z.any().optional(),
  generatedAt: z.date(),
  expiresAt: z.date(),
  category: z.string().default('sweaters'),
  sources: TrendSourcesSchema,
  insights: TrendInsightsSchema,
  status: TrendStatusSchema,
  error: z.string().optional(),
});

// Types
export type GoogleTrendKeyword = z.infer<typeof GoogleTrendKeywordSchema>;
export type GoogleTrendsData = z.infer<typeof GoogleTrendsDataSchema>;
export type RedditPost = z.infer<typeof RedditPostSchema>;
export type RedditData = z.infer<typeof RedditDataSchema>;
export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;
export type TrendInsights = z.infer<typeof TrendInsightsSchema>;
export type TrendSources = z.infer<typeof TrendSourcesSchema>;
export type TrendStatus = z.infer<typeof TrendStatusSchema>;
export type TrendDocument = z.infer<typeof TrendDocumentSchema>;

// Constants
export const SWEATER_KEYWORDS = [
  'sueter',
  'sueter mujer',
  'sueter hombre',
  'cardigan',
  'sueter tejido',
  'sueter oversize',
  'sueter cuello alto',
  'sueter cuello tortuga',
  'chaleco tejido',
  'cardigan mujer',
  'sueter navideño',
  'sueter lana',
  'sueter de moda',
  'sueter crop',
  'sueter aesthetic',
] as const;

export const FASHION_SUBREDDITS = [
  'fashion',
  'streetwear',
  'femalefashionadvice',
  'malefashionadvice',
  'fashionreps',
] as const;
