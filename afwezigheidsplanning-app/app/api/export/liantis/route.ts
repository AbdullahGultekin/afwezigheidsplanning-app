import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

// GET - Export data voor Liantis
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const maand = searchParams.get('maand') // Format: YYYY-MM
    
    if (!maand) {
      return NextResponse.json({ error: 'Maand parameter is required (format: YYYY-MM)' }, { status: 400 })
    }

    const [year, month] = maand.split('-')
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

    // Haal alle werknemers op
    const werknemers = await prisma.werknemer.findMany({
      where: { actief: true },
      orderBy: { naam: 'asc' }
    })

    // Haal urenregistraties op voor de maand
    const urenregistraties = await prisma.urenregistratie.findMany({
      where: {
        datum: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        werknemer: true
      }
    })

    // Haal afwezigheden op voor de maand
    const afwezigheden = await prisma.afwezigheid.findMany({
      where: {
        OR: [
          {
            startDatum: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            eindDatum: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      },
      include: {
        werknemer: true
      }
    })

    // Haal kilometers op voor de maand
    const kilometers = await prisma.kilometer.findMany({
      where: {
        datum: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        werknemer: true
      }
    })

    // Maak Excel data
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
    const excelData: any[] = []

    // Header row
    const headerRow: any = {
      'Naam werknemer': 'Naam werknemer'
    }
    for (let day = 1; day <= daysInMonth; day++) {
      headerRow[`Dag ${day}`] = day
    }
    headerRow['Totaal uren'] = 'Totaal uren'
    excelData.push(headerRow)

    // Data rows per werknemer
    for (const werknemer of werknemers) {
      const row: any = {
        'Naam werknemer': werknemer.naam
      }

      let totaalUren = 0

      for (let day = 1; day <= daysInMonth; day++) {
        const datum = new Date(parseInt(year), parseInt(month) - 1, day)
        
        // Check voor afwezigheid op deze dag
        const afwezigheid = afwezigheden.find(a => 
          a.werknemerId === werknemer.id &&
          new Date(a.startDatum) <= datum &&
          new Date(a.eindDatum) >= datum
        )

        if (afwezigheid) {
          // Toon afwezigheidstype
          const typeMap: any = {
            'VAKANTIE': 'V',
            'ZIEK': 'Z',
            'PERSOONLIJK': 'P',
            'AANGEPAST_1': 'A1',
            'AANGEPAST_2': 'A2'
          }
          row[`Dag ${day}`] = typeMap[afwezigheid.type] || afwezigheid.type
        } else {
          // Check voor urenregistratie
          const uren = urenregistraties.find(u => 
            u.werknemerId === werknemer.id &&
            new Date(u.datum).toDateString() === datum.toDateString()
          )

          if (uren) {
            row[`Dag ${day}`] = uren.uren
            totaalUren += uren.uren
          } else {
            // Check of het een weekend is
            const dayOfWeek = datum.getDay()
            row[`Dag ${day}`] = (dayOfWeek === 0 || dayOfWeek === 6) ? 'W' : ''
          }
        }
      }

      row['Totaal uren'] = totaalUren
      excelData.push(row)
    }

    // Totaal row
    const totaalRow: any = {
      'Naam werknemer': 'TOTAAL'
    }
    let grandTotal = 0

    for (let day = 1; day <= daysInMonth; day++) {
      let dayTotal = 0
      for (const werknemer of werknemers) {
        const datum = new Date(parseInt(year), parseInt(month) - 1, day)
        const uren = urenregistraties.find(u => 
          u.werknemerId === werknemer.id &&
          new Date(u.datum).toDateString() === datum.toDateString()
        )
        if (uren) {
          dayTotal += uren.uren
        }
      }
      totaalRow[`Dag ${day}`] = dayTotal || ''
      grandTotal += dayTotal
    }
    totaalRow['Totaal uren'] = grandTotal
    excelData.push(totaalRow)

    // Maak Excel workbook
    const wb = XLSX.utils.book_new()
    
    // Uren werkblad
    const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: true })
    XLSX.utils.book_append_sheet(wb, ws, 'Uren')

    // Kilometers werkblad
    const KM_TARIEF = 0.40 // €0.40 per kilometer
    const kmData: any[] = []
    
    // Header row
    const kmHeaderRow: any = {
      'Naam werknemer': 'Naam werknemer'
    }
    for (let day = 1; day <= daysInMonth; day++) {
      kmHeaderRow[`Dag ${day}`] = day
    }
    kmHeaderRow['Totaal KM'] = 'Totaal KM'
    kmHeaderRow['Te Betalen (€)'] = 'Te Betalen (€)'
    kmData.push(kmHeaderRow)

    // Data rows per werknemer voor kilometers
    for (const werknemer of werknemers) {
      const kmRow: any = {
        'Naam werknemer': werknemer.naam
      }

      let totaalKm = 0

      for (let day = 1; day <= daysInMonth; day++) {
        const datum = new Date(parseInt(year), parseInt(month) - 1, day)
        
        // Check voor kilometers op deze dag
        const km = kilometers.find(k => 
          k.werknemerId === werknemer.id &&
          new Date(k.datum).toDateString() === datum.toDateString()
        )

        if (km) {
          kmRow[`Dag ${day}`] = km.kilometers
          totaalKm += km.kilometers
        } else {
          kmRow[`Dag ${day}`] = ''
        }
      }

      kmRow['Totaal KM'] = totaalKm
      kmRow['Te Betalen (€)'] = parseFloat((totaalKm * KM_TARIEF).toFixed(2))
      kmData.push(kmRow)
    }

    // Totaal row voor kilometers
    const kmTotaalRow: any = {
      'Naam werknemer': 'TOTAAL'
    }
    let kmGrandTotal = 0

    for (let day = 1; day <= daysInMonth; day++) {
      let dayKmTotal = 0
      for (const werknemer of werknemers) {
        const datum = new Date(parseInt(year), parseInt(month) - 1, day)
        const km = kilometers.find(k => 
          k.werknemerId === werknemer.id &&
          new Date(k.datum).toDateString() === datum.toDateString()
        )
        if (km) {
          dayKmTotal += km.kilometers
        }
      }
      kmTotaalRow[`Dag ${day}`] = dayKmTotal || ''
      kmGrandTotal += dayKmTotal
    }
    kmTotaalRow['Totaal KM'] = kmGrandTotal
    kmTotaalRow['Te Betalen (€)'] = parseFloat((kmGrandTotal * KM_TARIEF).toFixed(2))
    kmData.push(kmTotaalRow)

    const wsKm = XLSX.utils.json_to_sheet(kmData, { skipHeader: true })
    XLSX.utils.book_append_sheet(wb, wsKm, 'Kilometers')

    // Genereer buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return als download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Liantis_Export_${maand}.xlsx"`
      }
    })

  } catch (error) {
    console.error('Error exporting to Liantis:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ]
  return months[month - 1]
}

