import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Printer, Eye, Save, RotateCcw, FileText } from "lucide-react";
import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import PagarForm from "@/components/taxforms/PagarForm";
import DeclarationForm from "@/components/taxforms/DeclarationForm";
import AavakVeraFormA from "@/components/taxforms/AavakVeraFormA";
import AavakVeraFormB from "@/components/taxforms/AavakVeraFormB";
import Form16A from "@/components/taxforms/Form16A";
import Form16B from "@/components/taxforms/Form16B";
import { toast } from "@/hooks/use-toast";

interface PrintSettingsProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
}

interface FormPrintSettings {
  enabled: boolean;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  fontSize: number;
  showBorders: boolean;
  showHeader: boolean;
  showFooter: boolean;
  // Page border options
  pageBorder: boolean;
  pageBorderWidth: number;
  pageBorderStyle: "solid" | "dashed" | "dotted" | "double";
  pageBorderColor: string;
}

interface AllFormSettings {
  pagar: FormPrintSettings;
  declaration: FormPrintSettings;
  aavakVeraA: FormPrintSettings;
  aavakVeraB: FormPrintSettings;
  form16A: FormPrintSettings;
  form16B: FormPrintSettings;
}

const defaultSettings: FormPrintSettings = {
  enabled: true,
  pageSize: "A4",
  orientation: "portrait",
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 5,
  marginRight: 5,
  fontSize: 8,
  showBorders: true,
  showHeader: true,
  showFooter: true,
  pageBorder: false,
  pageBorderWidth: 1,
  pageBorderStyle: "solid",
  pageBorderColor: "#000000",
};

const formNames: { [key: string]: string } = {
  pagar: "પગાર ફોર્મ",
  declaration: "ડિક્લેરેશન ફોર્મ",
  aavakVeraA: "આવકવેરા A",
  aavakVeraB: "આવકવેરા B",
  form16A: "Form 16A",
  form16B: "Form 16B",
};

