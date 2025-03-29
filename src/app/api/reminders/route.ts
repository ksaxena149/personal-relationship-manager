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

// GET handler to retrieve all reminders for the user
export async function GET(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const url = new URL(req.url);
    const contactId = url.searchParams.get('contactId');

    let whereClause: any = { userId };

    // If contactId is provided, filter by it
    if (contactId) {
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

      whereClause.contactId = contactIdNum;
    }

    // Get reminders for the user (and optionally filtered by contact)
    const reminders = await prisma.reminder.findMany({
      where: whereClause,
      orderBy: {
        reminderDate: 'asc',
      },
      include: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return serverErrorResponse('Error fetching reminders');
  }
}

// POST handler to create a new reminder
export async function POST(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const { contactId, reminderDate, description, isRecurring } = await req.json();

    // Validate required fields
    if (!reminderDate || !description) {
      return badRequestResponse('Reminder date and description are required');
    }

    // Parse reminder date
    const parsedReminderDate = new Date(reminderDate);
    if (isNaN(parsedReminderDate.getTime())) {
      return badRequestResponse('Invalid reminder date format');
    }

    // If contactId is provided, check if it's valid and belongs to user
    let contactIdNum: number | null = null;
    if (contactId) {
      contactIdNum = parseInt(contactId);
      if (isNaN(contactIdNum)) {
        return badRequestResponse('Invalid contact ID');
      }

      const contact = await prisma.contact.findUnique({
        where: {
          id: contactIdNum,
          userId,
        },
      });

      if (!contact) {
        return notFoundResponse('Contact not found');
      }
    }

    // Create the reminder
    const newReminder = await prisma.reminder.create({
      data: {
        userId,
        contactId: contactIdNum,
        reminderDate: parsedReminderDate,
        description,
        isRecurring: isRecurring || false,
      },
      include: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return createdResponse(newReminder, 'Reminder created successfully');
  } catch (error) {
    console.error('Error creating reminder:', error);
    return serverErrorResponse('Error creating reminder');
  }
} 