import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file uploaded.' }, { status: 400 });
    }

    // Verify it is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Uploaded file must be a valid image (JPG, PNG, WebP, SVG).' }, { status: 400 });
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image size exceeds 5MB limit.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try saving to public/images/uploads
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const originalExt = path.extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
      const safeFilename = `service-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${originalExt}`;
      const destination = path.join(uploadDir, safeFilename);

      fs.writeFileSync(destination, buffer);

      return NextResponse.json(
        {
          success: true,
          url: `/images/uploads/${safeFilename}`,
          message: 'Image uploaded successfully.',
        },
        { status: 200 }
      );
    } catch (fsError) {
      // Serverless fallback: Convert to data URL
      console.warn('Filesystem write not permitted, falling back to base64 Data URL:', fsError);
      const mime = file.type || 'image/jpeg';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;

      return NextResponse.json(
        {
          success: true,
          url: dataUrl,
          message: 'Image processed successfully.',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing image upload.' },
      { status: 500 }
    );
  }
}

