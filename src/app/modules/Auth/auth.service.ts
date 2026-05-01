/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import { AppError } from '../../error/AppError';
import { TLoginUser } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';
import config from '../../config';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByCustomId(payload.name);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid username or password');
  }

  // ❌ If user is marked as deleted
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This account has been deleted!');
  }

  // ❌ If user is inactive
  if (user.status === 'inactive') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Something Wrong'
    );
  }

  // ❌ If password does not match
  const isPasswordValid = await User.isPasswordMatched(payload.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid username or password');
  }

  // ✅ If everything OK → create JWT tokens
  const jwtPayload = {
    userId: user._id as unknown as string,
    role: user.role,
    name: user.name,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: {
      userId: user._id,
      name: user.name,
      role: user.role,
      token: accessToken,
    },
  };
};

// Add refresh token service
const refreshToken = async (token: string) => {
  try {
    // Verify the refresh token
    const decoded = verifyToken(token, config.jwt_refresh_secret as string) as JwtPayload;
    
    const { userId } = decoded;
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
    }
    
    if (user.status === 'inactive') {
      throw new AppError(httpStatus.FORBIDDEN, 'User is inactive');
    }
    
    // Create new access token
    const jwtPayload = {
      userId: user._id as unknown as string,
      role: user.role,
      name: user.name,
    };
    
    const newAccessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );
    
    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  
  const user = await User.isUserExistsByCustomId(userData.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found ');
  }

  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is deleted!');
  }


  if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_round),
  );

  const result = await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return result;
};

export const AuthServices = {
  loginUser,
  refreshToken, // Add this
  changePassword,
};


// /* eslint-disable @typescript-eslint/no-unused-vars */
// import httpStatus from 'http-status';
// import { AppError } from '../../error/AppError';
// import { TLoginUser } from './auth.interface';
// import { createToken } from './auth.utils';
// import config from '../../config';
// import bcrypt from 'bcrypt';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import { User } from '../user/user.model';

// const loginUser = async (payload: TLoginUser) => {
//   const user = await User.isUserExistsByCustomId(payload.name);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Invalid username or password');
//   }

//   // ❌ If user is marked as deleted
//   if (user.isDeleted) {
//     throw new AppError(httpStatus.FORBIDDEN, 'This account has been deleted!');
//   }

//   // ❌ If user is inactive
//   if (user.status === 'inactive') {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       'Something Wrong'
//     );
//   }

//   // ❌ If password does not match
//   const isPasswordValid = await User.isPasswordMatched(payload.password, user.password);
//   if (!isPasswordValid) {
//     throw new AppError(httpStatus.FORBIDDEN, 'Invalid username or password');
//   }

//   // ✅ If everything OK → create JWT tokens
//   const jwtPayload = {
//     userId: user._id as unknown as string,
//     role: user.role,
//     name: user.name,
//   };

//   const accessToken = createToken(
//     jwtPayload,
//     config.jwt_access_secret as string,
//     config.jwt_access_expires_in as string
//   );

//   const refreshToken = createToken(
//     jwtPayload,
//     config.jwt_refresh_secret as string,
//     config.jwt_refresh_expires_in as string
//   );

//   return {
//     accessToken,
//     refreshToken,
//     user: {
//       userId: user._id,
//       name: user.name,
//       role: user.role,
//       token: accessToken,
//     },
//   };
// };



// const changePassword = async (
//   userData: JwtPayload,
//   payload: { oldPassword: string; newPassword: string },
// ) => {
  
//   const user = await User.isUserExistsByCustomId(userData.userId);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'This user is not found ');
//   }

//   const isDeleted = user?.isDeleted;
//   if (isDeleted) {
//     throw new AppError(httpStatus.NOT_FOUND, 'This user is deleted!');
//   }


//   if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
//     throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
//   }

//   const newHashedPassword = await bcrypt.hash(
//     payload.newPassword,
//     Number(config.bcrypt_salt_round),
//   );

//   const result = await User.findOneAndUpdate(
//     {
//       id: userData.userId,
//       role: userData.role,
//     },
//     {
//       password: newHashedPassword,
//       needsPasswordChange: false,
//       passwordChangedAt: new Date(),
//     },
//   );

//   return result;
// };




// export const AuthServices = {
//   loginUser,
//   changePassword,

// };
