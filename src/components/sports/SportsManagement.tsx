"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDashboard } from "@/context/DashboardContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllSportsStats, checkStatsExistence, saveSportsStats, deleteSportsRecord, updateSportsRecord } from "@/lib/sports_dashboard.service"
import { Loader2, Plus, Pencil, Trash2, CalendarDays, Eye, AlertCircle, CheckCircle2 } from "lucide-react"
import { months, years } from "@/utils/utils"
import { EditValues, FormValues } from "@/types"

export const formSchema = z.object({
    year: z.string().min(1, "Seleccione el año"),
    month: z.string().min(1, "Seleccione el mes"),
    padel_indoor_courts: z.coerce.number().min(0, "Mínimo 0"),
    padel_indoor_income: z.coerce.number().min(0, "Mínimo 0"),
    padel_outdoor_courts: z.coerce.number().min(0, "Mínimo 0"),
    padel_outdoor_income: z.coerce.number().min(0, "Mínimo 0"),
    futbol_courts: z.coerce.number().min(0, "Mínimo 0"),
    futbol_income: z.coerce.number().min(0, "Mínimo 0"),
})

export const editSchema = z.object({
    courts_rented: z.coerce.number().min(0, "Mínimo 0"),
    total_income: z.coerce.number().min(0, "Mínimo 0"),
})


