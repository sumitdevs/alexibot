import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
const router = Router();

router.post(
  '/word-bank',
  authenticate,
  UserController.addToWordBank
);

router.get(
  '/word-bank',
  authenticate,
  UserController.getWordBank
);

router.delete(
  '/word-bank/:id',
  authenticate,
  UserController.removeFromWordBank
);

// History routes
router.post(
  '/history',
  authenticate,
  UserController.addToHistory
);

router.get(
  '/history',
  authenticate,
  UserController.getHistory
);

router.get(
  '/history/recent',
  authenticate,
  UserController.getRecentWords
);

router.delete(
  '/history/:id',
  authenticate,
  UserController.deleteHistory
);

router.delete(
  '/history',
  authenticate,
  UserController.clearHistory
);

export default router;