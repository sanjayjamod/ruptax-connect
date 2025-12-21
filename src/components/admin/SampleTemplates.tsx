import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaxFormData } from "@/types/taxForm";
import { toast } from "@/hooks/use-toast";
import { 
  Database, 
  Plus, 
  Trash2, 
  FileText,
  Download
} from "lucide-react";

interface SampleTemplate {
  id: string;
  name: string;
  description?: string;
  templateData: TaxFormData;
  createdAt: string;
}

interface SampleTemplatesProps {
  currentFormData: TaxFormData | null;
  onApplyTemplate: (templateData: TaxFormData) => void;
}

const TEMPLATES_KEY = "ruptax_sample_templates";

const SampleTemplates = ({ currentFormData, onApplyTemplate }: SampleTemplatesProps) => {
  const [templates, setTemplates] = useState<SampleTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  };

  const saveTemplates = (newTemplates: SampleTemplate[]) => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleSaveAsTemplate = () => {
    if (!currentFormData) {
      toast({
        title: "Error",
        description: "No form data to save",
        variant: "destructive",
      });
      return;
    }

    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: SampleTemplate = {
      id: Date.now().toString(),
      name: templateName,
      templateData: { ...currentFormData, clientId: "" },
      createdAt: new Date().toISOString(),
    };

    saveTemplates([...templates, newTemplate]);
    setTemplateName("");
    setIsDialogOpen(false);
    
    toast({
      title: "Template Saved",
      description: `"${templateName}" saved as sample template`,
    });
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    saveTemplates(updated);
    toast({
      title: "Template Deleted",
      description: "Sample template removed",
    });
  };

  const handleApplyTemplate = (template: SampleTemplate) => {
    onApplyTemplate(template.templateData);
    toast({
      title: "Template Applied",
      description: `"${template.name}" data loaded into form`,
    });
  };

  return (
    <Card className="border-border/50 shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Database className="h-4 w-4 text-primary" />
            Sample Templates
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                disabled={!currentFormData}
              >
                <Plus className="h-3 w-3 mr-1" /> Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Template</DialogTitle>
                <DialogDescription>
                  Save current form data as a reusable template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Primary Teacher 2025"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAsTemplate}>
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[300px]">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No templates saved</p>
              <p className="text-xs">Fill a form and save it as template</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group flex items-center justify-between p-2 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => handleApplyTemplate(template)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SampleTemplates;
