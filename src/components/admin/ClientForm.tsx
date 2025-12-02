import { useState, useEffect } from "react";
import { Client, ClientFormData } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Save, X } from "lucide-react";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => void;
  client?: Client | null;
  isLoading?: boolean;
}

const emptyFormData: ClientFormData = {
  enterNo: "",
  name: "",
  nameGujarati: "",
  schoolName: "",
  schoolNameGujarati: "",
  designation: "",
  designationGujarati: "",
  schoolAddress: "",
  addressGujarati: "",
  panNo: "",
  bankAcNo: "",
  ifscCode: "",
  aadharNo: "",
  dateOfBirth: "",
  mobileNo: "",
  email: "",
  payCenterName: "",
  payCenterAddress: "",
  place: "",
  tdo: "",
  headMasterPlace: "",
  annualIncome: "",
  occupation: "salaried",
  assessmentYear: "2026-27",
};

const ClientForm = ({ open, onClose, onSave, client, isLoading }: ClientFormProps) => {
  const [formData, setFormData] = useState<ClientFormData>(emptyFormData);

  useEffect(() => {
    if (client) {
      setFormData({
        enterNo: client.enterNo || "",
        name: client.name || "",
        nameGujarati: client.nameGujarati || "",
        schoolName: client.schoolName || "",
        schoolNameGujarati: client.schoolNameGujarati || "",
        designation: client.designation || "",
        designationGujarati: client.designationGujarati || "",
        schoolAddress: client.schoolAddress || "",
        addressGujarati: client.addressGujarati || "",
        panNo: client.panNo || "",
        bankAcNo: client.bankAcNo || "",
        ifscCode: client.ifscCode || "",
        aadharNo: client.aadharNo || "",
        dateOfBirth: client.dateOfBirth || "",
        mobileNo: client.mobileNo || "",
        email: client.email || "",
        payCenterName: client.payCenterName || "",
        payCenterAddress: client.payCenterAddress || "",
        place: client.place || "",
        tdo: client.tdo || "",
        headMasterPlace: client.headMasterPlace || "",
        annualIncome: client.annualIncome || "",
        occupation: client.occupation || "salaried",
        assessmentYear: client.assessmentYear || "2026-27",
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [client, open]);

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {client ? `Edit Client: ${client.id}` : "Add New Client"}
          </DialogTitle>
          <DialogDescription>
            {client ? "Update client details below" : "Enter client details to create a new record"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                Basic Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="enterNo">Enter No / ID</Label>
                  <Input
                    id="enterNo"
                    placeholder="732"
                    value={formData.enterNo}
                    onChange={(e) => updateField("enterNo", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentYear">Assessment Year</Label>
                  <Select value={formData.assessmentYear} onValueChange={(v) => updateField("assessmentYear", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-27">2026-27</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (English) *</Label>
                  <Input
                    id="name"
                    placeholder="MAHESHKUMAR AMARSHIBHAI SOYA"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameGujarati">Full Name (Gujarati)</Label>
                  <Input
                    id="nameGujarati"
                    placeholder="મહેશકુમાર અમરશીભાઇ સોયા"
                    value={formData.nameGujarati}
                    onChange={(e) => updateField("nameGujarati", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Select value={formData.occupation} onValueChange={(v) => updateField("occupation", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salaried">Salaried (Teacher)</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* School/Work Info */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                School / Work Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name (English)</Label>
                  <Input
                    id="schoolName"
                    placeholder="GUNDALA(JAS) PRI. SHALA"
                    value={formData.schoolName}
                    onChange={(e) => updateField("schoolName", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolNameGujarati">School Name (Gujarati)</Label>
                  <Input
                    id="schoolNameGujarati"
                    placeholder="ગુંદાળા જસ.પ્રા.શાળા"
                    value={formData.schoolNameGujarati}
                    onChange={(e) => updateField("schoolNameGujarati", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation (English)</Label>
                  <Input
                    id="designation"
                    placeholder="ASS.TEACHER"
                    value={formData.designation}
                    onChange={(e) => updateField("designation", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designationGujarati">Designation (Gujarati)</Label>
                  <Input
                    id="designationGujarati"
                    placeholder="આ.શિ."
                    value={formData.designationGujarati}
                    onChange={(e) => updateField("designationGujarati", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolAddress">School Address (English)</Label>
                  <Input
                    id="schoolAddress"
                    placeholder="GUNDALA(JAS)"
                    value={formData.schoolAddress}
                    onChange={(e) => updateField("schoolAddress", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressGujarati">Address (Gujarati)</Label>
                  <Input
                    id="addressGujarati"
                    placeholder="તાલુકો વિંછીયા, જીલ્લો રાજકોટ"
                    value={formData.addressGujarati}
                    onChange={(e) => updateField("addressGujarati", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payCenterName">Pay Center Name</Label>
                  <Input
                    id="payCenterName"
                    placeholder="AMRAPUR KANYA TA. SHALA"
                    value={formData.payCenterName}
                    onChange={(e) => updateField("payCenterName", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payCenterAddress">Pay Center Address</Label>
                  <Input
                    id="payCenterAddress"
                    placeholder="TALUKO VINCHHIYA, DIST RAJKOT"
                    value={formData.payCenterAddress}
                    onChange={(e) => updateField("payCenterAddress", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Place</Label>
                  <Input
                    id="place"
                    placeholder="AMRAPUR"
                    value={formData.place}
                    onChange={(e) => updateField("place", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tdo">TDO Name</Label>
                  <Input
                    id="tdo"
                    placeholder="RASIKBHAI KALUBHAI VASANI"
                    value={formData.tdo}
                    onChange={(e) => updateField("tdo", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="headMasterPlace">Head Master Place</Label>
                  <Input
                    id="headMasterPlace"
                    placeholder="AMRAPUR KANYA TA. SHALA"
                    value={formData.headMasterPlace}
                    onChange={(e) => updateField("headMasterPlace", e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
                Contact Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mobileNo">Mobile Number *</Label>
                  <Input
                    id="mobileNo"
                    placeholder="8758306720"
                    value={formData.mobileNo}
                    onChange={(e) => updateField("mobileNo", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@email.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ID Documents */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">4</span>
                ID Documents
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="panNo">PAN Number *</Label>
                  <Input
                    id="panNo"
                    placeholder="BMFPS1003R"
                    value={formData.panNo}
                    onChange={(e) => updateField("panNo", e.target.value.toUpperCase())}
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadharNo">Aadhar Number *</Label>
                  <Input
                    id="aadharNo"
                    placeholder="201361290880"
                    value={formData.aadharNo}
                    onChange={(e) => updateField("aadharNo", e.target.value.replace(/\D/g, "").slice(0, 12))}
                    maxLength={12}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">5</span>
                Bank Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankAcNo">Bank Account Number</Label>
                  <Input
                    id="bankAcNo"
                    placeholder="38205185078"
                    value={formData.bankAcNo}
                    onChange={(e) => updateField("bankAcNo", e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="SBIN0060086"
                    value={formData.ifscCode}
                    onChange={(e) => updateField("ifscCode", e.target.value.toUpperCase())}
                    maxLength={11}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income (₹)</Label>
                  <Input
                    id="annualIncome"
                    placeholder="500000"
                    value={formData.annualIncome}
                    onChange={(e) => updateField("annualIncome", e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {client ? "Update Client" : "Add Client"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
