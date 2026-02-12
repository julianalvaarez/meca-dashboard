"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getOverviewStats, getEvolutionRange, getFullMonthReport } from "@/lib/dashboard.service"
import { generateMonthlyPDF } from "@/lib/pdf-generator"
import { Loader2, DollarSign, Trophy, UtensilsCrossed, Disc, FileDown } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useDashboard } from "@/context/DashboardContext"
import { toast } from "sonner"
import { months, years, ranges } from "@/utils/utils"


const chartConfig = {
    sports: {
        label: "Deportes",
        color: "#10b981",
    },
    food: {
        label: "Gastronomía",
        color: "#3b82f6",
    },
    clothing: {
        label: "Indumentaria",
        color: "#8b5cf6",
    },
    total: {
        label: "Ingreso Total",
        color: "#0f172a",
    }
} satisfies ChartConfig

export function DashboardOverview() {
    const { overviewData, setOverviewData, evolutionData, setEvolutionData, lastFetchParams, setLastFetchParams } = useDashboard()

    const [selectedMonth, setSelectedMonth] = useState(lastFetchParams?.month || new Date().getMonth() + 1 + "")
    const [selectedYear, setSelectedYear] = useState(lastFetchParams?.year || new Date().getFullYear() + "")
    const [evolutionRange, setEvolutionRange] = useState(lastFetchParams?.evolutionRange || "12")

    const [loading, setLoading] = useState(!overviewData)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const paramsChanged = !lastFetchParams ||
                lastFetchParams.month !== selectedMonth ||
                lastFetchParams.year !== selectedYear ||
                lastFetchParams.evolutionRange !== evolutionRange

            if (!paramsChanged && overviewData && evolutionData.length > 0) {
                setLoading(false)
                return
            }

            setLoading(true)
            const [overview, evolution] = await Promise.all([
                getOverviewStats(parseInt(selectedYear), parseInt(selectedMonth)),
                getEvolutionRange(parseInt(evolutionRange))
            ])

            if (overview.success) {
                setOverviewData(overview.data)
            } else {
                toast.error("Error al cargar resumen")
            }

            if (evolution.success && evolution.data) {
                setEvolutionData(evolution.data)
            } else if (!evolution.success) {
                toast.error("Error al cargar evolución")
            }

            setLastFetchParams({ month: selectedMonth, year: selectedYear, evolutionRange })
            setLoading(false)
        }
        fetchData()
    }, [selectedMonth, selectedYear, evolutionRange])

    const handleDownloadPDF = async () => {
        setDownloading(true)
        const res = await getFullMonthReport(parseInt(selectedYear), parseInt(selectedMonth))

        if (res.success && res.data) {
            try {
                generateMonthlyPDF(res.data)
                toast.success("PDF generado correctamente")
            } catch (err) {
                console.error(err)
                toast.error("Error al generar el PDF")
            }
        } else {
            toast.error("Error al obtener datos para el reporte")
        }
        setDownloading(false)
    }

    const barChartData = useMemo(() => [
        { sector: "sports", value: overviewData?.sports || 0, fill: chartConfig.sports.color },
        { sector: "food", value: overviewData?.food || 0, fill: chartConfig.food.color },
        { sector: "clothing", value: overviewData?.clothing || 0, fill: chartConfig.clothing.color },
    ], [overviewData])

    if (loading && !overviewData) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 bg-background hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                    >
                        {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Descargar PDF
                    </Button>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[140px] h-10 bg-background cursor-pointer">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m) => (
                                <SelectItem key={m.value} value={m.value} className="cursor-pointer">{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px] h-10 bg-background cursor-pointer">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y.value} value={y.value} className="cursor-pointer">{y.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary/70">Balance Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">${overviewData?.total?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ingresos netos combinados</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-emerald-500/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-600">Deportes</CardTitle>
                        <Trophy className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-emerald-700">${overviewData?.sports?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Alquiler de canchas</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-500/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600">Gastronomía (Neto)</CardTitle>
                        <UtensilsCrossed className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-700">${overviewData?.food?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ingresos - Gastos de insumos</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-500/5">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-purple-600">Indumentaria</CardTitle>
                        <Disc className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-purple-700">${overviewData?.clothing?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ventas de ropa y accesorios</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-3 border-none shadow-lg overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-lg">Distribución por Sector</CardTitle>
                        <CardDescription>
                            Comparativa de desempeño para {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={barChartData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                                <XAxis
                                    dataKey="sector"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="value"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 border-none shadow-lg overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
                        <div>
                            <CardTitle className="text-lg">Evolución de Ingresos Netos</CardTitle>
                            <CardDescription>Crecimiento mensual del negocio total.</CardDescription>
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
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolutionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} stroke="#ccc" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingreso Neto Total']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#0f172a"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: "#0f172a", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
