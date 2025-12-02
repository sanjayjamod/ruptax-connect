import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Printer, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAvailableYears } from "@/lib/clientFileStorage";
import { getAllTaxForms } from "@/lib/taxFormStorage";

interface FormDownloaderProps {
  clientId: string;
}

const FormDownloader = ({ clientId }: FormDownloaderProps) => {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2026-27");
  const years = getAvailableYears();

  // Check if form exists for client and year
  const checkFormStatus = (year: string) => {
    const forms = getAllTaxForms();
    const form = forms.find(f => f.clientId === clientId);
    return form ? 'completed' : 'pending';
  };

  const handlePrint = () => {
    // Navigate to tax form page and trigger print
    const printUrl = `/tax-form-admin?clientId=${clientId}&print=true`;
    window.open(printUrl, '_blank');
    toast({
      title: "Opening Print View",
      description: "Please use Ctrl+P or browser print option"
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Download PDF",
      description: "Opening form - use browser's Save as PDF option",
    });
    const printUrl = `/tax-form-admin?clientId=${clientId}&print=true`;
    window.open(printUrl, '_blank');
  };

  const status = checkFormStatus(selectedYear);

  const forms = [
    { id: 'pagar', name: 'PAGAR (Salary Details)', nameHi: 'पगार फॉर्म' },
    { id: 'declaration', name: 'Declaration Form', nameHi: 'घोषणा पत्र' },
    { id: 'aavakveraA', name: 'Aavak Vera Form A', nameHi: 'આવક વેરા ફોર્મ A' },
    { id: 'aavakveraB', name: 'Aavak Vera Form B', nameHi: 'આવક વેરા ફોર્મ B' },
    { id: 'form16A', name: 'Form 16 Part A', nameHi: 'फॉर्म 16 भाग A' },
    { id: 'form16B', name: 'Form 16 Part B', nameHi: 'फॉर्म 16 भाग B' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Download Tax Forms
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
        {/* Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {status === 'completed' ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm">Forms ready for AY {selectedYear}</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 ml-auto">
                Ready
              </Badge>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Forms pending for AY {selectedYear}</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 ml-auto">
                Pending
              </Badge>
            </>
          )}
        </div>

        {/* Forms List */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Available Forms:</p>
          {forms.map(form => (
            <div 
              key={form.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{form.name}</p>
                  <p className="text-xs text-muted-foreground">{form.nameHi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Download Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            onClick={handlePrint} 
            className="flex-1"
            disabled={status === 'pending'}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print All Forms
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            className="flex-1"
            disabled={status === 'pending'}
          >
            <Download className="h-4 w-4 mr-2" />
            Save as PDF
          </Button>
        </div>

        {status === 'pending' && (
          <p className="text-xs text-center text-muted-foreground">
            Forms will be available after admin completes your ITR filing
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FormDownloader;
