import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { getClientById, updateClientStatus } from "@/lib/clientStorage";
import { getOrCreateTaxForm, saveTaxForm, calculateTax } from "@/lib/taxFormStorage";
import { fillSampleDataForClient } from "@/lib/sampleTaxData";
import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import PagarForm from "@/components/taxforms/PagarForm";
import DeclarationForm from "@/components/taxforms/DeclarationForm";
import AavakVeraFormA from "@/components/taxforms/AavakVeraFormA";
import AavakVeraFormB from "@/components/taxforms/AavakVeraFormB";
import Form16A from "@/components/taxforms/Form16A";
import Form16B from "@/components/taxforms/Form16B";
import { Search, Printer, FileText, FileSpreadsheet, Save, ArrowLeft, Calculator, RefreshCw, Database, Loader2, PanelRightOpen, PanelRightClose } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TaxChatbot from "@/components/TaxChatbot";
import SideCalculator from "@/components/admin/SideCalculator";
import SampleTemplates from "@/components/admin/SampleTemplates";
import WhatsAppShare from "@/components/admin/WhatsAppShare";
import { useAuth } from "@/hooks/useAuth";
const TaxFormAdmin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [clientId, setClientId] = useState(searchParams.get("clientId") || "");
  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<TaxFormData | null>(null);
  const [activeTab, setActiveTab] = useState("pagar");
  const [autoCalcEnabled, setAutoCalcEnabled] = useState(true);
  const [showTemplates, setShowTemplates] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  // Check admin authentication via Supabase
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
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      const id = searchParams.get("clientId");
      if (id) {
        loadClient(id);
      }
    }
  }, [searchParams, authLoading, user, isAdmin]);

  const loadClient = (id: string) => {
    const foundClient = getClientById(id);
    if (foundClient) {
      setClient(foundClient);
      setClientId(id);
      const taxForm = getOrCreateTaxForm(id);
      // Auto-calculate on load
      const calculated = calculateTax(taxForm);
      setFormData(calculated);
    } else {
      toast({ title: "Error", description: "Client not found", variant: "destructive" });
    }
  };

  const handleSearch = () => {
    if (clientId.trim()) {
      loadClient(clientId.trim());
    }
  };

  // Auto-calculate when form data changes (Excel-like formula behavior)
  const handleFormChange = useCallback((newData: TaxFormData) => {
    if (autoCalcEnabled) {
      // Auto-calculate totals and tax like Excel formulas
      const calculated = calculateTax(newData);
      setFormData(calculated);
    } else {
      setFormData(newData);
    }
  }, [autoCalcEnabled]);

  const handleSave = () => {
    if (formData && client) {
      const calculated = calculateTax(formData);
      saveTaxForm(calculated);
      setFormData(calculated);
      // Update client status to completed when form is saved
      updateClientStatus(client.id, "completed");
      setClient({ ...client, formStatus: "completed" });
      toast({ title: "Saved", description: "Form saved and status updated to Completed" });
    }
  };

  const handleCalculate = () => {
    if (formData) {
      const calculated = calculateTax(formData);
      setFormData(calculated);
      saveTaxForm(calculated);
      toast({ title: "Calculated", description: "Tax calculation completed" });
    } else {
      toast({ title: "Error", description: "Please load a client first", variant: "destructive" });
    }
  };

  const handleLoadSampleData = () => {
    if (client) {
      const filledData = fillSampleDataForClient(client.id);
      setFormData(filledData);
      toast({ 
        title: "Sample Data Loaded", 
        description: `Excel data filled for ${client.name}. Click Save to persist.` 
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!client || !formData) return;
    
    const salaryData = formData.salaryData;
    const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;
    const monthNames = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    
    // Create comprehensive CSV with all forms data
    let csv = '\uFEFF'; // BOM for UTF-8
    
    // Client Info
    csv += `CLIENT INFORMATION\n`;
    csv += `Client ID,${client.id}\n`;
    csv += `Name,${client.name}\n`;
    csv += `Name (Gujarati),${client.nameGujarati || ''}\n`;
    csv += `School,${client.schoolName || ''}\n`;
    csv += `Designation,${client.designation || ''}\n`;
    csv += `PAN No,${client.panNo || ''}\n`;
    csv += `Aadhar No,${client.aadharNo || ''}\n`;
    csv += `Mobile,${client.mobileNo || ''}\n`;
    csv += `Bank A/C,${client.bankAcNo || ''}\n`;
    csv += `IFSC,${client.ifscCode || ''}\n\n`;
    
    // PAGAR FORM - Salary Data
    csv += `PAGAR FORM - SALARY DATA\n`;
    csv += `Financial Year,${salaryData.financialYear}\n`;
    csv += `Accounting Year,${salaryData.accountingYear}\n\n`;
    
    csv += `Month,Basic,Grade Pay,DA,HRA,Medical,Disability Allow,Principal Allow,DA Arrears,Salary Arrears,Total Salary,GPF,CPF,Prof Tax,Society,Group Ins,Income Tax,Total Deduction,Net Pay\n`;
    
    months.forEach((m, i) => {
      const s = salaryData.months[m];
      csv += `${monthNames[i]},${s.basic},${s.gradePay},${s.da},${s.hra},${s.medical},${s.disabilityAllowance},${s.principalAllowance},${s.daArrears},${s.salaryArrears},${s.totalSalary},${s.gpf},${s.cpf},${s.professionTax},${s.society},${s.groupInsurance},${s.incomeTax},${s.totalDeduction},${s.netPay}\n`;
    });
    
    const t = salaryData.totals;
    csv += `TOTAL,${t.basic},${t.gradePay},${t.da},${t.hra},${t.medical},${t.disabilityAllowance},${t.principalAllowance},${t.daArrears},${t.salaryArrears},${t.totalSalary},${t.gpf},${t.cpf},${t.professionTax},${t.society},${t.groupInsurance},${t.incomeTax},${t.totalDeduction},${t.netPay}\n\n`;
    
    // Declaration Form
    const decl = formData.declarationData;
    csv += `DECLARATION FORM\n`;
    csv += `Income Type,Amount\n`;
    csv += `Bank Interest (Savings),${decl.bankInterest}\n`;
    csv += `NSC Interest,${decl.nscInterest}\n`;
    csv += `Exam Income,${decl.examIncome}\n`;
    csv += `FD Interest,${decl.fdInterest}\n`;
    csv += `Other Income,${decl.otherIncome}\n`;
    csv += `Total Income,${decl.totalIncome}\n\n`;
    
    csv += `Deduction Type,Amount\n`;
    csv += `LIC Premium,${decl.licPremium}\n`;
    csv += `Post Insurance,${decl.postInsurance}\n`;
    csv += `PPF,${decl.ppf}\n`;
    csv += `NSC Investment,${decl.nscInvestment}\n`;
    csv += `Housing Loan Interest,${decl.housingLoanInterest}\n`;
    csv += `Housing Loan Principal,${decl.housingLoanPrincipal}\n`;
    csv += `Education Fee,${decl.educationFee}\n`;
    csv += `SBI Life/FD,${decl.sbiLife}\n`;
    csv += `Sukanya Samridhi,${decl.sukanyaSamridhi}\n`;
    csv += `Medical Insurance,${decl.medicalInsurance}\n`;
    csv += `5 Year FD,${decl.fiveYearFD}\n`;
    csv += `Other Deduction,${decl.otherDeduction}\n`;
    csv += `Total Deduction,${decl.totalDeduction}\n\n`;
    
    // Tax Calculation A
    const taxA = formData.taxCalculationA;
    csv += `AAVAK VERA FORM A - TAX CALCULATION\n`;
    csv += `Particulars,Amount\n`;
    csv += `Gross Salary,${taxA.grossSalary}\n`;
    csv += `HRA Exempt,${taxA.hraExempt}\n`;
    csv += `Transport Allowance,${taxA.transportAllowance}\n`;
    csv += `Total Exempt,${taxA.totalExempt}\n`;
    csv += `Balance Salary,${taxA.balanceSalary}\n`;
    csv += `Profession Tax,${taxA.professionTax}\n`;
    csv += `Standard Deduction,${taxA.standardDeduction}\n`;
    csv += `Professional Income,${taxA.professionalIncome}\n`;
    csv += `Bank Interest,${taxA.bankInterest}\n`;
    csv += `NSC Interest,${taxA.nscInterest}\n`;
    csv += `FD Interest,${taxA.fdInterest}\n`;
    csv += `Total Interest Income,${taxA.totalInterestIncome}\n`;
    csv += `Exam Income,${taxA.examIncome}\n`;
    csv += `Other Income,${taxA.otherIncome}\n`;
    csv += `Total Other Income,${taxA.totalOtherIncome}\n`;
    csv += `Gross Total Income,${taxA.grossTotalIncome}\n`;
    csv += `Housing Loan Interest,${taxA.housingLoanInterest}\n`;
    csv += `PRO Income,${taxA.proIncome}\n\n`;
    
    // Tax Calculation B
    const taxB = formData.taxCalculationB;
    csv += `AAVAK VERA FORM B - DEDUCTIONS & TAX\n`;
    csv += `Section 80C Deductions,Amount\n`;
    csv += `GPF,${taxB.gpf}\n`;
    csv += `CPF,${taxB.cpf}\n`;
    csv += `LIC Premium,${taxB.licPremium}\n`;
    csv += `PLI Premium,${taxB.pliPremium}\n`;
    csv += `Group Insurance,${taxB.groupInsurance}\n`;
    csv += `PPF,${taxB.ppf}\n`;
    csv += `NSC Investment,${taxB.nscInvestment}\n`;
    csv += `Housing Loan Principal,${taxB.housingLoanPrincipal}\n`;
    csv += `Education Fee,${taxB.educationFee}\n`;
    csv += `Other 80C (SSY/FD),${taxB.otherInvestment80C}\n`;
    csv += `Total 80C,${taxB.total80C}\n`;
    csv += `Max 80C (150000 limit),${taxB.max80C}\n\n`;
    
    csv += `Other Deductions,Amount\n`;
    csv += `Medical Insurance 80D,${taxB.medicalInsurance80D}\n`;
    csv += `Disabled Dependent 80DD,${taxB.disabledDependent80DD}\n`;
    csv += `Serious Disease 80DDB,${taxB.seriousDisease80DDB}\n`;
    csv += `Disability 80U,${taxB.disability80U}\n`;
    csv += `Donation 80G,${taxB.donation80G}\n`;
    csv += `Savings Interest 80TTA,${taxB.savingsBankInterest80TTA}\n`;
    csv += `Total Deductions,${taxB.totalDeductions}\n\n`;
    
    csv += `Tax Calculation,Amount\n`;
    csv += `Taxable Income,${taxB.taxableIncome}\n`;
    csv += `Rounded Taxable Income,${taxB.roundedTaxableIncome}\n`;
    csv += `Tax Slab 1 (0-2.5L @ 0%),${taxB.taxSlab1}\n`;
    csv += `Tax Slab 2 (2.5-5L @ 5%),${taxB.taxSlab2}\n`;
    csv += `Tax Slab 3 (5-10L @ 20%),${taxB.taxSlab3}\n`;
    csv += `Total Tax,${taxB.totalTax}\n`;
    csv += `Tax Rebate 87A,${taxB.taxRebate87A}\n`;
    csv += `Tax After Rebate,${taxB.taxAfterRebate}\n`;
    csv += `Education Cess 4%,${taxB.educationCess}\n`;
    csv += `Total Tax Payable,${taxB.totalTaxPayable}\n`;
    csv += `Relief 89,${taxB.relief89}\n`;
    csv += `Net Tax Payable,${taxB.netTaxPayable}\n`;
    csv += `Tax Paid,${taxB.taxPaid}\n`;
    csv += `Balance Tax,${taxB.balanceTax}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.id}_${client.name.replace(/\s+/g, '_')}_TaxForm.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Exported", description: "Excel file downloaded successfully" });
  };

  const handleExportPDF = () => {
    window.print();
    toast({ title: "PDF", description: "Use 'Save as PDF' option in print dialog" });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render until authentication is verified
  if (!user || !isAdmin) {
    return null;
  }

  const handleApplyTemplate = (templateData: TaxFormData) => {
    if (client) {
      const newData = {
        ...templateData,
        clientId: client.id,
      };
      const calculated = calculateTax(newData);
      setFormData(calculated);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="no-print">
        <Header />
      </div>
      
      <main className="flex-1 py-4">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="mb-4 flex flex-wrap items-center gap-3 no-print">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Client ID (e.g., 202601)"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-40"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4 mr-1" /> Load
              </Button>
            </div>

            {client && (
              <>
                <Button onClick={handleLoadSampleData} variant="secondary" size="sm" title="Load sample data from Excel">
                  <Database className="h-4 w-4 mr-1" /> Sample
                </Button>
                <Button 
                  onClick={() => setAutoCalcEnabled(!autoCalcEnabled)} 
                  variant={autoCalcEnabled ? "default" : "outline"} 
                  size="sm"
                  title={autoCalcEnabled ? "Auto-calc ON" : "Auto-calc OFF"}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${autoCalcEnabled ? 'animate-spin' : ''}`} /> 
                  Auto
                </Button>
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
                <WhatsAppShare client={client} onSharePDF={handleExportPDF} />
                <Button 
                  onClick={() => setShowTemplates(!showTemplates)} 
                  variant="ghost" 
                  size="sm"
                  title={showTemplates ? "Hide Templates" : "Show Templates"}
                >
                  {showTemplates ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>

          {/* Client Info */}
          {client && (
            <div className="mb-4 p-3 bg-muted rounded-lg no-print">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                <div><strong>ID:</strong> {client.id}</div>
                <div><strong>Name:</strong> {client.name}</div>
                <div><strong>PAN:</strong> {client.panNo || '-'}</div>
                <div><strong>Mobile:</strong> {client.mobileNo}</div>
                <div><strong>School:</strong> {client.schoolName || '-'}</div>
              </div>
            </div>
          )}

          {/* Main Content with Sidebar */}
          <div className="flex gap-4">
            {/* Forms - Screen View */}
            <div className={`flex-1 ${showTemplates && client ? '' : 'w-full'}`}>
              {client && formData ? (
                <div className="no-print">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-6 mb-4">
                      <TabsTrigger value="pagar" className="text-xs">પગાર</TabsTrigger>
                      <TabsTrigger value="declaration" className="text-xs">Declaration</TabsTrigger>
                      <TabsTrigger value="formA" className="text-xs">આવકવેરા A</TabsTrigger>
                      <TabsTrigger value="formB" className="text-xs">આવકવેરા B</TabsTrigger>
                      <TabsTrigger value="form16a" className="text-xs">Form 16A</TabsTrigger>
                      <TabsTrigger value="form16b" className="text-xs">Form 16B</TabsTrigger>
                    </TabsList>

                    <div className="border rounded-lg p-4 bg-white dark:bg-card overflow-auto max-h-[70vh]">
                      <TabsContent value="pagar" className="mt-0">
                        <PagarForm client={client} formData={formData} onChange={handleFormChange} />
                      </TabsContent>
                      <TabsContent value="declaration" className="mt-0">
                        <DeclarationForm client={client} formData={formData} onChange={handleFormChange} />
                      </TabsContent>
                      <TabsContent value="formA" className="mt-0">
                        <AavakVeraFormA client={client} formData={formData} onChange={handleFormChange} />
                      </TabsContent>
                      <TabsContent value="formB" className="mt-0">
                        <AavakVeraFormB client={client} formData={formData} onChange={handleFormChange} />
                      </TabsContent>
                      <TabsContent value="form16a" className="mt-0">
                        <Form16A client={client} formData={formData} onChange={handleFormChange} />
                      </TabsContent>
                      <TabsContent value="form16b" className="mt-0">
                        <Form16B client={client} formData={formData} onChange={handleFormChange} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground no-print">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Enter Client ID to load tax forms</p>
                </div>
              )}
            </div>

            {/* Sample Templates Sidebar */}
            {showTemplates && client && (
              <div className="w-64 flex-shrink-0 no-print sample-templates-sidebar">
                <SampleTemplates
                  currentFormData={formData}
                  onApplyTemplate={handleApplyTemplate}
                />
              </div>
            )}
          </div>

          {/* Print Area - All Forms for A4 Print */}
          {client && formData && (
            <div className="hidden print:block" ref={printRef}>
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
      
      <SideCalculator />
      <TaxChatbot formData={formData} />
    </div>
  );
};

export default TaxFormAdmin;
