// src/pdfWorker.ts
import { pdfjs } from 'react-pdf';

// Use a dynamic import to ensure the worker is loaded correctly
const loadWorker = async () => {
  try {
    const worker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    console.log('PDF Worker loaded successfully');
  } catch (error) {
    console.error('Failed to load PDF worker:', error);
  }
};

export default loadWorker;