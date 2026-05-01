/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { Epaper } from './epaper.model';
import { IArticle, IEpaperDocument, IPage } from './epaper.interface';
import httpStatus from 'http-status';
import { AppError } from '../../error/AppError';
import { clearCacheByPattern, getCache, setCache } from '../../../utils/cache';
import { PipelineStage } from 'mongoose';
const generateArticleId = (pageNumber: number, idx: number) => {
  return `art_${Date.now()}_${pageNumber}_${idx}`;
};

const transformArticleForBackend = (article: any, pageNumber: number, idx: number) => {
  return {
    id: article.id || generateArticleId(pageNumber, idx),
    newsId: article.newsId || null,
    newsSlug: article.newsSlug || '',
    titleSnapshot: article.titleSnapshot || article.title || '',
    imageSnapshot: article.imageSnapshot || article.articleImage || '',
    x: article.x || 0,
    y: article.y || 0,
    width: article.width || 0,
    height: article.height || 0,
    articleImage: article.articleImage || '',
    contentSnapshot: article.contentSnapshot || article.content || '',
    category: article.category || 'জাতীয়',
  };
};

const createEpaper = async (payload: any): Promise<IEpaperDocument> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingEpaper = await Epaper.findOne({
      date: payload.date,
      edition: payload.edition
    }).session(session);

    if (existingEpaper) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Epaper for date ${payload.date} with edition ${payload.edition} already exists`,
      );
    }

    // Process pages and articles
    if (payload.pages && Array.isArray(payload.pages)) {
      for (let i = 0; i < payload.pages.length; i++) {
        const page = payload.pages[i];

        if (!page.originalWidth || !page.originalHeight) {
          page.originalWidth = 1200;
          page.originalHeight = 1800;
        }

        if (page.articles && Array.isArray(page.articles)) {
          const transformedArticles = page.articles.map((article: any, idx: number) =>
            transformArticleForBackend(article, page.pageNumber || i + 1, idx)
          );
          payload.pages[i].articles = transformedArticles;
        } else {
          payload.pages[i].articles = [];
        }
      }
    }

    const result = await Epaper.create([payload], { session });
    await session.commitTransaction();

    // Clear cache
    await clearCacheByPattern('epaper:*');

    return result[0];
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};



export const getAllEpapers = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const match: Record<string, unknown> = {};

  if (query.isActive === 'true') match.isActive = true;

  if (query.date && typeof query.date === 'string' && query.date.trim()) {
    match.date = query.date.trim();
  }

  if (query.edition && typeof query.edition === 'string' && query.edition.trim()) {
    match.edition = query.edition.trim();
  }

  const cacheKey = `epaper:list:page:${page}:limit:${limit}:date:${match.date || 'all'}:edition:${match.edition || 'all'}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;


  const pipeline: PipelineStage[] = [
    { $match: match },
    { $sort: { date: -1, edition: 1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        title: 1,
        date: 1,
        edition: 1,
        pages: 1,
        isActive: 1,
        footerInfo: 1,
      },
    },
  ];

  const [epapers, total] = await Promise.all([
    Epaper.aggregate(pipeline),
    Epaper.countDocuments(match),
  ]);

  const totalPage = Math.ceil(total / limit);

  const result = {
    meta: { page, limit, total, totalPage },
    epapers,
  };

  await setCache(cacheKey, result, 300);

  return result;
};

const getEpaperByDate = async (date: string): Promise<IEpaperDocument | null> => {
  const cacheKey = `epaper:date:${date}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await Epaper.findOne({ date, isActive: true }).lean();

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Epaper not found for date: ${date}`,
    );
  }

  await setCache(cacheKey, result, 600);
  return result;
};

const getEpaperByDateAndEdition = async (date: string, edition: string) => {
  const cacheKey = `epaper:date:${date}:edition:${edition}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await Epaper.findOne({ date, edition, isActive: true }).lean();

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Epaper not found for date: ${date} and edition: ${edition}`,
    );
  }

  await setCache(cacheKey, result, 600);
  return result;
};

const getEpaperByPage = async (date: string, pageNumber: number, edition?: string) => {
  const cacheKey = `epaper:date:${date}:page:${pageNumber}:edition:${edition || 'default'}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const query: any = { date, isActive: true };
  if (edition) query.edition = edition;

  const epaper = await Epaper.findOne(query).lean();

  if (!epaper) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Epaper not found for date: ${date}${edition ? ` and edition: ${edition}` : ''}`,
    );
  }

  const page = epaper.pages.find((p: IPage) => p.pageNumber === pageNumber);

  if (!page) {
    throw new AppError(httpStatus.NOT_FOUND, `Page ${pageNumber} not found`);
  }

  const result = {
    date: epaper.date,
    edition: epaper.edition,
    title: epaper.title,
    page,
  };

  await setCache(cacheKey, result, 600);
  return result;
};

