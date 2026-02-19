"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getAllEvents, createEvent, deleteEvent, upsertEventIncome, getAllEventIncomes, deleteEventIncome } from "@/lib/events.service"
import { Loader2, Plus, PartyPopper, Trash2, DollarSign, Pencil } from "lucide-react"
import { months, years, defaultMonth, defaultYear } from "@/utils/utils"
import { Event } from "@/types"

const eventSchema = z.object({
    name: z.string().min(2, "Mínimo 2 caracteres"),
})

const incomeSchema = z.object({
    event_id: z.string().min(1, "Seleccione un evento"),
    year: z.string().min(1, "Seleccione el año"),
    month: z.string().min(1, "Seleccione el mes"),
    total_income: z.coerce.number().min(0, "Mínimo 0"),
})

type EventFormValues = z.infer<typeof eventSchema>
type IncomeFormValues = z.infer<typeof incomeSchema>

export function EventsManagement({ onRefresh }: { onRefresh: () => void }) {
    const [events, setEvents] = useState<Event[]>([])
    const [loadingEvents, setLoadingEvents] = useState(true)
    const [incomes, setIncomes] = useState<any[]>([])
    const [loadingIncomes, setLoadingIncomes] = useState(true)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingIncome, setEditingIncome] = useState<any>(null)

    const eventForm = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema) as any,
        defaultValues: { name: "" }
    })

    const incomeForm = useForm<IncomeFormValues>({
        resolver: zodResolver(incomeSchema) as any,
        defaultValues: {
            event_id: "",
            year: defaultYear,
            month: defaultMonth,
            total_income: 0
        }
    })

    const fetchEvents = async () => {
        setLoadingEvents(true)
        const res = await getAllEvents()
        setEvents(res || [])
        setLoadingEvents(false)
    }

    const fetchIncomes = async () => {
        setLoadingIncomes(true)
        const res = await getAllEventIncomes()
        if (res.success) setIncomes(res.data || [])
        setLoadingIncomes(false)
    }

    useEffect(() => {
        fetchEvents()
        fetchIncomes()
    }, [])

    const onAddEvent = async (values: EventFormValues) => {
        setSubmitting(true)
        const res = await createEvent(values.name)
        if (res.success) {
            toast.success("Evento creado correctamente")
            fetchEvents()
            setIsAddEventOpen(false)
            eventForm.reset()
            onRefresh()
        } else {
            toast.error("Error al crear evento")
        }
        setSubmitting(false)
    }

    const onAddIncome = async (values: IncomeFormValues) => {
        setSubmitting(true)
        const res = await upsertEventIncome(
            values.event_id,
            parseInt(values.year),
            parseInt(values.month),
            values.total_income
        )
        if (res.success) {
            toast.success(editingIncome ? "Ingreso actualizado correctamente" : "Ingreso registrado correctamente")
            setIsAddIncomeOpen(false)
            setEditingIncome(null)
            incomeForm.reset({
                event_id: "",
                year: defaultYear,
                month: defaultMonth,
                total_income: 0
            })
            fetchIncomes()
            onRefresh()
        } else {
            toast.error("Error al registrar ingreso")
        }
        setSubmitting(false)
    }

    const handleDeleteIncome = async (id: string) => {
        setSubmitting(true)
        const res = await deleteEventIncome(id)
        if (res.success) {
            toast.success("Registro eliminado correctamente")
            fetchIncomes()
            onRefresh()
        } else {
            toast.error("Error al eliminar el registro")
        }
        setSubmitting(false)
    }

    const handleDeleteEvent = async (id: string) => {
        const res = await deleteEvent(id)
        if (res.success) {
            toast.success("Evento eliminado")
            fetchEvents()
            onRefresh()
        } else {
            toast.error("Error al eliminar")
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Eventos</CardTitle>
                        <CardDescription>Gestión de eventos del complejo.</CardDescription>
                    </div>
                    <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                                <Plus className="h-4 w-4 mr-1" /> Nuevo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nuevo Evento</DialogTitle>
                                <DialogDescription>Ingrese el nombre del nuevo evento.</DialogDescription>
                            </DialogHeader>
                            <Form {...eventForm}>
                                <form onSubmit={eventForm.handleSubmit(onAddEvent)} className="space-y-4">
                                    <FormField
                                        control={eventForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl><Input placeholder="Ej: Torneo de Verano" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Crear"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="pt-4 max-h-[400px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingEvents ? (
                                <TableRow><TableCell colSpan={2} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                            ) : events.length === 0 ? (
                                <TableRow><TableCell colSpan={2} className="text-center py-10 text-muted-foreground uppercase text-xs font-bold">No hay eventos</TableCell></TableRow>
                            ) : events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.name}</TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>Esta acción eliminará el evento y todos sus registros históricos de ingresos.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-rose-600 hover:bg-rose-700">Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Registro de Ingresos</CardTitle>
                        <CardDescription>Cargar ingresos mensuales por evento.</CardDescription>
                    </div>
                    <Dialog open={isAddIncomeOpen} onOpenChange={(open) => {
                        setIsAddIncomeOpen(open)
                        if (!open) {
                            setEditingIncome(null)
                            incomeForm.reset({
                                event_id: "",
                                year: defaultYear,
                                month: defaultMonth,
                                total_income: 0
                            })
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 cursor-pointer">
                                <DollarSign className="h-4 w-4 mr-1" /> Registrar Ingreso
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingIncome ? "Editar Ingreso" : "Registrar Ingreso"}</DialogTitle>
                                <DialogDescription>{editingIncome ? "Modifique los datos del ingreso registrado." : "Seleccione el evento y complete el monto del ingreso."}</DialogDescription>
                            </DialogHeader>
                            <Form {...incomeForm}>
                                <form onSubmit={incomeForm.handleSubmit(onAddIncome)} className="space-y-4">
                                    <FormField
                                        control={incomeForm.control}
                                        name="event_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Evento</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!!editingIncome}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione evento" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={incomeForm.control}
                                            name="year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Año</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editingIncome}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={incomeForm.control}
                                            name="month"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mes</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editingIncome}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={incomeForm.control}
                                        name="total_income"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monto Ingresado</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : editingIncome ? "Actualizar" : "Guardar"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Evento</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingIncomes ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                                ) : incomes.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground uppercase text-xs font-bold">No hay ingresos registrados</TableCell></TableRow>
                                ) : incomes.map((income) => (
                                    <TableRow key={income.id}>
                                        <TableCell className="font-medium">{income.events?.name || '---'}</TableCell>
                                        <TableCell>{months.find(m => m.value === income.month.toString())?.label} {income.year}</TableCell>
                                        <TableCell className="font-bold text-orange-600">${Number(income.total_income).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                                                    onClick={() => {
                                                        setEditingIncome(income)
                                                        incomeForm.reset({
                                                            event_id: income.event_id,
                                                            year: income.year.toString(),
                                                            month: income.month.toString(),
                                                            total_income: income.total_income
                                                        })
                                                        setIsAddIncomeOpen(true)
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                                            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteIncome(income.id)}
                                                                className="bg-rose-600 hover:bg-rose-700"
                                                                disabled={submitting}
                                                            >
                                                                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Eliminar"}
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
                </CardContent>
            </Card>
        </div>
    )
}
