import httpStatus from 'http-status';
import { epaperServices } from './epaper.service';
import { catchAsync } from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

const createEpaper = catchAsync(async (req, res) => {
  const result = await epaperServices.createEpaper(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Epaper created successfully',
    data: result,
  });
});

const getAllEpapers = catchAsync(async (req, res) => {
  const result = await epaperServices.getAllEpapers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Epapers retrieved successfully',
    data: result,
  });
});

const getEpaperByDate = catchAsync(async (req, res) => {
  const { date } = req.params;
  const { edition } = req.query; // Get edition from query params

  // If edition is provided, get specific edition
  if (edition) {
    const result = await epaperServices.getEpaperByDateAndEdition(date, edition as string);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Epaper retrieved successfully',
      data: result,
    });
  }

  // Otherwise get all editions for that date or default
  const result = await epaperServices.getEpaperByDate(date);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Epaper retrieved successfully',
    data: result,
  });
});

const getEpaperByPage = catchAsync(async (req, res) => {
  const { date, pageNumber } = req.params;
  const { edition } = req.query;

  const result = await epaperServices.getEpaperByPage(date, Number(pageNumber), edition as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Page retrieved successfully',
    data: result,
  });
});

const getArticleById = catchAsync(async (req, res) => {
  const { date, pageNumber, articleId } = req.params;
  const { edition } = req.query;

  const result = await epaperServices.getArticleById(
    date,
    Number(pageNumber),
    articleId,
    edition as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article retrieved successfully',
    data: result,
  });
});

const updateEpaper = catchAsync(async (req, res) => {
  const { date } = req.params;
  const { edition } = req.query; // Get edition from query params
  const updateData = req.body;

  if (!edition) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Edition is required in query params',
      data: null,
    });
  }

  const result = await epaperServices.updateEpaper(date, edition as string, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Epaper updated successfully',
    data: result,
  });
});

const deleteEpaper = catchAsync(async (req, res) => {
  const { date } = req.params;
  const { edition } = req.query; // Get edition from query params

  if (!edition) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Edition is required in query params',
      data: null,
    });
  }

  const result = await epaperServices.deleteEpaper(date, edition as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Epaper deleted successfully',
    data: result,
  });
});

const toggleActiveStatus = catchAsync(async (req, res) => {
  const { date } = req.params;
  const { edition } = req.query;
  const { isActive } = req.body;

  if (!edition) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Edition is required in query params',
      data: null,
    });
  }

  const result = await epaperServices.toggleActiveStatus(date, edition as string, isActive);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Epaper status updated successfully',
    data: result,
  });
});

export const epaperControllers = {
  createEpaper,
  getAllEpapers,
  getEpaperByDate,
  getEpaperByPage,
  getArticleById,
  updateEpaper,
  deleteEpaper,
  toggleActiveStatus,
};