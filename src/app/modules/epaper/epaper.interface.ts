// epaper.interface.ts
import { Types } from 'mongoose';

export interface IArticle {
  id: string;
  newsId?: Types.ObjectId;
  newsSlug?: string;
  titleSnapshot: string;
  imageSnapshot: string;
  x: number;
  y: number;
  width: number;
  height: number;
  articleImage: string;
  contentSnapshot: string;
  category: string;
}

export interface IPage {
  pageNumber: number;
  image: string;
  thumbnail: string;
  originalWidth: number;  // নতুন: ইমেজের আসল প্রস্থ
  originalHeight: number; // নতুন: ইমেজের আসল উচ্চতা
  articles: IArticle[];
}

export interface IFooterInfo {
  editor?: string;
  publisher?: string;
  organization?: string;
  copyright: string;
}

export interface IEpaperDocument {
  date: string;
  title: string;
  edition: '1st' | '2nd' | '3rd' | 'special' | 'magazine';
  pages: IPage[];
  isActive: boolean;
  footerInfo: IFooterInfo;
  createdAt?: Date;
  updatedAt?: Date;
}