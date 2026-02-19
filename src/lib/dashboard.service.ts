import { supabase } from "./supabase";

export async function getOverviewStats(year: number, month: number) {
    try {
        const [sports, foodIncome, foodExpenses, clothing, tenants, events] = await Promise.all([
            supabase.from("sports_stats").select("total_income").eq("year", year).eq("month", month),
            supabase.from("food_monthly_income").select("total_income").eq("year", year).eq("month", month),
            supabase.from("food_monthly_expenses").select("amount").eq("year", year).eq("month", month),
            supabase.from("clothing_stats").select("total_income").eq("year", year).eq("month", month),
            supabase.from("tenant_monthly_income").select("total_income").eq("year", year).eq("month", month),
            supabase.from("event_monthly_income").select("total_income").eq("year", year).eq("month", month),
        ]);

        const sportsIncome = sports.data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;

        const fIncome = foodIncome.data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;
        const fExpenses = foodExpenses.data?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
        const foodNetIncome = fIncome - fExpenses;

        const clothingIncome = clothing.data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;
        const tenantIncome = tenants.data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;
        const eventsIncome = events.data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;

        return {
            success: true,
            data: {
                sports: sportsIncome,
                food: foodNetIncome,
                clothing: clothingIncome,
                tenants: tenantIncome,
                events: eventsIncome,
                total: sportsIncome + foodNetIncome + clothingIncome + tenantIncome + eventsIncome,
            }
        };
    } catch (error) {
        console.error("Dashboard Service Error:", error);
        return { success: false, error: "Error al obtener datos del dashboard" };
    }
}

export async function getFullMonthReport(year: number, month: number) {
    try {
        const [sports, foodIncome, foodExpenses, clothing, tenants, events] = await Promise.all([
            supabase.from("sports_stats").select("*").eq("year", year).eq("month", month),
            supabase.from("food_monthly_income").select("*").eq("year", year).eq("month", month),
            supabase.from("food_monthly_expenses").select("*").eq("year", year).eq("month", month),
            supabase.from("clothing_stats").select("*").eq("year", year).eq("month", month),
            supabase.from("tenant_monthly_income").select("*, tenants(name)").eq("year", year).eq("month", month),
            supabase.from("event_monthly_income").select("*, events(name)").eq("year", year).eq("month", month),
        ]);

        return {
            success: true,
            data: {
                sports: sports.data || [],
                food: {
                    income: foodIncome.data || [],
                    expenses: foodExpenses.data || []
                },
                clothing: clothing.data || [],
                tenants: tenants.data || [],
                events: events.data || [],
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
        const [sports, foodIncome, foodExpenses, clothing, tenants, events] = await Promise.all([
            supabase.from("sports_stats").select("total_income, month").eq("year", year),
            supabase.from("food_monthly_income").select("total_income, month").eq("year", year),
            supabase.from("food_monthly_expenses").select("amount, month").eq("year", year),
            supabase.from("clothing_stats").select("total_income, month").eq("year", year),
            supabase.from("tenant_monthly_income").select("total_income, month").eq("year", year),
            supabase.from("event_monthly_income").select("total_income, month").eq("year", year),
        ]);

        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(year, i)),
            sports: 0,
            food: 0,
            clothing: 0,
            tenants: 0,
            events: 0,
            total: 0,
        }));

        sports.data?.forEach(item => {
            const income = Number(item.total_income || 0);
            monthlyData[item.month - 1].sports += income;
            monthlyData[item.month - 1].total += income;
        });

        // Food Income
        foodIncome.data?.forEach(item => {
            monthlyData[item.month - 1].food += Number(item.total_income || 0);
            monthlyData[item.month - 1].total += Number(item.total_income || 0);
        });
        // Food Expenses (Subtract)
        foodExpenses.data?.forEach(item => {
            monthlyData[item.month - 1].food -= Number(item.amount || 0);
            monthlyData[item.month - 1].total -= Number(item.amount || 0);
        });

        clothing.data?.forEach(item => {
            const income = Number(item.total_income || 0);
            monthlyData[item.month - 1].clothing += income;
            monthlyData[item.month - 1].total += income;
        });

        tenants.data?.forEach(item => {
            const income = Number(item.total_income || 0);
            monthlyData[item.month - 1].tenants += income;
            monthlyData[item.month - 1].total += income;
        });

        events.data?.forEach(item => {
            const income = Number(item.total_income || 0);
            monthlyData[item.month - 1].events += income;
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
        const [sports, foodIncome, foodExpenses, clothing, tenants, events] = await Promise.all([
            supabase.from("sports_stats").select("total_income, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range * 3),
            supabase.from("food_monthly_income").select("total_income, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range),
            supabase.from("food_monthly_expenses").select("amount, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range * 4),
            supabase.from("clothing_stats").select("total_income, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range),
            supabase.from("tenant_monthly_income").select("total_income, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range * 5),
            supabase.from("event_monthly_income").select("total_income, month, year").order("year", { ascending: false }).order("month", { ascending: false }).limit(range * 5),
        ]);

        const grouped: { [key: string]: any } = {};

        const ensureItem = (year: number, month: number) => {
            const key = `${year}-${month}`;
            if (!grouped[key]) {
                grouped[key] = { year, month, sports: 0, food: 0, clothing: 0, tenants: 0, events: 0, total: 0 };
            }
            return key;
        };

        sports.data?.forEach(item => {
            const key = ensureItem(item.year, item.month);
            grouped[key].sports += Number(item.total_income || 0);
            grouped[key].total += Number(item.total_income || 0);
        });

        foodIncome.data?.forEach(item => {
            const key = ensureItem(item.year, item.month);
            grouped[key].food += Number(item.total_income || 0);
            grouped[key].total += Number(item.total_income || 0);
        });

        foodExpenses.data?.forEach(item => {
            const key = ensureItem(item.year, item.month);
            grouped[key].food -= Number(item.amount || 0);
            grouped[key].total -= Number(item.amount || 0);
        });

        clothing.data?.forEach(item => {
            const key = ensureItem(item.year, item.month);
            grouped[key].clothing += Number(item.total_income || 0);
            grouped[key].total += Number(item.total_income || 0);
        });

        tenants.data?.forEach(item => {
            const key = ensureItem(item.year, item.month);
            grouped[key].tenants += Number(item.total_income || 0);
            grouped[key].total += Number(item.total_income || 0);
        });

        events.data?.forEach(item => {
            const key = ensureItem(item.year, item.month);
            grouped[key].events += Number(item.total_income || 0);
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

