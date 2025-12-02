import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Client } from "@/types/client";
import { getCurrentClient, logoutClient, updateClient } from "@/lib/clientStorage";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Phone,
  Building,
  CreditCard,
  Save,
  Edit2,
  X
} from "lucide-react";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    const currentClient = getCurrentClient();
    if (!currentClient) {
      navigate("/client-login");
      return;
    }
    setClient(currentClient);
    setFormData(currentClient);
  }, [navigate]);

  const handleLogout = () => {
    logoutClient();
    navigate("/client-login");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(client || {});
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!client) return;
    
    const updated = updateClient(client.id, formData);
    if (updated) {
      setClient(updated);
      setFormData(updated);
      setIsEditing(false);
      toast({
        title: "સફળ!",
        description: "તમારી માહિતી સેવ થઈ ગઈ છે।",
      });
    }
  };

  const handleChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: Client["formStatus"]) => {
    const config = {
      pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
      completed: { label: "Completed", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
      submitted: { label: "Submitted", className: "bg-green-500/20 text-green-600 border-green-500/30" },
    };
    const { label, className } = config[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  if (!client) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome, {client.name}
              </h1>
              <p className="text-muted-foreground">
                Client ID: <span className="font-mono font-semibold text-primary">{client.id}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Status Card */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    ITR Form Status - AY {client.assessmentYear}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your income tax registration form status
                  </p>
                </div>
              </div>
              {getStatusBadge(client.formStatus)}
            </div>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              {client.formStatus === "pending" && (
                <div className="flex items-center gap-3 text-yellow-600">
                  <Clock className="h-5 w-5" />
                  <p>कृपया अपनी जानकारी भरें ताकि हम आपका ITR फॉर्म जल्दी तैयार कर सकें।</p>
                </div>
              )}
              {client.formStatus === "completed" && (
                <div className="flex items-center gap-3 text-blue-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>Your form is completed and ready for submission.</p>
                </div>
              )}
              {client.formStatus === "submitted" && (
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>Your ITR has been submitted successfully!</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Mode Instructions */}
          {isEditing && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-primary font-medium">
                📝 कृपया नीचे अपनी सभी जानकारी सही-सही भरें। जितनी ज़्यादा जानकारी आप भरेंगे, उतनी जल्दी हम आपका फॉर्म तैयार कर पाएंगे।
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <FieldRow 
                  label="Full Name (English)" 
                  value={formData.name || ""} 
                  field="name"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="JOHN DOE"
                />
                <FieldRow 
                  label="Name (ગુજરાતી)" 
                  value={formData.nameGujarati || ""} 
                  field="nameGujarati"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="જ્હોન ડો"
                />
                <FieldRow 
                  label="Date of Birth" 
                  value={formData.dateOfBirth || ""} 
                  field="dateOfBirth"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  type="date"
                />
                <FieldRow 
                  label="PAN Number" 
                  value={formData.panNo || ""} 
                  field="panNo"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  mono
                />
                <FieldRow 
                  label="Aadhar Number" 
                  value={formData.aadharNo || ""} 
                  field="aadharNo"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="1234 5678 9012"
                  mono
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <FieldRow 
                  label="Mobile Number" 
                  value={formData.mobileNo || ""} 
                  field="mobileNo"
                  isEditing={false} // Mobile can't be changed
                  onChange={handleChange}
                  mono
                />
                <FieldRow 
                  label="Email" 
                  value={formData.email || ""} 
                  field="email"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  type="email"
                />
                <FieldRow 
                  label="Place / City" 
                  value={formData.place || ""} 
                  field="place"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Ahmedabad"
                />
                <FieldRow 
                  label="TDO" 
                  value={formData.tdo || ""} 
                  field="tdo"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="TDO Name"
                />
              </div>
            </div>

            {/* School/Work Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Building className="h-5 w-5 text-primary" />
                Work Details
              </h3>
              <div className="space-y-4">
                <FieldRow 
                  label="School Name (English)" 
                  value={formData.schoolName || ""} 
                  field="schoolName"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Government Primary School"
                />
                <FieldRow 
                  label="School Name (ગુજરાતી)" 
                  value={formData.schoolNameGujarati || ""} 
                  field="schoolNameGujarati"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="સરકારી પ્રાથમિક શાળા"
                />
                <FieldRow 
                  label="Designation (English)" 
                  value={formData.designation || ""} 
                  field="designation"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Teacher"
                />
                <FieldRow 
                  label="Designation (ગુજરાતી)" 
                  value={formData.designationGujarati || ""} 
                  field="designationGujarati"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="શિક્ષક"
                />
                <FieldRow 
                  label="School Address" 
                  value={formData.schoolAddress || ""} 
                  field="schoolAddress"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Full school address"
                />
                <FieldRow 
                  label="Address (ગુજરાતી)" 
                  value={formData.addressGujarati || ""} 
                  field="addressGujarati"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="સંપૂર્ણ સરનામું"
                />
                <FieldRow 
                  label="Pay Center Name" 
                  value={formData.payCenterName || ""} 
                  field="payCenterName"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Pay Center"
                />
                <FieldRow 
                  label="Pay Center Address" 
                  value={formData.payCenterAddress || ""} 
                  field="payCenterAddress"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Pay Center Address"
                />
                <FieldRow 
                  label="Head Master Place" 
                  value={formData.headMasterPlace || ""} 
                  field="headMasterPlace"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Headmaster's place"
                />
              </div>
            </div>

            {/* Bank Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Bank Details
              </h3>
              <div className="space-y-4">
                <FieldRow 
                  label="Bank Account Number" 
                  value={formData.bankAcNo || ""} 
                  field="bankAcNo"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="1234567890123456"
                  mono
                />
                <FieldRow 
                  label="IFSC Code" 
                  value={formData.ifscCode || ""} 
                  field="ifscCode"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="SBIN0001234"
                  mono
                />
                <FieldRow 
                  label="Annual Income (₹)" 
                  value={formData.annualIncome || ""} 
                  field="annualIncome"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="500000"
                  type="number"
                />
                <FieldRow 
                  label="Enter No." 
                  value={formData.enterNo || ""} 
                  field="enterNo"
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Enter Number"
                />
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              Need Help?
            </h3>
            <p className="text-muted-foreground">
              Contact us on WhatsApp for any queries regarding your ITR filing.
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

// Helper component for field rows
interface FieldRowProps {
  label: string;
  value: string;
  field: keyof Client;
  isEditing: boolean;
  onChange: (field: keyof Client, value: string) => void;
  placeholder?: string;
  mono?: boolean;
  type?: string;
}

const FieldRow = ({ label, value, field, isEditing, onChange, placeholder, mono, type = "text" }: FieldRowProps) => {
  if (isEditing) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field} className="text-sm text-muted-foreground">{label}</Label>
        <Input
          id={field}
          type={type}
          value={value}
          onChange={(e) => onChange(field, type === "text" ? e.target.value.toUpperCase() : e.target.value)}
          placeholder={placeholder}
          className={mono ? "font-mono" : ""}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-foreground ${mono ? "font-mono" : ""}`}>
        {value || "-"}
      </span>
    </div>
  );
};

export default ClientDashboard;
