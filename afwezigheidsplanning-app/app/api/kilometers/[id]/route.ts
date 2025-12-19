import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// DELETE - Verwijder kilometer registratie
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.kilometer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Kilometer registratie deleted successfully' })
  } catch (error) {
    console.error('Error deleting kilometer registratie:', error)
    return NextResponse.json({ error: 'Failed to delete kilometer registratie' }, { status: 500 })
  }
}

