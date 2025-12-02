import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  Trash2, 
  Download, 
  FolderOpen,
  File
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getClientDocuments, 
  saveDocument, 
  deleteDocument, 
  fileToBase64, 
  formatFileSize,
  getAvailableYears 
} from "@/lib/clientFileStorage";
import { ClientDocument } from "@/types/clientFiles";

interface DocumentManagerProps {
  clientId: string;
}

const DocumentManager = ({ clientId }: DocumentManagerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState("2026-27");
  const [documents, setDocuments] = useState<ClientDocument[]>(getClientDocuments(clientId));

  const refreshDocuments = () => {
    setDocuments(getClientDocuments(clientId));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `${file.name} is too large. Max size is 5MB`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        saveDocument(
          clientId,
          { name: file.name, type: file.type, size: file.size, data: base64 },
          selectedYear
        );
        toast({
          title: "Uploaded",
          description: `${file.name} uploaded successfully`
        });
      } catch {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }
    
    refreshDocuments();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (doc: ClientDocument) => {
    if (confirm(`Delete ${doc.name}?`)) {
      deleteDocument(doc.id);
      refreshDocuments();
      toast({
        title: "Deleted",
        description: `${doc.name} deleted`
      });
    }
  };

  const handleDownload = (doc: ClientDocument) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-blue-500" />;
  };

  const filteredDocs = documents.filter(d => d.year === selectedYear);
  const years = getAvailableYears();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5 text-primary" />
            File Manager
          </CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>AY {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload documents (Max 5MB each)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, Images, Word, Excel supported
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No documents for AY {selectedYear}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              {filteredDocs.length} document(s) for AY {selectedYear}
            </p>
            {filteredDocs.map(doc => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(doc.type)}
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentManager;
