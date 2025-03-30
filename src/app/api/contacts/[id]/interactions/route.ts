import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// Helper function to get the date key in YYYY-MM-DD format
function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

// GET handler to retrieve interaction history for a contact
export async function GET(
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

    // Get query parameters
    const url = new URL(req.url);
    const monthsParam = url.searchParams.get('months') || '12';
    const months = parseInt(monthsParam);
    
    if (isNaN(months) || months <= 0 || months > 24) {
      return badRequestResponse('Invalid months parameter. Must be between 1 and 24.');
    }

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

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get all notes that are interactions for this contact in the date range
    const interactionNotes = await prisma.note.findMany({
      where: {
        contactId: contactId,
        isInteraction: true,
        interactionDate: {
          gte: startDate,
          lte: endDate,
        },
      } as any,
      orderBy: {
        interactionDate: 'asc',
      },
    });

    // Create a map of dates to interaction counts
    const interactionsMap: Record<string, number> = {};
    
    // Initialize with zeros for all days in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      interactionsMap[getDateKey(currentDate)] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add the actual interactions
    interactionNotes.forEach(note => {
      if (note.interactionDate) {
        const dateKey = getDateKey(new Date(note.interactionDate));
        if (interactionsMap[dateKey] !== undefined) {
          interactionsMap[dateKey]++;
        }
      }
    });
    
    // Format the data for the contribution graph
    const interactionHistory = Object.entries(interactionsMap).map(([date, count]) => ({
      date,
      count,
    }));

    return successResponse({
      contactId,
      interactionHistory,
    });
  } catch (error) {
    console.error('Error fetching interaction history:', error);
    return serverErrorResponse('Error fetching interaction history');
  }
} 