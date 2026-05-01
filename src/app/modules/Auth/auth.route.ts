import express from 'express';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

router.post(
  '/change-password',
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

export const authRoutes = router;