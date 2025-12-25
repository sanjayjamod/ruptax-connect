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
    if (!form) {
      console.log(`PDF: Form #${formId} not found`);
      return;
    }

    const isPagar = formId === 'pagar-form';
    const isLast = index === FORM_IDS.length - 1;
    
    // Base form styles with !important to override CSS
    const baseStyles = `
      display: block !important;
      visibility: visible !important;
      background: white !important;
      color: black !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      position: relative !important;
      page-break-after: ${isLast ? 'avoid' : 'always'} !important;
      page-break-inside: avoid !important;
      opacity: 1 !important;
    `;

    if (isPagar) {
      form.style.cssText = baseStyles + `
        width: 287mm !important;
        min-width: 287mm !important;
        height: 198mm !important;
        max-height: 198mm !important;
        padding: 2mm !important;
        font-size: 10pt !important;
      `;
    } else if (formId === 'aavak-vera-form-a' || formId === 'aavak-vera-form-b') {
      form.style.cssText = baseStyles + `
        width: 198mm !important;
        max-width: 198mm !important;
        height: auto !important;
        max-height: 280mm !important;
        padding: 3mm !important;
        font-size: ${formId === 'aavak-vera-form-a' ? '8pt' : '7.5pt'} !important;
      `;
    } else {
      form.style.cssText = baseStyles + `
        width: 198mm !important;
        max-width: 198mm !important;
        height: auto !important;
        max-height: 282mm !important;
        padding: 2mm !important;
        font-size: ${formId === 'declaration-form' ? '11pt' : '7.5pt'} !important;
      `;
    }

    // Style tables within this form
    const tables = form.querySelectorAll('table');
    tables.forEach((table) => {
      const tableEl = table as HTMLElement;
      tableEl.style.cssText = `
        width: 100% !important;
        border-collapse: collapse !important;
        margin-bottom: ${isPagar ? '0.5mm' : '1mm'} !important;
        background: white !important;
        border: 0.5pt solid black !important;
        display: table !important;
        visibility: visible !important;
        ${isPagar ? 'table-layout: fixed !important;' : ''}
      `;
    });

    // Style cells within this form
    const cells = form.querySelectorAll('th, td');
    cells.forEach((cell) => {
      const cellEl = cell as HTMLElement;
      const isHeader = cell.tagName === 'TH';
      
      let fontSize = '7.5pt';
      let padding = '1mm 1.5mm';
      
      if (isPagar) {
        fontSize = '10pt';
        padding = '0.3mm';
      } else if (formId === 'aavak-vera-form-a') {
        fontSize = '11pt';
        padding = '0.8mm 1.2mm';
      } else if (formId === 'aavak-vera-form-b') {
        fontSize = '7.5pt';
        padding = '0.8mm 1.2mm';
      } else if (formId === 'declaration-form') {
        fontSize = '11pt';
        padding = '1mm 1.5mm';
      }
      
      cellEl.style.cssText = `
        border: ${isPagar ? '0.3pt' : '0.5pt'} solid black !important;
        color: black !important;
        background: ${isHeader ? '#e8e8e8' : 'white'} !important;
        vertical-align: middle !important;
        font-weight: ${isHeader ? 'bold' : 'normal'} !important;
        line-height: 1.2 !important;
        overflow: hidden !important;
        font-size: ${fontSize} !important;
        padding: ${padding} !important;
        ${isPagar ? 'white-space: nowrap !important;' : ''}
        display: table-cell !important;
        visibility: visible !important;
      `;
    });

    // Style inputs/spans within this form
    const inputs = form.querySelectorAll('input, span');
    inputs.forEach((input) => {
      const el = input as HTMLElement;
      el.style.cssText = `
        border: none !important;
        background: transparent !important;
        color: black !important;
        ${isPagar ? 'font-size: 11pt !important;' : ''}
        visibility: visible !important;
      `;
    });

    // Handle Aavak Vera A title - 18pt
    if (formId === 'aavak-vera-form-a') {
      const firstTable = form.querySelector('table:first-of-type');
      if (firstTable) {
        const titleCell = firstTable.querySelector('td');
        if (titleCell) {
          (titleCell as HTMLElement).style.cssText += `
            font-size: 18pt !important;
            font-weight: bold !important;
            padding: 2mm !important;
          `;
        }
      }
    }
    
    console.log(`PDF: Styled form #${formId}`);
  });

  // Convert all inputs to spans with their values
  const allInputs = clone.querySelectorAll('input');
  console.log(`PDF: Converting ${allInputs.length} inputs to spans`);
  allInputs.forEach((input) => {
    const inputEl = input as HTMLInputElement;
    const span = document.createElement('span');
    span.textContent = inputEl.value || '';
    span.style.cssText = `
      color: black !important;
      font-size: inherit !important;
      font-family: inherit !important;
      border: none !important;
      background: transparent !important;
      visibility: visible !important;
    `;
    if (inputEl.parentNode) {
      inputEl.parentNode.replaceChild(span, inputEl);
    }
  });

  // Hide screen-only elements
  const hideElements = clone.querySelectorAll('.screen-only, .no-print, button');
  hideElements.forEach((el) => {
    (el as HTMLElement).style.cssText = 'display: none !important;';
  });
};

// Create a print-styled clone for PDF generation
const createPrintStyledClone = (printElement: HTMLElement): HTMLElement => {
  console.log('PDF: Starting clone creation');
  console.log('PDF: Source element children:', printElement.children.length);
  
  const clone = printElement.cloneNode(true) as HTMLElement;
  
  // Remove classes that hide content
  clone.classList.remove('print-only-area');
  clone.id = 'pdf-capture-container';
  
  // Main container styles - MUST be visible
  clone.style.cssText = `
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 210mm !important;
    background: white !important;
    visibility: visible !important;
    display: block !important;
    z-index: 99999 !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 1 !important;
    overflow: visible !important;
    height: auto !important;
  `;

  // Force ALL children to be visible
  const allElements = clone.querySelectorAll('*');
  console.log('PDF: Total elements in clone:', allElements.length);
  
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    // Remove hidden classes
    htmlEl.classList.remove('hidden', 'invisible', 'print-only-area');
    // Ensure visibility
    if (htmlEl.style.display === 'none' || htmlEl.style.visibility === 'hidden') {
      htmlEl.style.display = 'block';
      htmlEl.style.visibility = 'visible';
    }
  });

  // Check forms exist
  let formsFound = 0;
  FORM_IDS.forEach(id => {
    const form = clone.querySelector(`#${id}`);
    if (form) {
      formsFound++;
      console.log(`PDF: Found form #${id}`);
    } else {
      console.log(`PDF: MISSING form #${id}`);
    }
  });
  console.log('PDF: Total forms found:', formsFound);

  // Apply all print styles
  applyPrintStyles(clone);
  
  console.log('PDF: Clone innerHTML length:', clone.innerHTML.length);
  
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
