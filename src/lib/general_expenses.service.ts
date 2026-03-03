import { GeneralExpense } from "@/types";
import { supabase } from "./supabase"

export async function getGeneralExpenses(year: number, month: number) {
    try {
        const { data, error } = await supabase
            .from("general_expenses")
            .select("*")
            .eq("year", year)
            .eq("month", month)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is code for no rows found
            return { success: false, error };
        }
        return { success: true, data: data || null };
    } catch (error) {
        console.log(error);
        return { success: false, error: "Error inesperado de conexión." };
    }
}

export async function upsertGeneralExpense(expense: Omit<GeneralExpense, 'id' | 'created_at'>) {
    try {
        const { data, error } = await supabase
            .from("general_expenses")
            .upsert(
                {
                    year: expense.year,
                    month: expense.month,
                    total_expenses: expense.total_expenses
                },
                { onConflict: 'year,month' }
            )
            .select()
            .single();

        if (error) {
            console.error("Supabase Upsert Error:", error);
            return { success: false, error: error.message || error };
        }
        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected Error in upsertGeneralExpense:", error);
        return { success: false, error: error.message || "Error inesperado de conexión." };
    }
}
