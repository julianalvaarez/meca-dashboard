import { supabase } from "./supabase";

export async function getOverviewStats(year: number, month: number) {
    try {
        const [sports, food, clothing] = await Promise.all([
            supabase.from("sports_stats").select("total_income").eq("year", year).eq("month", month),
            supabase.from("food_stats").select("total_income, total_expense").eq("year", year).eq("month", month),
            supabase.from("clothing_stats").select("total_income").eq("year", year).eq("month", month),
        ]);

        if (sports.error || food.error || clothing.error) {
            console.error("Supabase Error:", { sports: sports.error, food: food.error, clothing: clothing.error });
        }

        const sportsIncome = sports.data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;

        // Use net income for food (Total Income - Total Expense)
        const foodNetIncome = food.data?.reduce((acc, curr) =>
            acc + (Number(curr.total_income || 0) - Number(curr.total_expense || 0)), 0) || 0;

        const clothingIncome = clothing.data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;

        return {
            success: true,
            data: {
                sports: sportsIncome,
                food: foodNetIncome,
                clothing: clothingIncome,
                total: sportsIncome + foodNetIncome + clothingIncome,
            }
        };
    } catch (error) {
        console.error("Dashboard Service Error:", error);
        return { success: false, error: "Error al obtener datos del dashboard" };
    }
}

export async function getFullMonthReport(year: number, month: number) {
    try {
        const [sports, food, clothing] = await Promise.all([
            supabase.from("sports_stats").select("*").eq("year", year).eq("month", month),
            supabase.from("food_stats").select("*").eq("year", year).eq("month", month),
            supabase.from("clothing_stats").select("*").eq("year", year).eq("month", month),
        ]);

        return {
            success: true,
            data: {
                sports: sports.data || [],
                food: food.data || [],
                clothing: clothing.data || [],
                year,
                month
            }
        };
    } catch (error) {
        console.error("Full Month Report Error:", error);
        return { success: false, error: "Error al obtener reporte detallado" };
    }
}

export async function getYearlyEvolution(year: number) {
    try {
        const [sports, food, clothing] = await Promise.all([
            supabase.from("sports_stats").select("total_income, month").eq("year", year),
            supabase.from("food_stats").select("total_income, total_expense, month").eq("year", year),
            supabase.from("clothing_stats").select("total_income, month").eq("year", year),
        ]);

        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(year, i)),
            sports: 0,
            food: 0,
            clothing: 0,
            total: 0,
        }));

        sports.data?.forEach(item => {
            const income = Number(item.total_income || 0);
            monthlyData[item.month - 1].sports += income;
            monthlyData[item.month - 1].total += income;
        });

        food.data?.forEach(item => {
            const netIncome = Number(item.total_income || 0) - Number(item.total_expense || 0);
            monthlyData[item.month - 1].food += netIncome;
            monthlyData[item.month - 1].total += netIncome;
        });

        clothing.data?.forEach(item => {
            const income = Number(item.total_income || 0);
            monthlyData[item.month - 1].clothing += income;
            monthlyData[item.month - 1].total += income;
        });

        return { success: true, data: monthlyData };
    } catch (error) {
        console.error("Yearly Evolution Error:", error);
        return { success: false, error: "Error al obtener evolución anual" };
    }
}

export async function getEvolutionRange(range: number) {
    try {
        const [sports, food, clothing] = await Promise.all([
            supabase.from("sports_stats").select("total_income, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range * 3),
            supabase.from("food_stats").select("total_income, total_expense, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range),
            supabase.from("clothing_stats").select("total_income, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range),
        ]);

        const grouped: { [key: string]: any } = {};

        sports.data?.forEach(item => {
            const key = `${item.year}-${item.month}`;
            if (!grouped[key]) grouped[key] = { year: item.year, month: item.month, sports: 0, food: 0, clothing: 0, total: 0 };
            grouped[key].sports += Number(item.total_income || 0);
            grouped[key].total += Number(item.total_income || 0);
        });

        food.data?.forEach(item => {
            const key = `${item.year}-${item.month}`;
            if (!grouped[key]) grouped[key] = { year: item.year, month: item.month, sports: 0, food: 0, clothing: 0, total: 0 };
            const netIncome = Number(item.total_income || 0) - Number(item.total_expense || 0);
            grouped[key].food += netIncome;
            grouped[key].total += netIncome;
        });

        clothing.data?.forEach(item => {
            const key = `${item.year}-${item.month}`;
            if (!grouped[key]) grouped[key] = { year: item.year, month: item.month, sports: 0, food: 0, clothing: 0, total: 0 };
            grouped[key].clothing += Number(item.total_income || 0);
            grouped[key].total += Number(item.total_income || 0);
        });

        const result = Object.values(grouped).map((item: any) => ({
            ...item,
            name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(item.year, item.month - 1)),
        })).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        }).slice(-range);

        return { success: true, data: result };
    } catch (error) {
        console.error("Evolution Range Error:", error);
        return { success: false, error: "Error al obtener evolución range" };
    }
}
