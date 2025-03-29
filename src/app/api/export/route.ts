import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  serverErrorResponse,
} from '@/utils/api/response';

// GET handler to export contacts to CSV/JSON
export async function GET(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';

    // Validate format
    if (format !== 'json' && format !== 'csv') {
      return badRequestResponse('Invalid format. Supported formats: json, csv');
    }

    // Get user's contacts
    const contacts = await prisma.contact.findMany({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // In a real implementation, we would:
    // 1. Format data as CSV or JSON
    // 2. Set appropriate headers for file download
    // 3. Return formatted data as a downloadable file
    
    // For now, just return the contacts as JSON
    return new Response(JSON.stringify(contacts), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="contacts.${format}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting contacts:', error);
    return serverErrorResponse('Error exporting contacts');
  }
} 