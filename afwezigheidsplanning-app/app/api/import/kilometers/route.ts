import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

// POST - Import Kilometers Excel data (Kilometer2026.xlsx structuur)
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)

    let importedWerknemers = 0
    let importedKilometers = 0

    // Verwerk elk werkblad (maand) - skip "Werknemers" werkblad
    for (const sheetName of workbook.SheetNames) {
      // Skip het "Werknemers" werkblad
      if (sheetName.toLowerCase() === 'werknemers') continue

      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      if (data.length < 5) continue

      // Bepaal jaar en maand van het werkblad
      const year = 2026
      const monthNames = [
        'januari', 'februari', 'maart', 'april', 'mei', 'juni',
        'juli', 'augustus', 'september', 'oktober', 'november', 'december'
      ]
      const monthIndex = monthNames.findIndex(m => 
        sheetName.toLowerCase().includes(m)
      )
      
      if (monthIndex === -1) continue

      // Vind de header rij met "Naam werknemer" (meestal rij 4, index 3)
      let nameColumnIndex = -1
      let dayStartColumnIndex = -1
      let dataStartRow = -1

      for (let i = 0; i < Math.min(data.length, 10); i++) {
        const row = data[i]
        for (let j = 0; j < row.length; j++) {
          const cell = row[j]
          if (typeof cell === 'string' && cell.toLowerCase().includes('naam') && cell.toLowerCase().includes('werknemer')) {
            nameColumnIndex = j
            dataStartRow = i + 1
            
            // Vind waar de dag nummers beginnen (zoek naar "1" in dezelfde rij)
            for (let k = j + 1; k < row.length; k++) {
              if (row[k] === 1 || row[k] === '1') {
                dayStartColumnIndex = k
                break
              }
            }
            break
          }
        }
        if (nameColumnIndex !== -1) break
      }

      if (nameColumnIndex === -1 || dataStartRow === -1 || dayStartColumnIndex === -1) {
        console.log(`Skipping sheet ${sheetName}: Could not find header row`)
        continue
      }

      console.log(`Processing ${sheetName}: nameCol=${nameColumnIndex}, dayStart=${dayStartColumnIndex}, dataStart=${dataStartRow}`)

      // Verwerk werknemers en hun kilometers
      for (let i = dataStartRow; i < data.length; i++) {
        const row = data[i]
        const naam = row[nameColumnIndex]

        // Stop bij lege rijen of "Totaal" rijen
        if (!naam || typeof naam !== 'string' || naam.trim() === '' || 
            naam.toLowerCase().includes('totaal') || naam.toLowerCase().includes('elke dag')) {
          continue
        }

        // Maak of vind werknemer
        let werknemer = await prisma.werknemer.findFirst({
          where: { naam: naam.trim() }
        })

        if (!werknemer) {
          werknemer = await prisma.werknemer.create({
            data: {
              naam: naam.trim(),
              vakantiedagenTotaal: 20
            }
          })
          importedWerknemers++
        }

        // Verwerk dagen voor kilometers (max 31 dagen)
        for (let day = 1; day <= 31; day++) {
          const columnIndex = dayStartColumnIndex + (day - 1)
          if (columnIndex >= row.length) break

          const cellValue = row[columnIndex]
          
          // Check of het een geldige datum is voor deze maand
          const datum = new Date(year, monthIndex, day)
          if (datum.getMonth() !== monthIndex) continue

          // Check of het een numerieke waarde is (kilometers)
          if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
            const kmValue = typeof cellValue === 'number' ? cellValue : parseFloat(cellValue)
            
            if (!isNaN(kmValue) && kmValue > 0) {
              try {
                await prisma.kilometer.upsert({
                  where: {
                    werknemerId_datum: {
                      werknemerId: werknemer.id,
                      datum: datum
                    }
                  },
                  update: {
                    kilometers: kmValue
                  },
                  create: {
                    werknemerId: werknemer.id,
                    datum: datum,
                    kilometers: kmValue
                  }
                })
                importedKilometers++
              } catch (error) {
                console.error(`Error importing kilometers for ${naam} on ${datum}:`, error)
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Kilometers import successful',
      imported: {
        werknemers: importedWerknemers,
        kilometers: importedKilometers
      }
    })

  } catch (error) {
    console.error('Error importing Kilometers Excel:', error)
    return NextResponse.json({ 
      error: 'Failed to import Kilometers Excel file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

