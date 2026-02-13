"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts"
import { getCurrentMonthFoodStats, getFoodEvolution } from "@/lib/food.service"
import { UtensilsCrossed, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Loader2, Landmark, Users } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { months, years, ranges, defaultMonth, defaultYear } from "@/utils/utils"
import { FoodManagement } from "./FoodManagement"
import { FoodStats } from "@/types"

export function FoodDashboard() {
    const [selectedYear, setSelectedYear] = useState(defaultYear)
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
    const [evolutionRange, setEvolutionRange] = useState("12")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<FoodStats | null>(null)
    const [evolution, setEvolution] = useState<any[]>([])
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [statsRes, evolutionRes] = await Promise.all([
                getCurrentMonthFoodStats(parseInt(selectedYear), parseInt(selectedMonth)),
                getFoodEvolution(parseInt(evolutionRange))
            ])

            if (statsRes.success) {
                setStats(statsRes.data || null)
            } else {
                toast.error("Error al cargar estadísticas")
            }

            if (evolutionRes.success) {
                setEvolution(evolutionRes.data || [])
            }
        } catch (error) {
            console.error("fetchData Error:", error)
            toast.error("Error de conexión al cargar datos")
        } finally {
            setLoading(false)
        }
    }, [selectedMonth, selectedYear, evolutionRange])

    useEffect(() => {
        fetchData()
    }, [fetchData, refreshKey])

    const kpis = useMemo(() => {
        return {
            income: stats?.income || 0,
            expense: stats?.expenses?.total || 0,
            net: stats?.netIncome || 0,
            variation: stats?.variation || 0
        }
    }, [stats])

    const expenseBreakdown = useMemo(() => {
        if (!stats) return []
        const total = stats.expenses.total > 0 ? stats.expenses.total : 1
        return [
            {
                label: "Materia Prima",
                amount: stats.expenses.materia_prima,
                percentage: (stats.expenses.materia_prima / total) * 100,
                icon: UtensilsCrossed,
                color: "text-rose-600",
                bgColor: "bg-rose-50"
            },
            {
                label: "Sueldos",
                amount: stats.expenses.sueldos,
                percentage: (stats.expenses.sueldos / total) * 100,
                icon: Users,
                color: "text-blue-600",
                bgColor: "bg-blue-50"
            },
            {
                label: "Impuestos",
                amount: stats.expenses.impuestos,
                percentage: (stats.expenses.impuestos / total) * 100,
                icon: Landmark,
                color: "text-amber-600",
                bgColor: "bg-amber-50"
            },
        ]
    }, [stats])

    const chartData = useMemo(() => {
        return evolution.map(item => ({
            name: item.name,
            ingresos: Number(item.total_income || 0),
            gastos: Number(item.expenses?.total || 0),
            "Materia Prima": Number(item.expenses?.materia_prima || 0),
            "Sueldos": Number(item.expenses?.sueldos || 0),
            "Impuestos": Number(item.expenses?.impuestos || 0),
            "Otros": Number(item.expenses?.otros || 0),
            neto: Number(item.net_income || 0)
        }))
    }, [evolution])

    if (loading && evolution.length === 0) {
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
                    <p className="text-muted-foreground">Gestión financiera y desglose de costos operativos.</p>
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

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-emerald-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-emerald-700">Ingresos del Mes</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">${kpis.income.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600/70 mt-1">Ventas totales registradas</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-white to-rose-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-rose-700">Gastos Totales</CardTitle>
                        <Wallet className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700">${kpis.expense.toLocaleString()}</div>
                        <p className="text-xs text-rose-600/70 mt-1">Suma de todas las categorías</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-blue-700">Ingreso Neto</CardTitle>
                        <Landmark className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">${kpis.net.toLocaleString()}</div>
                        <p className="text-xs text-blue-600/70 mt-1">Utilidad del período</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-white to-amber-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-amber-700">Variación Neta</CardTitle>
                        {kpis.variation >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${kpis.variation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {kpis.variation.toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground font-medium">vs mes anterior</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Desglose de Gastos (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {expenseBreakdown.length > 0 ? (
                    expenseBreakdown.map((item) => (
                        <Card key={item.label} className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex items-center p-4 gap-4">
                                    <div className={`p-3 rounded-xl ${item.bgColor}`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-xl font-bold">${item.amount.toLocaleString()}</h3>
                                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-muted">
                                                {item.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-muted">
                                    <div
                                        className={`h-full ${item.color.replace('text', 'bg')}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-3 py-10 text-center bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
                        No hay desglose de gastos disponible para este mes.
                    </div>
                )}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/10 pb-4">
                        <CardTitle className="text-lg">Desglose de Gastos por Mes</CardTitle>
                        <CardDescription>Visualización segmentada de costos operativos.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Bar dataKey="Materia Prima" stackId="a" fill="#f43f5e" />
                                        <Bar dataKey="Sueldos" stackId="a" fill="#3b82f6" />
                                        <Bar dataKey="Impuestos" stackId="a" fill="#f59e0b" />
                                        <Bar dataKey="Otros" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">No hay datos históricos disponibles</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/10 flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg">Evolución Ingreso Neto</CardTitle>
                            <CardDescription>Utilidad mensual neta (Ingresos - Gastos).</CardDescription>
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
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Neto']}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Line
                                            type="monotone"
                                            dataKey="neto"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#3b82f6' }}
                                            activeDot={{ r: 6 }}
                                            name="Ingreso Neto"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">No hay datos históricos disponibles</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Table */}
            <FoodManagement onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </div>
    )
}
