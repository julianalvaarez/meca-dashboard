import { ClothingStats } from "@/types";
import { supabase } from "./supabase";



export async function getClothingStats(year: number, month: number) {
  try {
    const { data, error } = await supabase.from("clothing_stats").select("*").eq("year", year).eq("month", month)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function addClothingStats(stats: ClothingStats) {
  try {
    const { data, error } = await supabase.from("clothing_stats").insert(stats)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function updateClothingStats(id: number, stats: ClothingStats) {
  try {
    const { data, error } = await supabase.from("clothing_stats").update(stats).eq("id", id)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function deleteClothingStats(id: number) {
  try {
    const { data, error } = await supabase.from("clothing_stats").delete().eq("id", id)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}