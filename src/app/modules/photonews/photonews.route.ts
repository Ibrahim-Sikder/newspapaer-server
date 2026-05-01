import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { auth } from '../../middlewares/auth';
import { photoNewsControllers } from './photonews.controller';
import { PhotoNewsValidations } from './photonews.validation';

const router = express.Router();

router.post(
  '/',
  auth('admin', 'super_admin', 'editor'),
  validateRequest(PhotoNewsValidations.photoNewsValidationSchema),
  photoNewsControllers.createPhotoNews,
);
router.get('/', photoNewsControllers.getAllPhotoNews);
router.get('/:id', photoNewsControllers.getPhotoNewsByID);
router.get('/:slug', photoNewsControllers.getSinglePhotoNews);
router.delete(
  '/:id',
  auth('admin', 'super_admin', 'editor'),
  photoNewsControllers.deletePhotoNews,
);
router.patch(
  '/:id',
  // auth('admin', 'super_admin'),
  photoNewsControllers.updatePhotoNews,
);

export const photoNewsRoutes = router;
