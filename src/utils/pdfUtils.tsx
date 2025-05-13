import { PDFDocument } from 'pdf-lib';
import { Annotation } from '../App';

export const savePDF = async (pdfUrl: string, annotations: Annotation[]): Promise<boolean> => {
  try {
    // Fetch the PDF
    const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    // Process each annotation
    for (const annotation of annotations) {
      if (annotation.type === 'text' && annotation.text) {
        const page = pages[annotation.page - 1];
        const { height } = page.getSize();
        const fontSize = 12;
        // Draw the text at the top of the annotation box
        page.drawText(annotation.text, {
          x: annotation.x,
          y: height - annotation.y - fontSize, // align text at the top
          size: fontSize,
          color: undefined, // default black
          maxWidth: annotation.width - 8,
        });
        continue;
      }
      if (!annotation.content) continue;
      
      const page = pages[annotation.page - 1];
      const { width, height } = page.getSize();
      
      // Convert annotation image to bytes
      const imageBytes = await fetch(annotation.content).then(res => res.arrayBuffer());
      
      // Embed the image
      let image;
      if (annotation.content.startsWith('data:image/png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }
      
      // Calculate position (PDF coordinates start from bottom-left)
      const x = annotation.x;
      const y = height - annotation.y - annotation.height;
      
      // Draw the image
      page.drawImage(image, {
        x,
        y,
        width: annotation.width,
        height: annotation.height,
      });
    }
    
    // Save the PDF
    const modifiedPdfBytes = await pdfDoc.save();
    
    // Create a blob from the bytes
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    
    // Create a download link and click it
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'signed_document.pdf';
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};
