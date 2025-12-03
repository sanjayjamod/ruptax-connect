import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import TaxChatbot from "@/components/TaxChatbot";
import StatsCards from "@/components/admin/StatsCards";
import ClientList from "@/components/admin/ClientList";
import ClientForm from "@/components/admin/ClientForm";
import AdminNotes from "@/components/admin/AdminNotes";
import { Client, ClientFormData } from "@/types/client";
import {
  getAllClients,
  searchClients,
  addClient,
  updateClient,
  deleteClient,
  getClientStats,
} from "@/lib/clientStorage";
import { importTeachersFromHTML, readFileAsText } from "@/lib/excelImport";
import { toast } from "@/hooks/use-toast";
import { LogOut, UserPlus, Download, FileJson, Upload } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, submitted: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin authentication
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("ruptax_admin_logged_in");
    if (adminLoggedIn !== "true") {
      navigate("/admin-login");
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  // Load clients and stats
  const loadData = () => {
    const allClients = getAllClients();
    setClients(allClients);
    setStats(getClientStats());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle Excel/HTML import
  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const content = await readFileAsText(file);
      const teachers = importTeachersFromHTML(content);
      
      if (teachers.length === 0) {
        toast({
          title: "Import Failed",
          description: "No valid teacher data found in the file.",
          variant: "destructive",
        });
        return;
      }

      let imported = 0;
      let skipped = 0;
      
      teachers.forEach((teacherData) => {
        // Check if client with same enterNo already exists
        const existing = clients.find(c => c.enterNo === teacherData.enterNo);
        if (!existing) {
          addClient(teacherData);
          imported++;
        } else {
          skipped++;
        }
      });
      
      loadData();
      toast({
        title: "Import Successful",
        description: `${imported} teachers imported, ${skipped} skipped (already exist).`,
      });
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to parse the file. Make sure it's an Excel/HTML file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Filtered clients based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    return searchClients(searchQuery);
  }, [clients, searchQuery]);

  // Handle add/edit client
  const handleSaveClient = (formData: ClientFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      if (editingClient) {
        updateClient(editingClient.id, formData);
        toast({
          title: "Client Updated",
          description: `Client ${editingClient.id} has been updated successfully.`,
        });
      } else {
        const newClient = addClient(formData);
        toast({
          title: "Client Added",
          description: `New client ${newClient.id} has been created successfully.`,
        });
      }
      loadData();
      setIsFormOpen(false);
      setEditingClient(null);
      setIsLoading(false);
    }, 500);
  };

  // Handle delete
  const handleDeleteClient = (id: string) => {
    deleteClient(id);
    toast({
      title: "Client Deleted",
      description: `Client ${id} has been deleted.`,
      variant: "destructive",
    });
    loadData();
  };

  // Handle edit
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  // Handle view/fill form
  const handleViewForm = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("ruptax_admin_logged_in");
    navigate("/admin-login");
  };

  // Handle password update
  const handlePasswordUpdate = (clientId: string, newPassword: string) => {
    const STORAGE_KEY = "ruptax_clients";
    const data = localStorage.getItem(STORAGE_KEY);
    const clientsData = data ? JSON.parse(data) : [];
    const index = clientsData.findIndex((c: Client) => c.id === clientId);
    if (index >= 0) {
      clientsData[index].password = newPassword;
      clientsData[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clientsData));
      loadData();
    }
  };

  // Export data as JSON
  const handleExportJSON = () => {
    const data = JSON.stringify(clients, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ruptax_clients_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: `${clients.length} clients exported to JSON file.`,
    });
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const headers = [
      "ID", "Enter No", "Name", "Name (Gujarati)", "School Name", "School Name (Gujarati)",
      "Designation", "Designation (Gujarati)", "School Address", "Address (Gujarati)",
      "PAN No", "Bank A/C No", "IFSC Code", "Aadhar No", "DOB", "Mobile", "Email",
      "Pay Center Name", "Pay Center Address", "Place", "TDO", "Head Master Place",
      "Annual Income", "Occupation", "Assessment Year", "Status", "Password", "Created At"
    ];
    
    const csvRows = [headers.join(",")];
    
    clients.forEach(client => {
      const row = [
        client.id, client.enterNo, `"${client.name}"`, `"${client.nameGujarati}"`,
        `"${client.schoolName}"`, `"${client.schoolNameGujarati}"`,
        `"${client.designation}"`, `"${client.designationGujarati}"`,
        `"${client.schoolAddress}"`, `"${client.addressGujarati}"`,
        client.panNo, client.bankAcNo, client.ifscCode, client.aadharNo,
        client.dateOfBirth, client.mobileNo, client.email,
        `"${client.payCenterName}"`, `"${client.payCenterAddress}"`,
        client.place, `"${client.tdo}"`, `"${client.headMasterPlace}"`,
        client.annualIncome, client.occupation, client.assessmentYear,
        client.formStatus, client.password || "", client.createdAt
      ];
      csvRows.push(row.join(","));
    });
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ruptax_clients_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: `${clients.length} clients exported to CSV file.`,
    });
  };

  // Don't render until authentication is verified
  if (!isAuthenticated) {
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
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage teacher tax registrations (ID: 202601, 202602...)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminNotes />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleExcelImport}
                accept=".xls,.xlsx,.html,.htm"
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button variant="outline" onClick={handleExportJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                onClick={() => {
                  setEditingClient(null);
                  setIsFormOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <StatsCards {...stats} />
          </div>

          {/* Client List */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              Teacher Registrations
            </h2>
            <ClientList
              clients={filteredClients}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onViewForm={handleViewForm}
              onPasswordUpdate={handlePasswordUpdate}
            />
          </div>
        </div>
      </main>

      {/* Client Form Dialog */}
      <ClientForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        client={editingClient}
        isLoading={isLoading}
      />

      <Footer />
      <WhatsAppButton />
      <TaxChatbot />
    </div>
  );
};

export default AdminDashboard;
