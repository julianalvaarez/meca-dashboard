import { supabase } from "./supabase";
import { Tenant, TenantMonthlyIncome, TenantStats } from "@/types";

/**
 * Obtiene todos los inquilinos
 */
export async function getAllTenants() {
    try {
        const { data, error } = await supabase
            .from("tenants")
            .select("*")
            .order("name", { ascending: true });

        if (error) throw error;
        return { success: true, data: (data || []) as Tenant[] };
    } catch (error: any) {
        console.error("getAllTenants Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene el ingreso por inquilino para un mes específico
 */
export async function getTenantIncomeByMonth(year: number, month: number) {
    try {
        const { data, error } = await supabase
            .from("tenant_monthly_income")
            .select("*, tenants(name)")
            .eq("year", year)
            .eq("month", month);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error("getTenantIncomeByMonth Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene el ingreso total de inquilinos por mes para un año específico
 */
export async function getTotalTenantIncomeByYear(year: number) {
    try {
        const { data, error } = await supabase
            .from("tenant_monthly_income")
            .select("month, total_income")
            .eq("year", year);

        if (error) throw error;

        // Agrupar por mes
        const monthlyTotals = Array(12).fill(0).map((_, i) => ({ month: i + 1, total: 0 }));
        data?.forEach(item => {
            monthlyTotals[item.month - 1].total += Number(item.total_income || 0);
        });

        return { success: true, data: monthlyTotals };
    } catch (error: any) {
        console.error("getTotalTenantIncomeByYear Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene el ingreso total de los últimos N meses (para el gráfico)
 */
export async function getTenantIncomeLastNMonths(range: number) {
    try {
        // Obtenemos los ingresos brutos ordenados por fecha descendente
        // Usamos una query que agrupe por año y mes
        const { data, error } = await supabase
            .from("tenant_monthly_income")
            .select("year, month, total_income")
            .order("year", { ascending: false })
            .order("month", { ascending: false });

        if (error) throw error;

        // Agrupar por mes (ya que puede haber varios inquilinos por mes)
        const grouped = new Map<string, number>();
        data?.forEach(item => {
            const key = `${item.year}-${item.month}`;
            grouped.set(key, (grouped.get(key) || 0) + Number(item.total_income || 0));
        });

        // Convertir a array y tomar los últimos N
        const now = new Date();
        const result = [];

        for (let i = 0; i < range; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const key = `${y}-${m}`;
            const total = grouped.get(key) || 0;

            result.push({
                year: y,
                month: m,
                total,
                name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d)
            });
        }

        return {
            success: true,
            data: result.reverse() // Orden cronológico para el gráfico
        };
    } catch (error: any) {
        console.error("getTenantIncomeLastNMonths Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene estadísticas del mes actual para inquilinos
 */
export async function getCurrentMonthTenantStats(year: number, month: number) {
    try {
        // Inquilinos e ingresos del mes
        const [{ data: tenants }, { data: monthlyIncome }] = await Promise.all([
            supabase.from("tenants").select("*"),
            supabase.from("tenant_monthly_income").select("*").eq("year", year).eq("month", month)
        ]);

        // Combinar datos
        const tenantStatsList = (tenants || []).map(t => {
            const incomeRecord = monthlyIncome?.find(mi => mi.tenant_id === t.id);
            return {
                id: t.id,
                name: t.name,
                income: Number(incomeRecord?.total_income || 0)
            };
        });

        const totalIncome = tenantStatsList.reduce((acc, curr) => acc + curr.income, 0);

        // Calcular variación vs mes anterior
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const { data: prevIncome } = await supabase
            .from("tenant_monthly_income")
            .select("total_income")
            .eq("year", prevYear)
            .eq("month", prevMonth);

        const prevTotalIncome = prevIncome?.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0) || 0;

        let variation = 0;
        if (prevTotalIncome !== 0) {
            variation = ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100;
        } else if (totalIncome > 0) {
            variation = 100;
        }

        const stats: TenantStats = {
            totalIncome,
            tenants: tenantStatsList,
            variation
        };

        return { success: true, data: stats };
    } catch (error: any) {
        console.error("getCurrentMonthTenantStats Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * CRUD para Inquilinos
 */
export async function createTenant(name: string) {
    const { data, error } = await supabase.from("tenants").insert({ name }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function deleteTenant(id: string) {
    const { error } = await supabase.from("tenants").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

/**
 * Upsert ingreso mensual de un inquilino
 */
export async function upsertTenantIncome(tenant_id: string, year: number, month: number, total_income: number) {
    const { data, error } = await supabase
        .from("tenant_monthly_income")
        .upsert({ tenant_id, year, month, total_income }, { onConflict: 'tenant_id,year,month' })
        .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

/**
 * Elimina un registro de ingreso mensual
 */
export async function deleteTenantIncome(id: string) {
    const { error } = await supabase.from("tenant_monthly_income").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

/**
 * Obtiene todos los registros de ingresos de inquilinos (para gestión)
 */
export async function getAllTenantIncomes() {
    try {
        const { data, error } = await supabase
            .from("tenant_monthly_income")
            .select("*, tenants(name)")
            .order("year", { ascending: false })
            .order("month", { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error("getAllTenantIncomes Error:", error);
        return { success: false, error: error.message };
    }
}
