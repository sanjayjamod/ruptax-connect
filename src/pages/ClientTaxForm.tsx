import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentClient } from "@/lib/clientStorage";
import { getOrCreateTaxForm, saveTaxForm, calculateTax } from "@/lib/taxFormStorage";
import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import PagarForm from "@/components/taxforms/PagarForm";
import DeclarationForm from "@/components/taxforms/DeclarationForm";
import AavakVeraFormA from "@/components/taxforms/AavakVeraFormA";
import AavakVeraFormB from "@/components/taxforms/AavakVeraFormB";
import Form16A from "@/components/taxforms/Form16A";
import Form16B from "@/components/taxforms/Form16B";
import { Save, ArrowLeft, Printer, FileText, Edit2, Eye, Loader2, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ClientTaxForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<TaxFormData | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "pagar");
  const [isEditing, setIsEditing] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentClient = getCurrentClient();
    if (!currentClient) {
      navigate("/client-login");
      return;
    }
    setClient(currentClient);
    
    // Load or create tax form for this client
    const taxForm = getOrCreateTaxForm(currentClient.id);
    const calculated = calculateTax(taxForm);
    setFormData(calculated);
  }, [navigate]);

  const handleFormChange = (newData: TaxFormData) => {
    // Auto-calculate when form data changes
    const calculated = calculateTax(newData);
    setFormData(calculated);
  };

  const handleSave = async () => {
    if (!formData || !client) return;
    
    setIsSaving(true);
    try {
      const calculated = calculateTax(formData);
      saveTaxForm(calculated);
      setFormData(calculated);
      
      toast({ 
        title: "સેવ થયું!", 
        description: "તમારો ફોર્મ સફળતાપૂર્વક સેવ થયો છે।" 
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save form", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!client || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Print Area */}
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate("/client-dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div>
                  <h1 className="font-display text-lg font-bold text-foreground">
                    Tax Forms - {client.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Financial Year: {formData.salaryData.financialYear}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Edit/View Toggle */}
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-1" /> Edit Form
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => setIsManualMode(!isManualMode)} 
                      variant={isManualMode ? "default" : "outline"} 
                      size="sm"
                      title={isManualMode ? "Manual Mode ON - Can edit auto fields" : "Auto Mode - Formulas active"}
                    >
                      {isManualMode ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                      {isManualMode ? "Manual" : "Auto"}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View Only
                    </Button>
                    <Button onClick={handleSave} size="sm" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </>
                )}
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </div>

            {/* Status Info */}
            {formData.updatedAt && (
              <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  Last Updated: {new Date(formData.updatedAt).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Edit Mode Instructions */}
            {isEditing && (
              <div className="mb-4 p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm">
                <p className="font-medium text-primary flex items-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Mode Active
                </p>
                <p className="text-muted-foreground mt-1">
                  Yellow fields = Manual input | Gray/Blue fields = Auto calculated
                  {isManualMode && " | Manual Mode: You can override auto-calculated values"}
                </p>
              </div>
            )}

            {/* Form Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="pagar">Pagar</TabsTrigger>
                <TabsTrigger value="declaration">Declaration</TabsTrigger>
                <TabsTrigger value="aavakA">Form A</TabsTrigger>
                <TabsTrigger value="aavakB">Form B</TabsTrigger>
                <TabsTrigger value="form16A">Form 16A</TabsTrigger>
                <TabsTrigger value="form16B">Form 16B</TabsTrigger>
              </TabsList>

              <div className="mt-4 overflow-x-auto">
                <TabsContent value="pagar">
                  <PagarForm 
                    client={client} 
                    formData={formData} 
                    onChange={handleFormChange} 
                    readOnly={!isEditing}
                    isManualMode={isManualMode}
                  />
                </TabsContent>
                <TabsContent value="declaration">
                  <DeclarationForm 
                    client={client} 
                    formData={formData} 
                    onChange={handleFormChange} 
                    readOnly={!isEditing}
                    isManualMode={isManualMode}
                  />
                </TabsContent>
                <TabsContent value="aavakA">
                  <AavakVeraFormA 
                    client={client} 
                    formData={formData} 
                    onChange={handleFormChange} 
                    readOnly={!isEditing}
                    isManualMode={isManualMode}
                  />
                </TabsContent>
                <TabsContent value="aavakB">
                  <AavakVeraFormB 
                    client={client} 
                    formData={formData} 
                    onChange={handleFormChange} 
                    readOnly={!isEditing}
                    isManualMode={isManualMode}
                  />
                </TabsContent>
                <TabsContent value="form16A">
                  <Form16A 
                    client={client} 
                    formData={formData} 
                    onChange={handleFormChange} 
                    readOnly={!isEditing}
                  />
                </TabsContent>
                <TabsContent value="form16B">
                  <Form16B 
                    client={client} 
                    formData={formData} 
                    onChange={handleFormChange} 
                    readOnly={!isEditing}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ClientTaxForm;