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

// Style a form element for PDF capture
const styleFormForCapture = (form: HTMLElement, formId: string): void => {
  const isPagar = formId === 'pagar-form';
  
  // Make form visible and properly sized
  form.style.cssText = `
    display: block !important;
    visibility: visible !important;
    background: white !important;
    color: black !important;
    opacity: 1 !important;
    position: relative !important;
    overflow: visible !important;
    box-sizing: border-box !important;
    width: ${isPagar ? '280mm' : '200mm'} !important;
    min-width: ${isPagar ? '280mm' : '200mm'} !important;
    padding: ${isPagar ? '3mm' : '5mm'} !important;
    font-size: ${isPagar ? '9pt' : '10pt'} !important;
    page-break-after: always !important;
    page-break-inside: avoid !important;
  `;

  // Style tables
  const tables = form.querySelectorAll('table');
  tables.forEach((table) => {
    (table as HTMLElement).style.cssText = `
      width: 100% !important;
      border-collapse: collapse !important;
      background: white !important;
      border: 0.5pt solid black !important;
      display: table !important;
      visibility: visible !important;
      margin-bottom: 2mm !important;
    `;
  });

  // Style cells
  const cells = form.querySelectorAll('th, td');
  cells.forEach((cell) => {
    const isHeader = cell.tagName === 'TH';
    (cell as HTMLElement).style.cssText = `
      border: 0.5pt solid black !important;
      color: black !important;
      background: ${isHeader ? '#e8e8e8' : 'white'} !important;
      padding: ${isPagar ? '0.5mm 1mm' : '1mm 2mm'} !important;
      font-size: ${isPagar ? '9pt' : '10pt'} !important;
      vertical-align: middle !important;
      display: table-cell !important;
      visibility: visible !important;
      line-height: 1.2 !important;
    `;
  });

  // Convert inputs to text
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    const span = document.createElement('span');
    span.textContent = input.value || '';
    span.style.cssText = `
      color: black !important;
      font-size: inherit !important;
      background: transparent !important;
    `;
    if (input.parentNode) {
      input.parentNode.replaceChild(span, input);
    }
  });

  // Hide buttons and screen-only elements
  const hideElements = form.querySelectorAll('.screen-only, .no-print, button');
  hideElements.forEach((el) => {
    (el as HTMLElement).style.cssText = 'display: none !important;';
  });
};

// Create styled clone of print area
const createStyledClone = (printElement: HTMLElement): HTMLElement => {
  console.log('PDF: Creating styled clone');
  
  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.id = 'pdf-wrapper';
  wrapper.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: white !important;
    z-index: 99999 !important;
    overflow: auto !important;
    padding: 0 !important;
    margin: 0 !important;
  `;
  
  // Clone print element
  const clone = printElement.cloneNode(true) as HTMLElement;
  clone.classList.remove('print-only-area');
  clone.id = 'pdf-container';
  clone.style.cssText = `
    position: static !important;
    width: 210mm !important;
    background: white !important;
    visibility: visible !important;
    display: block !important;
    padding: 0 !important;
    margin: 0 auto !important;
    opacity: 1 !important;
  `;

  // Force visibility on all elements first
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.classList.remove('hidden', 'invisible', 'print-only-area');
  });

  // Style each form
  FORM_IDS.forEach((formId) => {
    const form = clone.querySelector(`#${formId}`) as HTMLElement;
    if (form) {
      styleFormForCapture(form, formId);
      console.log(`PDF: Styled form ${formId}`);
    }
  });

  wrapper.appendChild(clone);
  return wrapper;
};

// Generate PDF and auto-download
export const downloadPDF = async (
  printElement: HTMLElement,
  clientName: string,
  financialYear: string
): Promise<void> => {
  console.log('PDF: Starting download...');
  
  const wrapper = createStyledClone(printElement);
  document.body.appendChild(wrapper);
  
  const container = wrapper.querySelector('#pdf-container') as HTMLElement;
  wrapper.scrollTop = 0;
  
  await new Promise(resolve => setTimeout(resolve, 800));

  const filename = `${clientName}_TaxForms_${financialYear}.pdf`;
  
  console.log('PDF: Container size:', container?.offsetWidth, container?.offsetHeight);
  
  const options = {
    margin: [5, 5, 5, 5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: { 
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: container?.scrollWidth || 794,
      height: container?.scrollHeight || 5000,
      windowWidth: container?.scrollWidth || 794,
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
      .from(container)
      .save();
    console.log('PDF: Download complete');
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  } finally {
    document.body.removeChild(wrapper);
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
    console.log('PDF: Generating for storage...');
    
    const wrapper = createStyledClone(printElement);
    document.body.appendChild(wrapper);
    
    const container = wrapper.querySelector('#pdf-container') as HTMLElement;
    wrapper.scrollTop = 0;
    
    await new Promise(resolve => setTimeout(resolve, 800));

    const options = {
      margin: [5, 5, 5, 5],
      filename: `${clientName}_TaxForms_${financialYear}.pdf`,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: container?.scrollWidth || 794,
        height: container?.scrollHeight || 5000,
        windowWidth: container?.scrollWidth || 794,
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
      .from(container)
      .outputPdf('blob');

    document.body.removeChild(wrapper);

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

    console.log('PDF: Saved to storage');
    
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
