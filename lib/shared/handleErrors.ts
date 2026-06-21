import { NextResponse } from "next/server";
import { AppError } from "@/lib/shared/errors";

export function handleError(err: unknown) {
    if (err instanceof AppError) {
        return NextResponse.json(
            { error: err.message, details: err.details ?? undefined },
            { status: err.statusCode }
        );
    }

    console.error("Unexpected API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
