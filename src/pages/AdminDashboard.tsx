import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/WhatsAppButton";
import TaxChatbot from "@/components/TaxChatbot";
import StatsCards from "@/components/admin/StatsCards";
import ClientList from "@/components/admin/ClientList";
import ClientForm from "@/components/admin/ClientForm";
import AdminNotes from "@/components/admin/AdminNotes";
import AdvancedFilters from "@/components/admin/AdvancedFilters";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SideCalculator from "@/components/admin/SideCalculator";
import ClientProfilesSection from "@/components/admin/ClientProfilesSection";
import FilledFormsSection from "@/components/admin/FilledFormsSection";
import AdminSettings from "@/components/admin/AdminSettings";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Client, ClientFormData } from "@/types/client";
import {
  getAllClients,
  addClient,
  updateClient,
  deleteClient,
  getClientStats,
} from "@/lib/clientStorage";
import { importTeachersFromHTML, readFileAsText } from "@/lib/excelImport";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Calendar,
  Shield,
  Users,
  RefreshCw,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, submitted: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotes, setShowNotes] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Advanced filters state
  const [filters, setFilters] = useState({
    school: "all",
    paySchool: "all",
    status: "all",
    salaryRange: "all",
  });
  const [groupBy, setGroupBy] = useState("none");

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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

  // Load clients and stats
  const loadData = () => {
    const allClients = getAllClients();
    setClients(allClients);
    setStats(getClientStats());
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      toast({
        title: "Data Refreshed",
        description: "Client data has been updated.",
      });
    }, 500);
  };

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadData();
    }
  }, [authLoading, user, isAdmin]);

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
      let updated = 0;
      
      teachers.forEach((teacherData) => {
        const existing = clients.find(c => c.enterNo === teacherData.enterNo);
        if (!existing) {
          addClient(teacherData);
          imported++;
        } else {
          // Update existing client with new data (e.g., headMaster, headMasterFather)
          updateClient(existing.id, {
            ...teacherData,
          });
          updated++;
        }
      });
      
      loadData();
      toast({
        title: "Import Successful",
        description: `${imported} teachers imported, ${updated} updated.`,
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

  const triggerFileImport = () => {
    fileInputRef.current?.click();
  };

  // Filtered clients based on search and advanced filters
  const filteredClients = useMemo(() => {
    let result = clients;
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.id.includes(lowerQuery) ||
        c.name.toLowerCase().includes(lowerQuery) ||
        c.mobileNo.includes(lowerQuery) ||
        c.panNo.toLowerCase().includes(lowerQuery) ||
        c.schoolName.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (filters.school !== "all") {
      result = result.filter(c => c.schoolName === filters.school);
    }
    
    if (filters.paySchool !== "all") {
      result = result.filter(c => 
        c.payCenterName === filters.paySchool || 
        c.schoolNameGujarati === filters.paySchool
      );
    }
    
    if (filters.status !== "all") {
      result = result.filter(c => c.formStatus === filters.status);
    }
    
    if (filters.salaryRange !== "all") {
      result = result.filter(c => {
        const income = parseInt(c.annualIncome) || 0;
        switch (filters.salaryRange) {
          case "above10L": return income >= 1000000;
          case "5Lto10L": return income >= 500000 && income < 1000000;
          case "3Lto5L": return income >= 300000 && income < 500000;
          case "below3L": return income > 0 && income < 300000;
          case "noSalary": return income === 0;
          default: return true;
        }
      });
    }
    
    return result;
  }, [clients, searchQuery, filters]);

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

  // Handle password update - passwords should be managed through Supabase Auth
  const handlePasswordUpdate = (clientId: string, newPassword: string) => {
    // Password updates should go through proper Supabase Auth flow
    // This is a placeholder - in production, use supabase.auth.admin.updateUserById
    toast({
      title: "Password Update",
      description: "Password changes should be done through the secure authentication system.",
      variant: "destructive",
    });
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
      "Annual Income", "Occupation", "Assessment Year", "Status", "Created At"
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
        client.formStatus, client.createdAt
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

  // Handle section change
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (section === "calculator") {
      setShowCalculator(true);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render until authentication is verified
  if (!user || !isAdmin) {
    return null;
  }

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30">
        {/* Hidden file input for Excel import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleExcelImport}
          accept=".xls,.xlsx,.html,.htm"
          className="hidden"
        />

        {/* Admin Sidebar */}
        <AdminSidebar
          onAddClient={() => {
            setEditingClient(null);
            setIsFormOpen(true);
          }}
          onImportExcel={triggerFileImport}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onOpenNotes={() => setShowNotes(true)}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <SidebarTrigger className="h-8 w-8" />
            
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="font-display text-lg font-semibold text-foreground">
                  {activeSection === "dashboard" && "Dashboard"}
                  {activeSection === "teachers" && "Teachers"}
                  {activeSection === "profiles" && "Client Profiles"}
                  {activeSection === "filled-forms" && "Filled Forms"}
                  {activeSection === "calculator" && "Calculator"}
                  {activeSection === "notes" && "Notes"}
                  {activeSection === "settings" && "Settings"}
                </h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="hidden sm:flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {currentDate}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Shield className="h-3 w-3" />
                  AY 2026-27
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              {/* Stats Cards - Always visible */}
              {activeSection === "dashboard" && (
                <div className="animate-fade-in">
                  <StatsCards {...stats} />
                </div>
              )}

              {/* Advanced Filters */}
              {(activeSection === "dashboard" || activeSection === "teachers") && (
                <div className="animate-fade-in">
                  <AdvancedFilters
                    clients={clients}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    groupBy={groupBy}
                    onGroupByChange={setGroupBy}
                  />
                </div>
              )}

              {/* Client List */}
              {(activeSection === "dashboard" || activeSection === "teachers") && (
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in">
                  <div className="border-b border-border bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-semibold text-foreground">
                            Teacher Registrations
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Manage and track all tax registrations
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          {filteredClients.length} of {clients.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
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
              )}

              {/* Calculator Section */}
              {activeSection === "calculator" && (
                <div className="animate-fade-in">
                  <SideCalculator />
                </div>
              )}

              {/* Client Profiles Section */}
              {activeSection === "profiles" && (
                <div className="animate-fade-in">
                  <ClientProfilesSection
                    clients={filteredClients}
                    onEditClient={handleEditClient}
                    onViewForm={(client) => navigate(`/tax-form-admin?clientId=${client.id}`)}
                  />
                </div>
              )}

              {/* Filled Forms Section */}
              {activeSection === "filled-forms" && (
                <div className="animate-fade-in">
                  <FilledFormsSection />
                </div>
              )}

              {/* Settings Section */}
              {activeSection === "settings" && (
                <div className="animate-fade-in">
                  <AdminSettings onResetData={loadData} />
                </div>
              )}
            </div>
          </main>
        </SidebarInset>

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

        {/* Notes Dialog */}
        {showNotes && <AdminNotes />}

        <WhatsAppButton />
        <TaxChatbot />
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
