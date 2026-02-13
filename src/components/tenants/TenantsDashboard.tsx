"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, TrendingDown, DollarSign, Calendar, Loader2 } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { getCurrentMonthTenantStats, getTenantIncomeLastNMonths } from "@/lib/tenants.service"
import { TenantStats } from "@/types"
import { months, years, ranges, defaultMonth, defaultYear } from "@/utils/utils"
import { TenantsManagement } from "./TenantsManagement"

export function TenantsDashboard() {
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
    const [selectedYear, setSelectedYear] = useState(defaultYear)
    const [evolutionRange, setEvolutionRange] = useState("12")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<TenantStats | null>(null)
    const [evolutionData, setEvolutionData] = useState<any[]>([])
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [statsRes, evolutionRes] = await Promise.all([
                getCurrentMonthTenantStats(parseInt(selectedYear), parseInt(selectedMonth)),
                getTenantIncomeLastNMonths(parseInt(evolutionRange))
            ])

            if (statsRes.success) {
                setStats(statsRes.data || null)
            } else {
                toast.error("Error al cargar estadísticas")
            }

            if (evolutionRes.success) {
                setEvolutionData(evolutionRes.data || [])
            }

            setLoading(false)
        }
        fetchData()
    }, [selectedMonth, selectedYear, evolutionRange, refreshKey])

    if (loading && !stats) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header con selectores */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inquilinos</h1>
                    <p className="text-muted-foreground">Gestión de rentas y ocupación del complejo.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]"><SelectValue placeholder="Año" /></SelectTrigger>
                        <SelectContent>{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[130px]"><SelectValue placeholder="Mes" /></SelectTrigger>
                        <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Principal */}
            <div className="gap-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50/30 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-blue-700">Recaudación Total Inquilinos</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-4">
                            <div className="text-4xl font-bold text-blue-700">${(stats?.totalIncome || 0).toLocaleString()}</div>
                            <div className={`flex items-center text-sm font-medium ${((stats?.variation || 0) >= 0) ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {((stats?.variation || 0) >= 0) ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                                {Math.abs(stats?.variation || 0).toFixed(1)}% vs mes anterior
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </div>

            {/* Inquilinos Detalle (Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats?.tenants.map((tenant) => (
                    <Card key={tenant.id} className="border-none shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">{tenant.name}</p>
                                    <h3 className="text-xl font-bold">${tenant.income.toLocaleString()}</h3>
                                </div>
                                <div className={`p-2 rounded-full ${tenant.income > 0 ? 'bg-emerald-100/50 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                    <DollarSign className="h-4 w-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {stats?.tenants.length === 0 && (
                    <div className="col-span-full py-10 text-center bg-muted/20 rounded-xl border border-dashed text-muted-foreground font-medium">
                        No hay inquilinos registrados. Créalos en la sección de gestión.
                    </div>
                )}
            </div>

            {/* Gráfico de Evolución */}
            <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/10 flex flex-row items-center justify-between pb-4">
                    <div>
                        <CardTitle className="text-lg">Evolución de Recaudación</CardTitle>
                        <CardDescription>Ingresos totales por alquileres en el tiempo.</CardDescription>
                    </div>
                    <Select value={evolutionRange} onValueChange={setEvolutionRange}>
                        <SelectTrigger className="w-[150px] bg-white h-8 text-xs font-medium">
                            <SelectValue placeholder="Rango" />
                        </SelectTrigger>
                        <SelectContent>
                            {ranges.map(r => <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[350px] w-full">
                        {evolutionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolutionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingreso Total']}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#6366f1' }}
                                        activeDot={{ r: 6 }}
                                        name="Ingresos Totales"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground font-medium">No hay datos históricos para graficar</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Gestión de Inquilinos */}
            <TenantsManagement onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </div>
    )
}
