/* eslint-disable @typescript-eslint/no-explicit-any */
// import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";

// export const createToken = (
//   jwtPayload: object,
//   secret: Secret,
//   expiresIn: string | number
// ): string => {
//   const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
//   return jwt.sign(jwtPayload, secret, options);
// };

// export const verifyToken = (token: string, secret: Secret): JwtPayload => {
//   return jwt.verify(token, secret) as JwtPayload;
// };

import jwt, { JwtPayload } from 'jsonwebtoken';

export const createToken = (
  jwtPayload: { userId: any; role: any },
  secrete: any,
  expiresIn: any,
) => {
  return jwt.sign(jwtPayload, secrete, {
    expiresIn,
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
