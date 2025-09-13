import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { UploadService, UploadType } from '@/lib/upload';

// POST /api/upload - Upload single file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as UploadType;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !Object.keys((UploadService as any).UPLOAD_CONFIGS || {}).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      );
    }

    const result = await UploadService.uploadFile(file, type, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        filename: result.filename,
        url: result.url,
        size: result.size,
        mimetype: result.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET /api/upload - Get upload configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as UploadType;

    if (!type || !Object.keys((UploadService as any).UPLOAD_CONFIGS || {}).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      );
    }

    const config = (UploadService as any).UPLOAD_CONFIGS?.[type];

    return NextResponse.json({
      success: true,
      config: {
        maxSize: config.maxSize,
        maxSizeMB: config.maxSize / (1024 * 1024),
        allowedTypes: config.allowedTypes,
        destination: config.destination,
      },
    });
  } catch (error) {
    console.error('Upload config API error:', error);
    return NextResponse.json(
      { error: 'Failed to get upload config' },
      { status: 500 }
    );
  }
}
