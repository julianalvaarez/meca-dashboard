import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function generateMonthlyPDF(data: { sports: any[], food: any[], clothing: any[], year: number, month: number }) {
    const doc = new jsPDF()
    const monthName = months[data.month - 1]
    const title = `Reporte Mensual - ${monthName} ${data.year}`

    // Header
    doc.setFontSize(22)
    doc.setTextColor(15, 23, 42) // Slate 900
    doc.text("LA MECA CDA", 105, 20, { align: "center" })

    doc.setFontSize(16)
    doc.text(title, 105, 30, { align: "center" })

    doc.setDrawColor(200, 200, 200)
    doc.line(20, 35, 190, 35)

    let currentY = 45

    // Summary Section
    const sportsTotal = data.sports.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
    const foodIncome = data.food.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
    const foodExpense = data.food.reduce((acc, curr) => acc + Number(curr.total_expense || 0), 0)
    const foodNet = foodIncome - foodExpense
    const clothingTotal = data.clothing.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
    const grandTotal = sportsTotal + foodNet + clothingTotal

    doc.setFontSize(14)
    doc.text("Resumen (Ingresos Netos)", 20, currentY)
    currentY += 10

    autoTable(doc, {
        startY: currentY,
        head: [['Sector', 'Detalle', 'Monto']],
        body: [
            ['Deportes', 'Alquiler de canchas', `$${sportsTotal.toLocaleString()}`],
            ['Gastronomía', 'Ingreso Neto (Ventas - Costos)', `$${foodNet.toLocaleString()}`],
            ['Indumentaria', 'Venta de productos', `$${clothingTotal.toLocaleString()}`],
            ['TOTAL', 'Balance Final del Mes', `$${grandTotal.toLocaleString()}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] as any, textColor: 255 },
        styles: { fontSize: 10 }
    })

    currentY = (doc as any).lastAutoTable.finalY + 20

    // Detailed Sports Section
    doc.setFontSize(14)
    doc.text("Detalle: Deportes", 20, currentY)
    currentY += 5

    autoTable(doc, {
        startY: currentY,
        head: [['Deporte', 'Canchas Alquiladas', 'Ingresos']],
        body: data.sports.map(s => [
            s.sport,
            s.courts_rented,
            `$${Number(s.total_income).toLocaleString()}`
        ]),
        headStyles: { fillColor: [16, 185, 129] as any }, // Emerald 500
        styles: { fontSize: 9 }
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Detailed Food Section
    doc.setFontSize(14)
    doc.text("Detalle: Gastronomía", 20, currentY)
    currentY += 5

    autoTable(doc, {
        startY: currentY,
        head: [['Ventas Totales', 'Gastos Insumos', 'Beneficio Neto']],
        body: data.food.map(f => [
            `$${Number(f.total_income).toLocaleString()}`,
            `$${Number(f.total_expense).toLocaleString()}`,
            `$${(Number(f.total_income) - Number(f.total_expense)).toLocaleString()}`
        ]),
        headStyles: { fillColor: [59, 130, 246] as any }, // Blue 500
        styles: { fontSize: 9 }
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Detailed Clothing Section
    doc.setFontSize(14)
    doc.text("Detalle: Indumentaria", 20, currentY)
    currentY += 5

    autoTable(doc, {
        startY: currentY,
        head: [['Ventas Totales']],
        body: data.clothing.map(c => [
            `$${Number(c.total_income).toLocaleString()}`
        ]),
        headStyles: { fillColor: [139, 92, 246] as any }, // Violet 500
        styles: { fontSize: 9 }
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 285)
        doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: "right" })
    }

    doc.save(`Reporte_Meca_${monthName}_${data.year}.pdf`)
}
