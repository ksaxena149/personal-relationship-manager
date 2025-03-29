import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { hashPassword } from '@/utils/auth/password';
import { generateToken } from '@/utils/auth/jwt';
import { badRequestResponse, createdResponse, serverErrorResponse } from '@/utils/api/response';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return badRequestResponse('Email and password are required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return badRequestResponse('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
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

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    // Return user and token
    return createdResponse({
      user,
      token,
    }, 'User created successfully');
  } catch (error) {
    console.error('Signup error:', error);
    return serverErrorResponse('Error creating user');
  }
} 