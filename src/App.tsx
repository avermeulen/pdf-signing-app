// App.tsx
import { useState, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './modern-theme.css';
import PDFAnnotationLayer from './components/PDFAnnotationLayer';
import SignatureModal from './components/SignatureModal';
import TextModal from './components/TextModal';
import LandingPage from './components/LandingPage';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import { savePDF } from './utils/pdfUtils';
import loadWorker from './pdfWorker';

// Define types
export interface Annotation {
  id: number;
  type: 'signature' | 'initial' | 'text';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string | null;
  text?: string; // For text box
}

interface PDFDocumentProxy {
  numPages: number;
}

// Create a layout component to handle the navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isBlogSection = location.pathname.startsWith('/blog');
  
  return (
    <div className="min-vh-100">
      {/* Modern Navigation Bar - Now with blog link */}
      <nav className="navbar navbar-expand-lg navbar-light navbar-modern py-3">
        <div className="container-fluid px-4">
          <Link to="/" className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-file-earmark-text me-2 fs-4 text-primary"></i>
            <span>PDFsigned</span>
          </Link>
          
          <div className="ms-auto d-flex align-items-center">
            {isBlogSection ? (
              <Link to="/" className="btn btn-outline-secondary btn-sm me-2" data-bs-toggle="tooltip" data-bs-title="Go to Home Page">
                <i className="bi bi-house-door me-1"></i> <span className="d-none d-sm-inline">Home</span>
              </Link>
            ) : (
              <Link to="/blog" className="btn btn-outline-primary btn-sm me-2" data-bs-toggle="tooltip" data-bs-title="Read Our Blog">
                <i className="bi bi-journal-text me-1"></i> <span className="d-none d-sm-inline">Blog</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {children}
    </div>
  );
};

function AppContent() {
  const [workerLoaded, setWorkerLoaded] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotationType, setActiveAnnotationType] = useState<'signature' | 'initial' | 'text' | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [showTextModal, setShowTextModal] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [editingTextAnnotation, setEditingTextAnnotation] = useState<Annotation | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [initial, setInitial] = useState<string | null>(null);
  const [toast, setToast] = useState<{show: boolean, message: string, type: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  
  // Load the PDF.js worker
  useEffect(() => {
    const initWorker = async () => {
      await loadWorker();
      setWorkerLoaded(true);
    };
    
    initWorker();
  }, []);

  // Initialize tooltips for responsive buttons
  useEffect(() => {
    // Check if document is available (client-side only)
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      // Function to create and show tooltip
      const showTooltip = (el: Element, event: Event) => {
        // Only show tooltip on small screens where button text is hidden
        if (window.innerWidth > 576 && el.querySelector('.d-none')) {
          return; // Don't show tooltips on larger screens where text is visible
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-overlay';
        tooltip.textContent = el.getAttribute('data-bs-title') || '';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '6px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '1070';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.maxWidth = '200px';
        tooltip.style.textAlign = 'center';
        tooltip.style.pointerEvents = 'none'; // Prevent tooltip from intercepting events
        
        // Position the tooltip
        const rect = el.getBoundingClientRect();
        tooltip.style.top = (rect.bottom + 5) + 'px';
        tooltip.style.left = (rect.left + rect.width/2) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip on several events
        const removeTooltip = () => {
          if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);
          }
        };
        
        // Set timeout to remove tooltip after a delay (for touch events)
        const timeoutId = setTimeout(removeTooltip, 2000);
        
        // Also remove on mouse leave or touch elsewhere
        el.addEventListener('mouseleave', removeTooltip, { once: true });
        el.addEventListener('touchend', removeTooltip, { once: true });
        document.addEventListener('touchstart', function handleTouch(e) {
          if (e.target !== el) {
            removeTooltip();
            document.removeEventListener('touchstart', handleTouch);
            clearTimeout(timeoutId);
          }
        });
        
        return tooltip;
      };

      // Initialize tooltips using vanilla JS since we're not importing Bootstrap JS
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        // Add support for both mouse and touch events
        tooltipTriggerEl.addEventListener('mouseenter', (e) => showTooltip(tooltipTriggerEl, e));
        
        // For touch devices
        tooltipTriggerEl.addEventListener('touchstart', (e) => {
          // Prevent default only if we're on a small screen
          if (window.innerWidth <= 576) {
            e.preventDefault(); // Prevent click action on first tap to show tooltip
            showTooltip(tooltipTriggerEl, e);
          }
        });
      });
    }
    
    // Clean up any remaining tooltips on unmount
    return () => {
      const tooltips = document.querySelectorAll('.tooltip-overlay');
      tooltips.forEach(tooltip => {
        if (document.body.contains(tooltip)) {
          document.body.removeChild(tooltip);
        }
      });
    };
  }, [pdfFile]); // Re-initialize when PDF is loaded or unloaded

  // Handle toast auto-dismiss
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
      setAnnotations([]);
      setCurrentPage(1);
      showToast('PDF loaded successfully', 'success');
    } else {
      showToast('Please select a valid PDF file', 'danger');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    setNumPages(numPages);
  };
  
  const handleAddAnnotation = (type: 'signature' | 'initial' | 'text') => {
    setActiveAnnotationType(type);
    showToast(`Click where you want to place the ${type === 'text' ? 'text box' : type}`, 'info');
  };
  
  // When placing a text box, open the text modal
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeAnnotationType) return;
    const documentContainer = documentRef.current;
    if (!documentContainer) return;
    const rect = documentContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (activeAnnotationType === 'initial' && numPages) {
      // Place initial on all pages at the same position
      const timestamp = Date.now();
      const newAnnotations: Annotation[] = [];
      for (let page = 1; page <= numPages; page++) {
        newAnnotations.push({
          id: timestamp + page, // unique id for each
          type: 'initial',
          page,
          x,
          y,
          width: 80,
          height: 40,
          content: null
        });
      }
      setAnnotations([...annotations, ...newAnnotations]);
      setActiveAnnotationType(null);
      // Open signature modal for the first annotation only
      setSelectedAnnotation(newAnnotations[0]);
      setShowSignatureModal(true);
    } else if (activeAnnotationType === 'text') {
      const newAnnotation: Annotation = {
        id: Date.now(),
        type: 'text',
        page: currentPage,
        x,
        y,
        width: 180,
        height: 40,
        content: null,
        text: ''
      };
      setAnnotations([...annotations, newAnnotation]);
      setActiveAnnotationType(null);
      setEditingTextAnnotation(newAnnotation);
      setShowTextModal(true);
    } else {
      // Signature: only on current page
      const newAnnotation: Annotation = {
        id: Date.now(),
        type: activeAnnotationType,
        page: currentPage,
        x,
        y,
        width: activeAnnotationType === 'signature' ? 200 : 80,
        height: activeAnnotationType === 'signature' ? 80 : 40,
        content: null
      };
      setAnnotations([...annotations, newAnnotation]);
      setActiveAnnotationType(null);
      setSelectedAnnotation(newAnnotation);
      setShowSignatureModal(true);
    }
  };
  
  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setShowSignatureModal(true);
  };
  
  const handleAnnotationMove = (id: number, newX: number, newY: number) => {
    // Ensure the annotation stays within the page boundaries
    const updatedAnnotations = annotations.map(ann => {
      if (ann.id === id) {
        return { ...ann, x: Math.max(0, newX), y: Math.max(0, newY) };
      }
      return ann;
    });
    
    setAnnotations(updatedAnnotations);
  };
  
  const handleAnnotationDelete = (id: number) => {
    const annotationToDelete = annotations.find(ann => ann.id === id);
    const updatedAnnotations = annotations.filter(ann => ann.id !== id);
    setAnnotations(updatedAnnotations);
    
    if (annotationToDelete) {
      showToast(`${capitalizeFirstLetter(annotationToDelete.type)} field removed`, 'warning');
    }
  };
  
  const handleSignatureSave = (dataUrl: string) => {
    if (!selectedAnnotation) return;
    
    if (selectedAnnotation.type === 'signature') {
      setSignature(dataUrl);
      const updatedAnnotations = annotations.map(ann => 
        ann.id === selectedAnnotation.id 
          ? { ...ann, content: dataUrl } 
          : ann
      );
      setAnnotations(updatedAnnotations);
    } else {
      setInitial(dataUrl);
      // Set the initial drawing on all initial annotations (all pages)
      const updatedAnnotations = annotations.map(ann =>
        ann.type === 'initial' ? { ...ann, content: dataUrl } : ann
      );
      setAnnotations(updatedAnnotations);
    }
    setShowSignatureModal(false);
    setSelectedAnnotation(null);
    showToast(`${capitalizeFirstLetter(selectedAnnotation.type)} created successfully`, 'success');
  };
  
  const handleSavePDF = async () => {
    if (!pdfFile) return;
    
    try {
      await savePDF(pdfFile, annotations);
      showToast('PDF saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving PDF:', error);
      showToast('Failed to save PDF', 'danger');
    }
  };

  const handleResetDocument = () => {
    setPdfFile(null);
    setAnnotations([]);
    setCurrentPage(1);
    setScale(1.5);
  };
  
  const navigatePages = (step: number) => {
    const newPage = currentPage + step;
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setCurrentPage(newPage);
    }
  };
  
  const changeZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
  };
  
  const showToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info') => {
    setToast({
      show: true,
      message,
      type
    });
  };
  
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Add handler for text change
  const handleTextChange = (id: number, newText: string) => {
    setAnnotations(annotations =>
      annotations.map(ann =>
        ann.id === id ? { ...ann, text: newText } : ann
      )
    );
  };
  
  // Double-click handler for editing text box
  const handleEditTextAnnotation = (annotation: Annotation) => {
    setEditingTextAnnotation(annotation);
    setShowTextModal(true);
  };
  
  if (!workerLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Loading PDF capabilities...</span>
      </div>
    );
  }
  
  return (
    <>
      <AnimatePresence mode="wait">
        {!pdfFile ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container-fluid p-0"
          >
            {/* Show Landing Page when no PDF is loaded */}
            <LandingPage onUploadClick={handleUploadClick} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container-fluid p-0"
          >
            {/* PDF Editor Interface - Full width header */}
            <div className="container-fluid px-4 mb-4">
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-4">
                      <div className="d-flex flex-column flex-md-row flex-wrap align-items-start align-items-md-center gap-2 gap-md-3 mb-2">
                        <h4 className="mb-3 mb-md-0 me-auto">Document Editor</h4>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAddAnnotation('signature')}
                            className={`tool-btn ${activeAnnotationType === 'signature' ? 'active' : ''}`}
                            data-bs-toggle="tooltip"
                            data-bs-title="Add your signature to the document"
                          >
                            <i className="bi bi-pen"></i>
                            <span className="d-none d-sm-inline">Signature</span>
                          </button>
                          <button
                            onClick={() => handleAddAnnotation('initial')}
                            className={`tool-btn ${activeAnnotationType === 'initial' ? 'active' : ''}`}
                            data-bs-toggle="tooltip"
                            data-bs-title="Add your initials to the document"
                          >
                            <i className="bi bi-type"></i>
                            <span className="d-none d-sm-inline">Initial</span>
                          </button>
                          <button
                            onClick={() => handleAddAnnotation('text')}
                            className={`tool-btn ${activeAnnotationType === 'text' ? 'active' : ''}`}
                            data-bs-toggle="tooltip"
                            data-bs-title="Add a text box to the document"
                          >
                            <i className="bi bi-fonts"></i>
                            <span className="d-none d-sm-inline">Text</span>
                          </button>
                          <motion.button
                            onClick={handleSavePDF}
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            data-bs-toggle="tooltip"
                            data-bs-title="Save the signed PDF document"
                          >
                            <i className="bi bi-download me-1"></i>
                            <span className="d-none d-sm-inline">Save Document</span>
                          </motion.button>
                          <button 
                            onClick={handleResetDocument}
                            className="btn btn-outline-secondary btn-sm"
                            data-bs-toggle="tooltip"
                            data-bs-title="Return to home page"
                          >
                            <i className="bi bi-arrow-left me-1"></i> <span className="d-none d-sm-inline">Back to Home</span>
                          </button>
                        </div>
                      </div>
                      {/* Annotation instructions */}
                      {activeAnnotationType && (
                        <div className="alert alert-info d-flex align-items-center fade-in py-2 mb-3">
                          <i className="bi bi-info-circle me-2"></i>
                          <div>Click anywhere on the document to place your {activeAnnotationType}</div>
                          <button
                            className="btn-close ms-auto"
                            onClick={() => setActiveAnnotationType(null)}
                          ></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PDF Viewer - Now full width to match landing page */}
            <div className="container-fluid px-4 py-0">
              <div className="position-relative">
                <div className="pdf-container overflow-auto p-4" style={{ height: 'calc(100vh - 280px)' }}>
                  {/* Page Navigation Controls */}
                  <div className="d-flex justify-content-center mb-4 sticky-top" style={{ top: 0, zIndex: 20, background: 'rgba(255,255,255,0.95)' }}>
                    <div className="page-controls d-flex flex-wrap align-items-center justify-content-center">
                      <button
                        onClick={() => navigatePages(-1)}
                        disabled={currentPage <= 1}
                        title="Previous Page"
                        className="me-1"
                        data-bs-toggle="tooltip" 
                        data-bs-title="Previous Page"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <div className="page-info px-2">Page {currentPage} of {numPages}</div>
                      <button
                        onClick={() => navigatePages(1)}
                        disabled={currentPage >= (numPages || 1)}
                        title="Next Page"
                        className="ms-1 me-2"
                        data-bs-toggle="tooltip" 
                        data-bs-title="Next Page"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                      <div className="mx-2 d-none d-sm-block">|</div>
                      <div className="d-flex align-items-center mt-2 mt-sm-0">
                        <button
                          onClick={() => changeZoom(-0.1)}
                          title="Zoom Out"
                          className="me-1"
                          data-bs-toggle="tooltip" 
                          data-bs-title="Zoom Out"
                        >
                          <i className="bi bi-dash-lg"></i>
                        </button>
                        <div className="page-info px-2">{Math.round(scale * 100)}%</div>
                        <button
                          onClick={() => changeZoom(0.1)}
                          title="Zoom In"
                          className="ms-1"
                          data-bs-toggle="tooltip" 
                          data-bs-title="Zoom In"
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PDF Document - Center it within the wider container */}
                  <div 
                    className="position-relative d-flex justify-content-center"
                    onClick={activeAnnotationType ? handleCanvasClick : undefined}
                    style={{ 
                      cursor: activeAnnotationType ? 'crosshair' : 'default',
                    }}
                  >
                    <div 
                      ref={documentRef}
                      className="position-relative shadow-sm"
                      style={{ 
                        border: '1px solid var(--gray-light-color)',
                        borderRadius: 'var(--border-radius)'
                      }}
                    >
                      <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-secondary">Loading PDF document...</p>
                          </div>
                        }
                        error={
                          <div className="text-center py-5 text-danger">
                            <i className="bi bi-exclamation-triangle fs-2 mb-3"></i>
                            <p>Failed to load PDF document</p>
                          </div>
                        }
                      >
                        <Page 
                          pageNumber={currentPage} 
                          scale={scale}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="shadow-none"
                        />
                        <PDFAnnotationLayer
                          annotations={annotations.filter(ann => ann.page === currentPage)}
                          scale={scale}
                          onAnnotationClick={handleAnnotationClick}
                          onAnnotationMove={handleAnnotationMove}
                          onAnnotationDelete={handleAnnotationDelete}
                          onTextChange={handleTextChange}
                          onEditText={handleEditTextAnnotation}
                        />
                      </Document>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="d-none"
      />
      
      {/* Signature Modal */}
      {showSignatureModal && selectedAnnotation && (
        <SignatureModal
          type={selectedAnnotation.type}
          onSave={handleSignatureSave}
          onCancel={() => {
            setShowSignatureModal(false);
            setSelectedAnnotation(null);
          }}
          defaultValue={
            selectedAnnotation.type === 'signature' 
              ? signature 
              : initial
          }
        />
      )}
      
      {/* Text Modal for editing text annotations */}
      {showTextModal && editingTextAnnotation && (
        <TextModal
          defaultValue={editingTextAnnotation.text || ''}
          onSave={text => {
            setAnnotations(annotations =>
              annotations.map(ann =>
                ann.id === editingTextAnnotation.id ? { ...ann, text } : ann
              )
            );
            setShowTextModal(false);
            setEditingTextAnnotation(null);
          }}
          onCancel={() => {
            setShowTextModal(false);
            setEditingTextAnnotation(null);
          }}
        />
      )}
      
      {/* Toast Notifications */}
      {toast && (
        <div 
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4 toast-modern"
          style={{ zIndex: 1050 }}
        >
          <div className={`alert alert-${toast.type} d-flex align-items-center mb-0 py-2 px-3`}>
            {toast.type === 'success' && <i className="bi bi-check-circle-fill me-2"></i>}
            {toast.type === 'danger' && <i className="bi bi-x-circle-fill me-2"></i>}
            {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
            {toast.type === 'info' && <i className="bi bi-info-circle-fill me-2"></i>}
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <AppContent />
          </Layout>
        } />
        <Route path="/blog" element={
          <Layout>
            <Blog />
          </Layout>
        } />
        <Route path="/blog/post/:id" element={
          <Layout>
            <BlogPost />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;