const PrintSettings = ({ client, formData, onChange }: PrintSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<keyof AllFormSettings>("pagar");
  const [showPreview, setShowPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);
  const previewRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<AllFormSettings>(() => {
    const saved = localStorage.getItem("printSettings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          pagar: { ...defaultSettings, orientation: "landscape" },
          declaration: { ...defaultSettings },
          aavakVeraA: { ...defaultSettings },
          aavakVeraB: { ...defaultSettings },
          form16A: { ...defaultSettings },
          form16B: { ...defaultSettings },
        };
      }
    }
    return {
      pagar: { ...defaultSettings, orientation: "landscape" },
      declaration: { ...defaultSettings },
      aavakVeraA: { ...defaultSettings },
      aavakVeraB: { ...defaultSettings },
      form16A: { ...defaultSettings },
      form16B: { ...defaultSettings },
    };
  });

  // Global page border settings for all forms - load from localStorage
  const [globalBorder, setGlobalBorder] = useState(() => {
    const saved = localStorage.getItem("globalPrintBorder");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          enabled: false,
          width: 1,
          style: "solid" as "solid" | "dashed" | "dotted" | "double",
          color: "#000000",
        };
      }
    }
    return {
      enabled: false,
      width: 1,
      style: "solid" as "solid" | "dashed" | "dotted" | "double",
      color: "#000000",
    };
  });

  // Save global border to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("globalPrintBorder", JSON.stringify(globalBorder));
  }, [globalBorder]);

  const updateFormSetting = <K extends keyof FormPrintSettings>(
    formKey: keyof AllFormSettings,
    field: K,
    value: FormPrintSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [formKey]: { ...prev[formKey], [field]: value },
    }));
  };

  // Apply global border to all forms
  const applyGlobalBorder = () => {
    setSettings(prev => {
      const updated = { ...prev };
      (Object.keys(updated) as Array<keyof AllFormSettings>).forEach(key => {
        updated[key] = {
          ...updated[key],
          pageBorder: globalBorder.enabled,
          pageBorderWidth: globalBorder.width,
          pageBorderStyle: globalBorder.style,
          pageBorderColor: globalBorder.color,
        };
      });
      return updated;
    });
  };

  // Effect to auto-apply global border when changed
  useEffect(() => {
    applyGlobalBorder();
  }, [globalBorder]);

  const saveSettings = () => {
    localStorage.setItem("printSettings", JSON.stringify(settings));
    toast({ title: "સાચવ્યું", description: "Print settings saved successfully" });
  };

  const resetSettings = () => {
    const defaultAll: AllFormSettings = {
      pagar: { ...defaultSettings, orientation: "landscape" },
      declaration: { ...defaultSettings },
      aavakVeraA: { ...defaultSettings },
      aavakVeraB: { ...defaultSettings },
      form16A: { ...defaultSettings },
      form16B: { ...defaultSettings },
    };
    setSettings(defaultAll);
    localStorage.setItem("printSettings", JSON.stringify(defaultAll));
    toast({ title: "Reset", description: "Settings reset to defaults" });
  };

  const generatePrintStyles = (formSettings: FormPrintSettings) => {
    const { pageSize, orientation, marginTop, marginBottom, marginLeft, marginRight, fontSize, showBorders } = formSettings;
    
    const pageSizes = {
      A4: orientation === "portrait" ? "210mm 297mm" : "297mm 210mm",
      Letter: orientation === "portrait" ? "8.5in 11in" : "11in 8.5in",
      Legal: orientation === "portrait" ? "8.5in 14in" : "14in 8.5in",
    };

    return {
      width: orientation === "portrait" ? `calc(${pageSize === "A4" ? "210mm" : pageSize === "Letter" ? "8.5in" : "8.5in"} - ${marginLeft + marginRight}mm)` : `calc(${pageSize === "A4" ? "297mm" : pageSize === "Letter" ? "11in" : "14in"} - ${marginLeft + marginRight}mm)`,
      minHeight: orientation === "portrait" ? `calc(${pageSize === "A4" ? "297mm" : pageSize === "Letter" ? "11in" : "14in"} - ${marginTop + marginBottom}mm)` : `calc(${pageSize === "A4" ? "210mm" : pageSize === "Letter" ? "8.5in" : "8.5in"} - ${marginTop + marginBottom}mm)`,
      padding: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`,
      fontSize: `${fontSize}pt`,
      border: showBorders ? "1px solid #000" : "none",
    };
  };

const handlePrint = () => {
    // Generate unified print CSS - same as Print All button
    const printStyleSheet = document.createElement("style");
    printStyleSheet.id = "custom-print-styles";
    
    const enabledForms = Object.entries(settings)
      .filter(([_, s]) => s.enabled)
      .map(([key, _]) => key);

    const idMap: { [key: string]: string } = {
      pagar: "#pagar-form",
      declaration: "#declaration-form",
      aavakVeraA: "#aavak-vera-form-a",
      aavakVeraB: "#aavak-vera-form-b",
      form16A: "#form-16a",
      form16B: "#form-16b",
    };

    // Unified print styles - uses same layout as Print All
    let customStyles = `
      @media print {
        @page { size: A4 portrait; margin: 5mm; }
        @page pagar { size: A4 landscape; margin: 4mm; }
        .pagar-page { page: pagar; }

        /* Hide disabled forms */
        ${Object.entries(settings)
          .filter(([_, s]) => !s.enabled)
          .map(([key, _]) => `${idMap[key]} { display: none !important; }`)
          .join("\n")}
        
        /* Page border settings - only apply if enabled */
        ${Object.entries(settings)
          .filter(([_, s]) => s.enabled && s.pageBorder)
          .map(([key, s]) => `
            ${idMap[key]} {
              border: ${s.pageBorderWidth}pt ${s.pageBorderStyle} ${s.pageBorderColor} !important;
              box-sizing: border-box !important;
            }
          `)
          .join("\n")}
      }
    `;

    // Remove existing custom styles
    const existing = document.getElementById("custom-print-styles");
    if (existing) existing.remove();

    printStyleSheet.textContent = customStyles;
    document.head.appendChild(printStyleSheet);

    // Trigger print - uses same hidden print-area as Print All
    window.print();
    
    // Clean up after print
    setTimeout(() => {
      const style = document.getElementById("custom-print-styles");
      if (style) style.remove();
    }, 1000);

    toast({ title: "Print", description: `Printing ${enabledForms.length} form(s)` });
  };

  const currentSettings = settings[activeForm];

  const renderFormPreview = (formKey: keyof AllFormSettings) => {
    const s = settings[formKey];
    if (!s.enabled) return null;

    const previewStyle: React.CSSProperties = {
      transform: `scale(${previewScale})`,
      transformOrigin: "top left",
      width: s.orientation === "portrait" ? "210mm" : "297mm",
      minHeight: s.orientation === "portrait" ? "297mm" : "210mm",
      padding: `${s.marginTop}mm ${s.marginRight}mm ${s.marginBottom}mm ${s.marginLeft}mm`,
      fontSize: `${s.fontSize}pt`,
      background: "#fff",
      border: s.pageBorder 
        ? `${s.pageBorderWidth}pt ${s.pageBorderStyle} ${s.pageBorderColor}` 
        : "1px solid #ccc",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      boxSizing: "border-box",
    };

    const formComponents: { [key: string]: JSX.Element } = {
      pagar: <PagarForm client={client} formData={formData} onChange={onChange} readOnly />,
      declaration: <DeclarationForm client={client} formData={formData} onChange={onChange} readOnly />,
      aavakVeraA: <AavakVeraFormA client={client} formData={formData} onChange={onChange} readOnly />,
      aavakVeraB: <AavakVeraFormB client={client} formData={formData} onChange={onChange} readOnly />,
      form16A: <Form16A client={client} formData={formData} onChange={onChange} readOnly />,
      form16B: <Form16B client={client} formData={formData} onChange={onChange} readOnly />,
    };

    return (
      <div key={formKey} className="mb-4">
        <h4 className="font-medium mb-2">{formNames[formKey]}</h4>
        <div className="overflow-auto border rounded-lg bg-gray-100 p-4" style={{ maxHeight: "400px" }}>
          <div style={previewStyle}>
            {formComponents[formKey]}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Print Settings">
          <Settings className="h-4 w-4 mr-1" /> Print Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Settings - પ્રિન્ટ સેટિંગ્સ
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Forms - ફોર્મ્સ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.keys(settings) as Array<keyof AllFormSettings>).map((formKey) => (
                  <div
                    key={formKey}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      activeForm === formKey ? "bg-primary/10 border border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveForm(formKey)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{formNames[formKey]}</span>
                    </div>
                    <Switch
                      checked={settings[formKey].enabled}
                      onCheckedChange={(checked) => updateFormSetting(formKey, "enabled", checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={saveSettings} className="w-full">
                <Save className="h-4 w-4 mr-1" /> Save Settings
              </Button>
              <Button onClick={resetSettings} variant="outline" className="w-full">
                <RotateCcw className="h-4 w-4 mr-1" /> Reset All
              </Button>
              <Button onClick={handlePrint} variant="default" className="w-full bg-green-600 hover:bg-green-700">
                <Printer className="h-4 w-4 mr-1" /> Print Selected
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{formNames[activeForm]} Settings</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="layout">
                  <TabsList className="w-full">
                    <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
                    <TabsTrigger value="margins" className="flex-1">Margins</TabsTrigger>
                    <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
                  </TabsList>

                  <TabsContent value="layout" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Page Size - પેજ સાઇઝ</Label>
                        <Select
                          value={currentSettings.pageSize}
                          onValueChange={(value: "A4" | "Letter" | "Legal") =>
                            updateFormSetting(activeForm, "pageSize", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                            <SelectItem value="Letter">Letter (8.5×11in)</SelectItem>
                            <SelectItem value="Legal">Legal (8.5×14in)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Orientation - ઓરિએન્ટેશન</Label>
                        <Select
                          value={currentSettings.orientation}
                          onValueChange={(value: "portrait" | "landscape") =>
                            updateFormSetting(activeForm, "orientation", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait (ઊભું)</SelectItem>
                            <SelectItem value="landscape">Landscape (આડું)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="margins" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Top Margin (mm) - ઉપર</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[currentSettings.marginTop]}
                            min={0}
                            max={25}
                            step={1}
                            onValueChange={([value]) => updateFormSetting(activeForm, "marginTop", value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={currentSettings.marginTop}
                            onChange={(e) => updateFormSetting(activeForm, "marginTop", Number(e.target.value))}
                            className="w-16"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Bottom Margin (mm) - નીચે</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[currentSettings.marginBottom]}
                            min={0}
                            max={25}
                            step={1}
                            onValueChange={([value]) => updateFormSetting(activeForm, "marginBottom", value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={currentSettings.marginBottom}
                            onChange={(e) => updateFormSetting(activeForm, "marginBottom", Number(e.target.value))}
                            className="w-16"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Left Margin (mm) - ડાબી</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[currentSettings.marginLeft]}
                            min={0}
                            max={25}
                            step={1}
                            onValueChange={([value]) => updateFormSetting(activeForm, "marginLeft", value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={currentSettings.marginLeft}
                            onChange={(e) => updateFormSetting(activeForm, "marginLeft", Number(e.target.value))}
                            className="w-16"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Right Margin (mm) - જમણી</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[currentSettings.marginRight]}
                            min={0}
                            max={25}
                            step={1}
                            onValueChange={([value]) => updateFormSetting(activeForm, "marginRight", value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={currentSettings.marginRight}
                            onChange={(e) => updateFormSetting(activeForm, "marginRight", Number(e.target.value))}
                            className="w-16"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-4 mt-4">
                    <div>
                      <Label>Font Size (pt) - ફોન્ટ સાઇઝ</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[currentSettings.fontSize]}
                          min={5}
                          max={14}
                          step={0.5}
                          onValueChange={([value]) => updateFormSetting(activeForm, "fontSize", value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={currentSettings.fontSize}
                          onChange={(e) => updateFormSetting(activeForm, "fontSize", Number(e.target.value))}
                          className="w-16"
                          step={0.5}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Table Borders - ટેબલ બોર્ડર બતાવો</Label>
                      <Switch
                        checked={currentSettings.showBorders}
                        onCheckedChange={(checked) => updateFormSetting(activeForm, "showBorders", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Header - હેડર બતાવો</Label>
                      <Switch
                        checked={currentSettings.showHeader}
                        onCheckedChange={(checked) => updateFormSetting(activeForm, "showHeader", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Footer - ફૂટર બતાવો</Label>
                      <Switch
                        checked={currentSettings.showFooter}
                        onCheckedChange={(checked) => updateFormSetting(activeForm, "showFooter", checked)}
                      />
                    </div>
                    
                    {/* Global Page Border Section - Applies to ALL forms */}
                    <div className="border-t pt-4 mt-4">
                      <Label className="text-sm font-semibold mb-2 block">Page Border - પેજ બોર્ડર (બધા ફોર્મ માટે)</Label>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Enable Page Border - પેજ બોર્ડર ચાલુ</Label>
                        <Switch
                          checked={globalBorder.enabled}
                          onCheckedChange={(checked) => setGlobalBorder(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>
                      
                      {globalBorder.enabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                          <div>
                            <Label>Border Style - બોર્ડર ડિઝાઇન</Label>
                            <Select
                              value={globalBorder.style}
                              onValueChange={(value: "solid" | "dashed" | "dotted" | "double") =>
                                setGlobalBorder(prev => ({ ...prev, style: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solid">Solid (સીધી લાઇન)</SelectItem>
                                <SelectItem value="dashed">Dashed (ટૂટક લાઇન)</SelectItem>
                                <SelectItem value="dotted">Dotted (ટપકાં)</SelectItem>
                                <SelectItem value="double">Double (બેવડી લાઇન)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Border Width (pt) - બોર્ડર જાડાઈ</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                value={[globalBorder.width]}
                                min={0.5}
                                max={5}
                                step={0.5}
                                onValueChange={([value]) => setGlobalBorder(prev => ({ ...prev, width: value }))}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                value={globalBorder.width}
                                onChange={(e) => setGlobalBorder(prev => ({ ...prev, width: Number(e.target.value) }))}
                                className="w-16"
                                step={0.5}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Border Color - બોર્ડર રંગ</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={globalBorder.color}
                                onChange={(e) => setGlobalBorder(prev => ({ ...prev, color: e.target.value }))}
                                className="w-10 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={globalBorder.color}
                                onChange={(e) => setGlobalBorder(prev => ({ ...prev, color: e.target.value }))}
                                className="flex-1"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Preview Section */}
                {showPreview && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Preview Scale - પ્રિવ્યૂ સ્કેલ</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[previewScale]}
                          min={0.2}
                          max={1}
                          step={0.1}
                          onValueChange={([value]) => setPreviewScale(value)}
                          className="w-32"
                        />
                        <span className="text-sm">{Math.round(previewScale * 100)}%</span>
                      </div>
                    </div>
                    <div ref={previewRef}>
                      {renderFormPreview(activeForm)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintSettings;
