"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { getClothingStats, getClothingEvolutionRange } from "@/lib/clothing.service"
import { Shirt, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { months, years, ranges } from "@/utils/utils"
import { ClothingManagement } from "./ClothingManagement"
import { ClothingsStats } from "@/types"

export function ClothingDashboard() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
    const [evolutionRange, setEvolutionRange] = useState("12")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<ClothingsStats | null>(null)
    const [prevStats, setPrevStats] = useState<ClothingsStats | null>(null)
    const [evolution, setEvolution] = useState<any[]>([])
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const prevMonth = parseInt(selectedMonth) === 1 ? 12 : parseInt(selectedMonth) - 1
        const prevYear = parseInt(selectedMonth) === 1 ? parseInt(selectedYear) - 1 : parseInt(selectedYear)

        const [statsRes, prevStatsRes, evolutionRes] = await Promise.all([
            getClothingStats(parseInt(selectedYear), parseInt(selectedMonth)),
            getClothingStats(prevYear, prevMonth),
            getClothingEvolutionRange(parseInt(evolutionRange))
        ])
        if (statsRes.success) {
            setStats(statsRes.data)
        } else {
            toast.error("Error al cargar estadísticas")
        }

        if (prevStatsRes.success) {
            setPrevStats(prevStatsRes.data)
        }

        if (evolutionRes.success) {
            setEvolution(evolutionRes.data || [])
        }

        setLoading(false)
    }, [selectedMonth, selectedYear, evolutionRange])

    useEffect(() => {
        fetchData()
    }, [fetchData, refreshKey])

    const kpis = useMemo(() => {
        if (!stats) return null

        const income = Number(stats.total_income)

        let variation = 0
        if (prevStats) {
            const prevIncome = Number(prevStats.total_income)
            if (prevIncome !== 0) {
                variation = ((income - prevIncome) / prevIncome) * 100
            } else if (income > 0) {
                variation = 100
            }
        }

        return { income, variation }
    }, [stats, prevStats])

    const chartData = useMemo(() => {
        return evolution.map(item => ({
            name: months.find(m => m.value === item.month.toString())?.label.substring(0, 3),
            ingresos: Number(item.total_income),
        }))
    }, [evolution])

    if (loading && !stats && evolution.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Indumentaria</h1>
                    <p className="text-muted-foreground">Ventas de ropa y accesorios del complejo.</p>
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

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-purple-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-purple-700">Ingresos Totales (Mes)</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-700">${kpis?.income.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-purple-600/70 mt-1">Ventas de indumentaria registradas</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-blue-700">Variación Mensual</CardTitle>
                        {kpis && kpis.variation >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${kpis && kpis.variation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {kpis?.variation.toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            {kpis && kpis.variation >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-rose-500" />
                            )}
                            <span className="text-xs text-muted-foreground">vs. mes anterior</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="gap-6">
                {/* Evolution Chart */}
                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                        <div>
                            <CardTitle className="text-lg">Evolución de Ingresos</CardTitle>
                            <CardDescription>Ventas mensuales.</CardDescription>
                        </div>
                        <Select value={evolutionRange} onValueChange={setEvolutionRange}>
                            <SelectTrigger className="w-[180px] h-8"><SelectValue placeholder="Rango" /></SelectTrigger>
                            <SelectContent>{ranges.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ventas']}
                                    />
                                    <Area type="monotone" dataKey="ingresos" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} name="Ventas" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Table */}
            <ClothingManagement onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </div>
    )
}
