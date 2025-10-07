import { z } from 'zod';

// Serper Image Result Schema
export const SerperImageSchema = z.object({
  title: z.string(),
  imageUrl: z.string(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  thumbnailUrl: z.string().optional(),
  thumbnailWidth: z.number().optional(),
  thumbnailHeight: z.number().optional(),
  source: z.string().optional(),
  domain: z.string().optional(),
  link: z.string().optional(),
  position: z.number().optional(),
});

// Cached Image Document Schema
export const TrendImageDocumentSchema = z.object({
  _id: z.any().optional(),
  keyword: z.string(),
  images: z.array(SerperImageSchema),
  fetchedAt: z.date(),
  expiresAt: z.date(), // TTL: 7 días
});

// Types
export type SerperImage = z.infer<typeof SerperImageSchema>;
export type TrendImageDocument = z.infer<typeof TrendImageDocumentSchema>;
