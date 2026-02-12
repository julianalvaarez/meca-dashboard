import { FoodStats } from "@/types";
import { supabase } from "./supabase";

export async function getFoodStats(year: number, month: number) {
  try {
    const { data, error } = await supabase
      .from("food_stats")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single()

    if (error && error.code !== "PGRST116") return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function getAllFoodStats() {
  try {
    const { data, error } = await supabase
      .from("food_stats")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function getFoodEvolution(year: number) {
  try {
    const { data, error } = await supabase
      .from("food_stats")
      .select("*")
      .eq("year", year)
      .order("month", { ascending: true })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function addFoodStats(stats: Omit<FoodStats, "id">) {
  try {
    const { data, error } = await supabase.from("food_stats").insert(stats)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function updateFoodStats(id: number, stats: Partial<FoodStats>) {
  try {
    const { data, error } = await supabase.from("food_stats").update(stats).eq("id", id)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function deleteFoodStats(id: number) {
  try {
    const { data, error } = await supabase.from("food_stats").delete().eq("id", id)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function checkFoodStatsExistence(year: number, month: number) {
  try {
    const { count, error } = await supabase
      .from("food_stats")
      .select("*", { count: "exact", head: true })
      .eq("year", year)
      .eq("month", month)

    if (error) return false
    return (count ?? 0) > 0
  } catch (error) {
    return false
  }
}

export async function getFoodEvolutionRange(range: number) {
  try {
    const { data, error } = await supabase
      .from("food_stats")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(range);

    if (error) return { success: false, error: error.message };

    const result = data?.map(item => ({
      ...item,
      name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(item.year, item.month - 1)),
    })).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Error al obtener evolución de gastronomía" };
  }
}