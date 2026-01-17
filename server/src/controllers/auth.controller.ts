import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { ApiResponse } from "../utils/apiResponse";
import { RegisterDTO, LoginDTO } from "../types/auth.type";
import { JWTUtil } from "../utils/auth.util";

export class AuthController {
  static async register(req: Request, res: Response): Promise<any> {
    try {
      const {name, email, password}: RegisterDTO = req.body;

      const existingUer = await UserModel.emailExists(email);
      if(existingUer)
        return ApiResponse.unauthorized(res, 'Email already exists');

      const password_hash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10
      });

      const user = await UserModel.create({ name, email, password, password_hash });
      if(!user) return ApiResponse.error(res, 'Registration failed');

      const token = JWTUtil.generateToken({
        userId: user.id,
        name: user.name,
        email: user.email
      });

      const { password_hash:_, ...safeUser} = user;

      return ApiResponse.created(res, 'User registered successfully', {
        user: safeUser,
        token: token
      });

    } catch (error) {
      console.log('Registration error: ', error);
      return ApiResponse.error(res, 'Registration failed');
    }
  }

  static async login(req: Request, res: Response) {
    try {
      if(req.data) return ApiResponse.success(res, 
        'User login successfully', req.data
      );
      const {email, password}: LoginDTO = req.body;
      const user = await UserModel.findByEmail(email);

      if (!user) return ApiResponse.unauthorized(res, 
        'invalid user email'
      );

      const isValidPassword = await Bun.password.verify(
        password,
        user.password_hash
      );

      if (!isValidPassword) return ApiResponse.unauthorized(res, 
        'Invalid user password'
      );

      const token = JWTUtil.generateToken({
        userId: user.id,
        name: user.name,
        email: user.email
      });

      const { password_hash:_, ...safeUser } = user;

      return ApiResponse.success(res, 
        'User login successfully',
        {
          user: safeUser,
          token: token
        }
      );

    } catch (error) {
      console.log('login error: ', error);
      return ApiResponse.error(res, 'Login failed');
    }
  }

  
}