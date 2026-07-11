import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.SUPABASE_ACCESS_KEY_ID || !process.env.SUPABASE_SECRET_ACCESS_KEY) {
    throw new Error("Missing Supabase S3 storage environment variables.");
}

export const s3Client = new S3Client({
    forcePathStyle: true,
    region: "eu-west-1",
    endpoint: "https://tymadfujdriobcwfualf.supabase.co/storage/v1/s3",
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
    },
});

export const BUCKET_NAME = "nyekusa";
export const PROJECT_REF = "tymadfujdriobcwfualf";

// Helper to get public URL of the uploaded image
export function getPublicUrl(key: string): string {
    return `https://${PROJECT_REF}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${key}`;
}
