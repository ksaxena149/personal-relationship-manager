import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// GET handler to retrieve a specific reminder
export async function GET(
  req: AuthRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const reminderId = parseInt(params.id);

    if (isNaN(reminderId)) {
      return badRequestResponse('Invalid reminder ID');
    }

    const reminder = await prisma.reminder.findUnique({
      where: {
        id: reminderId,
        userId,
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

    if (!reminder) {
      return notFoundResponse('Reminder not found');
    }

    return successResponse(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    return serverErrorResponse('Error fetching reminder');
  }
}

// PUT handler to update a reminder
export async function PUT(
  req: AuthRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const reminderId = parseInt(params.id);

    if (isNaN(reminderId)) {
      return badRequestResponse('Invalid reminder ID');
    }

    const {
      contactId,
      reminderDate,
      description,
      isRecurring,
      isCompleted,
    } = await req.json();

    // Validate required fields
    if (!reminderDate || !description) {
      return badRequestResponse('Reminder date and description are required');
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findUnique({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!existingReminder) {
      return notFoundResponse('Reminder not found');
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

    // Update the reminder
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        contactId: contactIdNum,
        reminderDate: parsedReminderDate,
        description,
        isRecurring: isRecurring || false,
        isCompleted: typeof isCompleted === 'boolean' ? isCompleted : undefined,
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

    return successResponse(updatedReminder, 'Reminder updated successfully');
  } catch (error) {
    console.error('Error updating reminder:', error);
    return serverErrorResponse('Error updating reminder');
  }
}

// DELETE handler to remove a reminder
export async function DELETE(
  req: AuthRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const reminderId = parseInt(params.id);

    if (isNaN(reminderId)) {
      return badRequestResponse('Invalid reminder ID');
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findUnique({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!existingReminder) {
      return notFoundResponse('Reminder not found');
    }

    // Delete the reminder
    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    return successResponse(null, 'Reminder deleted successfully');
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return serverErrorResponse('Error deleting reminder');
  }
} 