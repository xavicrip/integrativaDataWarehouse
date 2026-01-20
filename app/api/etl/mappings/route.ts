// API route para obtener mappings por defecto
import { NextResponse } from 'next/server';
import { ETLOrchestrator } from '@/lib/etl/orchestrator';

export async function GET() {
  try {
    const mappings = ETLOrchestrator.getDefaultMappings();
    return NextResponse.json(mappings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
