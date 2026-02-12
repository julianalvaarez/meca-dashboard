"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDashboard } from "@/context/DashboardContext"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    getAllClothingStats, checkClothingStatsExistence, addClothingStats, deleteClothingStats, updateClothingStats
} from "@/lib/clothing.service"
import { Loader2, Plus, Pencil, Trash2, Shirt, AlertCircle, CheckCircle2 } from "lucide-react"

const formSchema = z.object({
    year: z.string().min(1, "Seleccione el año"),
    month: z.string().min(1, "Seleccione el mes"),
    total_income: z.coerce.number().min(0, "Mínimo 0"),
})

type FormValues = z.infer<typeof formSchema>

const months = [
    { value: "1", label: "Enero" }, { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" }, { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" }, { value: "6", label: "Junio" },
    { value: "7", label: "Julio" }, { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" }, { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
]

const years = ["2024", "2025", "2026"]

export function ClothingManagement({ onRefresh }: { onRefresh: () => void }) {
    const { refresh: refreshDashboard } = useDashboard()
    const [records, setRecords] = useState<any[]>([])
    const [loadingRecords, setLoadingRecords] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<any>(null)
    const [alreadyExists, setAlreadyExists] = useState(false)
    const [checkingExistence, setCheckingExistence] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            total_income: 0,
        }
    })

    const watchYear = useWatch({ control: form.control, name: "year" })
    const watchMonth = useWatch({ control: form.control, name: "month" })

    useEffect(() => {
        async function check() {
            if (watchYear && watchMonth && !editingRecord) {
                setCheckingExistence(true)
                const exists = await checkClothingStatsExistence(parseInt(watchYear), parseInt(watchMonth))
                setAlreadyExists(exists)
                setCheckingExistence(false)
            }
        }
        check()
    }, [watchYear, watchMonth, editingRecord])

    const fetchRecords = async () => {
        setLoadingRecords(true)
        const res = await getAllClothingStats()
        if (res.success) {
            setRecords(res.data || [])
        } else {
            toast.error("Error al cargar los registros")
        }
        setLoadingRecords(false)
    }

    useEffect(() => {
        fetchRecords()
    }, [])

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true)
        const dataToSave = {
            year: parseInt(values.year),
            month: parseInt(values.month),
            total_income: values.total_income,
        }

        const res = editingRecord
            ? await updateClothingStats(editingRecord.id, dataToSave)
            : await addClothingStats(dataToSave)

        if (res.success) {
            toast.success(editingRecord ? "Registro actualizado" : "Datos guardados correctamente")
            setIsAddOpen(false)
            setEditingRecord(null)
            form.reset()
            await fetchRecords()
            onRefresh()
            refreshDashboard()
        } else {
            toast.error("Error al procesar la solicitud")
        }
        setSubmitting(false)
    }

    const handleDelete = async (id: number) => {
        setSubmitting(true)
        const res = await deleteClothingStats(id)
        if (res.success) {
            toast.success("Registro eliminado")
            await fetchRecords()
            onRefresh()
            refreshDashboard()
        } else {
            toast.error("Error al eliminar el registro")
        }
        setSubmitting(false)
    }

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Shirt className="h-5 w-5 text-primary" />
                    Gestión de Indumentaria
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    setIsAddOpen(open)
                    if (!open) {
                        setEditingRecord(null)
                        form.reset()
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Agregar Datos
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingRecord ? "Editar Registro" : "Agregar Estadísticas de Indumentaria"}</DialogTitle>
                            <DialogDescription>
                                Ingrese el monto total de ventas para el período seleccionado.
                            </DialogDescription>
                        </DialogHeader>

                        {alreadyExists && !editingRecord && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Mes ya registrado</AlertTitle>
                                <AlertDescription>
                                    Ya existen registros para {months.find(m => m.value === watchMonth)?.label} {watchYear}.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Form {...(form as any)}>
                            <form onSubmit={form.handleSubmit(onSubmit) as any} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="year" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Año</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingRecord}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="month" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mes</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingRecord}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <FormField control={form.control} name="total_income" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ventas Totales ($)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="w-full" disabled={(alreadyExists && !editingRecord) || submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingRecord ? "Actualizar" : "Guardar Registro"}
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
                                    <TableHead>Ingresos Totales</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No hay registros cargados.</TableCell></TableRow>
                                ) : (
                                    records.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-muted/30 transition-colors group">
                                            <TableCell className="font-bold">
                                                {months.find(m => m.value === record.month.toString())?.label} {record.year}
                                            </TableCell>
                                            <TableCell className="text-emerald-600 font-bold">${Number(record.total_income).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => {
                                                        setEditingRecord(record)
                                                        form.setValue("year", record.year.toString())
                                                        form.setValue("month", record.month.toString())
                                                        form.setValue("total_income", record.total_income)
                                                        setIsAddOpen(true)
                                                    }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-destructive/10 cursor-pointer">
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción eliminará el registro de {months.find(m => m.value === record.month.toString())?.label} {record.year} permanentemente.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                                                    onClick={() => handleDelete(record.id)}
                                                                    disabled={submitting}
                                                                >
                                                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
