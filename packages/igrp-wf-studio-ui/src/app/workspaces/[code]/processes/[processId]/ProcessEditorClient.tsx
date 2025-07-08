"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
// useRouter não é mais necessário aqui, pois o botão "Back" está no page.tsx
import BpmnModelerComponent from '@/components/bpmn/BpmnModeler';
import { Save, Play, FileText, Image as ImageIcon, Loader2, HardDriveDownload, UploadCloud } from 'lucide-react'; // Ícones adicionados/revisados
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Para status
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { saveProcessAction, deployProcessAction } from '@/app/actions';

interface Process {
  id?: string;
  code: string;
  title: string;
  description?: string;
  status?: string;
}

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
  const [bpmnXml, setBpmnXml] = useState<string | undefined>(initialProcessDetails.bpmnXml || undefined);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const modelerRef = useRef<any>(null);

  const handleModelerLoad = useCallback((modelerInstance: any) => {
    modelerRef.current = modelerInstance;
  }, []);

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
        processCode: initialProcessDetails.code,
        bpmnXml: bpmnXml,
      });
      if (result.success) {
        toast.success(result.message || 'Process saved successfully');
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
      toast("No BPMN content to export.", { icon: '⚠️' });
      return;
    }
    const blob = new Blob([bpmnXml], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${initialProcessDetails.code}.bpmn`; // Nome simplificado
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Process exported as ${initialProcessDetails.code}.bpmn`);
  };

  const handleExportSvg = async () => {
    if (!modelerRef.current) {
      toast("BPMN Modeler not loaded.", { icon: '⚠️' });
      return;
    }
    try {
      const { svg } = await modelerRef.current.saveSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${initialProcessDetails.code}.svg`; // Nome simplificado
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Process exported as ${initialProcessDetails.code}.svg`);
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
    toast.loading("Deploying process..."); // Usar toast.loading e dispensar depois
    try {
      const result = await deployProcessAction({
        processId: initialProcessDetails.code,
        bpmnXml: bpmnXml,
        appCode: initialProcessDetails.appCode,
        areaCode: initialProcessDetails.areaCode,
        subAreaCode: initialProcessDetails.subAreaCode,
      });
      toast.dismiss(); // Dispensar o "Deploying..."
      if (result.success) {
        toast.success(result.message || `Process deployed successfully.`);
      } else {
        toast.error(result.message || `Deploy failed.`);
      }
    } catch (err) {
      toast.dismiss(); // Dispensar o "Deploying..."
      toast.error(`Client error deploying process: ${(err as Error).message}`);
    } finally {
      setDeploying(false);
    }
  };

  const getStatusBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active": return "default";
      case "draft": return "outline";
      case "inactive": return "secondary";
      default: return "secondary";
    }
  };


  if (!initialProcessDetails) {
      return <div className="p-4 text-destructive">Error: Process details not available. Contact support.</div>;
  }

  return (
    // O container principal agora é dimensionado pelo page.tsx (flex-1 e overflow-auto no pai)
    // Este div ocupa toda a altura disponível em seu slot no layout da página.
    <div className="flex flex-col h-full">
      {/* Barra de Ferramentas do Editor - Simplificada e integrada */}
      <div className="flex items-center justify-end space-x-2 p-2 border-b bg-background sticky top-0 z-10">
        {/* Informação de Status (opcional aqui, pode estar no header da página) */}
        {initialProcessDetails.status && (
            <Badge variant={getStatusBadgeVariant(initialProcessDetails.status)} className="mr-auto">
                Status: {initialProcessDetails.status.charAt(0).toUpperCase() + initialProcessDetails.status.slice(1)}
            </Badge>
        )}
        <Button variant="outline" size="sm" onClick={handleExportBpmn} title="Download BPMN XML">
          <HardDriveDownload className="h-4 w-4 mr-1.5" />
          BPMN
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportSvg} title="Download SVG Image">
          <ImageIcon className="h-4 w-4 mr-1.5" />
          SVG
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || deploying}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          Save
        </Button>
        <Button variant="default" size="sm" onClick={handleDeploy} disabled={deploying || saving}>
          {deploying ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4 mr-1.5" /> // Ícone mais apropriado para deploy
          )}
          Deploy
        </Button>
      </div>

      {/* Container do Modeler BPMN */}
      <div className="flex-1 bg-muted/40 min-h-0 relative"> {/* relative para posicionar overlays do bpmn-js */}
        <BpmnModelerComponent
          xml={bpmnXml}
          onChange={handleXmlChange}
          onLoad={handleModelerLoad}
          appCode={initialProcessDetails.appCode} // Passado para o modeler, pode ser usado para features customizadas
        />
      </div>
    </div>
  );
};

export default ProcessEditorClient;
