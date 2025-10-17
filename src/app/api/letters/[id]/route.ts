import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/letters/[id]?userId=xxx
 * Delete a scheduled letter
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get the letter
    const letter = await prisma.scheduledLetter.findUnique({
      where: { id },
    });

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Verify ownership
    if (letter.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Don't allow deleting sent letters
    if (letter.sent) {
      return NextResponse.json(
        { error: 'Cannot delete a letter that has already been sent' },
        { status: 400 }
      );
    }

    await prisma.scheduledLetter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
