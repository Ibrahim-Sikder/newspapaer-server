// epaper.model.ts
import { Schema, model } from 'mongoose';
import { IEpaperDocument, IArticle, IPage, IFooterInfo } from './epaper.interface';

const ArticleSchema = new Schema<IArticle>(
  {
    id: { type: String, required: true },
    newsId: { type: Schema.Types.ObjectId, ref: 'News', required: false },
    newsSlug: { type: String, required: false },
    titleSnapshot: { type: String, required: true },
    imageSnapshot: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    articleImage: { type: String, required: true },
    contentSnapshot: { type: String, default: '' },
    category: { type: String, default: 'জাতীয়' },
  },
  { _id: false },
);

const PageSchema = new Schema<IPage>(
  {
    pageNumber: { type: Number, required: true },
    image: { type: String, required: true },
    thumbnail: { type: String, required: true },
    originalWidth: { type: Number, required: true, default: 1200 }, // ব্যাকওয়ার্ড কম্প্যাটিবল
    originalHeight: { type: Number, required: true, default: 1800 }, // ব্যাকওয়ার্ড কম্প্যাটিবল
    articles: [ArticleSchema],
  },
  { _id: false },
);

const FooterInfoSchema = new Schema<IFooterInfo>(
  {
    editor: { type: String },
    publisher: { type: String },
    organization: { type: String },
    copyright: { type: String, required: true },
  },
  { _id: false },
);

const EpaperSchema = new Schema<IEpaperDocument>(
  {
    date: { type: String, required: true },
    title: { type: String, required: true },
    edition: {
      type: String,
      enum: ['1st', '2nd', '3rd', 'special', 'magazine'],
      default: '1st',
      required: true,
    },
    pages: [PageSchema],
    isActive: { type: Boolean, default: true },
    footerInfo: { type: FooterInfoSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

EpaperSchema.index({ date: -1 });
EpaperSchema.index({ date: 1, edition: 1 }, { unique: true });
EpaperSchema.index({ isActive: 1 });
EpaperSchema.index({ edition: 1 });
EpaperSchema.index({ 'pages.articles.newsId': 1 });
EpaperSchema.index({ 'pages.articles.newsSlug': 1 });

export const Epaper = model<IEpaperDocument>('Epaper', EpaperSchema);