import { ApiResponse } from "../utils/apiResponse";
import { JWTUtil } from "../utils/auth.util";
import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";


export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if(!authHeader || !authHeader.startsWith('Bearer '))
      return ApiResponse.unauthorized(res, 'No token provided');

    const token = authHeader.substring(7);

    try {
      const decoded =  JWTUtil.verifyToken(token);
      if(!decoded) return ApiResponse.unauthorized(res, 'Invalid token');

      const user = await UserModel.findById(decoded.userId);
      if(!user) return ApiResponse.unauthorized(res, 'User not found');

      req.data = {
        token: token,
        user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
      }
      

      next();
    } catch (error) {
      return ApiResponse.unauthorized(res, 'Invalid or Expired token')
    }
  } catch (error) {
    return ApiResponse.error(res, 'authentication failed');
  }
}

export const optinalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer '))
      return next();

    const token = authHeader.substring(7);

    try {
      const decoded =  JWTUtil.verifyToken(token);
      if(!decoded) return next();

      const user = await UserModel.findById(decoded.userId);
      if(!user) return next();

      req.data = {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };

      next();
    } catch (error) {
      return ApiResponse.unauthorized(res, 'Invalid or Expired token')
    }
  } catch (error) {
    return ApiResponse.error(res, 'authentication failed');
  }
}