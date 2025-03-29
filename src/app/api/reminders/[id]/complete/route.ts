import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// PATCH handler to mark a reminder as completed
export async function PATCH(
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

    // Get the isCompleted value from request body
    const { isCompleted } = await req.json();
    
    if (typeof isCompleted !== 'boolean') {
      return badRequestResponse('isCompleted must be a boolean value');
    }

    // Update the reminder's completion status
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        isCompleted,
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
    console.error('Error updating reminder completion status:', error);
    return serverErrorResponse('Error updating reminder');
  }
} 