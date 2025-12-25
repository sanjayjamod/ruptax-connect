import { supabase } from '@/integrations/supabase/client';

export interface PDFGenerationResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
}

// Open print dialog - user can save as PDF from browser
// This uses the exact same print styles that window.print() uses
export const openPrintForPDF = (clientName: string, financialYear: string): void => {
  // Add a message to guide user
  const messageDiv = document.createElement('div');
  messageDiv.id = 'pdf-save-guide';
  messageDiv.className = 'no-print';
  messageDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #1e40af, #7c3aed);
      color: white;
      padding: 15px 20px;
      z-index: 999999;
      text-align: center;
      font-size: 15px;
      font-family: sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">
      <strong>📄 PDF सेव करने के लिए:</strong> 
      Destination/प्रिंटर में <b>"Save as PDF"</b> या <b>"PDF के रूप में सहेजें"</b> चुनें → 
      फाइल का नाम: <b>${clientName}_TaxForms_${financialYear}.pdf</b> → Save करें
    </div>
  `;
  document.body.appendChild(messageDiv);
  
  // Trigger print
  setTimeout(() => {
    window.print();
    // Remove message after print dialog closes
    setTimeout(() => {
      const guide = document.getElementById('pdf-save-guide');
      if (guide) guide.remove();
    }, 1000);
  }, 100);
};

// Download PDF using browser print (same as print output)
export const downloadPDF = async (
  _printElement: HTMLElement,
  clientName: string,
  financialYear: string
): Promise<void> => {
  openPrintForPDF(clientName, financialYear);
};

// Generate and save PDF record (after user saves via print dialog)
export const generateAndSavePDF = async (
  _printElement: HTMLElement,
  clientId: string,
  clientName: string,
  financialYear: string,
  userId?: string
): Promise<PDFGenerationResult> => {
  try {
    // Open print dialog for user to save PDF
    openPrintForPDF(clientName, financialYear);
    
    // Create a record in database (user will save PDF locally via print dialog)
    const timestamp = Date.now();
    const sanitizedName = clientName.replace(/[^a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F]/g, '_');
    const fileName = `${sanitizedName}_TaxForms_${financialYear}.pdf`;
    
    // Save record to client_pdfs table (as a local save record)
    const { error: dbError } = await supabase
      .from('client_pdfs')
      .insert({
        client_id: clientId,
        client_name: clientName,
        file_path: `local/${fileName}`,
        file_url: `#saved-locally-${timestamp}`,
        file_size: 0,
        financial_year: financialYear,
        created_by: userId || null
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return {
      success: true,
      filePath: fileName
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
    // Only try to delete from storage if it's not a local save
    if (!filePath.startsWith('local/')) {
      const { error: storageError } = await supabase.storage
        .from('client-pdfs')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }
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
