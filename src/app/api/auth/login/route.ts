import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { verifyPassword } from '@/utils/auth/password';
import { generateToken } from '@/utils/auth/jwt';
import { badRequestResponse, serverErrorResponse, successResponse, unauthorizedResponse } from '@/utils/api/response';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return badRequestResponse('Email and password are required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    // Return user data (excluding password hash) and token
    const { passwordHash, ...userData } = user;
    return successResponse({
      user: userData,
      token,
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse('Error during login');
  }
} 