"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Loader2, PartyPopper, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { getEventIncomeByMonth, getEventIncomeLastNMonths, getAllEvents } from "@/lib/events.service"
import { months, years, ranges, defaultMonth, defaultYear } from "@/utils/utils"
import { EventsManagement } from "./EventsManagement"
import { EventMonthlyIncome } from "@/types"
import { KpiCard } from "@/components/KpiCard"
import { LineChartReusable } from "@/components/LineChartReusable"

export function EventsDashboard() {
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
    const [selectedYear, setSelectedYear] = useState(defaultYear)
    const [evolutionRange, setEvolutionRange] = useState("12")

    const [stats, setStats] = useState<EventMonthlyIncome[]>([])
    const [evolution, setEvolution] = useState<any[]>([])
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [statsRes, evolutionRes, eventsRes] = await Promise.all([
                getEventIncomeByMonth(parseInt(selectedYear), parseInt(selectedMonth)),
                getEventIncomeLastNMonths(parseInt(evolutionRange)),
                getAllEvents()
            ])
            setStats(statsRes || [])
            setEvolution(evolutionRes || [])
            setEvents(eventsRes || [])
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar los datos de eventos")
        } finally {
            setLoading(false)
        }
    }, [selectedMonth, selectedYear, evolutionRange])

    useEffect(() => {
        fetchData()
    }, [fetchData, refreshKey])

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
    }

    const chartConfig = useMemo(() => {
        const config: any = {
            total: {
                label: "Ingreso Total",
                color: "#1d4ed8",
            }
        }

        events.forEach((event, index) => {
            config[`event-${event.id}`] = {
                label: event.name,
                color: `var(--chart-${(index % 5) + 1})`,
            }
        })

        return config
    }, [events])

    const chartLines = useMemo(() => {
        return events.map((event, index) => ({
            key: `event-${event.id}`,
            color: `var(--chart-${(index % 5) + 1})`,
            label: event.name
        }));
    }, [events]);

    if (loading && stats.length === 0 && evolution.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
                    <p className="text-muted-foreground">Gestión y análisis de ingresos generados por eventos.</p>
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

            {/* Event Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.length === 0 ? (
                    <Card className="col-span-full border-dashed border-2 flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <PartyPopper className="h-12 w-12 mb-4 opacity-20" />
                        <p>No hay ingresos registrados para este mes.</p>
                    </Card>
                ) : (
                    stats.map((income) => (
                        <KpiCard
                            key={income.id}
                            title={income.events?.name || "Sin nombre"}
                            value={`$${Number(income.total_income).toLocaleString()}`}
                            description="Ingreso del mes seleccionado"
                            icon={Calendar}
                            bgColor="bg-orange-500/5"
                            textColor="text-orange-600"
                            accentColor="text-orange-500"
                        />
                    ))
                )}
            </div>

            {/* Evolution Chart */}
            <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
                    <div>
                        <CardTitle className="text-lg">Evolución de Ingresos por Evento</CardTitle>
                        <CardDescription>Ingresos acumulados a lo largo del tiempo.</CardDescription>
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
                    {evolution.length > 0 ? (
                        <LineChartReusable
                            data={evolution}
                            config={chartConfig}
                            lines={chartLines}
                        />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            No hay datos suficientes para mostrar la evolución.
                        </div>
                    )}
                </CardContent>
            </Card>

            <EventsManagement onRefresh={handleRefresh} />
        </div>
    )
}
