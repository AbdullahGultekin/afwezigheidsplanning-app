import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Haal specifieke maandelijkse km-stand op
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const maandKmStand = await prisma.maandKmStand.findUnique({
      where: { id },
      include: {
        werknemer: true
      }
    })

    if (!maandKmStand) {
      return NextResponse.json({ error: 'Maand km-stand not found' }, { status: 404 })
    }

    return NextResponse.json(maandKmStand)
  } catch (error) {
    console.error('Error fetching maand km-stand:', error)
    return NextResponse.json({ error: 'Failed to fetch maand km-stand' }, { status: 500 })
  }
}

// PUT - Update maandelijkse km-stand
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { beginKmStand, eindKmStand, elkeDagGereden, handtekening, getekendOp } = body

    const updateData: any = {}
    
    if (beginKmStand !== undefined) updateData.beginKmStand = parseFloat(beginKmStand)
    if (eindKmStand !== undefined) updateData.eindKmStand = eindKmStand ? parseFloat(eindKmStand) : null
    if (elkeDagGereden !== undefined) updateData.elkeDagGereden = elkeDagGereden ? parseFloat(elkeDagGereden) : null
    if (handtekening !== undefined) updateData.handtekening = handtekening
    if (getekendOp !== undefined) updateData.getekendOp = getekendOp ? new Date(getekendOp) : null

    const maandKmStand = await prisma.maandKmStand.update({
      where: { id },
      data: updateData,
      include: {
        werknemer: true
      }
    })

    return NextResponse.json(maandKmStand)
  } catch (error: any) {
    console.error('Error updating maand km-stand:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Maand km-stand not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to update maand km-stand' }, { status: 500 })
  }
}

// DELETE - Verwijder maandelijkse km-stand
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.maandKmStand.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Maand km-stand deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting maand km-stand:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Maand km-stand not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to delete maand km-stand' }, { status: 500 })
  }
}

