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
  console.log('Creating PDF clone from element:', printElement);
  console.log('Original element innerHTML length:', printElement.innerHTML.length);
  console.log('Original element children count:', printElement.children.length);
  
  const clone = printElement.cloneNode(true) as HTMLElement;
  
  // Remove classes that hide content
  clone.classList.remove('print-only-area');
  clone.id = 'pdf-capture-container';
  
  // Main container styles - make it visible
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

  // Get all form containers
  const forms = clone.querySelectorAll('[id$="-form"]');
  console.log('Found forms in clone:', forms.length);
  
  forms.forEach((form, index) => {
    const formEl = form as HTMLElement;
    const isPagarForm = formEl.id === 'pagar-form';
    console.log(`Form ${index}: ${formEl.id}, isPagar: ${isPagarForm}`);
    
    // Make form visible
    formEl.style.display = 'block';
    formEl.style.visibility = 'visible';
    formEl.style.background = 'white';
    formEl.style.color = 'black';
    formEl.style.margin = '0';
    formEl.style.padding = isPagarForm ? '3mm' : '5mm';
    formEl.style.boxSizing = 'border-box';
    formEl.style.pageBreakAfter = index < forms.length - 1 ? 'always' : 'avoid';
    formEl.style.pageBreakInside = 'avoid';
    formEl.style.overflow = 'visible';
    formEl.style.width = isPagarForm ? '287mm' : '200mm';
    formEl.style.minHeight = isPagarForm ? '200mm' : '280mm';
    formEl.style.fontFamily = 'Arial, sans-serif';
    formEl.style.fontSize = isPagarForm ? '9pt' : '10pt';
    formEl.style.position = 'relative';
  });

  // Style all tables
  const tables = clone.querySelectorAll('table');
  console.log('Found tables:', tables.length);
  tables.forEach((table) => {
    const tableEl = table as HTMLElement;
    tableEl.style.width = '100%';
    tableEl.style.borderCollapse = 'collapse';
    tableEl.style.marginBottom = '2mm';
    tableEl.style.background = 'white';
    tableEl.style.display = 'table';
    tableEl.style.visibility = 'visible';
  });

  // Style all table cells
  const cells = clone.querySelectorAll('th, td');
  console.log('Found cells:', cells.length);
  cells.forEach((cell) => {
    const cellEl = cell as HTMLElement;
    const isHeader = cell.tagName === 'TH';
    cellEl.style.border = '0.5pt solid black';
    cellEl.style.padding = '1mm 1.5mm';
    cellEl.style.fontSize = '9pt';
    cellEl.style.color = 'black';
    cellEl.style.background = isHeader ? '#e8e8e8' : 'white';
    cellEl.style.verticalAlign = 'middle';
    cellEl.style.fontWeight = isHeader ? 'bold' : 'normal';
    cellEl.style.visibility = 'visible';
    cellEl.style.display = 'table-cell';
  });

  // Convert inputs to spans with their values
  const inputs = clone.querySelectorAll('input');
  console.log('Found inputs to convert:', inputs.length);
  inputs.forEach((input) => {
    const inputEl = input as HTMLInputElement;
    const span = document.createElement('span');
    span.textContent = inputEl.value || '';
    span.style.color = 'black';
    span.style.fontSize = 'inherit';
    span.style.fontFamily = 'inherit';
    if (inputEl.parentNode) {
      inputEl.parentNode.replaceChild(span, inputEl);
    }
  });

  // Hide screen-only elements
  const hideElements = clone.querySelectorAll('.screen-only, .no-print, button');
  hideElements.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  console.log('Clone prepared, innerHTML length:', clone.innerHTML.length);
  
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
