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
import { getAllTenants, createTenant, deleteTenant, upsertTenantIncome, getTenantIncomeByMonth, getAllTenantIncomes, deleteTenantIncome } from "@/lib/tenants.service"
import { Loader2, Plus, Users, Trash2, DollarSign, Calendar, Pencil } from "lucide-react"
import { months, years, defaultMonth, defaultYear } from "@/utils/utils"
import { Tenant } from "@/types"

// Schema para nuevo inquilino
const tenantSchema = z.object({
    name: z.string().min(2, "Mínimo 2 caracteres"),
})

// Schema para ingreso mensual
const incomeSchema = z.object({
    tenant_id: z.string().min(1, "Seleccione un inquilino"),
    year: z.string().min(1, "Seleccione el año"),
    month: z.string().min(1, "Seleccione el mes"),
    total_income: z.coerce.number().min(0, "Mínimo 0"),
})

type TenantFormValues = z.infer<typeof tenantSchema>
type IncomeFormValues = z.infer<typeof incomeSchema>

export function TenantsManagement({ onRefresh }: { onRefresh: () => void }) {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [loadingTenants, setLoadingTenants] = useState(true)
    const [incomes, setIncomes] = useState<any[]>([])
    const [loadingIncomes, setLoadingIncomes] = useState(true)
    const [isAddTenantOpen, setIsAddTenantOpen] = useState(false)
    const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingIncome, setEditingIncome] = useState<any>(null)

    const tenantForm = useForm<TenantFormValues>({
        resolver: zodResolver(tenantSchema) as any,
        defaultValues: { name: "" }
    })

    const incomeForm = useForm<IncomeFormValues>({
        resolver: zodResolver(incomeSchema) as any,
        defaultValues: {
            tenant_id: "",
            year: defaultYear,
            month: defaultMonth,
            total_income: 0
        }
    })

    const fetchTenants = async () => {
        setLoadingTenants(true)
        const res = await getAllTenants()
        if (res.success) setTenants(res.data || [])
        setLoadingTenants(false)
    }

    const fetchIncomes = async () => {
        setLoadingIncomes(true)
        const res = await getAllTenantIncomes()
        if (res.success) setIncomes(res.data || [])
        setLoadingIncomes(false)
    }

    useEffect(() => {
        fetchTenants()
        fetchIncomes()
    }, [])

    const onAddTenant = async (values: TenantFormValues) => {
        setSubmitting(true)
        const res = await createTenant(values.name)
        if (res.success) {
            toast.success("Inquilino creado correctamente")
            fetchTenants()
            setIsAddTenantOpen(false)
            tenantForm.reset()
            onRefresh()
        } else {
            toast.error("Error al crear inquilino")
        }
        setSubmitting(false)
    }

    const onAddIncome = async (values: IncomeFormValues) => {
        setSubmitting(true)
        const res = await upsertTenantIncome(
            values.tenant_id,
            parseInt(values.year),
            parseInt(values.month),
            values.total_income
        )
        if (res.success) {
            toast.success(editingIncome ? "Ingreso actualizado correctamente" : "Ingreso registrado correctamente")
            setIsAddIncomeOpen(false)
            setEditingIncome(null)
            incomeForm.reset({
                tenant_id: "",
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
        const res = await deleteTenantIncome(id)
        if (res.success) {
            toast.success("Pago eliminado correctamente")
            fetchIncomes()
            onRefresh()
        } else {
            toast.error("Error al eliminar el pago")
        }
        setSubmitting(false)
    }

    const handleDeleteTenant = async (id: string) => {
        const res = await deleteTenant(id)
        if (res.success) {
            toast.success("Inquilino eliminado")
            fetchTenants()
            onRefresh()
        } else {
            toast.error("Error al eliminar")
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gestión de Inquilinos (Lista) */}
            <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Inquilinos</CardTitle>
                        <CardDescription>Directorio de arrendatarios.</CardDescription>
                    </div>
                    <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                                <Plus className="h-4 w-4 mr-1" /> Nuevo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nuevo Inquilino</DialogTitle>
                                <DialogDescription>Ingrese el nombre del nuevo inquilino del complejo.</DialogDescription>
                            </DialogHeader>
                            <Form {...tenantForm}>
                                <form onSubmit={tenantForm.handleSubmit(onAddTenant)} className="space-y-4">
                                    <FormField
                                        control={tenantForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl><Input placeholder="Ej: Buffet de la Meca" {...field} /></FormControl>
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
                <CardContent className="pt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingTenants ? (
                                <TableRow><TableCell colSpan={2} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                            ) : tenants.length === 0 ? (
                                <TableRow><TableCell colSpan={2} className="text-center py-10 text-muted-foreground uppercase text-xs font-bold">No hay inquilinos</TableCell></TableRow>
                            ) : tenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="font-medium">{tenant.name}</TableCell>
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
                                                    <AlertDialogDescription>Esta acción eliminará al inquilino y todos sus registros históricos de ingresos.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteTenant(tenant.id)} className="bg-rose-600 hover:bg-rose-700">Eliminar</AlertDialogAction>
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

            {/* Cargo de Ingresos */}
            <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Registro de Cobros</CardTitle>
                        <CardDescription>Cargar ingresos mensuales por alquiler.</CardDescription>
                    </div>
                    <Dialog open={isAddIncomeOpen} onOpenChange={(open) => {
                        setIsAddIncomeOpen(open)
                        if (!open) {
                            setEditingIncome(null)
                            incomeForm.reset({
                                tenant_id: "",
                                year: defaultYear,
                                month: defaultMonth,
                                total_income: 0
                            })
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                                <DollarSign className="h-4 w-4 mr-1" /> Registrar Pago
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingIncome ? "Editar Ingreso" : "Registrar Ingreso"}</DialogTitle>
                                <DialogDescription>{editingIncome ? "Modifique los datos del cobro registrado." : "Seleccione el inquilino y complete el monto del alquiler."}</DialogDescription>
                            </DialogHeader>
                            <Form {...incomeForm}>
                                <form onSubmit={incomeForm.handleSubmit(onAddIncome)} className="space-y-4">
                                    <FormField
                                        control={incomeForm.control}
                                        name="tenant_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Inquilino</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!!editingIncome}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione inquilino" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
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
                                                <FormLabel>Monto del Alquiler</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : editingIncome ? "Actualizar Pago" : "Guardar Registro"}
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
                                    <TableHead>Inquilino</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingIncomes ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                                ) : incomes.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground uppercase text-xs font-bold">No hay cobros registrados</TableCell></TableRow>
                                ) : incomes.map((income) => (
                                    <TableRow key={income.id}>
                                        <TableCell className="font-medium">{income.tenants?.name || '---'}</TableCell>
                                        <TableCell>{months.find(m => m.value === income.month.toString())?.label} {income.year}</TableCell>
                                        <TableCell className="font-bold text-emerald-600">${Number(income.total_income).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                                                    onClick={() => {
                                                        setEditingIncome(income)
                                                        incomeForm.reset({
                                                            tenant_id: income.tenant_id,
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
                                                            <AlertDialogTitle>¿Eliminar cobro?</AlertDialogTitle>
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
