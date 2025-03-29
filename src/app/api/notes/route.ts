import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  createdResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// GET handler to retrieve all notes for a contact
export async function GET(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const url = new URL(req.url);
    const contactId = url.searchParams.get('contactId');

    if (!contactId) {
      return badRequestResponse('Contact ID is required');
    }

    const contactIdNum = parseInt(contactId);
    if (isNaN(contactIdNum)) {
      return badRequestResponse('Invalid contact ID');
    }

    // Check if contact exists and belongs to user
    const contact = await prisma.contact.findUnique({
      where: {
        id: contactIdNum,
        userId,
      },
    });

    if (!contact) {
      return notFoundResponse('Contact not found');
    }

    // Get notes for the contact
    const notes = await prisma.note.findMany({
      where: {
        contactId: contactIdNum,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return serverErrorResponse('Error fetching notes');
  }
}

// POST handler to create a new note
export async function POST(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const { contactId, note, interactionDate } = await req.json();

    // Validate required fields
    if (!contactId || !note) {
      return badRequestResponse('Contact ID and note text are required');
    }

    const contactIdNum = parseInt(contactId);
    if (isNaN(contactIdNum)) {
      return badRequestResponse('Invalid contact ID');
    }

    // Check if contact exists and belongs to user
    const contact = await prisma.contact.findUnique({
      where: {
        id: contactIdNum,
        userId,
      },
    });

    if (!contact) {
      return notFoundResponse('Contact not found');
    }

    // Parse interaction date if provided
    let parsedInteractionDate: Date | undefined = undefined;
    if (interactionDate) {
      parsedInteractionDate = new Date(interactionDate);
      if (isNaN(parsedInteractionDate.getTime())) {
        return badRequestResponse('Invalid interaction date format');
      }
    }

    // Create the note
    const newNote = await prisma.note.create({
      data: {
        contactId: contactIdNum,
        note,
        interactionDate: parsedInteractionDate,
      },
    });

    return createdResponse(newNote, 'Note created successfully');
  } catch (error) {
    console.error('Error creating note:', error);
    return serverErrorResponse('Error creating note');
  }
} 