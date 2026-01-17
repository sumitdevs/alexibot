import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { optinalAuth } from "../middlewares/auth.middleware"

const router = Router();


router.post('/register', AuthController.register);
router.post('/login', optinalAuth, AuthController.login);

export default router;