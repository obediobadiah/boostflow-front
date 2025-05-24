import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// NOTE: For production environments, consider using external storage solutions like:
// - Amazon S3
// - Cloudinary
// - Firebase Storage
// - DigitalOcean Spaces
// This would make your uploads more scalable and avoid the issues with serving
// dynamically uploaded files in a Next.js production environment.

// Ensure uploads directory exists
const ensureUploadsDirectory = async () => {
  try {
    const publicDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(publicDir, { recursive: true });
    return publicDir;
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    throw error;
  }
};

// Handle file uploads
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueId = uuidv4();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${uniqueId}.${extension}`;

    // Save file to public directory
    const publicDir = await ensureUploadsDirectory();
    
    const filepath = join(publicDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL that can be used to access the file
    // We'll use the /api/upload/:filename route to serve the file
    const url = `/api/upload/${filename}`;
    console.log(`File saved to ${filepath}, URL: ${url}`);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

// Handle serving uploaded files
export async function GET(
  request: NextRequest
) {
  try {
    const pathname = request.nextUrl.pathname;
    const filename = pathname.replace('/api/upload/', '');
    
    if (!filename || filename === '') {
      return new NextResponse('File not specified', { status: 400 });
    }
    
    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    
    // Check if file exists
    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        return new NextResponse('Not found', { status: 404 });
      }
    } catch (err) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 