import httpStatus from 'http-status';

import sendResponse from '../../../utils/sendResponse';
import { catchAsync } from '../../../utils/catchAsync';
import { photoNewsServices } from './photonews.service';

const createPhotoNews = catchAsync(async (req, res, next) => {
  try {
    const result = await photoNewsServices.createPhotoNews(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Photo news create successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

const getAllPhotoNews = catchAsync(async (req, res, next) => {
  try {
    const result = await photoNewsServices.getAllPhotoNews(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Photo news are retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
const getSinglePhotoNews = catchAsync(async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await photoNewsServices.getSinglePhotoNews(slug);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Photo news is retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
const getPhotoNewsByID = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await photoNewsServices.getPhotoNewsByID(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Photo  news is retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
const deletePhotoNews = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await photoNewsServices.deletePhotoNews(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Photo news deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

const updatePhotoNews = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await photoNewsServices.updatePhotoNews(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Photo news update successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

export const photoNewsControllers = {
  getAllPhotoNews,
  getSinglePhotoNews,
  deletePhotoNews,
  updatePhotoNews,
  createPhotoNews,
  getPhotoNewsByID,
};
