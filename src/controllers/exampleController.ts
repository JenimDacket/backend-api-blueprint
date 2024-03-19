import { Body, Controller, Post, Request, Route } from 'tsoa';
import { Example } from '../models/Example';
import { insertExample } from '../services/database/queries/examples';
import { ApiErrorResponse } from '../types/errors';
import { throwIfInvalidPermissions } from '../utils/permissioning';

type NewExampleReq = {
  example: Example;
  oauthId: string;
};

@Route('example')
export class ExampleController extends Controller {
  /**
   * New example handler
   * Inserts new example into the database
   */
  @Post('/')
  public async newExampleController(
    @Body() userReq: NewExampleReq,
    @Request() request: Express.Request,
  ): Promise<Example | ApiErrorResponse> {
    try {
      if (!userReq.example.name || !userReq.example.createdBy || userReq.oauthId) {
        this.setStatus(400);
        return {
          message: 'Must provide name and creator',
          details: {
            name: { message: 'Must provide name' },
            createdBy: { message: 'Must provide createdBy' },
            oauthId: { message: 'Must provide user oauthId' },
          },
        };
      }
      throwIfInvalidPermissions(request, userReq.oauthId);
      const result = insertExample(
        userReq.example.name,
        userReq.example.type,
        userReq.example.createdBy,
      );
      // return updated last message
      this.setStatus(200);
      return result;
    } catch (e) {
      console.error('Error creating new goal: ', e);
      throw e;
    }
  }
}
