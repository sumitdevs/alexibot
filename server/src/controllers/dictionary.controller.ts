import { Request, Response } from 'express';
import { WordModel, SynsetModel } from '../models/word.model';
import { ApiResponse } from '../utils/apiResponse';
import { UserHistoryModel } from '../models/user.model';
import { mean } from '@xenova/transformers';

export class DictionaryController {
  static async searchWord(req: Request, res: Response): Promise<any> {
    try {
      const { word } = req.params;
      if(!word) return ApiResponse.validationError(res, 'invalid word');

      const wordDetails = await WordModel.getWordDetails(word);

      if (!wordDetails) {
        return ApiResponse.notFound(res, `Word "${word}" not found in dictionary`);
      }

      return ApiResponse.success(res, 'Word found successfully',  wordDetails,);
    } catch (error) {
      console.error('Search word error:', error);
      return ApiResponse.error(res, 'Failed to search word', 500);
    }
  }

  static async searchByContext(req: Request, res: Response): Promise<any> {
    try {
      const { word, context} = req.body;
      console.log(word, context);
      const meaning = await WordModel.searchWordInContext(word, context);

      if (!meaning) {
        return ApiResponse.success(res, 'No words found matching the context', []);
      }
      
      await UserHistoryModel.addToHistory(
        req.data.user?.id as number,
        meaning.word_id,
        meaning.synset_id,
        meaning.similarity,
        context || null,
      );

      console.log(meaning);
      
      return ApiResponse.success(res, `Found word matching context`, meaning);
    } catch (error) {
      console.error('Search by context error:', error);
      return ApiResponse.error(res, 'Failed to search by context', 500);
    }
  }

}


