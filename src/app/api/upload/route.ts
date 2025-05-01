import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

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
    const publicDir = join(process.cwd(), 'public', 'uploads');
    
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
      console.log('Created uploads directory:', publicDir);
    }
    
    const filepath = join(publicDir, filename);
    await writeFile(filepath, buffer);
    console.log('File saved at:', filepath);

    // Return the URL with origin for absolute path
    const url = `/uploads/${filename}`;
    console.log('Returning URL:', url);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 