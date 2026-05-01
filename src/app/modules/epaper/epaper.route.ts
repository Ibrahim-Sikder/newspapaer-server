import express from 'express';
import { epaperControllers } from './epaper.controller';
import { epaperValidations } from './epaper.validation';
import { validateRequest } from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  validateRequest(epaperValidations.createEpaperValidationSchema),
  epaperControllers.createEpaper,
);

router.get('/', epaperControllers.getAllEpapers);

router.get('/date/:date', epaperControllers.getEpaperByDate);


router.get(
  '/date/:date/page/:pageNumber/article/:articleId',
  epaperControllers.getArticleById,
);

router.patch(
  '/date/:date',
  validateRequest(epaperValidations.updateEpaperValidationSchema),
  epaperControllers.updateEpaper,
);

router.delete('/date/:date', epaperControllers.deleteEpaper);

router.patch('/date/:date/toggle-status', epaperControllers.toggleActiveStatus);

export const epaperRoutes = router;
