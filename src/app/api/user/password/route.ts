import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import { hashPassword, verifyPassword } from '@/utils/auth/password';
import {
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/utils/api/response';

// PUT handler to change the user's password
export async function PUT(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = await req.json();

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return badRequestResponse('Old password and new password are required');
    }

    // Get the user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    // Verify the old password
    const isValidPassword = await verifyPassword(oldPassword, user.passwordHash);
    if (!isValidPassword) {
      return unauthorizedResponse('Current password is incorrect');
    }

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Error changing password:', error);
    return serverErrorResponse('Error changing password');
  }
} 