import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { advertisementControllers } from './advertisement.controller';
import { advertisementValidations } from './advertisement.validation';
import { auth } from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth('admin','super_admin', 'editor'),
  validateRequest(advertisementValidations.createAdvertisementValidationSchema),
  
  advertisementControllers.createadvertisement,
);
router.get('/', advertisementControllers.getAlladvertisement);
router.get('/:id', advertisementControllers.getSingleadvertisement);
router.delete('/:id',auth('admin','super_admin', 'editor'), advertisementControllers.deleteadvertisement);
router.patch(
  '/:id',
  auth('admin','super_admin', 'editor'),
  validateRequest(advertisementValidations.updateAdvertisementValidationSchema),
  advertisementControllers.updateadvertisement,
);

export const advertisementRoutes = router;
