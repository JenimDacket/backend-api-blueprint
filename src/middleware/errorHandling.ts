import { trace } from '@opentelemetry/api';
import { Express, NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { APIConnectionError, OpenAIError } from 'openai';
import { DatabaseError } from 'pg';
import { ValidateError } from 'tsoa';
import { PermissionError } from '../errors/PermissionError';

/**
 * Error handling middleware.
 * Handles uncaught thrown exceptions.
 * @param app Express app
 */
export const RegisterErrorHandling = (app: Express) => {
  app.use(function errorHandler(
    e: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | void {
    const currentSpan = trace.getActiveSpan();

    if (e instanceof ValidateError) {
      console.warn(`Caught Validation Error for ${req.path}:`, e.fields);
      currentSpan?.recordException(e);
      currentSpan?.setAttribute('error.validation', true);
      return res.status(422).json({
        message: 'Validation Failed',
        details: e?.fields,
      });
    } else if (e instanceof OpenAIError) {
      console.error('OpenAI error: ', e.message);
      currentSpan?.recordException(e);
      currentSpan?.setAttribute('error.openai', true);
      if (e instanceof APIConnectionError) {
        return res.status(504).json({
          message: 'Bad gateway',
        });
      }
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    } else if (e instanceof DatabaseError) {
      console.error('Database error: ', e.message, ' Error code: ', e.code);
      currentSpan?.recordException(e);
      currentSpan?.setAttribute('error.database', true);
      if (e.code === '23505') {
        return res.status(409).json({
          message: 'Already exists.',
        });
      }
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    } else if (e instanceof UnauthorizedError) {
      console.error('Unauthorized: ', e.headers);
      currentSpan?.recordException(e);
      return res.status(401).json({
        message: 'Unauthorized.',
      });
    } else if (e instanceof PermissionError) {
      console.error('Permission error');
      currentSpan?.recordException(e);
      return res.status(403).json({
        message: 'Denied.',
      });
    } else if (e instanceof Error) {
      currentSpan?.recordException(e);
      currentSpan?.setAttribute('error.generic', true);
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }

    next();
  });

  app.use(function notFoundHandler(req: Request, res: Response) {
    console.warn(`Not Found. ${req.url} is not a route.`);
    res.status(404).send({
      message: `Not Found. ${req.url} is not a route.`,
    });
  });
};
