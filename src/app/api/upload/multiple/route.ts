import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UploadService, UploadType } from '@/lib/upload';

// POST /api/upload/multiple - Upload multiple files
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as UploadType;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!type || !Object.keys(UploadService.UPLOAD_CONFIGS).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      );
    }

    // Limit to 10 files per request
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed per request' },
        { status: 400 }
      );
    }

    const results = await UploadService.uploadMultipleFiles(files, type, session.user.id);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      data: {
        successful: successful.map(r => ({
          filename: r.filename,
          url: r.url,
          size: r.size,
          mimetype: r.mimetype,
        })),
        failed: failed.map(r => ({
          error: r.error,
        })),
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
        },
      },
    });
  } catch (error) {
    console.error('Multiple upload API error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
