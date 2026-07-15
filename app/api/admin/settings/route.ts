import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const settingsList = await prisma.systemSetting.findMany();
        const settingsObj = settingsList.reduce((acc, current) => {
            acc[current.key] = current.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsObj);
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const upsertPromises = Object.entries(body).map(([key, value]) => {
            return prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            });
        });

        await Promise.all(upsertPromises);

        const settingsList = await prisma.systemSetting.findMany();
        const settingsObj = settingsList.reduce((acc, current) => {
            acc[current.key] = current.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsObj);
    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