export function SportsManagement({ onRefresh }: { onRefresh: () => void }) {
    const { refresh: refreshDashboard } = useDashboard()
    const [records, setRecords] = useState<any[]>([])
    const [loadingRecords, setLoadingRecords] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<any>(null)
    const [selectedMonthGroup, setSelectedMonthGroup] = useState<any>(null)
    const [alreadyExists, setAlreadyExists] = useState(false)
    const [checkingExistence, setCheckingExistence] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            padel_indoor_courts: 0,
            padel_indoor_income: 0,
            padel_outdoor_courts: 0,
            padel_outdoor_income: 0,
            futbol_courts: 0,
            futbol_income: 0,
        }
    })
    const editForm = useForm<EditValues>({
        resolver: zodResolver(editSchema) as any,
    })

    const watchYear = useWatch({ control: form.control, name: "year" })
    const watchMonth = useWatch({ control: form.control, name: "month" })

    useEffect(() => {
        async function check() {
            if (watchYear && watchMonth) {
                setCheckingExistence(true)
                const exists = await checkStatsExistence(parseInt(watchYear), parseInt(watchMonth))
                setAlreadyExists(exists)
                setCheckingExistence(false)
            }
        }
        check()
    }, [watchYear, watchMonth])


    const fetchRecords = async () => {
        setLoadingRecords(true)
        const res = await getAllSportsStats()
        if (res.success) {
            setRecords(res.data || [])
        } else {
            toast.error("Error al cargar los registros: " + (typeof res.error === 'string' ? res.error : "Error desconocido"))
        }
        setLoadingRecords(false)
    }

    useEffect(() => {
        fetchRecords()
    }, [])

    const groupedRecords = useMemo(() => {
        const groups: Record<string, any[]> = {}
        records.forEach(r => {
            const key = `${r.year}-${r.month}`
            if (!groups[key]) groups[key] = []
            groups[key].push(r)
        })
        return Object.entries(groups)
            .map(([key, items]) => ({
                id: key,
                year: items[0].year,
                month: items[0].month,
                items,
                totalIncome: items.reduce((acc, curr) => acc + Number(curr.total_income), 0),
                totalCourts: items.reduce((acc, curr) => acc + Number(curr.courts_rented), 0)
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year
                return b.month - a.month
            })
    }, [records])

    const onSubmit = async (values: FormValues) => {
        if (alreadyExists) return

        setSubmitting(true)
        const yearNum = parseInt(values.year)
        const monthNum = parseInt(values.month)

        const dataToSave = [
            { sport: "padel_indoor", year: yearNum, month: monthNum, courts_rented: values.padel_indoor_courts, total_income: values.padel_indoor_income },
            { sport: "padel_outdoor", year: yearNum, month: monthNum, courts_rented: values.padel_outdoor_courts, total_income: values.padel_outdoor_income },
            { sport: "futbol", year: yearNum, month: monthNum, courts_rented: values.futbol_courts, total_income: values.futbol_income }
        ]

        const res = await saveSportsStats(dataToSave)
        if (res.success) {
            toast.success("Datos guardados correctamente")
            setIsAddOpen(false)
            form.reset()
            await fetchRecords()
            onRefresh()
            refreshDashboard()
        } else {
            toast.error("Error al guardar los datos")
        }
        setSubmitting(false)
    }

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        if (!id) return
        if (e) e.preventDefault()

        setSubmitting(true)
        const res = await deleteSportsRecord(id)
        if (res.success) {
            toast.success("Registro eliminado")

            // If we are deleting from the detail modal, update its local items
            if (selectedMonthGroup) {
                const updatedItems = selectedMonthGroup.items.filter((i: any) => i.id !== id)
                if (updatedItems.length === 0) {
                    setIsDetailOpen(false)
                } else {
                    setSelectedMonthGroup({ ...selectedMonthGroup, items: updatedItems })
                }
            }

            await fetchRecords()
            onRefresh()
            refreshDashboard()
            setDeleteId(null)
        } else {
            toast.error("Error al eliminar: " + (typeof res.error === 'string' ? res.error : "Error desconocido"))
        }
        setSubmitting(false)
    }

    const onEditSubmit = async (values: EditValues) => {
        setSubmitting(true)
        const res = await updateSportsRecord(editingRecord.id, values)
        if (res.success) {
            toast.success("Registro actualizado")
            setIsEditOpen(false)

            // Update detail modal if open
            if (selectedMonthGroup) {
                const updatedItems = selectedMonthGroup.items.map((i: any) =>
                    i.id === editingRecord.id ? { ...i, ...values } : i
                )
                setSelectedMonthGroup({ ...selectedMonthGroup, items: updatedItems })
            }

            await fetchRecords()
            onRefresh()
            refreshDashboard()
        } else {
            toast.error("Error al actualizar")
        }
        setSubmitting(false)
    }

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b">
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Gestión de Estadísticas
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Agregar Datos
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Agregar Estadísticas Mensuales</DialogTitle>
                            <DialogDescription>
                                Ingrese la información para un nuevo período.
                            </DialogDescription>
                        </DialogHeader>

                        {alreadyExists && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Mes ya registrado</AlertTitle>
                                <AlertDescription>
                                    Ya existen registros para {months.find(m => m.value === watchMonth)?.label} {watchYear}.
                                    Por favor, usa la opción de editar en la tabla.
                                </AlertDescription>
                            </Alert>
                        )}
                        {!alreadyExists && !checkingExistence && watchYear && watchMonth && (
                            <Alert className="mb-4 bg-emerald-50 border-emerald-200 text-emerald-800">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <AlertTitle>Disponible</AlertTitle>
                                <AlertDescription>Este mes está libre para nueva carga.</AlertDescription>
                            </Alert>
                        )}

                        <Form {...(form as any)}>
                            <form onSubmit={form.handleSubmit(onSubmit) as any} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="year" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Año</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="month" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mes</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid md:grid-cols-3 gap-6 pt-2">
                                    {/* Padel Indoor */}
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                        <h3 className="font-bold text-xs uppercase text-primary">Padel Indoor</h3>
                                        <FormField control={form.control} name="padel_indoor_courts" render={({ field }) => (
                                            <FormItem><FormLabel className="text-[10px]">Canchas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="padel_indoor_income" render={({ field }) => (
                                            <FormItem><FormLabel className="text-[10px]">Ingresos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    {/* Padel Outdoor */}
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                        <h3 className="font-bold text-xs uppercase text-primary">Padel Outdoor</h3>
                                        <FormField control={form.control} name="padel_outdoor_courts" render={({ field }) => (
                                            <FormItem><FormLabel className="text-[10px]">Canchas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="padel_outdoor_income" render={({ field }) => (
                                            <FormItem><FormLabel className="text-[10px]">Ingresos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    {/* Fútbol */}
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                        <h3 className="font-bold text-xs uppercase text-primary">Fútbol</h3>
                                        <FormField control={form.control} name="futbol_courts" render={({ field }) => (
                                            <FormItem><FormLabel className="text-[10px]">Canchas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="futbol_income" render={({ field }) => (
                                            <FormItem><FormLabel className="text-[10px]">Ingresos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="w-full" disabled={alreadyExists || submitting || checkingExistence}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {alreadyExists ? "Mes ya registrado" : "Guardar Estadísticas"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
                {loadingRecords ? (
                    <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Período</TableHead>
                                    <TableHead>Total Canchas</TableHead>
                                    <TableHead>Ingreso Total</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupedRecords.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No hay registros cargados.</TableCell></TableRow>
                                ) : (
                                    groupedRecords.map((group) => (
                                        <TableRow key={group.id} className="hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => {
                                            setSelectedMonthGroup(group)
                                            setIsDetailOpen(true)
                                        }}>
                                            <TableCell className="font-bold">
                                                {months.find(m => m.value === group.month.toString())?.label} {group.year}
                                            </TableCell>
                                            <TableCell>{group.totalCourts} canchas</TableCell>
                                            <TableCell className="text-emerald-600 font-semibold">${Number(group.totalIncome).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Detalles
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Monthly Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Estadísticas de {months.find(m => m.value === selectedMonthGroup?.month.toString())?.label} {selectedMonthGroup?.year}
                        </DialogTitle>
                        <DialogDescription>
                            Desglose por disciplina deportiva.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Disciplina</TableHead>
                                    <TableHead>Canchas</TableHead>
                                    <TableHead>Ingresos</TableHead>
                                    <TableHead className="text-right">Herramientas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedMonthGroup?.items.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium capitalize">{item.sport.replace("_", " ")}</TableCell>
                                        <TableCell>{item.courts_rented}</TableCell>
                                        <TableCell>${Number(item.total_income).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingRecord(item)
                                                    editForm.setValue("courts_rented", item.courts_rented)
                                                    editForm.setValue("total_income", item.total_income)
                                                    setIsEditOpen(true)
                                                }}>
                                                    <Pencil className="h-3.5 w-3.5 text-primary" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-destructive/10 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Está profesionalmente seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción eliminará el registro de **{item.sport.replace("_", " ")}** permanentemente.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={() => setDeleteId(null)} disabled={submitting}>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                                                onClick={(e) => handleDelete(item.id, e)}
                                                                disabled={submitting}
                                                            >
                                                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Confirmar Eliminación
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 p-4 bg-muted/30 rounded-lg flex justify-between items-center font-bold">
                        <span>Total del Mes</span>
                        <span className="text-primary text-lg">${Number(selectedMonthGroup?.totalIncome).toLocaleString()}</span>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Item Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Disciplina</DialogTitle>
                        <DialogDescription>
                            Modificando {editingRecord?.sport.replace("_", " ")}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...(editForm as any)}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit) as any} className="space-y-4">
                            <FormField control={editForm.control} name="courts_rented" render={({ field }) => (
                                <FormItem><FormLabel>Canchas Alquiladas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={editForm.control} name="total_income" render={({ field }) => (
                                <FormItem><FormLabel>Ingresos Totales</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar Registro
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
