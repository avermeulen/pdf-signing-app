// src/components/PDFAnnotationLayer.tsx
import React, { useState, useRef } from 'react';
import { Annotation } from '../App';

interface PDFAnnotationLayerProps {
  annotations: Annotation[];
  scale: number;
  onAnnotationClick: (annotation: Annotation) => void;
  onAnnotationMove?: (id: number, x: number, y: number) => void;
  onAnnotationDelete?: (id: number) => void;
  onTextChange?: (id: number, newText: string) => void;
  onEditText?: (annotation: Annotation) => void;
}

const PDFAnnotationLayer: React.FC<PDFAnnotationLayerProps> = ({
  annotations,
  scale,
  onAnnotationClick,
  onAnnotationMove,
  onAnnotationDelete,
  onTextChange,
  onEditText
}) => {
  const [draggedAnnotation, setDraggedAnnotation] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null);
  
  // Ref to track if we're in a click vs. drag operation
  const isDragging = useRef<boolean>(false);
  const dragStartPosition = useRef<{x: number, y: number} | null>(null);
  
  const handleMouseDown = (e: React.MouseEvent, annotation: Annotation) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Store the initial click position relative to the annotation
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / scale;
    const relativeY = (e.clientY - rect.top) / scale;
    
    setDraggedAnnotation(annotation.id);
    setOffsetX(relativeX);
    setOffsetY(relativeY);
    isDragging.current = false;
    dragStartPosition.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedAnnotation === null || !onAnnotationMove) return;
    
    // Check if we've moved enough to consider this a drag
    if (dragStartPosition.current) {
      const deltaX = Math.abs(e.clientX - dragStartPosition.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPosition.current.y);
      
      // If the mouse has moved more than 3 pixels, consider it a drag
      if (deltaX > 3 || deltaY > 3) {
        isDragging.current = true;
      }
    }
    
    if (!isDragging.current) return;
    
    // Get the position relative to the document
    const container = (e.currentTarget as HTMLDivElement).parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newX = (e.clientX - containerRect.left) / scale - offsetX;
    const newY = (e.clientY - containerRect.top) / scale - offsetY;
    
    // Update annotation position
    onAnnotationMove(draggedAnnotation, newX, newY);
  };
  
  const handleMouseUp = (e: React.MouseEvent, annotation: Annotation) => {
    e.stopPropagation();
    
    // Only trigger click if we weren't dragging
    if (draggedAnnotation === annotation.id && !isDragging.current) {
      onAnnotationClick(annotation);
    }
    
    setDraggedAnnotation(null);
    dragStartPosition.current = null;
  };
  
  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAnnotationDelete) {
      onAnnotationDelete(id);
    }
  };
  
  return (
    <div 
      className="position-absolute top-0 left-0 w-100 h-100" 
      style={{ pointerEvents: 'none' }}
      onMouseMove={draggedAnnotation !== null ? handleMouseMove : undefined}
      onMouseUp={draggedAnnotation !== null ? (e) => {
        const annotation = annotations.find(a => a.id === draggedAnnotation);
        if (annotation) handleMouseUp(e, annotation);
      } : undefined}
    >
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="position-absolute border border-2 d-flex justify-content-center align-items-center"
          style={{
            left: `${annotation.x * scale}px`,
            top: `${annotation.y * scale}px`,
            width: `${annotation.width * scale}px`,
            height: `${annotation.height * scale}px`,
            borderColor: draggedAnnotation === annotation.id ? '#007bff' : 
                         hoveredAnnotation === annotation.id ? '#28a745' : '#6c757d',
            backgroundColor: annotation.type === 'text' ? 'rgba(255,255,200,0.8)' : 'rgba(255, 255, 255, 0.6)',
            pointerEvents: 'all',
            cursor: draggedAnnotation === annotation.id ? 'grabbing' : annotation.type === 'text' ? 'text' : 'grab',
            zIndex: draggedAnnotation === annotation.id ? 1000 : 100,
            minWidth: '40px',
            minHeight: '40px'
          }}
          onMouseDown={(e) => handleMouseDown(e, annotation)}
          onMouseUp={(e) => handleMouseUp(e, annotation)}
          onMouseEnter={() => setHoveredAnnotation(annotation.id)}
          onMouseLeave={() => setHoveredAnnotation(null)}
          onDoubleClick={() => annotation.type === 'text' && onEditText && onEditText(annotation)}
        >
          {annotation.type === 'text' ? (
            <span
              style={{
                width: '100%',
                height: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: '4px',
                fontSize: '1rem',
                color: '#333',
                cursor: 'text',
                userSelect: 'none',
              }}
              onClick={() => onEditText && onEditText(annotation)}
            >
              {annotation.text || <span style={{ color: '#aaa' }}>Enter text...</span>}
            </span>
          ) : annotation.content ? (
            <img 
              src={annotation.content} 
              alt={annotation.type} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                pointerEvents: 'none' 
              }} 
            />
          ) : (
            <span className="text-muted">
              {annotation.type === 'signature' ? 'Signature' : 'Initial'}
            </span>
          )}
          {hoveredAnnotation === annotation.id && (
            <div 
              className="position-absolute top-0 end-0 translate-middle bg-danger rounded-circle d-flex justify-content-center align-items-center"
              style={{ 
                width: '20px', 
                height: '20px', 
                cursor: 'pointer',
                zIndex: 1001
              }}
              onClick={(e) => handleDeleteClick(e, annotation.id)}
            >
              <span className="text-white" style={{ fontSize: '12px', fontWeight: 'bold' }}>×</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PDFAnnotationLayer;