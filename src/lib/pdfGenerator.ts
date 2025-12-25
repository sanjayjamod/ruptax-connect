import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';

export interface PDFGenerationResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
}

export const generateAndSavePDF = async (
  printElement: HTMLElement,
  clientId: string,
  clientName: string,
  financialYear: string,
  userId?: string
): Promise<PDFGenerationResult> => {
  try {
    // Temporarily make print element visible for PDF generation
    const originalStyles = {
      position: printElement.style.position,
      left: printElement.style.left,
      top: printElement.style.top,
      visibility: printElement.style.visibility,
      display: printElement.style.display,
      zIndex: printElement.style.zIndex,
      width: printElement.style.width,
      background: printElement.style.background
    };

    // Make visible for html2pdf capture
    printElement.style.position = 'absolute';
    printElement.style.left = '0';
    printElement.style.top = '0';
    printElement.style.visibility = 'visible';
    printElement.style.display = 'block';
    printElement.style.zIndex = '-1';
    printElement.style.width = '210mm';
    printElement.style.background = 'white';

    // Generate PDF from the print element
    const options = {
      margin: 5,
      filename: `${clientName}_TaxForms_${financialYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: 1123 // A4 height in pixels at 96 DPI
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      },
      pagebreak: { mode: ['css', 'legacy'], before: '.page-break' }
    };

    // Generate PDF blob
    const pdfBlob = await html2pdf()
      .set(options)
      .from(printElement)
      .outputPdf('blob');

    // Restore original styles
    printElement.style.position = originalStyles.position;
    printElement.style.left = originalStyles.left;
    printElement.style.top = originalStyles.top;
    printElement.style.visibility = originalStyles.visibility;
    printElement.style.display = originalStyles.display;
    printElement.style.zIndex = originalStyles.zIndex;
    printElement.style.width = originalStyles.width;
    printElement.style.background = originalStyles.background;

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
  // Temporarily make print element visible for PDF generation
  const originalStyles = {
    position: printElement.style.position,
    left: printElement.style.left,
    top: printElement.style.top,
    visibility: printElement.style.visibility,
    display: printElement.style.display,
    zIndex: printElement.style.zIndex,
    width: printElement.style.width,
    background: printElement.style.background
  };

  // Make visible for html2pdf capture
  printElement.style.position = 'absolute';
  printElement.style.left = '0';
  printElement.style.top = '0';
  printElement.style.visibility = 'visible';
  printElement.style.display = 'block';
  printElement.style.zIndex = '-1';
  printElement.style.width = '210mm';
  printElement.style.background = 'white';

  const options = {
    margin: 5,
    filename: `${clientName}_TaxForms_${financialYear}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      windowWidth: 794,
      windowHeight: 1123
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const
    },
    pagebreak: { mode: ['css', 'legacy'], before: '.page-break' }
  };

  await html2pdf()
    .set(options)
    .from(printElement)
    .save();

  // Restore original styles
  printElement.style.position = originalStyles.position;
  printElement.style.left = originalStyles.left;
  printElement.style.top = originalStyles.top;
  printElement.style.visibility = originalStyles.visibility;
  printElement.style.display = originalStyles.display;
  printElement.style.zIndex = originalStyles.zIndex;
  printElement.style.width = originalStyles.width;
  printElement.style.background = originalStyles.background;
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
