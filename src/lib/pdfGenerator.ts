import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';

export interface PDFGenerationResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
}

// All form IDs in the print area
const FORM_IDS = [
  'pagar-form',
  'declaration-form', 
  'aavak-vera-form-a',
  'aavak-vera-form-b',
  'form-16a',
  'form-16b'
];

// Apply print-like styles to clone for PDF generation
const applyPrintStyles = (clone: HTMLElement): void => {
  // Style each form based on its type
  FORM_IDS.forEach((formId, index) => {
    const form = clone.querySelector(`#${formId}`) as HTMLElement;
    if (!form) return;

    const isPagar = formId === 'pagar-form';
    const isLast = index === FORM_IDS.length - 1;
    
    // Base form styles
    form.style.display = 'block';
    form.style.visibility = 'visible';
    form.style.background = 'white';
    form.style.color = 'black';
    form.style.margin = '0';
    form.style.boxSizing = 'border-box';
    form.style.overflow = 'hidden';
    form.style.position = 'relative';
    form.style.pageBreakAfter = isLast ? 'avoid' : 'always';
    form.style.pageBreakInside = 'avoid';

    if (isPagar) {
      // Pagar - Landscape A4
      form.style.width = '287mm';
      form.style.minWidth = '287mm';
      form.style.height = '198mm';
      form.style.maxHeight = '198mm';
      form.style.padding = '2mm';
      form.style.fontSize = '10pt';
    } else if (formId === 'aavak-vera-form-a' || formId === 'aavak-vera-form-b') {
      // Aavak Vera forms - Portrait A4
      form.style.width = '198mm';
      form.style.maxWidth = '198mm';
      form.style.height = 'auto';
      form.style.maxHeight = '280mm';
      form.style.padding = '3mm';
      form.style.fontSize = formId === 'aavak-vera-form-a' ? '8pt' : '7.5pt';
    } else {
      // Declaration, Form 16A, Form 16B - Portrait A4
      form.style.width = '198mm';
      form.style.maxWidth = '198mm';
      form.style.height = 'auto';
      form.style.maxHeight = '282mm';
      form.style.padding = '2mm';
      form.style.fontSize = formId === 'declaration-form' ? '11pt' : '7.5pt';
    }

    // Style tables within this form
    const tables = form.querySelectorAll('table');
    tables.forEach((table) => {
      const tableEl = table as HTMLElement;
      tableEl.style.width = '100%';
      tableEl.style.borderCollapse = 'collapse';
      tableEl.style.marginBottom = isPagar ? '0.5mm' : '1mm';
      tableEl.style.background = 'white';
      tableEl.style.border = '0.5pt solid black';
      if (isPagar) {
        tableEl.style.tableLayout = 'fixed';
      }
    });

    // Style cells within this form
    const cells = form.querySelectorAll('th, td');
    cells.forEach((cell) => {
      const cellEl = cell as HTMLElement;
      const isHeader = cell.tagName === 'TH';
      
      cellEl.style.border = isPagar ? '0.3pt solid black' : '0.5pt solid black';
      cellEl.style.color = 'black';
      cellEl.style.background = isHeader ? '#e8e8e8' : 'white';
      cellEl.style.verticalAlign = 'middle';
      cellEl.style.fontWeight = isHeader ? 'bold' : 'normal';
      cellEl.style.lineHeight = '1.2';
      cellEl.style.overflow = 'hidden';
      
      if (isPagar) {
        cellEl.style.fontSize = '10pt';
        cellEl.style.padding = '0.3mm';
        cellEl.style.whiteSpace = 'nowrap';
      } else if (formId === 'aavak-vera-form-a') {
        cellEl.style.fontSize = '11pt';
        cellEl.style.padding = '0.8mm 1.2mm';
      } else if (formId === 'aavak-vera-form-b') {
        cellEl.style.fontSize = '7.5pt';
        cellEl.style.padding = '0.8mm 1.2mm';
      } else if (formId === 'declaration-form') {
        cellEl.style.fontSize = '11pt';
        cellEl.style.padding = '1mm 1.5mm';
      } else {
        cellEl.style.fontSize = '7.5pt';
        cellEl.style.padding = '1mm 1.5mm';
      }
    });

    // Style inputs/spans within this form
    const inputs = form.querySelectorAll('input, span');
    inputs.forEach((input) => {
      const el = input as HTMLElement;
      el.style.border = 'none';
      el.style.background = 'transparent';
      el.style.color = 'black';
      if (isPagar) {
        el.style.fontSize = '11pt';
      }
    });

    // Handle Aavak Vera A title - 18pt
    if (formId === 'aavak-vera-form-a') {
      const firstTable = form.querySelector('table:first-of-type');
      if (firstTable) {
        const titleCell = firstTable.querySelector('td');
        if (titleCell) {
          (titleCell as HTMLElement).style.fontSize = '18pt';
          (titleCell as HTMLElement).style.fontWeight = 'bold';
          (titleCell as HTMLElement).style.padding = '2mm';
        }
      }
    }
  });

  // Convert all inputs to spans with their values
  const allInputs = clone.querySelectorAll('input');
  allInputs.forEach((input) => {
    const inputEl = input as HTMLInputElement;
    const span = document.createElement('span');
    span.textContent = inputEl.value || '';
    span.style.color = 'black';
    span.style.fontSize = 'inherit';
    span.style.fontFamily = 'inherit';
    span.style.border = 'none';
    span.style.background = 'transparent';
    if (inputEl.parentNode) {
      inputEl.parentNode.replaceChild(span, inputEl);
    }
  });

  // Hide screen-only elements
  const hideElements = clone.querySelectorAll('.screen-only, .no-print, button');
  hideElements.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
};

// Create a print-styled clone for PDF generation
const createPrintStyledClone = (printElement: HTMLElement): HTMLElement => {
  const clone = printElement.cloneNode(true) as HTMLElement;
  
  // Remove classes that hide content
  clone.classList.remove('print-only-area');
  clone.id = 'pdf-capture-container';
  
  // Main container styles
  clone.style.position = 'absolute';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.width = '210mm';
  clone.style.background = 'white';
  clone.style.visibility = 'visible';
  clone.style.display = 'block';
  clone.style.zIndex = '99999';
  clone.style.padding = '0';
  clone.style.margin = '0';
  clone.style.opacity = '1';

  // Apply all print styles
  applyPrintStyles(clone);
  
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
  
  await new Promise(resolve => setTimeout(resolve, 500));

  const filename = `${clientName}_TaxForms_${financialYear}.pdf`;
  
  // Generate all forms with proper page breaks
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
      windowWidth: 1123, // Use landscape width to capture pagar properly
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      after: ['#pagar-form', '#declaration-form', '#aavak-vera-form-a', '#aavak-vera-form-b', '#form-16a']
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
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate all forms with proper page breaks
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
        windowWidth: 1123, // Use landscape width for pagar
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      },
      pagebreak: { 
        mode: ['css', 'legacy'],
        after: ['#pagar-form', '#declaration-form', '#aavak-vera-form-a', '#aavak-vera-form-b', '#form-16a']
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
