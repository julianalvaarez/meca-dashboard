import { ClothingStats } from "@/types";
import { supabase } from "./supabase";

export async function getClothingStats(year: number, month: number) {
  try {
    const { data, error } = await supabase
      .from("clothing_stats")
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

export async function getAllClothingStats() {
  try {
    const { data, error } = await supabase
      .from("clothing_stats")
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

export async function getClothingEvolution(year: number) {
  try {
    const { data, error } = await supabase
      .from("clothing_stats")
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

export async function addClothingStats(stats: Omit<ClothingStats, "id">) {
  try {
    const { data, error } = await supabase.from("clothing_stats").insert(stats)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function updateClothingStats(id: number, stats: Partial<ClothingStats>) {
  try {
    const { data, error } = await supabase.from("clothing_stats").update(stats).eq("id", id)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function deleteClothingStats(id: number) {
  try {
    const { data, error } = await supabase.from("clothing_stats").delete().eq("id", id)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function checkClothingStatsExistence(year: number, month: number) {
  try {
    const { count, error } = await supabase
      .from("clothing_stats")
      .select("*", { count: "exact", head: true })
      .eq("year", year)
      .eq("month", month)

    if (error) return false
    return (count ?? 0) > 0
  } catch (error) {
    return false
  }
}

export async function getClothingEvolutionRange(range: number) {
  try {
    const { data, error } = await supabase
      .from("clothing_stats")
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
    return { success: false, error: "Error al obtener evolución de indumentaria" };
  }
}