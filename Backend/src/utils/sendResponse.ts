import type { Response } from "express";

export interface IApiResponse<T = any> {
    success: boolean;
    message?: string;
    total?: number;
    data?: T;
}

/**
 * Central utility method to send standardized API responses.
 *
 * @param res - Express Response object
 * @param statusCode - HTTP Status Code (default: 200)
 * @param message - Optional response message
 * @param data - Optional data payload
 * @param total - Optional total count (automatically calculated if data is an array)
 */
export const sendResponse = <T>(
    res: Response,
    statusCode: number = 200,
    message?: string,
    data?: T,
    total?: number
): Response => {
    const responsePayload: IApiResponse<T> = {
        success: statusCode >= 200 && statusCode < 300,
    };

    if (message) {
        responsePayload.message = message;
    }

    if (total !== undefined) {
        responsePayload.total = total;
    } else if (Array.isArray(data)) {
        responsePayload.total = data.length;
    }

    if (data !== undefined) {
        responsePayload.data = data;
    }

    return res.status(statusCode).json(responsePayload);
};
