import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// POST handler to record a new interaction with a contact
export async function POST(
  req: AuthRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const contactId = parseInt(params.id);

    if (isNaN(contactId)) {
      return badRequestResponse('Invalid contact ID');
    }

    // Get request body
    const { note, interactionDate } = await req.json();
    
    // Default interaction date to now if not provided
    const parsedInteractionDate = interactionDate ? new Date(interactionDate) : new Date();
    
    // Check if contact exists and belongs to user
    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
        userId,
      },
    });

    if (!contact) {
      return notFoundResponse('Contact not found');
    }

    // Start a transaction to ensure both operations complete
    const result = await prisma.$transaction([
      // Create a new note with isInteraction flag
      prisma.note.create({
        data: {
          contactId,
          note: note || 'Marked as interacted with contact',
          interactionDate: parsedInteractionDate,
          isInteraction: true,
        } as any,
      }),
      
      // Update the contact's last interaction date
      prisma.contact.update({
        where: { id: contactId },
        data: {
          // Use type assertion to work around TypeScript error until Prisma migration is applied
          lastInteractionDate: parsedInteractionDate,
        } as any,
      })
    ]);

    return successResponse(result[1], 'Interaction recorded successfully');
  } catch (error) {
    console.error('Error recording interaction:', error);
    return serverErrorResponse('Error recording interaction');
  }
} 