const getArticleById = async (
  date: string,
  pageNumber: number,
  articleId: string,
  edition?: string,
) => {
  const cacheKey = `epaper:date:${date}:page:${pageNumber}:article:${articleId}:edition:${edition || 'default'}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const query: any = { date, isActive: true };
  if (edition) query.edition = edition;

  const epaper = await Epaper.findOne(query).lean();

  if (!epaper) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Epaper not found for date: ${date}${edition ? ` and edition: ${edition}` : ''}`,
    );
  }

  const page = epaper.pages.find((p: IPage) => p.pageNumber === pageNumber);
  if (!page) {
    throw new AppError(httpStatus.NOT_FOUND, `Page ${pageNumber} not found`);
  }

  const article = page.articles.find((a: IArticle) => a.id === articleId);
  if (!article) {
    throw new AppError(httpStatus.NOT_FOUND, `Article ${articleId} not found`);
  }

  const result = {
    date: epaper.date,
    edition: epaper.edition,
    title: epaper.title,
    pageNumber,
    article,
  };

  await setCache(cacheKey, result, 600);
  return result;
};

const updateEpaper = async (date: string, edition: string, payload: any) => {
  console.log('Updating epaper with payload:', { date, edition, payload });

  // Validate inputs
  if (!date || typeof date !== 'string') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid date is required');
  }

  if (!edition || typeof edition !== 'string') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid edition is required');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find existing epaper with both date and edition
    const existingEpaper = await Epaper.findOne({
      date: date,
      edition: edition
    }).session(session);

    if (!existingEpaper) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Epaper not found for date: ${date} and edition: ${edition}`,
      );
    }

    // Create a clean copy of payload without circular references
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    // Process pages to ensure original dimensions
    if (cleanPayload.pages && Array.isArray(cleanPayload.pages)) {
      for (let i = 0; i < cleanPayload.pages.length; i++) {
        const page = cleanPayload.pages[i];

        if (!page.originalWidth || !page.originalHeight) {
          page.originalWidth = 1200;
          page.originalHeight = 1800;
        }

        if (page.articles && Array.isArray(page.articles)) {
          const transformedArticles = page.articles.map((article: any, idx: number) =>
            transformArticleForBackend(article, page.pageNumber || i + 1, idx)
          );
          cleanPayload.pages[i].articles = transformedArticles;
        }
      }
    }

    // Remove fields that shouldn't be updated
    delete cleanPayload._id;
    delete cleanPayload.createdAt;
    delete cleanPayload.updatedAt;
    delete cleanPayload.date; // Don't allow date update
    delete cleanPayload.edition; // Don't allow edition update

    const result = await Epaper.findOneAndUpdate(
      { date: date, edition: edition },
      { $set: cleanPayload },
      { new: true, session, runValidators: true }
    );

    await session.commitTransaction();

    // Clear all related caches
    await clearCacheByPattern(`epaper:date:${date}*`);
    await clearCacheByPattern(`epaper:list:*`);
    await clearCacheByPattern(`epaper:date:${date}:edition:${edition}*`);

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const deleteEpaper = async (date: string, edition: string) => {
  const result = await Epaper.findOneAndDelete({ date, edition });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Epaper not found for date: ${date} and edition: ${edition}`,
    );
  }

  // Clear cache
  await clearCacheByPattern(`epaper:date:${date}*`);
  await clearCacheByPattern('epaper:list:*');

  return result;
};

const toggleActiveStatus = async (date: string, edition: string, isActive: boolean) => {
  const result = await Epaper.findOneAndUpdate(
    { date, edition },
    { isActive },
    { new: true },
  ).lean();

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Epaper not found for date: ${date} and edition: ${edition}`,
    );
  }

  await clearCacheByPattern(`epaper:date:${date}*`);
  await clearCacheByPattern('epaper:list:*');

  return result;
};

export const epaperServices = {
  createEpaper,
  getAllEpapers,
  getEpaperByDate,
  getEpaperByDateAndEdition,
  getEpaperByPage,
  getArticleById,
  updateEpaper,
  deleteEpaper,
  toggleActiveStatus,
};