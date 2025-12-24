import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Printer, CheckCircle2, Clock, Edit2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAvailableYears } from "@/lib/clientFileStorage";
import { getAllTaxForms, getTaxFormByClientId } from "@/lib/taxFormStorage";

interface FormDownloaderProps {
  clientId: string;
}

const FormDownloader = ({ clientId }: FormDownloaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState("2026-27");
  const years = getAvailableYears();

  // Check if form exists for client and year
  const checkFormStatus = () => {
    const form = getTaxFormByClientId(clientId);
    if (!form) return { status: 'pending', lastUpdated: null };
    
    // Check if form has data (any salary entered)
    const hasSalaryData = form.salaryData.totals.totalSalary > 0;
    return { 
      status: hasSalaryData ? 'completed' : 'pending',
      lastUpdated: form.updatedAt
    };
  };

  const handleViewForm = (tabId: string) => {
    navigate(`/client-tax-form?tab=${tabId}`);
  };

  const handleEditForm = () => {
    navigate(`/client-tax-form`);
  };

  const handlePrint = () => {
    navigate(`/client-tax-form?print=true`);
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
    navigate(`/client-tax-form?print=true`);
  };

  const { status, lastUpdated } = checkFormStatus();

  const forms = [
    { id: 'pagar', name: 'PAGAR (Salary Details)', nameHi: 'પગાર ફોર્મ' },
    { id: 'declaration', name: 'Declaration Form', nameHi: 'ડેકલેરેશન ફોર્મ' },
    { id: 'aavakA', name: 'Aavak Vera Form A', nameHi: 'આવક વેરા ફોર્મ A' },
    { id: 'aavakB', name: 'Aavak Vera Form B', nameHi: 'આવક વેરા ફોર્મ B' },
    { id: 'form16A', name: 'Form 16 Part A', nameHi: 'ફોર્મ 16 ભાગ A' },
    { id: 'form16B', name: 'Form 16 Part B', nameHi: 'ફોર્મ 16 ભાગ B' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Tax Forms
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
              <div className="flex-1">
                <span className="text-sm font-medium">Forms ready for AY {selectedYear}</span>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(lastUpdated).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                Ready
              </Badge>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <span className="text-sm font-medium">Forms pending for AY {selectedYear}</span>
                <p className="text-xs text-muted-foreground">
                  Click "Edit Form" to fill your details
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                Pending
              </Badge>
            </>
          )}
        </div>

        {/* Edit Form Button */}
        <Button onClick={handleEditForm} className="w-full" size="lg">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit / Fill Tax Form
        </Button>

        {/* Forms List */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">View Individual Forms:</p>
          {forms.map(form => (
            <div 
              key={form.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{form.name}</p>
                  <p className="text-xs text-muted-foreground">{form.nameHi}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleViewForm(form.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          ))}
        </div>

        {/* Download Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            onClick={handlePrint} 
            variant="outline"
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print All Forms
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Save as PDF
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Fill your salary and investment details to generate accurate tax forms
        </p>
      </CardContent>
    </Card>
  );
};

export default FormDownloader;