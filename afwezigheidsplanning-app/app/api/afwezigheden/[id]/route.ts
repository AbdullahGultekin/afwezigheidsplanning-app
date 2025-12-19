import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT - Update afwezigheid
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { goedgekeurd, opmerking } = body

    const afwezigheid = await prisma.afwezigheid.update({
      where: { id },
      data: {
        goedgekeurd,
        opmerking
      },
      include: {
        werknemer: {
          select: {
            id: true,
            naam: true
          }
        }
      }
    })

    return NextResponse.json(afwezigheid)
  } catch (error) {
    console.error('Error updating afwezigheid:', error)
    return NextResponse.json({ error: 'Failed to update afwezigheid' }, { status: 500 })
  }
}

// DELETE - Verwijder afwezigheid
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Haal afwezigheid op om vakantiedagen terug te geven indien nodig
    const afwezigheid = await prisma.afwezigheid.findUnique({
      where: { id }
    })

    if (afwezigheid && afwezigheid.type === 'VAKANTIE') {
      const start = new Date(afwezigheid.startDatum)
      const eind = new Date(afwezigheid.eindDatum)
      const dagen = Math.ceil((eind.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      const werknemer = await prisma.werknemer.findUnique({
        where: { id: afwezigheid.werknemerId }
      })

      if (werknemer) {
        await prisma.werknemer.update({
          where: { id: afwezigheid.werknemerId },
          data: {
            vakantiedagenOpgenomen: Math.max(0, werknemer.vakantiedagenOpgenomen - dagen)
          }
        })
      }
    }

    await prisma.afwezigheid.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Afwezigheid deleted successfully' })
  } catch (error) {
    console.error('Error deleting afwezigheid:', error)
    return NextResponse.json({ error: 'Failed to delete afwezigheid' }, { status: 500 })
  }
}

