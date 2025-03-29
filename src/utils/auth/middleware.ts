import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { prisma } from '../db/prisma';

export interface AuthRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
  };
}

export async function authMiddleware(
  req: AuthRequest
): Promise<NextResponse | null> {
  const authorization = req.headers.get('authorization');
  const token = extractTokenFromHeader(authorization || '');

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing authentication token' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User not found' },
        { status: 401 }
      );
    }

    req.user = user;
    return null; // Continue to the API route handler
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 