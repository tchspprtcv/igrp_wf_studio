import React, { useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Expand } from 'lucide-react'; // Usar ícones Lucide
import { Button } from '@/components/ui/button'; // Importar Button do ShadCN
import { cn } from '@/lib/utils'; // Para classnames condicinais se necessário

interface ZoomControlsProps {
  modeler: any; // Tipo BpmnJS Modeler
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ modeler }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;
  
  useEffect(() => {
    if (!modeler) return;
    
    try {
      const canvas = modeler.get('canvas');
      if (canvas) {
        setZoomLevel(canvas.zoom()); // Inicializa o nível de zoom
      }
      
      const eventBus = modeler.get('eventBus');
      if (eventBus) {
        const onZoomChanged = () => {
          if (modelerRefMounted.current) { // Verificar se o componente ainda está montado
             setZoomLevel(canvas.zoom());
          }
        };
        
        eventBus.on('canvas.viewbox.changed', onZoomChanged);
        
        return () => {
          eventBus.off('canvas.viewbox.changed', onZoomChanged);
        };
      }
    } catch (error) {
      console.error('Error initializing zoom level or event bus:', error);
    }
  }, [modeler]);

  // Ref para verificar se o componente está montado antes de atualizar o estado em callbacks
  const modelerRefMounted = useRef(true);
  useEffect(() => {
    modelerRefMounted.current = true;
    return () => {
      modelerRefMounted.current = false;
    };
  }, []);
  
  const handleZoomIn = useCallback(() => {
    if (!modeler) return;
    try {
      const canvas = modeler.get('canvas');
      canvas.zoom(Math.min(canvas.zoom() + ZOOM_STEP, MAX_ZOOM));
    } catch (error) { console.error('Error zooming in:', error); }
  }, [modeler]);
  
  const handleZoomOut = useCallback(() => {
    if (!modeler) return;
    try {
      const canvas = modeler.get('canvas');
      canvas.zoom(Math.max(canvas.zoom() - ZOOM_STEP, MIN_ZOOM));
    } catch (error) { console.error('Error zooming out:', error); }
  }, [modeler]);
  
  const handleResetZoom = useCallback(() => {
    if (!modeler) return;
    try {
      modeler.get('canvas').zoom('fit-viewport');
    } catch (error) { console.error('Error resetting zoom:', error); }
  }, [modeler]);
  
  // Atalhos de teclado
  useEffect(() => {
    if (!modeler) return;
    try {
      const keyboard = modeler.get('keyboard');
      if (!keyboard) return;

      const createKeyListener = (keys: string[], modifierCheck: (e: KeyboardEvent) => boolean, action: () => void) => (context: { keyEvent: KeyboardEvent }) => {
        const event = context.keyEvent;
        if (modifierCheck(event) && keys.some(k => keyboard.isKey(k, event))) {
          action();
          return true; // Indica que o evento foi tratado
        }
        return false;
      };

      const zoomInListener = createKeyListener(['=', '+'], (e) => keyboard.isCmd(e), handleZoomIn);
      const zoomOutListener = createKeyListener(['-', '_'], (e) => keyboard.isCmd(e), handleZoomOut);
      const resetZoomListener = createKeyListener(['0'], (e) => keyboard.isCmd(e), handleResetZoom);
      
      keyboard.addListener(2000, zoomInListener); // Prioridade alta para nossos atalhos
      keyboard.addListener(2000, zoomOutListener);
      keyboard.addListener(2000, resetZoomListener);
      
      return () => {
        keyboard.removeListener(zoomInListener);
        keyboard.removeListener(zoomOutListener);
        keyboard.removeListener(resetZoomListener);
      };
    } catch (error) {
      console.error('Error setting up keyboard shortcuts for zoom:', error);
    }
  }, [modeler, handleZoomIn, handleZoomOut, handleResetZoom]);
  
  // Gestos de toque (pinch zoom)
  useEffect(() => {
    if (!modeler) return;
    try {
      const canvas = modeler.get('canvas');
      const container = canvas._container; // Acesso ao container do canvas
      if (!container) return;

      let initialDistance = 0;
      let initialZoom = 1;

      const handleTouchStart = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          initialDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
          initialZoom = canvas.zoom();
          event.preventDefault(); // Prevenir scroll da página
        }
      };

      const handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
          const distanceRatio = currentDistance / initialDistance;
          const newZoom = Math.min(Math.max(initialZoom * distanceRatio, MIN_ZOOM), MAX_ZOOM);
          canvas.zoom(newZoom);
          event.preventDefault(); // Prevenir scroll da página
        }
      };
      
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      };
    } catch (error) {
      console.error('Error setting up touch gestures for zoom:', error);
    }
  }, [modeler]);
  
  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col items-center bg-card border border-border rounded-md shadow-lg">
      <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In (Ctrl++)" className="rounded-b-none border-b border-border">
        <ZoomIn className="h-5 w-5" />
      </Button>
      <div
        className="flex items-center justify-center w-9 h-9 text-xs font-medium text-muted-foreground"
        title={`Zoom: ${Math.round(zoomLevel * 100)}%`}
      >
        {Math.round(zoomLevel * 100)}%
      </div>
      <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out (Ctrl+-)" className="rounded-none border-t border-border">
        <ZoomOut className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleResetZoom} title="Fit to Screen (Ctrl+0)" className="rounded-t-none border-t border-border">
        <Expand className="h-4 w-4" /> {/* Ícone menor para 'fit' */}
      </Button>
    </div>
  );
};

export default ZoomControls;
