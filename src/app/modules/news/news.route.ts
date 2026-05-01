import express from 'express';
import { newsControllers } from './news.controller';
import { newsValidations } from './news.validation';
import { validateRequest } from '../../middlewares/validateRequest';
const router = express.Router();

router.post(
  '/',
  // auth('admin','super_admin', 'editor'),
  validateRequest(newsValidations.createNewsValidationSchema),
  newsControllers.createNews,
);
router.get('/', newsControllers.getAllNews);
router.get('/:id', newsControllers.getNewsByID);
router.get('/slug/:slug', newsControllers.getSingleNews);

router.delete(
  '/:id',
  // auth('admin','super_admin', 'editor'),
  newsControllers.deleteNews,
);

router.patch(
  '/:id',
  // auth('admin', 'super_admin', 'editor'),
  validateRequest(newsValidations.updateNewsValidationSchema),
  newsControllers.updateNews,
);

export const newsRoutes = router;
