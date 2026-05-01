/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { AppError } from '../../error/AppError';

import PhotoNews from './photonews.model';
import mongoose from 'mongoose';
import { createSlug } from '../../../utils/slug';
import { IPhotoNews } from './photonews.interface';
import { getCache, setCache } from '../../../utils/cache';
import { createCacheKey } from '../../../utils/cacheKey';
import { clearCache } from '../../../utils/redisCache';

const createPhotoNews = async (payload: IPhotoNews) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, images } = payload;

    if (!title || !images) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'All required data is not provided.',
      );
    }

    const slug = createSlug(title);

    const slugExists = await PhotoNews.findOne({ slug }).session(session);

    if (slugExists) {
      throw new AppError(httpStatus.CONFLICT, 'Photo news already exists.');
    }

    payload.slug = slug;

    const result = await PhotoNews.create([payload], { session });

    await session.commitTransaction();

    // 🔥 CLEAR ALL PHOTO NEWS CACHE AFTER CREATE
    await clearCache('photonews:*');

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllPhotoNews = async (query: Record<string, unknown>) => {
  const cacheKey = createCacheKey('photonews:list', query);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const match: any = {};

  if (query.searchTerm) {
    match.$or = [
      { title: { $regex: query.searchTerm, $options: 'i' } },
      { description: { $regex: query.searchTerm, $options: 'i' } },
    ];
  }

  const data = await PhotoNews.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await PhotoNews.countDocuments(match);

  const result = {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    photonews: data,
  };

  await setCache(cacheKey, result, 300);

  return result;
};
const getSinglePhotoNews = async (slug: string) => {
  const cacheKey = `photonews:single:${slug}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await PhotoNews.findOne({ slug }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'PhotoNews not found');
  }

  await setCache(cacheKey, result, 600);

  return result;
};
const getPhotoNewsByID = async (id: string) => {
  const cacheKey = `photonews:id:${id}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await PhotoNews.findById(id).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'PhotoNews not found');
  }

  await setCache(cacheKey, result, 600);

  return result;
};
const updatePhotoNews = async (id: string, payload: Partial<IPhotoNews>) => {
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Photo news ID is required.');
  }

  const result = await PhotoNews.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Photo news not found.');
  }

  // 🔥 CLEAR CACHE AFTER UPDATE
  await clearCache('photonews:*');

  return result;
};

const deletePhotoNews = async (id: string) => {
  const result = await PhotoNews.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Photo news not found.');
  }

  // 🔥 CLEAR CACHE AFTER DELETE
  await clearCache('photonews:*');

  return result;
};

export const photoNewsServices = {
  createPhotoNews,
  getAllPhotoNews,
  getSinglePhotoNews,
  updatePhotoNews,
  deletePhotoNews,
  getPhotoNewsByID,
};
