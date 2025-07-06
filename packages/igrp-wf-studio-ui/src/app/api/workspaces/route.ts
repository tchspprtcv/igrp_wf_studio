import { NextResponse } from 'next/server';
import { WorkflowEngineSDK } from '@igrp/wf-engine';

// Initialize SDK on the server side
const sdk = new WorkflowEngineSDK();

export async function GET() {
  try {
    // Fetch workspaces
    const apps = await sdk.workspaces.listWorkspaces();
    
    // Fetch project config for each workspace
    const appsWithConfig = await Promise.all(
      apps.map(async (app: {title: string; code: string; description?: string }) => {
        const config = await sdk.workspaces.loadProjectConfig(app.code);
        return {
          code: app.code,
          title: app.title || app.description || app.code, 
          areas: (config?.areas || []).map((area: any) => ({
            ...area,
            description: area.description || '', // Default description
            status: area.status || 'active', // Default status
            processes: area.processes || [],
            // Ensure subareas within areas also have required fields
            subareas: (area.subareas || []).map((subarea: any) => ({
              ...subarea,
              description: subarea.description || '', // Default description
              status: subarea.status || 'active', // Default status
              processes: subarea.processes || []
            }))
          }))
        };
      })
    );
    
    return NextResponse.json({ workspaces: appsWithConfig });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces', message: (error as Error).message },
      { status: 500 }
    );
  }
}
