import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { getClientById, updateClientStatus, updateClient } from "@/lib/clientStorage";
import { getOrCreateTaxForm, saveTaxForm, calculateTax, getAllTaxForms } from "@/lib/taxFormStorage";
import { getEmptyTaxFormData } from "@/types/taxForm";
import { fillSampleDataForClient } from "@/lib/sampleTaxData";
import { importTaxFormFromExcel } from "@/lib/taxFormExcelImport";
import { Client, ClientFormData } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import PagarForm from "@/components/taxforms/PagarForm";
import DeclarationForm from "@/components/taxforms/DeclarationForm";
import AavakVeraFormA from "@/components/taxforms/AavakVeraFormA";
import AavakVeraFormB from "@/components/taxforms/AavakVeraFormB";
import Form16A from "@/components/taxforms/Form16A";
import Form16B from "@/components/taxforms/Form16B";
import { Search, Printer, FileText, FileSpreadsheet, Save, ArrowLeft, Calculator, RefreshCw, Database, Loader2, PanelRightOpen, PanelRightClose, Upload, RotateCcw, Edit2, X, Check, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TaxChatbot from "@/components/TaxChatbot";
import SideCalculator from "@/components/admin/SideCalculator";
import SampleTemplates from "@/components/admin/SampleTemplates";
import WhatsAppShare from "@/components/admin/WhatsAppShare";
import EmailShare from "@/components/admin/EmailShare";
import PrintSettings from "@/components/admin/PrintSettings";
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
  const [isManualMode, setIsManualMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedClient, setEditedClient] = useState<Partial<ClientFormData>>({});
  const [savedForms, setSavedForms] = useState<TaxFormData[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const calculated = calculateTax(taxForm);
      setFormData(calculated);
      // Load saved forms for this client
      const allForms = getAllTaxForms();
      const clientForms = allForms.filter(f => f.clientId === id);
      setSavedForms(clientForms);
    } else {
      toast({ title: "Error", description: "Client not found", variant: "destructive" });
    }
  };

  const handleStartEditProfile = () => {
    if (client) {
      setEditedClient({ ...client });
      setIsEditingProfile(true);
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setEditedClient({});
  };

  const handleSaveProfile = () => {
    if (client && editedClient) {
      const updated = updateClient(client.id, editedClient);
      if (updated) {
        setClient(updated);
        setIsEditingProfile(false);
        setEditedClient({});
        toast({ title: "Saved", description: "Profile updated successfully" });
      } else {
        toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
      }
    }
  };

  const handleProfileFieldChange = (field: keyof ClientFormData, value: string) => {
    setEditedClient(prev => ({ ...prev, [field]: value }));
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

  const handleResetData = () => {
    if (client) {
      const emptyData = getEmptyTaxFormData(client.id);
      setFormData(emptyData);
      toast({ 
        title: "Data Reset", 
        description: "All form data has been cleared. Click Save to persist." 
      });
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !client) return;
    
    setIsImporting(true);
    try {
      const importedData = await importTaxFormFromExcel(file, client.id);
      const calculated = calculateTax(importedData);
      setFormData(calculated);
      toast({ 
        title: "Excel Imported", 
        description: `Form data imported from ${file.name}. All forms mapped automatically.` 
      });
    } catch (error) {
      console.error('Excel import error:', error);
      toast({ 
        title: "Import Error", 
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Print only Pagar form in Landscape - Clean Professional Layout
  const handlePrintPagar = () => {
    if (!client || !formData) {
      toast({ title: "Error", description: "Please load client data first", variant: "destructive" });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Error", description: "Please allow popups to print", variant: "destructive" });
      return;
    }

    const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;
    const monthNames = ['એપ્રિલ', 'મે', 'જુન', 'જુલાઇ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર', 'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ'];
    const salaryData = formData.salaryData;

    const calculateTotal = (field: string) => {
      return months.reduce((sum, m) => sum + (Number((salaryData.months[m] as any)[field]) || 0), 0);
    };

    const formatNum = (num: number) => num > 0 ? num.toString() : '';

    const generateRow = (num: string, label: string, field: string) => {
      let cells = months.map(m => `<td class="amt">${formatNum((salaryData.months[m] as any)[field] || 0)}</td>`).join('');
      return `<tr><td>${num}</td><td class="label">${label}</td>${cells}<td class="amt total">${formatNum(calculateTotal(field))}</td><td></td></tr>`;
    };

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>પગાર ફોર્મ - ${client.name}</title>
<style>
@page { size: A4 landscape; margin: 4mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  font-family: 'Noto Sans Gujarati', 'Shruti', Arial, sans-serif; 
  font-size: 8pt; 
  background: #fff; 
  color: #000;
  width: 289mm;
  height: 202mm;
  padding: 2mm;
}
.title { text-align: center; font-size: 12pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2mm; margin-bottom: 2mm; }
.info { display: flex; justify-content: space-between; margin-bottom: 1mm; font-size: 8pt; }
.info-row { display: flex; gap: 5mm; margin-bottom: 1mm; }
.info-row span { }
.info-row strong { font-weight: bold; }
table { width: 100%; border-collapse: collapse; font-size: 7pt; }
th, td { border: 0.5pt solid #000; padding: 1mm; text-align: center; vertical-align: middle; }
th { background: #e8e8e8; font-weight: bold; font-size: 6.5pt; }
.label { text-align: left; white-space: nowrap; }
.amt { text-align: right; font-family: 'Courier New', monospace; font-size: 6.5pt; }
.total { font-weight: bold; background: #f5f5f5; }
.section-header td { background: #d0d0d0; font-weight: bold; text-align: center; }
.signature { display: flex; justify-content: space-between; margin-top: 3mm; font-size: 8pt; }
.sig-right { text-align: right; }
.sig-line { border-top: 1px solid #000; margin-top: 8mm; padding-top: 1mm; }
.footer { text-align: center; font-size: 7pt; margin-top: 2mm; border-top: 1px dashed #999; padding-top: 1mm; color: #555; }
</style>
</head>
<body>
<div class="title">${salaryData.financialYear}</div>

<div class="info">
  <div><strong>હિસાબી વર્ષ તા:</strong> ${salaryData.accountingYear}</div>
  <div style="font-size:7pt">નોંધ :- માર્ચ પેઈડ ઇન અપ્રિલનું વર્ષ ગણવું</div>
</div>

<div class="info-row">
  <span><strong>શાળાનું નામ:</strong> ${client.schoolNameGujarati || client.schoolName || '-'}</span>
  <span><strong>કર્મચારીનું નામ:</strong> ${client.nameGujarati || client.name}</span>
</div>
<div class="info-row">
  <span><strong>સરનામું:</strong> ${client.addressGujarati || client.schoolAddress || '-'}</span>
  <span><strong>હોદ્દો:</strong> ${client.designationGujarati || client.designation || '-'}</span>
</div>

<table>
<thead>
<tr>
  <th style="width:5mm">ક્રમ</th>
  <th style="width:25mm">વેતનની વિગત</th>
  ${monthNames.map(n => `<th style="width:16mm">${n}</th>`).join('')}
  <th style="width:18mm">કુલ</th>
  <th style="width:8mm">નોંધ</th>
</tr>
</thead>
<tbody>
${generateRow('1', 'બેઝિક પગાર', 'basic')}
${generateRow('2', 'ગ્રેડ પે', 'gradePay')}
${generateRow('3', 'મોંઘવારી ભથ્થું', 'da')}
${generateRow('4', 'ઘરભાડા ભથ્થું', 'hra')}
${generateRow('6', 'મેડીકલ ભથ્થું', 'medical')}
${generateRow('7', 'અપંગ એલાઉન્સ', 'disabilityAllowance')}
${generateRow('8', 'આચાર્ય એલાઉન્સ', 'principalAllowance')}
${generateRow('9', 'મોંઘવારી એરિયર્સ', 'daArrears')}
${generateRow('10', 'પગાર એરિયર્સ', 'salaryArrears')}
${generateRow('11', 'અન્ય આવક 1', 'otherIncome1')}
${generateRow('12', 'અન્ય આવક 2', 'otherIncome2')}
${generateRow('13', 'કુલ પગાર', 'totalSalary')}
<tr class="section-header"><td colspan="16">કપાત</td></tr>
${generateRow('14', 'G.P.F.', 'gpf')}
${generateRow('15', 'C.P.F.', 'cpf')}
${generateRow('16', 'વ્યવસાય વેરો', 'professionTax')}
${generateRow('17', 'મંડળી', 'society')}
${generateRow('18', 'જૂથ વિમા પ્રિમિયમ', 'groupInsurance')}
${generateRow('19', 'ઇન્કમટેક્ષ કપાત', 'incomeTax')}
${generateRow('20', 'કુલ કપાત', 'totalDeduction')}
${generateRow('21', 'ચુકવેલ રકમ', 'netPay')}
</tbody>
</table>

<div class="signature">
  <div>
    <p>સ્થળ: ${client.schoolNameGujarati || client.schoolName || '_____________'}</p>
    <p>તારીખ: _______________</p>
  </div>
  <div class="sig-right">
    <div class="sig-line">સંસ્થાના વડાની સહી</div>
  </div>
</div>

<div class="footer">Created By: Smart Computer Vinchhiya 9924640689, 9574031243</div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
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
    <>
      {/* Print Area - All Forms for A4 Print - Outside main for clean printing */}
      {client && formData && (
        <div className="hidden print:block print-area" ref={printRef}>
          <PagarForm client={client} formData={formData} onChange={setFormData} readOnly />
          <DeclarationForm client={client} formData={formData} onChange={setFormData} readOnly />
          <AavakVeraFormA client={client} formData={formData} onChange={setFormData} readOnly />
          <AavakVeraFormB client={client} formData={formData} onChange={setFormData} readOnly />
          <Form16A client={client} formData={formData} onChange={setFormData} readOnly />
          <Form16B client={client} formData={formData} onChange={setFormData} readOnly />
        </div>
      )}

      <div className="flex min-h-screen flex-col bg-background no-print">
        <Header />
        
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
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.xlsm"
                  onChange={handleImportExcel}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="default" 
                  size="sm" 
                  title="Import from Excel file (.xlsm)"
                  disabled={isImporting}
                >
                  {isImporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  Import Excel
                </Button>
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
                <Button
                  onClick={() => setIsManualMode(!isManualMode)} 
                  variant={isManualMode ? "secondary" : "outline"} 
                  size="sm"
                  title={isManualMode ? "Manual Mode ON - Can edit auto fields" : "Manual Mode OFF"}
                  className={isManualMode ? "bg-yellow-500/20 border-yellow-500 text-yellow-700" : ""}
                >
                  {isManualMode ? "Manual ON" : "Manual OFF"}
                </Button>
                <Button onClick={handleCalculate} variant="secondary" size="sm">
                  <Calculator className="h-4 w-4 mr-1" /> Calculate
                </Button>
                <Button 
                  onClick={handleResetData} 
                  variant="destructive" 
                  size="sm"
                  title="Reset all form data / ફોર્મ ડેટા રીસેટ"
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <PrintSettings client={client} formData={formData} onChange={handleFormChange} />
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-1" /> Print All
                </Button>
                <Button onClick={handlePrintPagar} variant="secondary" size="sm" title="Print Pagar Form in A4 Landscape">
                  <Printer className="h-4 w-4 mr-1" /> Pagar (Landscape)
                </Button>
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                </Button>
                <WhatsAppShare client={client} onSharePDF={handleExportPDF} />
                <EmailShare client={client} formData={formData} />
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
                    <TabsList className="grid w-full grid-cols-7 mb-4">
                      <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                      <TabsTrigger value="pagar" className="text-xs">પગાર</TabsTrigger>
                      <TabsTrigger value="declaration" className="text-xs">Declaration</TabsTrigger>
                      <TabsTrigger value="formA" className="text-xs">આવકવેરા A</TabsTrigger>
                      <TabsTrigger value="formB" className="text-xs">આવકવેરા B</TabsTrigger>
                      <TabsTrigger value="form16a" className="text-xs">Form 16A</TabsTrigger>
                      <TabsTrigger value="form16b" className="text-xs">Form 16B</TabsTrigger>
                    </TabsList>

                    <div className="border rounded-lg p-4 bg-white dark:bg-card overflow-auto max-h-[70vh]">
                      <TabsContent value="profile" className="mt-0">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-lg font-bold">Client Profile / ક્લાયન્ટ પ્રોફાઇલ</h2>
                            {!isEditingProfile ? (
                              <Button onClick={handleStartEditProfile} variant="outline" size="sm">
                                <Edit2 className="h-4 w-4 mr-1" /> Edit
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button onClick={handleSaveProfile} variant="default" size="sm">
                                  <Check className="h-4 w-4 mr-1" /> Save
                                </Button>
                                <Button onClick={handleCancelEditProfile} variant="outline" size="sm">
                                  <X className="h-4 w-4 mr-1" /> Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-3">
                              <p><strong>ID:</strong> {client.id}</p>
                              {isEditingProfile ? (
                                <>
                                  <div><strong>Name / નામ:</strong> <Input value={editedClient.name || ''} onChange={(e) => handleProfileFieldChange('name', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Name (Gujarati):</strong> <Input value={editedClient.nameGujarati || ''} onChange={(e) => handleProfileFieldChange('nameGujarati', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Designation:</strong> <Input value={editedClient.designation || ''} onChange={(e) => handleProfileFieldChange('designation', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Designation (Gujarati):</strong> <Input value={editedClient.designationGujarati || ''} onChange={(e) => handleProfileFieldChange('designationGujarati', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>School Name:</strong> <Input value={editedClient.schoolName || ''} onChange={(e) => handleProfileFieldChange('schoolName', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>School Name (Gujarati):</strong> <Input value={editedClient.schoolNameGujarati || ''} onChange={(e) => handleProfileFieldChange('schoolNameGujarati', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>School Address:</strong> <Input value={editedClient.schoolAddress || ''} onChange={(e) => handleProfileFieldChange('schoolAddress', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Address (Gujarati):</strong> <Input value={editedClient.addressGujarati || ''} onChange={(e) => handleProfileFieldChange('addressGujarati', e.target.value)} className="mt-1 h-8" /></div>
                                </>
                              ) : (
                                <>
                                  <p><strong>Name / નામ:</strong> {client.name}</p>
                                  <p><strong>Name (Gujarati):</strong> {client.nameGujarati || '-'}</p>
                                  <p><strong>Designation:</strong> {client.designation || '-'}</p>
                                  <p><strong>Designation (Gujarati):</strong> {client.designationGujarati || '-'}</p>
                                  <p><strong>School Name:</strong> {client.schoolName || '-'}</p>
                                  <p><strong>School Name (Gujarati):</strong> {client.schoolNameGujarati || '-'}</p>
                                  <p><strong>School Address:</strong> {client.schoolAddress || '-'}</p>
                                  <p><strong>Address (Gujarati):</strong> {client.addressGujarati || '-'}</p>
                                </>
                              )}
                            </div>
                            <div className="space-y-3">
                              {isEditingProfile ? (
                                <>
                                  <div><strong>PAN No:</strong> <Input value={editedClient.panNo || ''} onChange={(e) => handleProfileFieldChange('panNo', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Aadhar No:</strong> <Input value={editedClient.aadharNo || ''} onChange={(e) => handleProfileFieldChange('aadharNo', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Mobile No:</strong> <Input value={editedClient.mobileNo || ''} onChange={(e) => handleProfileFieldChange('mobileNo', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Email:</strong> <Input value={editedClient.email || ''} onChange={(e) => handleProfileFieldChange('email', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Bank A/C No:</strong> <Input value={editedClient.bankAcNo || ''} onChange={(e) => handleProfileFieldChange('bankAcNo', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>IFSC Code:</strong> <Input value={editedClient.ifscCode || ''} onChange={(e) => handleProfileFieldChange('ifscCode', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Date of Birth:</strong> <Input value={editedClient.dateOfBirth || ''} onChange={(e) => handleProfileFieldChange('dateOfBirth', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Pay Center:</strong> <Input value={editedClient.payCenterName || ''} onChange={(e) => handleProfileFieldChange('payCenterName', e.target.value)} className="mt-1 h-8" /></div>
                                  <div><strong>Pay Center Address:</strong> <Input value={editedClient.payCenterAddress || ''} onChange={(e) => handleProfileFieldChange('payCenterAddress', e.target.value)} className="mt-1 h-8" /></div>
                                </>
                              ) : (
                                <>
                                  <p><strong>PAN No:</strong> {client.panNo || '-'}</p>
                                  <p><strong>Aadhar No:</strong> {client.aadharNo || '-'}</p>
                                  <p><strong>Mobile No:</strong> {client.mobileNo || '-'}</p>
                                  <p><strong>Email:</strong> {client.email || '-'}</p>
                                  <p><strong>Bank A/C No:</strong> {client.bankAcNo || '-'}</p>
                                  <p><strong>IFSC Code:</strong> {client.ifscCode || '-'}</p>
                                  <p><strong>Date of Birth:</strong> {client.dateOfBirth || '-'}</p>
                                  <p><strong>Pay Center:</strong> {client.payCenterName || '-'}</p>
                                  <p><strong>Pay Center Address:</strong> {client.payCenterAddress || '-'}</p>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-3">
                            <h3 className="text-md font-bold mb-3 text-primary">HEAD MASTER / હેડ માસ્ટર</h3>
                            {isEditingProfile ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><strong>HEAD MASTER:</strong> <Input value={editedClient.headMaster || ''} onChange={(e) => handleProfileFieldChange('headMaster', e.target.value)} className="mt-1 h-8" placeholder="HEAD MASTER નામ" /></div>
                                <div><strong>HEAD MASTER FATHER:</strong> <Input value={editedClient.headMasterFather || ''} onChange={(e) => handleProfileFieldChange('headMasterFather', e.target.value)} className="mt-1 h-8" placeholder="HEAD MASTER પિતાનું નામ" /></div>
                                <div><strong>HEAD MASTER PLACE:</strong> <Input value={editedClient.headMasterPlace || ''} onChange={(e) => handleProfileFieldChange('headMasterPlace', e.target.value)} className="mt-1 h-8" placeholder="Place" /></div>
                                <div><strong>TDO:</strong> <Input value={editedClient.tdo || ''} onChange={(e) => handleProfileFieldChange('tdo', e.target.value)} className="mt-1 h-8" /></div>
                                <div><strong>TDO FATHER:</strong> <Input value={editedClient.tdf || ''} onChange={(e) => handleProfileFieldChange('tdf', e.target.value)} className="mt-1 h-8" /></div>
                                <div><strong>Place:</strong> <Input value={editedClient.place || ''} onChange={(e) => handleProfileFieldChange('place', e.target.value)} className="mt-1 h-8" /></div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <p><strong>HEAD MASTER:</strong> <span className="text-primary font-medium">{client.headMaster || '-'}</span></p>
                                <p><strong>HEAD MASTER FATHER:</strong> <span className="text-primary font-medium">{client.headMasterFather || '-'}</span></p>
                                <p><strong>HEAD MASTER PLACE:</strong> {client.headMasterPlace || '-'}</p>
                                <p><strong>TDO:</strong> {client.tdo || '-'}</p>
                                <p><strong>TDO FATHER:</strong> {client.tdf || '-'}</p>
                                <p><strong>Place:</strong> {client.place || '-'}</p>
                              </div>
                            )}
                          </div>

                          {/* Saved Forms History */}
                          <div className="border-t pt-4 mt-4">
                            <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                              <Clock className="h-4 w-4" /> Saved Forms History / સાચવેલ ફોર્મ
                            </h3>
                            {savedForms.length > 0 ? (
                              <div className="space-y-2">
                                {savedForms.map((form, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div>
                                      <p className="font-medium">{form.salaryData.financialYear}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Last Updated: {form.updatedAt ? new Date(form.updatedAt).toLocaleDateString('en-IN') : 'N/A'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Total Salary: ₹{form.salaryData.totals?.totalSalary?.toLocaleString('en-IN') || 0}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        form.salaryData.totals?.totalSalary > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {form.salaryData.totals?.totalSalary > 0 ? 'Filled' : 'Draft'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">No saved forms yet. Fill the forms and save.</p>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="pagar" className="mt-0">
                        <div id="pagar-form-screen">
                          <PagarForm client={client} formData={formData} onChange={handleFormChange} isManualMode={isManualMode} />
                        </div>
                      </TabsContent>
                      <TabsContent value="declaration" className="mt-0">
                        <DeclarationForm client={client} formData={formData} onChange={handleFormChange} isManualMode={isManualMode} />
                      </TabsContent>
                      <TabsContent value="formA" className="mt-0">
                        <AavakVeraFormA client={client} formData={formData} onChange={handleFormChange} isManualMode={isManualMode} />
                      </TabsContent>
                      <TabsContent value="formB" className="mt-0">
                        <AavakVeraFormB client={client} formData={formData} onChange={handleFormChange} isManualMode={isManualMode} />
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
        </div>
      </main>
      
      <SideCalculator />
      <TaxChatbot formData={formData} />
    </div>
    </>
  );
};

export default TaxFormAdmin;
