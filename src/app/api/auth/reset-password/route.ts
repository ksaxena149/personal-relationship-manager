import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { badRequestResponse, serverErrorResponse, successResponse } from '@/utils/api/response';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate required fields
    if (!email) {
      return badRequestResponse('Email is required');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Instead, return a success message regardless
      return successResponse(
        null,
        'If your email exists in our system, you will receive password reset instructions'
      );
    }

    // In a real application, here you would:
    // 1. Generate a password reset token
    // 2. Store it in the database with an expiration
    // 3. Send an email with a link containing the token

    // For now, we'll just return a success message
    return successResponse(
      null,
      'If your email exists in our system, you will receive password reset instructions'
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return serverErrorResponse('Error processing password reset request');
  }
} 