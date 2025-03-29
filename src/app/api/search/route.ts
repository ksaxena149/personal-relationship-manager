import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// GET handler to search across contacts and notes
export async function GET(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const url = new URL(req.url);
    const query = url.searchParams.get('query');

    if (!query || query.trim() === '') {
      return badRequestResponse('Search query is required');
    }

    // Search for contacts matching the query
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    // Search for notes matching the query
    const notes = await prisma.note.findMany({
      where: {
        contact: {
          userId,
        },
        note: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Search for reminders matching the query
    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        description: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse({
      contacts,
      notes,
      reminders,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return serverErrorResponse('Error performing search');
  }
} 