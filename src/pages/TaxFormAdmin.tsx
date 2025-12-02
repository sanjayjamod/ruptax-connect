import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getClientById } from "@/lib/clientStorage";
import { getOrCreateTaxForm, saveTaxForm, calculateTax } from "@/lib/taxFormStorage";
import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import PagarForm from "@/components/taxforms/PagarForm";
import DeclarationForm from "@/components/taxforms/DeclarationForm";
import AavakVeraFormA from "@/components/taxforms/AavakVeraFormA";
import AavakVeraFormB from "@/components/taxforms/AavakVeraFormB";
import Form16A from "@/components/taxforms/Form16A";
import Form16B from "@/components/taxforms/Form16B";
import { Search, Printer, FileText, FileSpreadsheet, Save, ArrowLeft, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TaxFormAdmin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientId, setClientId] = useState(searchParams.get("clientId") || "");
  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<TaxFormData | null>(null);
  const [activeTab, setActiveTab] = useState("pagar");

  useEffect(() => {
    const id = searchParams.get("clientId");
    if (id) {
      loadClient(id);
    }
  }, [searchParams]);

  const loadClient = (id: string) => {
    const foundClient = getClientById(id);
    if (foundClient) {
      setClient(foundClient);
      setClientId(id);
      const taxForm = getOrCreateTaxForm(id);
      setFormData(taxForm);
    } else {
      toast({ title: "Error", description: "Client not found", variant: "destructive" });
    }
  };

  const handleSearch = () => {
    if (clientId.trim()) {
      loadClient(clientId.trim());
    }
  };

  const handleSave = () => {
    if (formData) {
      saveTaxForm(formData);
      toast({ title: "Saved", description: "Form data saved successfully" });
    }
  };

  const handleCalculate = () => {
    if (formData) {
      const calculated = calculateTax(formData);
      setFormData(calculated);
      saveTaxForm(calculated);
      toast({ title: "Calculated", description: "Tax calculation completed" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!client || !formData) return;
    
    // Create CSV content
    const salaryData = formData.salaryData;
    const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;
    
    let csv = `Client ID,${client.id}\nName,${client.name}\nSchool,${client.schoolName}\n\n`;
    csv += `Salary Data\nMonth,Basic,DA,HRA,Medical,Total Salary,GPF,Income Tax,Net Pay\n`;
    
    months.forEach(m => {
      const s = salaryData.months[m];
      csv += `${m},${s.basic},${s.da},${s.hra},${s.medical},${s.totalSalary},${s.gpf},${s.incomeTax},${s.netPay}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.id}_${client.name}_TaxForm.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Exported", description: "Excel file downloaded" });
  };

  const handleExportPDF = () => {
    // Use browser print to PDF
    window.print();
    toast({ title: "PDF", description: "Use 'Save as PDF' in print dialog" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-4">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="mb-4 flex flex-wrap items-center gap-4 no-print">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter Client ID (e.g., 202601)"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4 mr-1" /> Load
              </Button>
            </div>

            {client && (
              <>
                <Button onClick={handleCalculate} variant="secondary" size="sm">
                  <Calculator className="h-4 w-4 mr-1" /> Calculate
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                </Button>
              </>
            )}
          </div>

          {/* Client Info */}
          {client && (
            <div className="mb-4 p-3 bg-muted rounded-lg no-print">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><strong>ID:</strong> {client.id}</div>
                <div><strong>Name:</strong> {client.name}</div>
                <div><strong>PAN:</strong> {client.panNo}</div>
                <div><strong>Mobile:</strong> {client.mobileNo}</div>
              </div>
            </div>
          )}

          {/* Forms */}
          {client && formData ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="no-print">
              <TabsList className="grid w-full grid-cols-6 mb-4">
                <TabsTrigger value="pagar">પગાર</TabsTrigger>
                <TabsTrigger value="declaration">Declaration</TabsTrigger>
                <TabsTrigger value="formA">આવકવેરા A</TabsTrigger>
                <TabsTrigger value="formB">આવકવેરા B</TabsTrigger>
                <TabsTrigger value="form16a">Form 16A</TabsTrigger>
                <TabsTrigger value="form16b">Form 16B</TabsTrigger>
              </TabsList>

              <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[70vh]">
                <TabsContent value="pagar" className="mt-0">
                  <PagarForm client={client} formData={formData} onChange={setFormData} />
                </TabsContent>
                <TabsContent value="declaration" className="mt-0">
                  <DeclarationForm client={client} formData={formData} onChange={setFormData} />
                </TabsContent>
                <TabsContent value="formA" className="mt-0">
                  <AavakVeraFormA client={client} formData={formData} onChange={setFormData} />
                </TabsContent>
                <TabsContent value="formB" className="mt-0">
                  <AavakVeraFormB client={client} formData={formData} onChange={setFormData} />
                </TabsContent>
                <TabsContent value="form16a" className="mt-0">
                  <Form16A client={client} formData={formData} onChange={setFormData} />
                </TabsContent>
                <TabsContent value="form16b" className="mt-0">
                  <Form16B client={client} formData={formData} onChange={setFormData} />
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Enter Client ID to load tax forms</p>
            </div>
          )}

          {/* Print Area - All Forms */}
          {client && formData && (
            <div className="hidden print:block">
              <PagarForm client={client} formData={formData} onChange={setFormData} readOnly />
              <DeclarationForm client={client} formData={formData} onChange={setFormData} readOnly />
              <AavakVeraFormA client={client} formData={formData} onChange={setFormData} readOnly />
              <AavakVeraFormB client={client} formData={formData} onChange={setFormData} readOnly />
              <Form16A client={client} formData={formData} onChange={setFormData} readOnly />
              <Form16B client={client} formData={formData} onChange={setFormData} readOnly />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TaxFormAdmin;
