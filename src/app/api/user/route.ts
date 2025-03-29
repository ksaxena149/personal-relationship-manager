import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';

// GET handler to retrieve the user's profile
export async function GET(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return serverErrorResponse('Error fetching user profile');
  }
}

// PUT handler to update the user's profile
export async function PUT(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const { firstName, lastName } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return successResponse(updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    return serverErrorResponse('Error updating user profile');
  }
} 