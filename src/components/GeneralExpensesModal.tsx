"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { upsertGeneralExpense } from "@/lib/general_expenses.service"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface GeneralExpensesModalProps {
    isOpen: boolean
    onClose: () => void
    year: number
    month: number
    initialAmount: number
    onSuccess: () => void
}

export function GeneralExpensesModal({ isOpen, onClose, year, month, initialAmount, onSuccess }: GeneralExpensesModalProps) {
    const [amount, setAmount] = useState<string>(initialAmount.toString())
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setAmount(initialAmount.toString())
    }, [initialAmount, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Replace comma with dot for decimal compatibility
        const normalizedAmount = amount.replace(',', '.')
        const finalAmount = parseFloat(normalizedAmount)

        if (isNaN(finalAmount)) {
            toast.error("Monto inválido")
            setLoading(false)
            return
        }

        const res = await upsertGeneralExpense({
            year,
            month,
            total_expenses: finalAmount
        })

        if (res.success) {
            toast.success("Gastos actualizados correctamente")
            onSuccess()
            onClose()
        } else {
            console.error("Error upserting general expense:", res.error)
            toast.error(typeof res.error === 'string' ? res.error : "Error al actualizar gastos")
        }
        setLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gestionar Gastos Generales</DialogTitle>
                    <DialogDescription>
                        Ingrese el total de gastos para el mes seleccionado.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Monto
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
