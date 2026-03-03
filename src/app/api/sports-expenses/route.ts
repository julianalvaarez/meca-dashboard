import { NextRequest, NextResponse } from "next/server";
import { getSportsExpenses, saveSportsExpense } from "@/lib/sports_dashboard.service";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
        return NextResponse.json({ success: false, error: "Año y mes son requeridos" }, { status: 400 });
    }

    const res = await getSportsExpenses(parseInt(year), parseInt(month));
    return NextResponse.json(res);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { year, month, total_expense } = body;

        if (year === undefined || month === undefined || total_expense === undefined) {
            return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 });
        }

        const res = await saveSportsExpense(parseInt(year), parseInt(month), parseFloat(total_expense));
        return NextResponse.json(res);
    } catch (error) {
        return NextResponse.json({ success: false, error: "Error procesando la solicitud" }, { status: 500 });
    }
}
