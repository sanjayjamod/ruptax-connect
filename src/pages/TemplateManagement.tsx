import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Loader2,
  Download,
  Eye,
} from "lucide-react";

interface FormTemplate {
  id: string;
  form_type: string;
  template_name: string;
  file_path: string;
  file_url: string;
  is_active: boolean;
  created_at: string;
}

const FORM_TYPES = [
  { id: "pagar", name: "પગાર ફોર્મ", nameEn: "Pagar Form" },
  { id: "declaration", name: "ડેકલેરેશન ફોર્મ", nameEn: "Declaration Form" },
  { id: "aavak-vera-a", name: "આવકવેરા A", nameEn: "Aavak Vera Form A" },
  { id: "aavak-vera-b", name: "આવકવેરા B", nameEn: "Aavak Vera Form B" },
  { id: "form-16a", name: "ફોર્મ 16A", nameEn: "Form 16A" },
  { id: "form-16b", name: "ફોર્મ 16B", nameEn: "Form 16B" },
];

const TemplateManagement = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/admin-login");
        return;
      }
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/client-dashboard");
        return;
      }
      loadTemplates();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("form_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (formType: string, file: File) => {
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload Excel (.xlsx, .xls) or PDF files only",
        variant: "destructive",
      });
      return;
    }

    setUploadingFor(formType);

    try {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${formType}_${Date.now()}.${fileExt}`;
      const filePath = `templates/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("form-templates")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("form-templates")
        .getPublicUrl(filePath);

      // Deactivate existing templates for this form type
      await supabase
        .from("form_templates")
        .update({ is_active: false })
        .eq("form_type", formType);

      // Insert new template record
      const { error: insertError } = await supabase.from("form_templates").insert({
        form_type: formType,
        template_name: file.name,
        file_path: filePath,
        file_url: urlData.publicUrl,
        uploaded_by: user?.id,
        is_active: true,
      });

      if (insertError) throw insertError;

      toast({
        title: "Template Uploaded",
        description: `Template for ${FORM_TYPES.find((f) => f.id === formType)?.name} uploaded successfully`,
      });

      loadTemplates();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload template",
        variant: "destructive",
      });
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDeleteTemplate = async (template: FormTemplate) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      // Delete from storage
      await supabase.storage.from("form-templates").remove([template.file_path]);

      // Delete from database
      const { error } = await supabase
        .from("form_templates")
        .delete()
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Template has been removed",
      });

      loadTemplates();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const getTemplateForType = (formType: string) => {
    return templates.find((t) => t.form_type === formType && t.is_active);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Template Management</h1>
              <p className="text-muted-foreground">
                Upload Excel/PDF templates for each form type
              </p>
            </div>
          </div>
        </div>

        {/* Form Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FORM_TYPES.map((formType) => {
            const activeTemplate = getTemplateForType(formType.id);

            return (
              <Card key={formType.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{formType.name}</CardTitle>
                      <CardDescription>{formType.nameEn}</CardDescription>
                    </div>
                    {activeTemplate ? (
                      <Badge variant="default" className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <X className="h-3 w-3 mr-1" />
                        No Template
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeTemplate ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span className="truncate">{activeTemplate.template_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(activeTemplate.file_url, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = activeTemplate.file_url;
                            a.download = activeTemplate.template_name;
                            a.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTemplate(activeTemplate)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No template uploaded yet
                    </div>
                  )}

                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[formType.id] = el)}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(formType.id, file);
                        e.target.value = "";
                      }}
                      accept=".xlsx,.xls,.pdf"
                      className="hidden"
                    />
                    <Button
                      variant={activeTemplate ? "secondary" : "default"}
                      className="w-full"
                      onClick={() => fileInputRefs.current[formType.id]?.click()}
                      disabled={uploadingFor === formType.id}
                    >
                      {uploadingFor === formType.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {activeTemplate ? "Replace Template" : "Upload Template"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Upload Templates:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload Excel (.xlsx, .xls) or PDF templates</li>
                  <li>Each form type can have one active template</li>
                  <li>Uploading new template replaces the old one</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Export with Data:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Go to Tax Form Admin page</li>
                  <li>Select client and fill form data</li>
                  <li>Use "Export Excel" or "Export PDF" buttons</li>
                  <li>Data will be filled into your template</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplateManagement;
