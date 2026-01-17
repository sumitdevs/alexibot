import express from "express";

declare global {
  namespace Express {
    interface Request {
      data: {
        token?:string,
        user:{
          id: number;
          email: string;
          name: string;
        }
      }
    }
  }
}
