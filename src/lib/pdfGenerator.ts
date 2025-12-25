import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';

export interface PDFGenerationResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
}

const prepareElementForPDF = (printElement: HTMLElement): HTMLElement => {
  // Clone the element
  const clone = printElement.cloneNode(true) as HTMLElement;
  
  // Make it visible and styled for PDF capture
  clone.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    background: white;
    visibility: visible !important;
    display: block !important;
    opacity: 1 !important;
    z-index: 99999;
    overflow: visible;
    pointer-events: none;
  `;
  
  // Remove print-only-area class that might hide content
  clone.classList.remove('print-only-area');
  clone.classList.add('pdf-capture-area');
  
  // Make all child elements visible
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.visibility = 'visible';
    htmlEl.style.display = '';
  });
  
  // Ensure forms have proper styling
  const forms = clone.querySelectorAll('[id$="-form"]');
  forms.forEach((form) => {
    const formEl = form as HTMLElement;
    formEl.style.display = 'block';
    formEl.style.visibility = 'visible';
    formEl.style.pageBreakAfter = 'always';
    formEl.style.background = 'white';
    formEl.style.padding = '10mm';
    formEl.style.boxSizing = 'border-box';
  });
  
  return clone;
};

export const generateAndSavePDF = async (
  printElement: HTMLElement,
  clientId: string,
  clientName: string,
  financialYear: string,
  userId?: string
): Promise<PDFGenerationResult> => {
  try {
    // Prepare clone for PDF capture
    const clone = prepareElementForPDF(printElement);
    
    // Add to body temporarily
    document.body.appendChild(clone);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get actual height of content
    const contentHeight = clone.scrollHeight;

    // Generate PDF from the cloned element
    const options = {
      margin: [5, 5, 5, 5],
      filename: `${clientName}_TaxForms_${financialYear}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: true,
        width: 794,
        height: contentHeight,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break', after: '[id$="-form"]' }
    };

    // Generate PDF blob
    const pdfBlob = await html2pdf()
      .set(options)
      .from(clone)
      .outputPdf('blob');

    // Remove clone
    document.body.removeChild(clone);

    // Create file path
    const timestamp = Date.now();
    const sanitizedName = clientName.replace(/[^a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F]/g, '_');
    const filePath = `${clientId}/${sanitizedName}_${financialYear}_${timestamp}.pdf`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-pdfs')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('client-pdfs')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save record to client_pdfs table
    const { error: dbError } = await supabase
      .from('client_pdfs')
      .insert({
        client_id: clientId,
        client_name: clientName,
        file_path: filePath,
        file_url: fileUrl,
        file_size: pdfBlob.size,
        financial_year: financialYear,
        created_by: userId || null
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't throw - PDF was uploaded, just failed to save record
    }

    return {
      success: true,
      fileUrl,
      filePath
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const downloadPDF = async (
  printElement: HTMLElement,
  clientName: string,
  financialYear: string
): Promise<void> => {
  // Prepare clone for PDF capture
  const clone = prepareElementForPDF(printElement);
  
  // Add to body temporarily
  document.body.appendChild(clone);
  
  // Wait for rendering
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get actual height of content
  const contentHeight = clone.scrollHeight;

  const options = {
    margin: [5, 5, 5, 5],
    filename: `${clientName}_TaxForms_${financialYear}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: true,
      width: 794,
      height: contentHeight,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break', after: '[id$="-form"]' }
  };

  try {
    await html2pdf()
      .set(options)
      .from(clone)
      .save();
  } finally {
    // Remove clone
    document.body.removeChild(clone);
  }
};

export const getClientPDFs = async (clientId: string) => {
  const { data, error } = await supabase
    .from('client_pdfs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client PDFs:', error);
    return [];
  }

  return data || [];
};

export const getAllPDFs = async () => {
  const { data, error } = await supabase
    .from('client_pdfs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all PDFs:', error);
    return [];
  }

  return data || [];
};

export const deletePDF = async (id: string, filePath: string): Promise<boolean> => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('client-pdfs')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('client_pdfs')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};
