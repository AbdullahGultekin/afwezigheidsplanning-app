import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const KM_TARIEF = 0.40

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Fetch maand km-stand met werknemer gegevens
    const maandKmStand = await prisma.maandKmStand.findUnique({
      where: { id },
      include: {
        werknemer: true
      }
    })

    if (!maandKmStand) {
      return NextResponse.json({ error: 'Maand km-stand not found' }, { status: 404 })
    }

    // Fetch kilometers voor deze maand
    const startDate = new Date(maandKmStand.jaar, maandKmStand.maand - 1, 1)
    const endDate = new Date(maandKmStand.jaar, maandKmStand.maand, 0)

    const kilometers = await prisma.kilometer.findMany({
      where: {
        werknemerId: maandKmStand.werknemerId,
        datum: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        datum: 'asc'
      }
    })

    // Create PDF
    const doc = new jsPDF()

    // Titel
    doc.setFontSize(20)
    doc.text('Kilometerdeclaratie', 105, 20, { align: 'center' })

    // Werknemer informatie
    doc.setFontSize(12)
    doc.text(`Werknemer: ${maandKmStand.werknemer.naam}`, 20, 40)
    if (maandKmStand.werknemer.nummerplaat) {
      doc.text(`Nummerplaat: ${maandKmStand.werknemer.nummerplaat}`, 20, 48)
    }
    
    const maandNaam = format(new Date(maandKmStand.jaar, maandKmStand.maand - 1), 'MMMM yyyy', { locale: nl })
    doc.text(`Periode: ${maandNaam}`, 20, 56)

    // Km-standen
    doc.setFillColor(240, 240, 240)
    doc.rect(20, 65, 170, 38, 'F')
    
    doc.setFontSize(11)
    doc.text('Kilometerstand begin maand:', 25, 73)
    doc.text(maandKmStand.beginKmStand.toLocaleString('nl-NL'), 100, 73)
    
    doc.text('Kilometerstand eind maand:', 25, 81)
    doc.text((maandKmStand.eindKmStand || 0).toLocaleString('nl-NL'), 100, 81)
    
    doc.text('Verschil:', 25, 89)
    const verschil = (maandKmStand.eindKmStand || 0) - maandKmStand.beginKmStand
    doc.setFont('helvetica', 'bold')
    doc.text(verschil.toLocaleString('nl-NL') + ' km', 100, 89)
    doc.setFont('helvetica', 'normal')
    
    if (maandKmStand.elkeDagGereden) {
      doc.text('Aantal dagen gereden:', 25, 97)
      doc.setFont('helvetica', 'bold')
      doc.text(maandKmStand.elkeDagGereden.toString() + ' dagen', 100, 97)
      doc.setFont('helvetica', 'normal')
    }

    // Details tabel
    if (kilometers.length > 0) {
      const tableData = kilometers.map((km) => [
        format(new Date(km.datum), 'dd-MM-yyyy', { locale: nl }),
        km.kilometers.toString(),
        `€${(km.kilometers * KM_TARIEF).toFixed(2)}`
      ])

      const tableStartY = maandKmStand.elkeDagGereden ? 113 : 105

      autoTable(doc, {
        startY: tableStartY,
        head: [['Datum', 'Kilometers', 'Bedrag']],
        body: tableData,
        foot: [[
          'Totaal',
          kilometers.reduce((sum, k) => sum + k.kilometers, 0).toString() + ' km',
          `€${kilometers.reduce((sum, k) => sum + (k.kilometers * KM_TARIEF), 0).toFixed(2)}`
        ]],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' }
      })
    }

    // Handtekening
    if (maandKmStand.handtekening && maandKmStand.getekendOp) {
      const finalY = (doc as any).lastAutoTable?.finalY || 105
      
      doc.text('Handtekening werknemer:', 20, finalY + 20)
      
      try {
        doc.addImage(maandKmStand.handtekening, 'PNG', 20, finalY + 25, 60, 30)
      } catch (error) {
        console.error('Error adding signature image:', error)
      }
      
      doc.setFontSize(9)
      doc.text(
        `Getekend op: ${format(new Date(maandKmStand.getekendOp), 'dd MMMM yyyy HH:mm', { locale: nl })}`,
        20,
        finalY + 58
      )
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128)
      doc.text(
        `Pagina ${i} van ${pageCount}`,
        105,
        285,
        { align: 'center' }
      )
      doc.text(
        `Tarief: €${KM_TARIEF.toFixed(2)} per km`,
        20,
        285
      )
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Kilometerdeclaratie_${maandKmStand.werknemer.naam}_${maandNaam}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

