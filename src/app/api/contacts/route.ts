import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import { badRequestResponse, createdResponse, serverErrorResponse, successResponse } from '@/utils/api/response';

// GET handler to retrieve all contacts for the authenticated user
export async function GET(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;

    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: { firstName: 'asc' },
    });

    return successResponse(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return serverErrorResponse('Error fetching contacts');
  }
}

// POST handler to create a new contact
export async function POST(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const { firstName, lastName, email, phoneNumber, address, birthday, profileImage } = await req.json();

    // Validate required fields
    if (!firstName) {
      return badRequestResponse('First name is required');
    }

    // Parse birthday if provided
    let parsedBirthday: Date | undefined;
    if (birthday) {
      parsedBirthday = new Date(birthday);
      if (isNaN(parsedBirthday.getTime())) {
        return badRequestResponse('Invalid birthday format');
      }
    }

    // Create the contact
    const contact = await prisma.contact.create({
      data: {
        userId,
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        birthday: parsedBirthday,
        profileImage,
      },
    });

    return createdResponse(contact, 'Contact created successfully');
  } catch (error) {
    console.error('Error creating contact:', error);
    return serverErrorResponse('Error creating contact');
  }
} 