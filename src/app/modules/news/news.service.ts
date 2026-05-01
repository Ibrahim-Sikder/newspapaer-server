/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Category } from '../category/category.model';
import { News } from './news.model';
import { AppError } from '../../error/AppError';
import { createSlug } from '../../../utils/slug';
import { getCache, setCache, clearCacheByPattern } from '../../../utils/cache';
import redis from '../../config/redis';

// ======================================================
// CREATE NEWS
// ======================================================
const createNews = async (payload: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const category = await Category.findById(payload.category).session(session);

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    const slug = createSlug(payload.newsTitle);
    payload.slug = slug;

    const result = await News.create([payload], { session });

    // ✅ Commit BEFORE doing anything outside DB
    await session.commitTransaction();

    // ❗ Cache clear OUTSIDE transaction
    await clearCacheByPattern('news:list:*');

    return result[0];
  } catch (error) {
    // ✅ Only abort if transaction still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// ======================================================
// GET ALL NEWS (FAST + CACHED)
// ======================================================
const getAllNews = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const cacheKey = `news:list:page:${page}:limit:${limit}:category:${
    query.category || 'all'
  }`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;
  const match: any = {};

  if (query.category) {
    const category = await Category.findOne({
      name: query.category,
    }).select('_id');

    if (!category) {
      return {
        meta: { page, limit, total: 0, totalPage: 0 },
        news: [],
      };
    }

    match.category = category._id;
  }

  const data = await News.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryData',
      },
    },
    {
      $addFields: {
        category: { $arrayElemAt: ['$categoryData', 0] },
      },
    },
    { $project: { categoryData: 0 } },
  ]);

  const total = await News.countDocuments(match);
  const totalPage = Math.ceil(total / limit);

  const result = {
    meta: { page, limit, total, totalPage },
    news: data,
  };

  await setCache(cacheKey, result, 300);

  return result;
};

// ======================================================
// GET SINGLE NEWS
// ======================================================
const getSingleNews = async (slug: string) => {
  const cacheKey = `news:single:${slug}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await News.findOne({ slug })
    .populate('category', 'name slug')
    .populate({
      path: 'comments',
      populate: [{ path: 'user', select: 'name email' }],
    })
    .lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await setCache(cacheKey, result, 600);

  return result;
};

// ======================================================
// UPDATE NEWS
// ======================================================
const updateNews = async (id: string, payload: any) => {
  const result = await News.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  // Clear related cache
  await redis.del(`news:single:${result.slug}`);
  await redis.del(`news:id:${id}`);
  await clearCacheByPattern('news:list:*');

  return result;
};

// ======================================================
// DELETE NEWS
// ======================================================
const deleteNews = async (id: string) => {
  const news = await News.findById(id);

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await News.findByIdAndDelete(id);

  // Clear cache safely
  await redis.del(`news:single:${news.slug}`);
  await redis.del(`news:id:${id}`);
  await clearCacheByPattern('news:list:*');

  return news;
};

// ======================================================
// GET BY ID
// ======================================================
const getNewsByID = async (id: string) => {
  const cacheKey = `news:id:${id}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await News.findById(id)
    .populate('category', 'name slug')
    .lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await setCache(cacheKey, result, 600);

  return result;
};

export const newsServices = {
  createNews,
  getAllNews,
  getSingleNews,
  updateNews,
  deleteNews,
  getNewsByID,
};
