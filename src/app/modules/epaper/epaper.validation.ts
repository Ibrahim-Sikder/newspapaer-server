import { z } from 'zod';

const ArticleValidationSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  // ✅ min(0) বাদ দিয়ে .int() দিন — negative coordinate valid হতে পারে
  x: z.number({ required_error: 'X coordinate is required' }),
  y: z.number({ required_error: 'Y coordinate is required' }),
  width: z.number().min(1, 'Width must be at least 1'),
  height: z.number().min(1, 'Height must be at least 1'),
  articleImage: z.string().min(1, 'Article image is required'),
  content: z.string().optional().default(''),
  category: z.string().optional().default('জাতীয়'),
});
const PageValidationSchema = z.object({
  pageNumber: z.number().min(1, 'Page number is required'),
  image: z.string().url('Valid image URL is required'),
  thumbnail: z.string().url('Valid thumbnail URL is required'),
  articles: z.array(ArticleValidationSchema),
});

const createEpaperValidationSchema = z.object({
  body: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    title: z.string().min(1, 'Title is required'),
    pages: z.array(PageValidationSchema),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateEpaperValidationSchema = z.object({
  body: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    title: z.string().optional(),
    pages: z.array(PageValidationSchema).optional(),
    isActive: z.boolean().optional(),
  }),
});

const getEpaperByDateValidationSchema = z.object({
  params: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }),
});

const getEpaperByPageValidationSchema = z.object({
  params: z.object({
    date: z.string(),
    pageNumber: z.string().transform(Number),
  }),
});

export const epaperValidations = {
  createEpaperValidationSchema,
  updateEpaperValidationSchema,
  getEpaperByDateValidationSchema,
  getEpaperByPageValidationSchema,
};
