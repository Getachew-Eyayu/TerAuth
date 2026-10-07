import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Application Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
