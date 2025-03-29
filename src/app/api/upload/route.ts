import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import { serverErrorResponse, successResponse, badRequestResponse } from '@/utils/api/response';

// Upload directory
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
const createUploadDirectory = async () => {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// POST handler for uploading images
export async function POST(req: NextRequest) {
  const authRequest = req as AuthRequest;
  const authResponse = await authMiddleware(authRequest);
  if (authResponse) return authResponse;

  try {
    await createUploadDirectory();

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return badRequestResponse('No image file found');
    }

    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      return badRequestResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return badRequestResponse('File size exceeds the 5MB limit.');
    }

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const filename = `${uniqueSuffix}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to Buffer and save to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // Calculate the relative path for the database
    const relativePath = `/uploads/${filename}`;

    return successResponse({ url: relativePath }, 'Image uploaded successfully');
  } catch (error) {
    console.error('Error uploading image:', error);
    return serverErrorResponse('Error uploading image');
  }
} 