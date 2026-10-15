import type {NextFunction, Request, Response} from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, url } = req;

  res.on("finish", async () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${res.statusCode} - ${duration}ms`);
  })

  next();
}