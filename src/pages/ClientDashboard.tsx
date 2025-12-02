import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Client } from "@/types/client";
import { getCurrentClient, logoutClient } from "@/lib/clientStorage";
import { 
  LogOut, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Phone,
  Mail,
  Building,
  CreditCard,
  Calendar
} from "lucide-react";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const currentClient = getCurrentClient();
    if (!currentClient) {
      navigate("/client-login");
      return;
    }
    setClient(currentClient);
  }, [navigate]);

  const handleLogout = () => {
    logoutClient();
    navigate("/client-login");
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
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
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
                  <p>Your form is pending. Our team will fill your details soon.</p>
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

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <InfoRow label="Full Name" value={client.name || "-"} />
                <InfoRow label="Name (Gujarati)" value={client.nameGujarati || "-"} />
                <InfoRow label="Date of Birth" value={client.dateOfBirth || "-"} />
                <InfoRow label="PAN Number" value={client.panNo || "-"} mono />
                <InfoRow label="Aadhar Number" value={client.aadharNo || "-"} mono />
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <InfoRow label="Mobile" value={client.mobileNo || "-"} mono />
                <InfoRow label="Email" value={client.email || "-"} />
                <InfoRow label="Place" value={client.place || "-"} />
              </div>
            </div>

            {/* School/Work Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Building className="h-5 w-5 text-primary" />
                Work Details
              </h3>
              <div className="space-y-3">
                <InfoRow label="School Name" value={client.schoolName || "-"} />
                <InfoRow label="Designation" value={client.designation || "-"} />
                <InfoRow label="School Address" value={client.schoolAddress || "-"} />
                <InfoRow label="Pay Center" value={client.payCenterName || "-"} />
              </div>
            </div>

            {/* Bank Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Bank Details
              </h3>
              <div className="space-y-3">
                <InfoRow label="Bank Account" value={client.bankAcNo || "-"} mono />
                <InfoRow label="IFSC Code" value={client.ifscCode || "-"} mono />
                <InfoRow label="Annual Income" value={client.annualIncome ? `₹${parseInt(client.annualIncome).toLocaleString()}` : "-"} />
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

// Helper component for info rows
const InfoRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
  </div>
);

export default ClientDashboard;
