import { SportStats } from "@/types";
import { supabase } from "./supabase"

export async function getSportsStats(year: number, month: number) {
  try {
    const { data, error } = await supabase.from("sports_stats").select("*").eq("year", year).eq("month", month)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function getStatsBySport(year: number, month: number, sport: string) {
  try {
    const { data, error } = await supabase.from("sports_stats").select("*").eq("year", year).eq("month", month).eq("sport", sport)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function addSportStats(stats: SportStats) {
  try {
    const { data, error } = await supabase.from("sports_stats").insert(stats)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function updateSportStats(id: number,stats: SportStats) {
  try {
    const { data, error } = await supabase.from("sports_stats").update(stats).eq("id", id)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}

export async function deleteSportStats(id: number) {
  try {
    const { data, error } = await supabase.from("sports_stats").delete().eq("id", id)
    if (error) return {success: false, error}
    return {success: true, data}
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error inesperado de conexión." };
  }
}