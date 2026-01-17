import { Router } from 'express';
import { DictionaryController } from '../controllers/dictionary.controller';
import { authenticate } from '../middlewares/auth.middleware';
const router = Router();

// Search operations
router.get(
  '/search/:word',
  authenticate,
  DictionaryController.searchWord
);

router.post(
  '/search/context',
  authenticate,
  DictionaryController.searchByContext
);


export default router;