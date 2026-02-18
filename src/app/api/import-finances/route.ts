// /app/api/import-finances/route.ts

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type SportPayload = {
    year: number;
    month: number;
    sport: "padel_indoor" | "padel_outdoor" | "futbol";
    total_income: number;
    courts_rented: number;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { dataIndoor, dataOutdoor, dataFutbol } = body;

        const payloads: SportPayload[] = [dataIndoor, dataOutdoor, dataFutbol,];

        // Validación básica
        for (const item of payloads) {
            if (
                !item.year ||
                !item.month ||
                !item.sport ||
                typeof item.total_income !== "number" ||
                typeof item.courts_rented !== "number"
            ) {
                return NextResponse.json(
                    { error: "Invalid payload structure" },
                    { status: 400 }
                );
            }
        }

        // UPSERT en sports_monthly_stats
        const { error } = await supabase
            .from("sports_stats")
            .upsert(payloads, {
                onConflict: "year,month,sport",
            });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: "Database error" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Sports data imported successfully",
        });

    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
