import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download, Trash2, Search, FileText, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAllPDFs, deletePDF } from "@/lib/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";

interface ClientPDF {
  id: string;
  client_id: string;
  client_name: string;
  file_path: string;
  file_url: string;
  file_size: number | null;
  financial_year: string;
  created_at: string;
}

const ClientPDFManager = () => {
  const [pdfs, setPdfs] = useState<ClientPDF[]>([]);
  const [filteredPdfs, setFilteredPdfs] = useState<ClientPDF[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const loadPDFs = async () => {
    setIsLoading(true);
    setSelectedIds(new Set());
    try {
      const data = await getAllPDFs();
      setPdfs(data as ClientPDF[]);
      setFilteredPdfs(data as ClientPDF[]);
    } catch (error) {
      console.error("Error loading PDFs:", error);
      toast({ title: "Error", description: "Failed to load PDFs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPDFs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = pdfs.filter(pdf => 
        pdf.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.financial_year.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPdfs(filtered);
    } else {
      setFilteredPdfs(pdfs);
    }
    setSelectedIds(new Set());
  }, [searchTerm, pdfs]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredPdfs.map(pdf => pdf.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleDownload = async (pdf: ClientPDF) => {
    try {
      // Get a signed URL for secure download
      const { data: signedUrlData, error } = await supabase.storage
        .from('client-pdfs')
        .createSignedUrl(pdf.file_path, 3600); // 1 hour expiry

      if (error || !signedUrlData?.signedUrl) {
        toast({ 
          title: "Error", 
          description: "Failed to get download URL", 
          variant: "destructive" 
        });
        return;
      }

      window.open(signedUrlData.signedUrl, '_blank');
    } catch (error) {
      console.error("Download error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to download PDF", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (pdf: ClientPDF) => {
    setDeletingId(pdf.id);
    try {
      const success = await deletePDF(pdf.id, pdf.file_path);
      if (success) {
        setPdfs(prev => prev.filter(p => p.id !== pdf.id));
        toast({ title: "Deleted", description: "PDF deleted successfully" });
      } else {
        toast({ title: "Error", description: "Failed to delete PDF", variant: "destructive" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: "Failed to delete PDF", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setIsBulkDeleting(true);
    const selectedPdfs = filteredPdfs.filter(pdf => selectedIds.has(pdf.id));
    let successCount = 0;
    let failCount = 0;

    for (const pdf of selectedPdfs) {
      try {
        const success = await deletePDF(pdf.id, pdf.file_path);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        failCount++;
      }
    }

    setPdfs(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setIsBulkDeleting(false);

    if (failCount === 0) {
      toast({ title: "Deleted", description: `${successCount} PDFs deleted successfully` });
    } else {
      toast({ 
        title: "Partial Success", 
        description: `${successCount} deleted, ${failCount} failed`, 
        variant: "destructive" 
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAllSelected = filteredPdfs.length > 0 && selectedIds.size === filteredPdfs.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredPdfs.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Client PDFs / ક્લાયન્ટ PDF
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isBulkDeleting}>
                    {isBulkDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Delete {selectedIds.size} Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.size} PDFs?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {selectedIds.size} selected PDFs.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={loadPDFs} variant="outline" size="icon" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPdfs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchTerm ? "No PDFs found matching your search" : "No PDFs generated yet"}</p>
            <p className="text-sm mt-2">Generate PDFs from the Tax Form page</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) (el as any).indeterminate = isSomeSelected;
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Client Name / નામ</TableHead>
                  <TableHead>Financial Year</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPdfs.map((pdf) => (
                  <TableRow key={pdf.id} className={selectedIds.has(pdf.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(pdf.id)}
                        onCheckedChange={(checked) => handleSelectOne(pdf.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pdf.client_id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{pdf.client_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pdf.financial_year}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(pdf.file_size)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(pdf.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleDownload(pdf)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingId === pdf.id}
                            >
                              {deletingId === pdf.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete PDF?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the PDF for {pdf.client_name} ({pdf.financial_year}).
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(pdf)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {filteredPdfs.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            {selectedIds.size > 0 ? (
              <span className="font-medium text-primary">{selectedIds.size} selected • </span>
            ) : null}
            Showing {filteredPdfs.length} of {pdfs.length} PDFs
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientPDFManager;
