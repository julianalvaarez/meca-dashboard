import { supabase } from "./supabase";

interface SportMetric {
    courts: number;
    income: number;
}

interface CategorizedStats {
    padel_indoor: SportMetric;
    padel_outdoor: SportMetric;
    futbol: SportMetric;
    totalIncome: number;
    totalCourts: number;
}

export async function getDetailedSportsStats(year: number, month: number) {
    try {
        const { data, error } = await supabase
            .from("sports_stats")
            .select("*")
            .eq("year", year)
            .eq("month", month);

        if (error) {
            console.error("Supabase Error (Detailed Sports):", error);
            return { success: false, error };
        }

        const categorized: CategorizedStats = {
            padel_indoor: { courts: 0, income: 0 },
            padel_outdoor: { courts: 0, income: 0 },
            futbol: { courts: 0, income: 0 },
            totalIncome: 0,
            totalCourts: 0
        };

        data?.forEach(item => {
            const sportKey = item.sport.toLowerCase().replace(" ", "_");
            if (sportKey === "padel_indoor" || sportKey === "padel_outdoor" || sportKey === "futbol") {
                const key = sportKey as "padel_indoor" | "padel_outdoor" | "futbol";
                categorized[key].courts += Number(item.courts_rented || 0);
                categorized[key].income += Number(item.total_income || 0);
                categorized.totalIncome += Number(item.total_income || 0);
                categorized.totalCourts += Number(item.courts_rented || 0);
            }
        });

        return { success: true, data: categorized };
    } catch (error) {
        console.error("Detailed Sports Service Error:", error);
        return { success: false, error: "Error al obtener estadísticas detalladas de deportes" };
    }
}

export async function getSportsEvolution(year: number) {
    try {
        const { data, error } = await supabase
            .from("sports_stats")
            .select("sport, month, total_income, courts_rented")
            .eq("year", year);

        if (error) {
            console.error("Supabase Error (Sports Evolution):", error);
            return { success: false, error };
        }

        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(year, i)),
            padel_indoor_income: 0,
            padel_outdoor_income: 0,
            futbol_income: 0,
            padel_indoor_courts: 0,
            padel_outdoor_courts: 0,
            futbol_courts: 0,
        }));

        data?.forEach(item => {
            const sportKey = item.sport.toLowerCase().replace(" ", "_");
            const monthIdx = item.month - 1;

            if (months[monthIdx]) {
                if (sportKey === 'padel_indoor') {
                    months[monthIdx].padel_indoor_income += Number(item.total_income || 0);
                    months[monthIdx].padel_indoor_courts += Number(item.courts_rented || 0);
                } else if (sportKey === 'padel_outdoor') {
                    months[monthIdx].padel_outdoor_income += Number(item.total_income || 0);
                    months[monthIdx].padel_outdoor_courts += Number(item.courts_rented || 0);
                } else if (sportKey === 'futbol') {
                    months[monthIdx].futbol_income += Number(item.total_income || 0);
                    months[monthIdx].futbol_courts += Number(item.courts_rented || 0);
                }
            }
        });

        return { success: true, data: months };
    } catch (error) {
        console.error("Sports Evolution Service Error:", error);
        return { success: false, error: "Error al obtener evolución de deportes" };
    }
}

export async function getAllSportsStats() {
    try {
        const { data, error } = await supabase
            .from("sports_stats")
            .select("*")
            .order("year", { ascending: false })
            .order("month", { ascending: false });

        if (error) return { success: false, error };
        return { success: true, data };
    } catch (error) {
        console.error("Get All Sports Stats Error:", error);
        return { success: false, error: "Error al obtener todos los registros" };
    }
}

export async function checkStatsExistence(year: number, month: number) {
    try {
        const { data, error } = await supabase
            .from("sports_stats")
            .select("id")
            .eq("year", year)
            .eq("month", month)
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    } catch (error) {
        console.error("Check existence error:", error);
        return false;
    }
}

export async function saveSportsStats(statsList: any[]) {
    try {
        const { data, error } = await supabase
            .from("sports_stats")
            .insert(statsList);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Save sports stats error:", error);
        return { success: false, error: "Error al guardar los datos." };
    }
}

export async function updateSportsRecord(id: number, updates: any) {
    try {
        const { data, error } = await supabase
            .from("sports_stats")
            .update(updates)
            .eq("id", id);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Update sports record error:", error);
        return { success: false, error: "Error al actualizar el registro." };
    }
}

export async function deleteSportsRecord(id: number) {
    try {
        const { error } = await supabase
            .from("sports_stats")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete sports record error:", error);
        return { success: false, error: "Error al eliminar el registro." };
    }
}

export async function getSportsEvolutionRange(range: number) {
    try {
        const { data, error } = await supabase
            .from("sports_stats")
            .select("sport, month, year, total_income, courts_rented")
            .order("year", { ascending: false })
            .order("month", { ascending: false })
            .limit(range * 3); // 3 sports per month

        if (error) return { success: false, error: error.message };

        // Group by year-month
        const grouped: { [key: string]: any } = {};
        data?.forEach(item => {
            const key = `${item.year}-${item.month}`;
            if (!grouped[key]) {
                grouped[key] = {
                    year: item.year,
                    month: item.month,
                    name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(item.year, item.month - 1)),
                    padel_indoor_income: 0,
                    padel_outdoor_income: 0,
                    futbol_income: 0,
                    padel_indoor_courts: 0,
                    padel_outdoor_courts: 0,
                    futbol_courts: 0,
                };
            }
            const sportKey = item.sport.toLowerCase().replace(" ", "_");
            if (sportKey === 'padel_indoor') {
                grouped[key].padel_indoor_income += Number(item.total_income || 0);
                grouped[key].padel_indoor_courts += Number(item.courts_rented || 0);
            } else if (sportKey === 'padel_outdoor') {
                grouped[key].padel_outdoor_income += Number(item.total_income || 0);
                grouped[key].padel_outdoor_courts += Number(item.courts_rented || 0);
            } else if (sportKey === 'futbol') {
                grouped[key].futbol_income += Number(item.total_income || 0);
                grouped[key].futbol_courts += Number(item.courts_rented || 0);
            }
        });

        const result = Object.values(grouped).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: "Error al obtener evolución de deportes" };
    }
}
