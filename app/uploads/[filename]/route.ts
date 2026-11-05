import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function contentTypeForName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpeg' || ext === '.jpg') return 'image/jpeg';
  return 'application/octet-stream';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeName = path.basename(filename);
  const filePath = path.join(
    process.cwd(),
    'data',
    'uploads',
    safeName
  );

  if (!fs.existsSync(filePath)) {
    return new Response('Not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new Response(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      'Content-Type': contentTypeForName(safeName),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
