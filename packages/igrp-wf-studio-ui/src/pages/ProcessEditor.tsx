import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkflowEngineSDK } from '@igrp/wf-engine';
import BpmnModelerComponent from '@/components/bpmn/BpmnModeler'; // Renamed to avoid conflict
import { Save, Play, Download, ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface ProcessDetails {
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  bpmnXml?: string;
  appCode?: string;
  areaCode?: string;
  subareaCode?: string;
}

const ProcessEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bpmnXml, setBpmnXml] = useState<string>();
  const [processDetails, setProcessDetails] = useState<ProcessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const modelerRef = useRef<any>(null); // To store BpmnJS modeler instance

  const handleModelerLoad = useCallback((modeler: any) => {
    modelerRef.current = modeler;
  }, []); // Empty dependency array ensures the function is created only once

  useEffect(() => {
    loadProcessDetails();
  }, [id]);

  const loadProcessDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const sdk = new WorkflowEngineSDK();
      
      // Find the process in all workspaces
      const apps = await sdk.workspaces.listWorkspaces();
      
      for (const app of apps) {
        const config = await sdk.workspaces.loadProjectConfig(app.code);
        if (!config) continue;

        for (const area of config.areas) {
          // Check processes in area
          const process = area.processes.find((p: { code: string; }) => p.code === id);
          if (process) {
            const bpmnXml = await sdk.processes.readProcessDefinition(
              app.code,
              area.code,
              process.code
            );
            
            setProcessDetails({
              title: process.title,
              description: process.description || '',
              status: process.status,
              bpmnXml: bpmnXml?.bpmnXml,
              appCode: app.code,
              areaCode: area.code
            });
            setBpmnXml(bpmnXml?.bpmnXml);
            return;
          }

          // Check processes in subareas
          for (const subarea of area.subareas) {
            const process = subarea.processes.find((p: { code: string; }) => p.code === id);
            if (process) {
              const bpmnXml = await sdk.processes.readProcessDefinition(
                app.code,
                area.code,
                process.code,
                subarea.code
              );
              
              setProcessDetails({
                title: process.title,
                description: process.description || '',
                status: process.status,
                bpmnXml: bpmnXml?.bpmnXml,
                appCode: app.code,
                areaCode: area.code,
                subareaCode: subarea.code
              });
              setBpmnXml(bpmnXml?.bpmnXml);
              return;
            }
          }
        }
      }

      setError('Process not found');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bpmnXml || !processDetails?.appCode || !processDetails?.areaCode || !id) return;
    
    try {
      setSaving(true);
      const sdk = new WorkflowEngineSDK();
      const result = await sdk.processes.saveProcessDefinition(
        processDetails.appCode,
        processDetails.areaCode,
        id,
        bpmnXml,
        processDetails.subareaCode
      );

      if (!result.success) {
        setError(result.message);
        toast.error(result.message || 'Failed to save process');
      } else {
        toast.success('Process saved successfully');
      }
    } catch (err) {
      setError((err as Error).message);
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!bpmnXml) return;
    const blob = new Blob([bpmnXml], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `process-${id}.bpmn`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success(`Process exported as BPMN file`);
  };

  const handleExportSvg = async () => {
    if (!modelerRef.current || !id) return;
    try {
      const { svg } = await modelerRef.current.saveSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `process-${id}.svg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Process exported as SVG image`);
    } catch (err) {
      console.error('Failed to export SVG', err);
      setError('Failed to export SVG: ' + (err as Error).message);
      toast.error(`Failed to export SVG: ${(err as Error).message}`);
    }
  };

  const handleDeploy = async () => {
    console.log('Iniciando deploy do processo...');
    if (!bpmnXml || !id) return;
    try {
      setError(null);
      // Importar o serviço de armazenamento MinIO
      const MinioClientService = (await import('@/services/MinioClientService')).default;
      
      // Fazer deploy do processo para o MinIO
      const deployUrl = await MinioClientService.deployProcess(id, bpmnXml);
      
      console.log('Processo deployado com sucesso:', deployUrl);
      
      // Substituir alert por toast
      toast.success(`Process deployed successfully to MinIO server`);
    } catch (err) {
      console.error('Erro ao fazer deploy do processo:', err);
      setError((err as Error).message);
      toast.error(`Deploy failed: ${(err as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    icon={<ArrowLeft className="h-4 w-4" />}
                    className="mr-4"
                  >
                    Back
                  </Button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {processDetails?.title}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      {processDetails?.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExport}
                  icon={<FileText className="h-4 w-4" />}
                >
                  Export BPMN
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportSvg}
                  icon={<ImageIcon className="h-4 w-4" />}
                >
                  Export SVG
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  icon={<Save className="h-4 w-4" />}
                  isLoading={saving}
                >
                  Save
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDeploy}
                  icon={<Play className="h-4 w-4" />}
                >
                  Deploy
                </Button>
              </div>
            </div>
            {processDetails?.status && (
              <div className="mt-2">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  {
                    'bg-green-100 text-green-800': processDetails.status === 'active',
                    'bg-yellow-100 text-yellow-800': processDetails.status === 'draft',
                    'bg-gray-100 text-gray-800': processDetails.status === 'inactive'
                  }
                )}>
                  {processDetails.status.charAt(0).toUpperCase() + processDetails.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 min-h-0">
        <BpmnModelerComponent 
          xml={processDetails?.bpmnXml} 
          onChange={setBpmnXml} 
          onLoad={handleModelerLoad} 
        />
      </div>
    </div>
  );
};

export default ProcessEditor;