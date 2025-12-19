import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// DELETE - Verwijder urenregistratie
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.urenregistratie.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Urenregistratie deleted successfully' })
  } catch (error) {
    console.error('Error deleting urenregistratie:', error)
    return NextResponse.json({ error: 'Failed to delete urenregistratie' }, { status: 500 })
  }
}

