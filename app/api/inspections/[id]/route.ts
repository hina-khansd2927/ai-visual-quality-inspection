import {
  deleteInspection,
  getInspectionById,
  getStorageMode,
} from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await getInspectionById(id);
    if (!inspection) {
      return Response.json(
        { error: 'Inspection record not found.' },
        { status: 404 }
      );
    }
    return Response.json({
      inspection,
      storageMode: getStorageMode(),
    });
  } catch (err: any) {
    return Response.json(
      {
        error:
          err?.message || 'Failed to retrieve inspection detail.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteInspection(id);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Failed to delete record.' },
      { status: 500 }
    );
  }
}
