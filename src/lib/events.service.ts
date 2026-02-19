import { supabase } from "./supabase";
import { Event, EventMonthlyIncome } from "@/types";

export async function getAllEvents() {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("name");
    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }
    return data as Event[];
}

export async function getEventIncomeByMonth(year: number, month: number) {
    const { data, error } = await supabase
        .from("event_monthly_income")
        .select("*, events(name)")
        .eq("year", year)
        .eq("month", month);
    if (error) {
        console.error("Error fetching event income by month:", error);
        return [];
    }
    return data as EventMonthlyIncome[];
}

export async function getTotalEventIncomeByMonth(year: number) {
    const { data, error } = await supabase
        .from("event_monthly_income")
        .select("total_income, month")
        .eq("year", year);
    if (error) {
        console.error("Error fetching total event income by month:", error);
        return [];
    }
    return data;
}

export async function getEventIncomeLastNMonths(n: number) {
    try {
        const { data: events, error: eventsError } = await supabase.from("events").select("id, name");
        if (eventsError) throw eventsError;

        const { data: incomeData, error: incomeError } = await supabase
            .from("event_monthly_income")
            .select("event_id, year, month, total_income")
            .order("year", { ascending: false })
            .order("month", { ascending: false });

        if (incomeError) throw incomeError;

        const now = new Date();
        const monthsList = [];
        for (let i = 0; i < n; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthsList.unshift({
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d)
            });
        }

        const result = monthsList.map(m => {
            const monthObj: any = {
                name: m.name,
                year: m.year,
                month: m.month,
                total: 0
            };
            events.forEach(event => {
                const match = incomeData.find(d => d.event_id === event.id && d.year === m.year && d.month === m.month);
                const income = match ? Number(match.total_income) : 0;
                monthObj[`event-${event.id}`] = income;
                monthObj.total += income;
            });
            return monthObj;
        });

        return result;
    } catch (error) {
        console.error("Error in getEventIncomeLastNMonths:", error);
        return [];
    }
}

export async function getCurrentMonthEventStats() {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const { data, error } = await supabase
            .from("event_monthly_income")
            .select("total_income")
            .eq("year", year)
            .eq("month", month);

        if (error) throw error;

        const total = data?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;
        return total;
    } catch (error) {
        console.error("Error in getCurrentMonthEventStats:", error);
        return 0;
    }
}

export async function createEvent(name: string) {
    const { data, error } = await supabase.from("events").insert({ name }).select().single();
    if (error) return { success: false, error };
    return { success: true, data };
}

export async function deleteEvent(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return { success: false, error };
    return { success: true };
}

export async function upsertEventIncome(event_id: string, year: number, month: number, total_income: number) {
    const { data, error } = await supabase.from("event_monthly_income").upsert({
        event_id,
        year,
        month,
        total_income
    }, {
        onConflict: 'event_id, year, month'
    }).select().single();

    if (error) return { success: false, error };
    return { success: true, data };
}

export async function getAllEventIncomes() {
    const { data, error } = await supabase
        .from("event_monthly_income")
        .select("*, events(name)")
        .order("year", { ascending: false })
        .order("month", { ascending: false });
    if (error) return { success: false, error };
    return { success: true, data };
}

export async function deleteEventIncome(id: string) {
    const { error } = await supabase.from("event_monthly_income").delete().eq("id", id);
    if (error) return { success: false, error };
    return { success: true };
}
