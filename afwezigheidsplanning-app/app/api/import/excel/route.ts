import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

// POST - Import Excel data
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
    let importedUren = 0
    let importedAfwezigheden = 0

    // Verwerk elk werkblad (maand)
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      if (data.length < 5) continue

      // Vind de naam kolom en data rijen
      let nameColumnIndex = -1
      let dataStartRow = -1

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        if (row.some((cell: any) => 
          typeof cell === 'string' && 
          (cell.includes('Naam') || cell.includes('werknemer'))
        )) {
          nameColumnIndex = row.findIndex((cell: any) => 
            typeof cell === 'string' && 
            (cell.includes('Naam') || cell.includes('werknemer'))
          )
          dataStartRow = i + 1
          break
        }
      }

      if (nameColumnIndex === -1 || dataStartRow === -1) continue

      // Bepaal jaar en maand van het werkblad
      const year = 2026 // Default naar 2026
      const monthNames = [
        'januari', 'februari', 'maart', 'april', 'mei', 'juni',
        'juli', 'augustus', 'september', 'oktober', 'november', 'december'
      ]
      const monthIndex = monthNames.findIndex(m => 
        sheetName.toLowerCase().includes(m)
      )
      
      if (monthIndex === -1) continue

      // Verwerk werknemers en hun data
      for (let i = dataStartRow; i < data.length; i++) {
        const row = data[i]
        const naam = row[nameColumnIndex]

        if (!naam || typeof naam !== 'string' || naam.trim() === '' || 
            naam.toLowerCase().includes('totaal')) {
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

        // Verwerk dagen
        for (let day = 1; day <= 31; day++) {
          const cellValue = row[nameColumnIndex + day]
          if (!cellValue) continue

          const datum = new Date(year, monthIndex, day)

          // Check of het een geldige datum is
          if (datum.getMonth() !== monthIndex) continue

          if (typeof cellValue === 'number' && cellValue > 0) {
            // Het is een uren registratie
            try {
              await prisma.urenregistratie.upsert({
                where: {
                  werknemerId_datum: {
                    werknemerId: werknemer.id,
                    datum: datum
                  }
                },
                update: {
                  uren: cellValue
                },
                create: {
                  werknemerId: werknemer.id,
                  datum: datum,
                  uren: cellValue
                }
              })
              importedUren++
            } catch (error) {
              console.error('Error importing uren:', error)
            }
          } else if (typeof cellValue === 'string') {
            const value = cellValue.trim().toUpperCase()
            
            // Check voor afwezigheid types
            let afwezigheidType: string | null = null
            
            if (value === 'V') afwezigheidType = 'VAKANTIE'
            else if (value === 'Z') afwezigheidType = 'ZIEK'
            else if (value === 'P') afwezigheidType = 'PERSOONLIJK'
            else if (value === 'A1') afwezigheidType = 'AANGEPAST_1'
            else if (value === 'A2') afwezigheidType = 'AANGEPAST_2'

            if (afwezigheidType) {
              try {
                // Check of er al een afwezigheid bestaat voor deze dag
                const existingAfwezigheid = await prisma.afwezigheid.findFirst({
                  where: {
                    werknemerId: werknemer.id,
                    startDatum: {
                      lte: datum
                    },
                    eindDatum: {
                      gte: datum
                    }
                  }
                })

                if (!existingAfwezigheid) {
                  await prisma.afwezigheid.create({
                    data: {
                      werknemerId: werknemer.id,
                      startDatum: datum,
                      eindDatum: datum,
                      type: afwezigheidType,
                      goedgekeurd: true
                    }
                  })
                  importedAfwezigheden++

                  // Update vakantiedagen indien vakantie
                  if (afwezigheidType === 'VAKANTIE') {
                    await prisma.werknemer.update({
                      where: { id: werknemer.id },
                      data: {
                        vakantiedagenOpgenomen: {
                          increment: 1
                        }
                      }
                    })
                  }
                }
              } catch (error) {
                console.error('Error importing afwezigheid:', error)
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Import successful',
      imported: {
        werknemers: importedWerknemers,
        urenregistraties: importedUren,
        afwezigheden: importedAfwezigheden
      }
    })

  } catch (error) {
    console.error('Error importing Excel:', error)
    return NextResponse.json({ 
      error: 'Failed to import Excel file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

