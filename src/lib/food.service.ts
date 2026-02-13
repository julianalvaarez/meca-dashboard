import { supabase } from "./supabase";
import { ExpenseCategory, FoodIncome, FoodExpense, FoodStats } from "@/types";

/**
 * Obtiene los ingresos de gastronomía de los últimos 12 meses
 */
export async function getFoodIncomeLast12Months(year: number) {
  try {
    const { data, error } = await supabase
      .from("food_monthly_income")
      .select("*")
      .eq("year", year)
      .order("month", { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al obtener ingresos." };
  }
}

/**
 * Obtiene los gastos de gastronomía de los últimos 12 meses (desglosados)
 */
export async function getFoodExpensesLast12Months(year: number) {
  try {
    const { data, error } = await supabase
      .from("food_monthly_expenses")
      .select("*")
      .eq("year", year)
      .order("month", { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al obtener gastos." };
  }
}

/**
 * Obtiene estadísticas consolidadas del mes actual
 * Versión robusta sin .single() para evitar errores si no hay datos
 */
export async function getCurrentMonthFoodStats(year: number, month: number) {
  try {
    // Ingresos del mes
    const { data: incomeList } = await supabase
      .from("food_monthly_income")
      .select("total_income")
      .eq("year", year)
      .eq("month", month)
      .limit(1);

    // Gastos del mes
    const { data: expensesData } = await supabase
      .from("food_monthly_expenses")
      .select("category, amount")
      .eq("year", year)
      .eq("month", month);

    // Datos mes anterior
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const { data: prevIncomeList } = await supabase
      .from("food_monthly_income")
      .select("total_income")
      .eq("year", prevYear)
      .eq("month", prevMonth)
      .limit(1);

    const { data: prevExpensesList } = await supabase
      .from("food_monthly_expenses")
      .select("amount")
      .eq("year", prevYear)
      .eq("month", prevMonth);

    const income = incomeList && incomeList.length > 0 ? Number(incomeList[0].total_income) : 0;
    const expenseCategories = {
      materia_prima: 0,
      sueldos: 0,
      impuestos: 0,
      otros: 0,
      total: 0
    };

    expensesData?.forEach(exp => {
      const amt = Number(exp.amount || 0);
      if (exp.category in expenseCategories) {
        expenseCategories[exp.category as ExpenseCategory] += amt;
      }
      expenseCategories.total += amt;
    });

    const netIncome = income - expenseCategories.total;

    // Variación
    const prevIncome = prevIncomeList && prevIncomeList.length > 0 ? Number(prevIncomeList[0].total_income) : 0;
    const prevTotalExpenses = prevExpensesList?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
    const prevNetIncome = prevIncome - prevTotalExpenses;

    let variation = 0;
    if (prevNetIncome !== 0) {
      variation = ((netIncome - prevNetIncome) / Math.abs(prevNetIncome)) * 100;
    } else if (netIncome > 0) {
      variation = 100;
    }

    const stats: FoodStats = {
      income,
      expenses: expenseCategories,
      netIncome,
      variation
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("getCurrentMonthFoodStats Error:", error);
    return { success: false, error: "Error al obtener estadísticas." };
  }
}

/**
 * Obtiene la evolución histórica
 */
export async function getFoodEvolution(range: number) {
  try {
    const { data: incomes, error: incomeErr } = await supabase
      .from("food_monthly_income")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(range);

    if (incomeErr) throw incomeErr;
    if (!incomes || incomes.length === 0) return { success: true, data: [] };

    const evolution = await Promise.all(incomes.map(async (inc) => {
      const { data: expenses } = await supabase
        .from("food_monthly_expenses")
        .select("category, amount")
        .eq("year", inc.year)
        .eq("month", inc.month);

      const expBreakdown = {
        materia_prima: 0,
        sueldos: 0,
        impuestos: 0,
        otros: 0,
        total: 0
      };

      expenses?.forEach(exp => {
        const amt = Number(exp.amount || 0);
        if (exp.category in expBreakdown) {
          expBreakdown[exp.category as ExpenseCategory] += amt;
        }
        expBreakdown.total += amt;
      });

      return {
        year: inc.year,
        month: inc.month,
        total_income: Number(inc.total_income || 0),
        expenses: expBreakdown,
        net_income: Number(inc.total_income || 0) - expBreakdown.total,
        name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(inc.year, inc.month - 1))
      };
    }));

    return {
      success: true,
      data: evolution.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
    };
  } catch (error) {
    console.error("getFoodEvolution Error:", error);
    return { success: false, error: "Error al obtener evolución." };
  }
}

/**
 * Agrega o actualiza el ingreso de un mes
 */
export async function upsertFoodIncome(income: Omit<FoodIncome, "id" | "created_at">) {
  try {
    const { data, error } = await supabase
      .from("food_monthly_income")
      .upsert(income, { onConflict: 'year,month' })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al guardar ingresos." };
  }
}

/**
 * Agrega un gasto
 */
export async function addFoodExpense(expense: Omit<FoodExpense, "id" | "created_at">) {
  try {
    const { data, error } = await supabase.from("food_monthly_expenses").insert(expense).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al agregar gasto." };
  }
}

/**
 * Elimina gastos de un mes
 */
export async function clearMonthlyExpenses(year: number, month: number, category?: ExpenseCategory) {
  try {
    let query = supabase.from("food_monthly_expenses").delete().eq("year", year).eq("month", month);
    if (category) query = query.eq("category", category);

    const { error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al limpiar gastos." };
  }
}

/**
 * Elimina ingresos de un mes
 */
export async function deleteMonthlyIncome(year: number, month: number) {
  try {
    const { error } = await supabase.from("food_monthly_income").delete().eq("year", year).eq("month", month);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar ingresos." };
  }
}

/**
 * Standalone queries solicitadas
 */
export async function getFoodExpensesByCategory(year: number) {
  try {
    const { data, error } = await supabase
      .from("food_monthly_expenses")
      .select("category, amount, month")
      .eq("year", year);

    if (error) return { success: false, error: error.message };

    const grouped = (data || []).reduce((acc: any, curr) => {
      if (!acc[curr.category]) acc[curr.category] = 0;
      acc[curr.category] += Number(curr.amount || 0);
      return acc;
    }, {});

    return { success: true, data: grouped };
  } catch (error) {
    return { success: false, error: "Error al obtener gastos por categoría." };
  }
}

export async function getFoodTotalExpensesByMonth(year: number) {
  try {
    const { data, error } = await supabase
      .from("food_monthly_expenses")
      .select("amount, month")
      .eq("year", year);

    if (error) return { success: false, error: error.message };

    const monthly = Array(12).fill(0);
    (data || []).forEach(item => {
      monthly[item.month - 1] += Number(item.amount || 0);
    });

    return { success: true, data: monthly };
  } catch (error) {
    return { success: false, error: "Error al obtener gastos mensuales." };
  }
}

export async function getFoodNetIncomeByMonth(year: number) {
  try {
    const [incomeRes, expenseRes] = await Promise.all([
      getFoodIncomeLast12Months(year),
      getFoodTotalExpensesByMonth(year)
    ]);

    if (!incomeRes.success || !expenseRes.success) {
      return { success: false, error: "Error al obtener datos combinados." };
    }

    const incomeData = incomeRes.data as any[];
    const expenseData = expenseRes.data as number[];

    const netIncome = Array(12).fill(0);
    incomeData.forEach(item => {
      netIncome[item.month - 1] = Number(item.total_income || 0) - (expenseData[item.month - 1] || 0);
    });

    return { success: true, data: netIncome };
  } catch (error) {
    return { success: false, error: "Error al obtener ingreso neto mensual." };
  }
}