import { Request, Response } from 'express';
import { UserWordBankModel, UserHistoryModel } from '../models/user.model';
import { ApiResponse } from '../utils/apiResponse';

export class UserController {
  // Word Bank Operations
  static async addToWordBank(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data?.user.id) {
        return ApiResponse.unauthorized(res, 'authentication failed');
      }

      const { word_id, synset_id } = req.body;

      const exists = await UserWordBankModel.checkExists(req.data.user.id, word_id, synset_id);
      if (exists) {
        return ApiResponse.validationError(res, 'Word already exists in your word bank');
      }

      const item = await UserWordBankModel.addToBank(req.data.user.id, word_id, synset_id);
      return ApiResponse.created(res,'Word added to your bank successfully');
    } catch (error) {
      console.error('Add to word bank error:', error);
      return ApiResponse.error(res, 'Failed to add word to bank', 500);
    }
  }

  static async getWordBank(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data.user) {
        return ApiResponse.unauthorized(res, 'authentication failed');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { items, total } = await UserWordBankModel.getUserWords(req.data.user.id, page, limit);

      return ApiResponse.success(res, 
        'Word bank retrieved successfully',
        {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get word bank error:', error);
      return ApiResponse.error(res, 'Failed to retrieve word bank', 500);
    }
  }

  static async removeFromWordBank(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data.user) {
        return ApiResponse.unauthorized(res, 'authentication failed');
      }

      const { id }  = req.params;

      if(!id) return ApiResponse.validationError(res, 'Missing id parameter');

      const deleted = await UserWordBankModel.removeFromBank(parseInt(id), req.data.user.id);

      if (!deleted) {
        return ApiResponse.notFound(res, 'Word not found in your bank');
      }

      return ApiResponse.success(res, 'Word removed from bank successfully');
    } catch (error) {
      console.error('Remove from word bank error:', error);
      return ApiResponse.error(res, 'Failed to remove word from bank', 500);
    }
  }

  // History Operations
  static async addToHistory(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data.user) {
        return ApiResponse.unauthorized(res, 'authentication failed');
      }

      const { word_id, synset_id, context } = req.body;

      const history = await UserHistoryModel.addToHistory(
        req.data.user.id,
        word_id,
        synset_id,
        context || null
      );

      return ApiResponse.created(res, 'Added to history successfully');
    } catch (error) {
      console.error('Add to history error:', error);
      return ApiResponse.error(res, 'Failed to add to history');
    }
  }

  static async getHistory(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data.user) {
        return ApiResponse.unauthorized(res, 'authentication failed');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { items, total } = await UserHistoryModel.getUserHistory(req.data.user.id, page, limit);

      return ApiResponse.success(res, 
         'History retrieved successfully',
        {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
      );
    } catch (error) {
      console.error('Get history error:', error);
      return ApiResponse.error(res, 'Failed to retrieve history', 500);
    }
  }

  static async deleteHistory(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data.user) {
        return ApiResponse.unauthorized(res, 'auhtentication failed');
      }

      const { id } = req.params;

      if(!id) return ApiResponse.validationError(res, 'Missing id parameter')
      const deleted = await UserHistoryModel.deleteHistory(parseInt(id), req.data.user.id);

      if (!deleted) {
        return ApiResponse.notFound(res, 'History item not found');
      }

      return ApiResponse.success(res, 'History item deleted successfully');
    } catch (error) {
      console.error('Delete history error:', error);
      return ApiResponse.error(res, 'Failed to delete history item', 500);
    }
  }

  static async clearHistory(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data.user) {
        return ApiResponse.unauthorized(res, 'authorization failed');
      }

      await UserHistoryModel.clearUserHistory(req.data.user.id);
      return ApiResponse.success(res, 'History cleared successfully');
    } catch (error) {
      console.error('Clear history error:', error);
      return ApiResponse.error(res, 'Failed to clear history', 500);
    }
  }

  static async getRecentWords(req: Request, res: Response): Promise<any> {
    try {
      if (!req.data.user) {
        return ApiResponse.unauthorized(res, 'authorization failed');
      }

      const limit = parseInt(req.query.limit as string) || 5;
      const words = await UserHistoryModel.getRecentWords(req.data.user.id, limit);

      return ApiResponse.success(res, 'Recent words retrieved successfully', words);
    } catch (error) {
      console.error('Get recent words error:', error);
      return ApiResponse.error(res, 'Failed to retrieve recent words', 500);
    }
  }
}
