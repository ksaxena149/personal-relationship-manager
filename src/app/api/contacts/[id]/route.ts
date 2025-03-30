import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// GET handler to retrieve a specific contact
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

    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
        userId,
      },
      include: {
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        reminders: {
          orderBy: {
            reminderDate: 'asc',
          },
        },
      },
    });

    if (!contact) {
      return notFoundResponse('Contact not found');
    }

    return successResponse(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return serverErrorResponse('Error fetching contact');
  }
}

// PUT handler to update a contact
export async function PUT(
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

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      birthday,
      profileImage,
      relationshipType,
      customInteractionDays,
    } = await req.json();

    // Validate required fields
    if (!firstName) {
      return badRequestResponse('First name is required');
    }

    // Parse birthday if provided
    let parsedBirthday: Date | undefined = undefined;
    if (birthday) {
      parsedBirthday = new Date(birthday);
      if (isNaN(parsedBirthday.getTime())) {
        return badRequestResponse('Invalid birthday format');
      }
    }

    // Check if contact exists and belongs to user
    const existingContact = await prisma.contact.findUnique({
      where: {
        id: contactId,
        userId,
      },
    });

    if (!existingContact) {
      return notFoundResponse('Contact not found');
    }

    // Update the contact
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        birthday: parsedBirthday,
        profileImage,
        // Use type assertion to work around TypeScript error until Prisma migration is applied
        // @ts-ignore - These fields exist in the database but Prisma types are not updated yet
        relationshipType: relationshipType || null,
        customInteractionDays: customInteractionDays ? parseInt(customInteractionDays) : null,
      } as any,
    });

    return successResponse(updatedContact, 'Contact updated successfully');
  } catch (error) {
    console.error('Error updating contact:', error);
    return serverErrorResponse('Error updating contact');
  }
}

// DELETE handler to remove a contact
export async function DELETE(
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

    // Check if contact exists and belongs to user
    const existingContact = await prisma.contact.findUnique({
      where: {
        id: contactId,
        userId,
      },
    });

    if (!existingContact) {
      return notFoundResponse('Contact not found');
    }

    // Delete the contact (cascade will delete notes and reminders)
    await prisma.contact.delete({
      where: { id: contactId },
    });

    return successResponse(null, 'Contact deleted successfully');
  } catch (error) {
    console.error('Error deleting contact:', error);
    return serverErrorResponse('Error deleting contact');
  }
} 