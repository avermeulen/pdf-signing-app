// components/SignatureModal.tsx
import React, { useRef, useState, useEffect } from 'react';

interface SignatureModalProps {
  type: 'signature' | 'initial';
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  defaultValue: string | null;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ 
  type, 
  onSave, 
  onCancel, 
  defaultValue 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set line style
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    
    setContext(ctx);
    
    // If we have a default value, load it
    if (defaultValue) {
      const img = new Image();
      img.onload = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = defaultValue;
    }
  }, [defaultValue]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !context) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    context.beginPath();
    context.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    context.lineTo(clientX - rect.left, clientY - rect.top);
    context.stroke();
    setHasDrawn(true);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    if (!canvasRef.current || !context) return;
    
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };
  
  const saveSignature = () => {
    if (!hasDrawn) {
      alert('Please draw your signature first');
      return;
    }
    
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };
  
  return (
    <div className="modal d-block position-fixed top-0 start-0 w-100 h-100" 
         style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-sm modal-md-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {type === 'signature' ? 'Draw Your Signature' : 'Draw Your Initials'}
            </h5>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
          </div>
          
          <div className="modal-body p-2 p-sm-3">
            <div className="border rounded mb-3">
              <canvas
                ref={canvasRef}
                className="w-100"
                style={{ height: '180px', touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>
          
          <div className="modal-footer flex-wrap gap-2 justify-content-between">
            <button
              onClick={clearCanvas}
              className="btn btn-outline-secondary btn-sm"
              data-bs-toggle="tooltip"
              data-bs-title="Clear your drawing and start over"
            >
              <i className="bi bi-eraser me-1"></i> Clear
            </button>
            <div>
              <button
                onClick={onCancel}
                className="btn btn-secondary btn-sm me-2"
                data-bs-toggle="tooltip"
                data-bs-title="Cancel and close without saving"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="btn btn-primary btn-sm"
                disabled={!hasDrawn}
                data-bs-toggle="tooltip"
                data-bs-title="Save your signature"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;