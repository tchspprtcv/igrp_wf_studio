"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Para o botão "Back"
// SDK não é usado diretamente aqui para busca inicial, mas pode ser para algumas operações client-side se necessário
// import { WorkflowEngineSDK } from '@igrp/wf-engine';
import BpmnModelerComponent from '@/components/bpmn/BpmnModeler';
import { Save, Play, Download, ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { Process } from '@igrp/wf-engine'; // Tipo Process do SDK

// Server Actions (a serem criadas/usadas)
import { saveProcessAction, deployProcessAction } from '@/app/actions';

interface ProcessDetailsForEditor extends Process {
  bpmnXml?: string | null;
  appCode: string;
  areaCode: string;
  subAreaCode?: string;
}

interface ProcessEditorClientProps {
  initialProcessDetails: ProcessDetailsForEditor;
}

const ProcessEditorClient: React.FC<ProcessEditorClientProps> = ({ initialProcessDetails }) => {
  const router = useRouter();
  const [bpmnXml, setBpmnXml] = useState<string | undefined>(initialProcessDetails.bpmnXml || undefined);
  // Os detalhes do processo (título, descrição, status) vêm de initialProcessDetails e são usados para exibição.
  // Se precisarem ser editáveis aqui, precisariam de estado local.
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false); // Estado para deploy
  const modelerRef = useRef<any>(null);

  const handleModelerLoad = useCallback((modelerInstance: any) => {
    modelerRef.current = modelerInstance;
  }, []);

  // Atualiza o XML no estado quando o editor o modifica
  const handleXmlChange = (newXml: string) => {
    setBpmnXml(newXml);
  };

  const handleSave = async () => {
    if (!bpmnXml) {
      toast.error("No BPMN content to save.");
      return;
    }
    setSaving(true);
    try {
      const result = await saveProcessAction({
        appCode: initialProcessDetails.appCode,
        areaCode: initialProcessDetails.areaCode,
        subAreaCode: initialProcessDetails.subAreaCode,
        processCode: initialProcessDetails.code, // 'code' é o processId
        bpmnXml: bpmnXml,
      });

      if (result.success) {
        toast.success(result.message || 'Process saved successfully');
        // Opcional: router.refresh() se precisar recarregar dados que podem ter mudado no servidor
        // como `updated_at` do processo, se exibido.
      } else {
        toast.error(result.message || 'Failed to save process');
      }
    } catch (err) {
      toast.error(`Client error saving process: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExportBpmn = () => {
    if (!bpmnXml) {
        toast.warn("No BPMN content to export.");
        return;
    }
    const blob = new Blob([bpmnXml], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `process-${initialProcessDetails.code}.bpmn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Process exported as BPMN file`);
  };

  const handleExportSvg = async () => {
    if (!modelerRef.current) {
        toast.warn("BPMN Modeler not loaded.");
        return;
    }
    try {
      const { svg } = await modelerRef.current.saveSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `process-${initialProcessDetails.code}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Process exported as SVG image`);
    } catch (err) {
      console.error('Failed to export SVG', err);
      toast.error(`Failed to export SVG: ${(err as Error).message}`);
    }
  };

  const handleDeploy = async () => {
    if (!bpmnXml) {
        toast.error("No BPMN content to deploy.");
        return;
    }
    setDeploying(true);
    toast.info("Deploying process...");
    try {
      // Chamar a Server Action para deploy
      const result = await deployProcessAction({
        processId: initialProcessDetails.code, // ou outro identificador que MinIO precise
        bpmnXml: bpmnXml,
        // Passar outros metadados se a action de deploy precisar
        appCode: initialProcessDetails.appCode,
        areaCode: initialProcessDetails.areaCode,
        subAreaCode: initialProcessDetails.subAreaCode,
      });

      if (result.success) {
        toast.success(result.message || `Process deployed successfully.`);
      } else {
        toast.error(result.message || `Deploy failed.`);
      }
    } catch (err) {
      toast.error(`Client error deploying process: ${(err as Error).message}`);
    } finally {
      setDeploying(false);
    }
  };

  // Se initialProcessDetails for null (embora o Server Component deva ter feito notFound()),
  // podemos adicionar um fallback, mas idealmente não chegaria aqui.
  if (!initialProcessDetails) {
      return <div>Error: Process details not available.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))]"> {/* Ajustar --header-height se o layout global tiver header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    icon={<ArrowLeft className="h-4 w-4" />}
                    className="mr-4"
                  >
                    Back
                  </Button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 truncate" title={initialProcessDetails.title}>
                      {initialProcessDetails.title}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 truncate" title={initialProcessDetails.description}>
                      {initialProcessDetails.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleExportBpmn} icon={<FileText className="h-4 w-4" />}>
                  Export BPMN
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExportSvg} icon={<ImageIcon className="h-4 w-4" />}>
                  Export SVG
                </Button>
                <Button onClick={handleSave} icon={<Save className="h-4 w-4" />} isLoading={saving}>
                  Save
                </Button>
                <Button variant="primary" onClick={handleDeploy} icon={<Play className="h-4 w-4" />} isLoading={deploying}>
                  Deploy
                </Button>
              </div>
            </div>
            {initialProcessDetails.status && (
              <div className="mt-2">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  {
                    'bg-green-100 text-green-800': initialProcessDetails.status === 'active',
                    'bg-yellow-100 text-yellow-800': initialProcessDetails.status === 'draft',
                    'bg-gray-100 text-gray-800': initialProcessDetails.status === 'inactive'
                  }
                )}>
                  {initialProcessDetails.status.charAt(0).toUpperCase() + initialProcessDetails.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 min-h-0">
        <BpmnModelerComponent
          xml={bpmnXml}
          onChange={handleXmlChange}
          onLoad={handleModelerLoad}
        />
      </div>
    </div>
  );
};

export default ProcessEditorClient;
