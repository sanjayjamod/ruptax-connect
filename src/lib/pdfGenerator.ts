import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';

export interface PDFGenerationResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
}

// Create a print-styled clone for PDF generation
const createPrintStyledClone = (printElement: HTMLElement): HTMLElement => {
  const clone = printElement.cloneNode(true) as HTMLElement;
  
  // Remove classes that hide content
  clone.classList.remove('print-only-area');
  clone.id = 'pdf-capture-container';
  
  // Main container styles
  clone.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    background: white !important;
    visibility: visible !important;
    display: block !important;
    z-index: 99999;
    padding: 0;
    margin: 0;
  `;

  // Get all form containers
  const forms = clone.querySelectorAll('[id$="-form"]');
  
  forms.forEach((form, index) => {
    const formEl = form as HTMLElement;
    const isPagarForm = formEl.id === 'pagar-form';
    
    // Base form styles
    formEl.style.cssText = `
      display: block !important;
      visibility: visible !important;
      background: white !important;
      color: black !important;
      margin: 0 !important;
      padding: ${isPagarForm ? '3mm' : '5mm'} !important;
      box-sizing: border-box !important;
      page-break-after: ${index < forms.length - 1 ? 'always' : 'avoid'} !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
      width: ${isPagarForm ? '287mm' : '200mm'} !important;
      min-height: ${isPagarForm ? '200mm' : '280mm'} !important;
      font-family: Arial, sans-serif !important;
      font-size: ${isPagarForm ? '9pt' : '10pt'} !important;
    `;
  });

  // Style all tables
  const tables = clone.querySelectorAll('table');
  tables.forEach((table) => {
    const tableEl = table as HTMLElement;
    tableEl.style.cssText = `
      width: 100% !important;
      border-collapse: collapse !important;
      margin-bottom: 2mm !important;
      background: white !important;
    `;
  });

  // Style all table cells
  const cells = clone.querySelectorAll('th, td');
  cells.forEach((cell) => {
    const cellEl = cell as HTMLElement;
    const isHeader = cell.tagName === 'TH';
    cellEl.style.cssText = `
      border: 0.5pt solid black !important;
      padding: 1mm 1.5mm !important;
      font-size: 9pt !important;
      color: black !important;
      background: ${isHeader ? '#e8e8e8' : 'white'} !important;
      vertical-align: middle !important;
      text-align: ${cellEl.style.textAlign || 'left'} !important;
      font-weight: ${isHeader ? 'bold' : 'normal'} !important;
    `;
  });

  // Style inputs and spans to look like plain text
  const inputs = clone.querySelectorAll('input');
  inputs.forEach((input) => {
    const inputEl = input as HTMLInputElement;
    const span = document.createElement('span');
    span.textContent = inputEl.value || '';
    span.style.cssText = `
      color: black !important;
      font-size: inherit !important;
      font-family: inherit !important;
    `;
    inputEl.parentNode?.replaceChild(span, inputEl);
  });

  // Hide screen-only elements
  const hideElements = clone.querySelectorAll('.screen-only, .no-print, button, [class*="edit"]');
  hideElements.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  // Style title elements
  const titles = clone.querySelectorAll('.text-center.font-bold, h1, h2, h3');
  titles.forEach((title) => {
    const titleEl = title as HTMLElement;
    titleEl.style.color = 'black';
    titleEl.style.fontWeight = 'bold';
  });

  return clone;
};

// Generate PDF and auto-download
export const downloadPDF = async (
  printElement: HTMLElement,
  clientName: string,
  financialYear: string
): Promise<void> => {
  const clone = createPrintStyledClone(printElement);
  document.body.appendChild(clone);
  
  // Wait for DOM to render
  await new Promise(resolve => setTimeout(resolve, 300));

  const filename = `${clientName}_TaxForms_${financialYear}.pdf`;
  
  const options = {
    margin: [5, 5, 5, 5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break',
      after: '[id$="-form"]:not(:last-child)'
    }
  };

  try {
    await html2pdf()
      .set(options)
      .from(clone)
      .save();
  } finally {
    document.body.removeChild(clone);
  }
};

// Generate PDF and save to storage
export const generateAndSavePDF = async (
  printElement: HTMLElement,
  clientId: string,
  clientName: string,
  financialYear: string,
  userId?: string
): Promise<PDFGenerationResult> => {
  try {
    const clone = createPrintStyledClone(printElement);
    document.body.appendChild(clone);
    
    await new Promise(resolve => setTimeout(resolve, 300));

    const options = {
      margin: [5, 5, 5, 5],
      filename: `${clientName}_TaxForms_${financialYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break',
        after: '[id$="-form"]:not(:last-child)'
      }
    };

    // Generate PDF blob
    const pdfBlob = await html2pdf()
      .set(options)
      .from(clone)
      .outputPdf('blob');

    document.body.removeChild(clone);

    // Create file path
    const timestamp = Date.now();
    const sanitizedName = clientName.replace(/[^a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F]/g, '_');
    const filePath = `${clientId}/${sanitizedName}_${financialYear}_${timestamp}.pdf`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
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
