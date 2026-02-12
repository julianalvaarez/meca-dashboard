"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts"
import { getFoodStats, getFoodEvolutionRange } from "@/lib/food.service"
import { UtensilsCrossed, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { months, years, ranges } from "@/utils/utils"
import { FoodManagement } from "./FoodManagement"
import { FoodsStats } from "@/types"

export function FoodDashboard() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
    const [evolutionRange, setEvolutionRange] = useState("12")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<FoodsStats | null>(null)
    const [prevStats, setPrevStats] = useState<FoodsStats | null>(null)
    const [evolution, setEvolution] = useState<any[]>([])
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const prevMonth = parseInt(selectedMonth) === 1 ? 12 : parseInt(selectedMonth) - 1
        const prevYear = parseInt(selectedMonth) === 1 ? parseInt(selectedYear) - 1 : parseInt(selectedYear)

        const [statsRes, prevStatsRes, evolutionRes] = await Promise.all([
            getFoodStats(parseInt(selectedYear), parseInt(selectedMonth)),
            getFoodStats(prevYear, prevMonth),
            getFoodEvolutionRange(parseInt(evolutionRange))
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
        const expense = Number(stats.total_expense)
        const net = income - expense

        let variation = 0
        if (prevStats) {
            const prevNet = Number(prevStats.total_income) - Number(prevStats.total_expense)
            if (prevNet !== 0) {
                variation = ((net - prevNet) / Math.abs(prevNet)) * 100
            } else if (net > 0) {
                variation = 100
            }
        }

        return { income, expense, net, variation }
    }, [stats, prevStats])

    const chartData = useMemo(() => {
        return evolution.map(item => ({
            name: months.find(m => m.value === item.month.toString())?.label.substring(0, 3),
            ingresos: Number(item.total_income),
            gastos: Number(item.total_expense),
            neto: Number(item.total_income) - Number(item.total_expense)
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
                    <h1 className="text-3xl font-bold tracking-tight">Gastronomía</h1>
                    <p className="text-muted-foreground">Monitoreo de ingresos y costos de materia prima.</p>
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

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-emerald-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-emerald-700">Ingresos del Mes</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">${kpis?.income.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-emerald-600/70 mt-1">Ventas totales registradas</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-white to-rose-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-rose-700">Gastos (Materia Prima)</CardTitle>
                        <Wallet className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700">${kpis?.expense.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-rose-600/70 mt-1">Costo de insumos del período</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-blue-700">Ingreso Neto</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">${kpis?.net.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-blue-600/70 mt-1">Beneficio antes de otros gastos</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-white to-amber-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-amber-700">Variación vs Mes Ant.</CardTitle>
                        {kpis && kpis.variation >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${kpis && kpis.variation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {kpis?.variation.toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            {kpis && kpis.variation >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-rose-500" />
                            )}
                            <span className="text-xs text-muted-foreground">En rendimiento neto</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                        <div>
                            <CardTitle className="text-lg">Ingresos vs Gastos</CardTitle>
                            <CardDescription>Evolución de ventas y costos.</CardDescription>
                        </div>
                        <Select value={evolutionRange} onValueChange={setEvolutionRange}>
                            <SelectTrigger className="w-[180px] h-8"><SelectValue placeholder="Rango" /></SelectTrigger>
                            <SelectContent>{ranges.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Ingresos" />
                                    <Line type="monotone" dataKey="gastos" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} name="Gastos" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                        <div>
                            <CardTitle className="text-lg">Ganancia Neta Mensual</CardTitle>
                            <CardDescription>Resultado final después de costos directos.</CardDescription>
                        </div>
                        <div className="text-xs font-bold text-primary">Histórico</div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ganancia']}
                                    />
                                    <Bar dataKey="neto" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.neto >= 0 ? "#3b82f6" : "#f43f5e"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Table */}
            <FoodManagement onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </div>
    )
}
