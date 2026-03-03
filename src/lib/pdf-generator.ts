import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function generateMonthlyPDF(data: {
    sports: any[],
    food: { income: any[], expenses: any[] },
    clothing: any[],
    tenants: any[],
    events: any[],
    generalExpenses: any,
    year: number,
    month: number
}) {
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

    // Food calculations
    const foodIncomeTotal = data.food.income.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
    const foodExpenseTotal = data.food.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const foodNet = foodIncomeTotal - foodExpenseTotal

    const clothingTotal = data.clothing.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
    const tenantsTotal = data.tenants.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
    const eventsTotal = data.events.reduce((acc, curr) => acc + Number(curr.total_income || 0), 0)
    const generalExpensesTotal = Number(data.generalExpenses?.total_expenses || 0)
    const grandTotal = (sportsTotal + foodNet + clothingTotal + tenantsTotal + eventsTotal) - generalExpensesTotal

    const sportsSectorIncome = sportsTotal + clothingTotal + tenantsTotal + eventsTotal
    const sportsSectorNet = sportsSectorIncome - generalExpensesTotal

    doc.setFontSize(14)
    doc.text("Resumen de Balances por Sector", 20, currentY)
    currentY += 10

    autoTable(doc, {
        startY: currentY,
        head: [['Sector', 'Concepto', 'Monto']],
        body: [
            ['GASTRONOMÍA', 'Ingresos por Ventas', `$${foodIncomeTotal.toLocaleString()}`],
            ['GASTRONOMÍA', 'Gastos Operativos', `$${foodExpenseTotal.toLocaleString()}`],
            ['GASTRONOMÍA', 'Balance Gastronomía', `$${foodNet.toLocaleString()}`],
            ['', '', ''], // Spacer
            ['DEPORTIVO', 'Ingresos Deportes (Canchas)', `$${sportsTotal.toLocaleString()}`],
            ['DEPORTIVO', 'Ingresos Indumentaria', `$${clothingTotal.toLocaleString()}`],
            ['DEPORTIVO', 'Ingresos Inquilinos', `$${tenantsTotal.toLocaleString()}`],
            ['DEPORTIVO', 'Ingresos Eventos', `$${eventsTotal.toLocaleString()}`],
            ['DEPORTIVO', 'Total Ingresos Deportivos', `$${sportsSectorIncome.toLocaleString()}`],
            ['DEPORTIVO', 'Gastos Deportivos', `$${generalExpensesTotal.toLocaleString()}`],
            ['DEPORTIVO', 'Balance Deportivo', `$${sportsSectorNet.toLocaleString()}`],
            ['', '', ''], // Spacer
            ['TOTAL', 'BALANCE TOTAL GLOBAL', `$${grandTotal.toLocaleString()}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] as any, textColor: 255 },
        styles: { fontSize: 10 },
        didParseCell: function (data) {
            // Bold indices: 2 (Balance Gastro), 9 (Balance Deportivo), 11 (Balance Global)
            if (data.row.index === 2 || data.row.index === 10 || data.row.index === 12) {
                data.cell.styles.fontStyle = 'bold';
            }
        }
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

    const categoryNames: any = {
        materia_prima: 'Materia Prima',
        sueldos: 'Sueldos',
        impuestos: 'Impuestos',
        otros: 'Otros'
    }

    autoTable(doc, {
        startY: currentY,
        head: [['Concepto', 'Categoría', 'Monto']],
        body: [
            ...data.food.income.map(inc => ['Ingreso por Ventas', '-', `$${Number(inc.total_income).toLocaleString()}`]),
            ...data.food.expenses.map(exp => ['Gasto Operativo', categoryNames[exp.category] || exp.category, `$${Number(exp.amount).toLocaleString()}`]),
            [{ content: 'BALANCE NETO', colSpan: 2, styles: { fontStyle: 'bold' } }, { content: `$${foodNet.toLocaleString()}`, styles: { fontStyle: 'bold' } }]
        ],
        headStyles: { fillColor: [59, 130, 246] as any }, // Blue 500
        styles: { fontSize: 9 }
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Detailed Tenants Section
    doc.setFontSize(14)
    doc.text("Detalle: Inquilinos", 20, currentY)
    currentY += 5

    autoTable(doc, {
        startY: currentY,
        head: [['Inquilino', 'Monto']],
        body: data.tenants.map(t => [
            t.tenants?.name || 'Inquilino',
            `$${Number(t.total_income).toLocaleString()}`
        ]),
        headStyles: { fillColor: [236, 72, 153] as any }, // Pink 500
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

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Detailed Events Section
    doc.setFontSize(14)
    doc.text("Detalle: Eventos", 20, currentY)
    currentY += 5

    autoTable(doc, {
        startY: currentY,
        head: [['Evento', 'Monto']],
        body: data.events.map(e => [
            e.events?.name || 'Evento',
            `$${Number(e.total_income).toLocaleString()}`
        ]),
        headStyles: { fillColor: [245, 158, 11] as any }, // Amber 500
        styles: { fontSize: 9 }
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Detailed Sports Expenses Section
    doc.setFontSize(14)
    doc.text("Detalle: Gastos del Sector Deportivo", 20, currentY)
    doc.setFontSize(10)
    doc.setTextColor(100)
    currentY += 5
    doc.text("Consolidado de gastos operativos (Deportes, Indumentaria, Inquilinos, Eventos)", 20, currentY)
    doc.setTextColor(0)
    currentY += 5

    autoTable(doc, {
        startY: currentY,
        head: [['Concepto', 'Monto']],
        body: [
            ['Gastos de Operación y Mantenimiento', `$${Number(data.generalExpenses?.total_expenses || 0).toLocaleString()}`],
            [{ content: 'TOTAL GASTOS DEPORTIVOS', styles: { fontStyle: 'bold' } }, { content: `$${Number(data.generalExpenses?.total_expenses || 0).toLocaleString()}`, styles: { fontStyle: 'bold' } }]
        ],
        headStyles: { fillColor: [239, 68, 68] as any }, // Red 500
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

