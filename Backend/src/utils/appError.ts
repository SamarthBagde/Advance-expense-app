// src/utils/appError.ts
export class AppError extends Error {
    public statusCode: number;          // <‑‑ declared
    public status: "fail" | "error";   // <‑‑ declared
    public readonly isOperational: boolean;       // <‑‑ declared  

    constructor(message: string, statusCode: number) {
        super(message);

        // Necessary for proper instanceof checks in ES‑modules
        Object.setPrototypeOf(this, new.target.prototype);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
    }
}
