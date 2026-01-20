// API route para ejecutar procesos ETL
import { NextRequest, NextResponse } from 'next/server';
import { ETLOrchestrator } from '@/lib/etl/orchestrator';
import { ETLProcess } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const process: ETLProcess = {
      id: body.id || `etl-${Date.now()}`,
      name: body.name,
      sourceType: body.sourceType,
      sourcePath: body.sourcePath,
      targetCollection: body.targetCollection,
      mappings: body.mappings || [],
      status: 'running',
      startedAt: new Date(),
    };

    const result = await ETLOrchestrator.executeETL(process);

    return NextResponse.json({
      ...process,
      status: result.success ? 'completed' : 'failed',
      completedAt: new Date(),
      recordsProcessed: result.recordsProcessed,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
