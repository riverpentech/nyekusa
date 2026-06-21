export class AppError extends Error {
    statusCode: number;
    details?: unknown;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message = "Invalid input", details: unknown = null) {
        super(message, 400);
        this.details = details;
    }
}
