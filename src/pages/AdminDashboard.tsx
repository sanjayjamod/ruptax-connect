import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StatsCards from "@/components/admin/StatsCards";
import ClientList from "@/components/admin/ClientList";
import ClientForm from "@/components/admin/ClientForm";
import { Client, ClientFormData } from "@/types/client";
import {
  getAllClients,
  searchClients,
  addClient,
  updateClient,
  deleteClient,
  getClientStats,
} from "@/lib/clientStorage";
import { toast } from "@/hooks/use-toast";
import { LogOut, UserPlus, Download } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, submitted: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load clients and stats
  const loadData = () => {
    const allClients = getAllClients();
    setClients(allClients);
    setStats(getClientStats());
  };

  useEffect(() => {
    loadData();
  }, []);

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
    navigate("/admin-login");
  };

  // Export data
  const handleExport = () => {
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
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
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
    </div>
  );
};

export default AdminDashboard;
