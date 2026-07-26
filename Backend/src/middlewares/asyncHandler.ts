import type { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (
    asyncFunction: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<any>
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(asyncFunction(req, res, next)).catch(next);
    };
};