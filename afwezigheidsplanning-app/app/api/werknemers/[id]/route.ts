import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Haal specifieke werknemer op
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const werknemer = await prisma.werknemer.findUnique({
      where: { id },
      include: {
        urenregistraties: {
          orderBy: { datum: 'desc' },
          take: 30
        },
        afwezigheden: {
          orderBy: { startDatum: 'desc' }
        }
      }
    })

    if (!werknemer) {
      return NextResponse.json({ error: 'Werknemer not found' }, { status: 404 })
    }

    return NextResponse.json(werknemer)
  } catch (error) {
    console.error('Error fetching werknemer:', error)
    return NextResponse.json({ error: 'Failed to fetch werknemer' }, { status: 500 })
  }
}

// PUT - Update werknemer
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { naam, email, nummerplaat, vakantiedagenTotaal, vakantiedagenOpgenomen, actief } = body

    const werknemer = await prisma.werknemer.update({
      where: { id },
      data: {
        naam,
        email,
        nummerplaat,
        vakantiedagenTotaal,
        vakantiedagenOpgenomen,
        actief
      }
    })

    return NextResponse.json(werknemer)
  } catch (error) {
    console.error('Error updating werknemer:', error)
    return NextResponse.json({ error: 'Failed to update werknemer' }, { status: 500 })
  }
}

// DELETE - Verwijder werknemer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.werknemer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Werknemer deleted successfully' })
  } catch (error) {
    console.error('Error deleting werknemer:', error)
    return NextResponse.json({ error: 'Failed to delete werknemer' }, { status: 500 })
  }
}

