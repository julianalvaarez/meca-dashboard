"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { getDetailedSportsStats, getSportsEvolutionRange } from "@/lib/sports_dashboard.service"
import { Loader2, Trophy } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { SportsManagement } from "./SportsManagement"

const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
]

const years = [
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
]

const ranges = [
    { value: "3", label: "Últimos 3 meses" },
    { value: "6", label: "Últimos 6 meses" },
    { value: "9", label: "Últimos 9 meses" },
    { value: "12", label: "Últimos 12 meses" },
]

const chartConfig = {
    padel_indoor: {
        label: "Padel Indoor",
        color: "var(--chart-1)",
    },
    padel_outdoor: {
        label: "Padel Outdoor",
        color: "var(--chart-2)",
    },
    futbol: {
        label: "Fútbol",
        color: "var(--chart-3)",
    }
} satisfies ChartConfig

export function SportsDashboard() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1 + "")
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + "")
    const [evolutionRange, setEvolutionRange] = useState("12")

    const [stats, setStats] = useState<any>(null)
    const [evolution, setEvolution] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const [statsRes, evolutionRes] = await Promise.all([
            getDetailedSportsStats(parseInt(selectedYear), parseInt(selectedMonth)),
            getSportsEvolutionRange(parseInt(evolutionRange))
        ])

        if (statsRes.success) {
            setStats(statsRes.data || [])
        } else {
            toast.error("Error al cargar estadísticas: " + (typeof statsRes.error === 'string' ? statsRes.error : "Error de conexión"))
        }

        if (evolutionRes.success) {
            setEvolution(evolutionRes.data || [])
        } else {
            toast.error("Error al cargar evolución: " + (typeof evolutionRes.error === 'string' ? evolutionRes.error : "Error de conexión"))
        }
        setLoading(false)
    }, [selectedMonth, selectedYear, evolutionRange])

    useEffect(() => {
        fetchData()
    }, [fetchData, refreshKey])

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
    }

    if (loading && !stats) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deportes</h1>
                    <p className="text-muted-foreground">Análisis de ocupación e ingresos por disciplina.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m) => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px] bg-background">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-chart-1/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-chart-1/70">Padel Indoor</CardTitle>
                        <Trophy className="h-4 w-4 text-chart-1" />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        <div>
                            <div className="text-2xl font-bold">${stats?.padel_indoor?.income.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
                        </div>
                        <div>
                            <div className="text-xl font-semibold">{stats?.padel_indoor?.courts}</div>
                            <p className="text-xs text-muted-foreground">Canchas alquiladas</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-chart-2/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-chart-2/70">Padel Outdoor</CardTitle>
                        <Trophy className="h-4 w-4 text-chart-2" />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        <div>
                            <div className="text-2xl font-bold">${stats?.padel_outdoor?.income.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
                        </div>
                        <div>
                            <div className="text-xl font-semibold">{stats?.padel_outdoor?.courts}</div>
                            <p className="text-xs text-muted-foreground">Canchas alquiladas</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-chart-3/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-chart-3/70">Fútbol</CardTitle>
                        <Trophy className="h-4 w-4 text-chart-3" />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        <div>
                            <div className="text-2xl font-bold">${stats?.futbol?.income.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
                        </div>
                        <div>
                            <div className="text-xl font-semibold">{stats?.futbol?.courts}</div>
                            <p className="text-xs text-muted-foreground">Canchas alquiladas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Combined Line Chart */}
            <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
                    <div>
                        <CardTitle className="text-lg">Comparativa de Ingresos</CardTitle>
                        <CardDescription>Evolución mensual por deporte.</CardDescription>
                    </div>
                    <Select value={evolutionRange} onValueChange={setEvolutionRange}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Rango" />
                        </SelectTrigger>
                        <SelectContent>
                            {ranges.map((r) => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="pt-8 px-6">
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <LineChart data={evolution} margin={{ left: 12, right: 12, top: 12 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="padel_indoor_income"
                                stroke="var(--chart-1)"
                                strokeWidth={4}
                                dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="padel_outdoor_income"
                                stroke="var(--chart-2)"
                                strokeWidth={4}
                                dot={{ r: 4, fill: "var(--chart-2)", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="futbol_income"
                                stroke="var(--chart-3)"
                                strokeWidth={4}
                                dot={{ r: 4, fill: "var(--chart-3)", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Individual Bar Charts */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-chart-1/5 border-b pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-chart-1/70">Ocupación: Padel Indoor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ChartContainer config={chartConfig} className="h-[180px] w-full">
                            <BarChart data={evolution}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="padel_indoor_courts" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-chart-2/5 border-b pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-chart-2/70">Ocupación: Padel Outdoor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ChartContainer config={chartConfig} className="h-[180px] w-full">
                            <BarChart data={evolution}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="padel_outdoor_courts" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-chart-3/5 border-b pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-chart-3/70">Ocupación: Fútbol</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ChartContainer config={chartConfig} className="h-[180px] w-full">
                            <BarChart data={evolution}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="futbol_courts" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Management Section */}
            <SportsManagement onRefresh={handleRefresh} />
        </div>
    )
}
