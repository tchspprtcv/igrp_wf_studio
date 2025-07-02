import React, { useState, useEffect, useCallback } from 'react';
import { FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import styled from 'styled-components';

const ZoomControlsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  z-index: 100;
`;

const ZoomButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const ZoomLevel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #f5f5f5;
  font-size: 12px;
  font-weight: bold;
  color: #333;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e0e0e0;
`;

interface ZoomControlsProps {
  modeler: any;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ modeler }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Zoom step size
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;
  
  // Initialize zoom level from canvas
  useEffect(() => {
    if (!modeler) return;
    
    try {
      const canvas = modeler.get('canvas');
      if (canvas) {
        setZoomLevel(canvas.zoom());
      }
      
      // Listen for zoom changes
      const eventBus = modeler.get('eventBus');
      if (eventBus) {
        const onZoomChanged = () => {
          setZoomLevel(canvas.zoom());
        };
        
        eventBus.on('canvas.viewbox.changed', onZoomChanged);
        
        return () => {
          eventBus.off('canvas.viewbox.changed', onZoomChanged);
        };
      }
    } catch (error) {
      console.error('Error initializing zoom level:', error);
    }
  }, [modeler]);
  
  // Zoom in function
  const handleZoomIn = useCallback(() => {
    if (!modeler) return;
    
    try {
      const canvas = modeler.get('canvas');
      const currentZoom = canvas.zoom();
      const newZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
      
      canvas.zoom(newZoom);
    } catch (error) {
      console.error('Error handling zoom in:', error);
    }
  }, [modeler]);
  
  // Zoom out function
  const handleZoomOut = useCallback(() => {
    if (!modeler) return;
    
    try {
      const canvas = modeler.get('canvas');
      const currentZoom = canvas.zoom();
      const newZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
      
      canvas.zoom(newZoom);
    } catch (error) {
      console.error('Error handling zoom out:', error);
    }
  }, [modeler]);
  
  // Reset zoom function (fit to viewport)
  const handleResetZoom = useCallback(() => {
    if (!modeler) return;
    
    try {
      const canvas = modeler.get('canvas');
      canvas.zoom('fit-viewport');
    } catch (error) {
      console.error('Error handling reset zoom:', error);
    }
  }, [modeler]);
  
  // Register keyboard shortcuts
  useEffect(() => {
    if (!modeler) return;
    
    try {
      const keyboard = modeler.get('keyboard');
      
      // Removida a linha que causava o erro: const keyboardBindings = keyboard.getBindings();
      
      // Add zoom in shortcut (Ctrl/Cmd + +)
      const zoomInListener = function(context: { keyEvent: any; }) {
        const event = context.keyEvent;
        
        if (keyboard.isKey(['=', '+'], event) && keyboard.isCmd(event)) {
          handleZoomIn();
          return true;
        }
      };
      
      // Add zoom out shortcut (Ctrl/Cmd + -)
      const zoomOutListener = function(context: { keyEvent: any; }) {
        const event = context.keyEvent;
        
        if (keyboard.isKey(['-', '_'], event) && keyboard.isCmd(event)) {
          handleZoomOut();
          return true;
        }
      };
      
      // Add reset zoom shortcut (Ctrl/Cmd + 0)
      const resetZoomListener = function(context: { keyEvent: any; }) {
        const event = context.keyEvent;
        
        if (keyboard.isKey(['0'], event) && keyboard.isCmd(event)) {
          handleResetZoom();
          return true;
        }
      };
      
      keyboard.addListener(zoomInListener);
      keyboard.addListener(zoomOutListener);
      keyboard.addListener(resetZoomListener);
      
      return () => {
        // Clean up keyboard listeners
        try {
          keyboard.removeListener(zoomInListener);
          keyboard.removeListener(zoomOutListener);
          keyboard.removeListener(resetZoomListener);
        } catch (error) {
          console.error('Error removing keyboard listeners:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up keyboard shortcuts:', error);
      // Continue rendering the component even if keyboard shortcuts fail
    }
  }, [modeler, handleZoomIn, handleZoomOut, handleResetZoom]);
  
  // Register touch gestures for pinch zoom
  useEffect(() => {
    if (!modeler) return;
    
    try {
      const canvas = modeler.get('canvas');
      if (!canvas || !canvas._container) return;
      
      const container = canvas._container;
      
      let initialDistance = 0;
      let initialZoom = 1;
      
      const handleTouchStart = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          
          initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          
          initialZoom = canvas.zoom();
        }
      };
      
      const handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          
          const distanceRatio = currentDistance / initialDistance;
          const newZoom = Math.min(Math.max(initialZoom * distanceRatio, MIN_ZOOM), MAX_ZOOM);
          
          canvas.zoom(newZoom);
          
          event.preventDefault();
        }
      };
      
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      };
    } catch (error) {
      console.error('Error setting up touch gestures:', error);
      // Continue rendering the component even if touch gestures fail
    }
  }, [modeler]);
  
  return (
    <ZoomControlsContainer>
      <ZoomButton onClick={handleZoomIn} title="Aumentar Zoom (Ctrl++)">
        <FiZoomIn size={18} />
      </ZoomButton>
      <Divider />
      <ZoomLevel title="Nível de Zoom Atual">
        {Math.round(zoomLevel * 100)}%
      </ZoomLevel>
      <Divider />
      <ZoomButton onClick={handleZoomOut} title="Diminuir Zoom (Ctrl+-)">
        <FiZoomOut size={18} />
      </ZoomButton>
      <Divider />
      <ZoomButton onClick={handleResetZoom} title="Ajustar à Tela (Ctrl+0)">
        <FiMaximize size={16} />
      </ZoomButton>
    </ZoomControlsContainer>
  );
};

export default ZoomControls;
