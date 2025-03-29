import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// GET handler to retrieve a specific note
export async function GET(
  req: AuthRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const noteId = parseInt(params.id);

    if (isNaN(noteId)) {
      return badRequestResponse('Invalid note ID');
    }

    // Get note with contact info to verify ownership
    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
      include: {
        contact: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!note) {
      return notFoundResponse('Note not found');
    }

    // Verify that the note belongs to a contact owned by the user
    if (note.contact.userId !== userId) {
      return notFoundResponse('Note not found');
    }

    return successResponse(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return serverErrorResponse('Error fetching note');
  }
}

// PUT handler to update a note
export async function PUT(
  req: AuthRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const noteId = parseInt(params.id);

    if (isNaN(noteId)) {
      return badRequestResponse('Invalid note ID');
    }

    const { note: noteText, interactionDate } = await req.json();

    // Validate required fields
    if (!noteText) {
      return badRequestResponse('Note text is required');
    }

    // Get note with contact info to verify ownership
    const existingNote = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
      include: {
        contact: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingNote) {
      return notFoundResponse('Note not found');
    }

    // Verify that the note belongs to a contact owned by the user
    if (existingNote.contact.userId !== userId) {
      return notFoundResponse('Note not found');
    }

    // Parse interaction date if provided
    let parsedInteractionDate: Date | undefined = undefined;
    if (interactionDate) {
      parsedInteractionDate = new Date(interactionDate);
      if (isNaN(parsedInteractionDate.getTime())) {
        return badRequestResponse('Invalid interaction date format');
      }
    }

    // Update the note
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        note: noteText,
        interactionDate: parsedInteractionDate,
      },
    });

    return successResponse(updatedNote, 'Note updated successfully');
  } catch (error) {
    console.error('Error updating note:', error);
    return serverErrorResponse('Error updating note');
  }
}

// DELETE handler to remove a note
export async function DELETE(
  req: AuthRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const noteId = parseInt(params.id);

    if (isNaN(noteId)) {
      return badRequestResponse('Invalid note ID');
    }

    // Get note with contact info to verify ownership
    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
      include: {
        contact: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!note) {
      return notFoundResponse('Note not found');
    }

    // Verify that the note belongs to a contact owned by the user
    if (note.contact.userId !== userId) {
      return notFoundResponse('Note not found');
    }

    // Delete the note
    await prisma.note.delete({
      where: { id: noteId },
    });

    return successResponse(null, 'Note deleted successfully');
  } catch (error) {
    console.error('Error deleting note:', error);
    return serverErrorResponse('Error deleting note');
  }
} 