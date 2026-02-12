import { FoodStats } from "@/types";
import { supabase } from "./supabase";

export async function getFoodStats(year: number, month: number) {
  try {
    const { data, error } = await supabase.from("food_stats").select("*").eq("year", year).eq("month", month)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function addFoodStats(stats: FoodStats) {
  try {
    const { data, error } = await supabase.from("food_stats").insert(stats)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function updateFoodStats(id: number, stats: FoodStats) {
  try {
    const { data, error } = await supabase.from("food_stats").update(stats).eq("id", id)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function deleteFoodStats(id: number) {
  try {
    const { data, error } = await supabase.from("food_stats").delete().eq("id", id)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}