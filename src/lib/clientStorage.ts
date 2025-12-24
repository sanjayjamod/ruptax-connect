import { Client, ClientFormData } from "@/types/client";

const STORAGE_KEY = "ruptax_clients";
const COUNTER_KEY = "ruptax_client_counter";
const CURRENT_CLIENT_KEY = "ruptax_current_client";

// Get current year prefix (2026 -> "2026")
const getYearPrefix = () => {
  return "2026"; // Assessment Year 2026-27
};

// Generate next client ID: 202601, 202602, etc.
export const generateClientId = (): string => {
  const counter = parseInt(localStorage.getItem(COUNTER_KEY) || "0") + 1;
  localStorage.setItem(COUNTER_KEY, counter.toString());
  return `${getYearPrefix()}${counter.toString().padStart(2, "0")}`;
};

// Get all clients
export const getAllClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Get client by ID
export const getClientById = (id: string): Client | undefined => {
  const clients = getAllClients();
  return clients.find((c) => c.id === id);
};

// Get client by mobile number
export const getClientByMobile = (mobile: string): Client | undefined => {
  const clients = getAllClients();
  return clients.find((c) => c.mobileNo === mobile);
};

// Search clients
export const searchClients = (query: string): Client[] => {
  const clients = getAllClients();
  const lowerQuery = query.toLowerCase();
  return clients.filter(
    (c) =>
      c.id.includes(lowerQuery) ||
      c.name.toLowerCase().includes(lowerQuery) ||
      c.mobileNo.includes(lowerQuery) ||
      c.panNo.toLowerCase().includes(lowerQuery) ||
      c.schoolName.toLowerCase().includes(lowerQuery)
  );
};

// Register new client (from client registration)
export const registerClient = (
  name: string,
  mobile: string,
  password: string
): Client | { error: string } => {
  // Check if mobile already exists
  const existingClient = getClientByMobile(mobile);
  if (existingClient) {
    return { error: "Mobile number already registered" };
  }

  const clients = getAllClients();
  const newClient: Client = {
    id: generateClientId(),
    enterNo: "",
    name: name.toUpperCase(),
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
    mobileNo: mobile,
    email: "",
    payCenterName: "",
    payCenterAddress: "",
    place: "",
    tdo: "",
    tdf: "",
    headMaster: "",
    headMasterFather: "",
    headMasterPlace: "",
    annualIncome: "",
    occupation: "salaried",
    assessmentYear: "2026-27",
    formStatus: "pending",
    password: password,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  clients.push(newClient);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  return newClient;
};

// Login client
export const loginClient = (
  mobile: string,
  password: string
): Client | { error: string } => {
  const client = getClientByMobile(mobile);
  if (!client) {
    return { error: "Mobile number not registered" };
  }
  if ((client as any).password !== password) {
    return { error: "Incorrect password" };
  }
  // Store current logged in client
  localStorage.setItem(CURRENT_CLIENT_KEY, JSON.stringify(client));
  return client;
};

// Get current logged in client
export const getCurrentClient = (): Client | null => {
  const data = localStorage.getItem(CURRENT_CLIENT_KEY);
  return data ? JSON.parse(data) : null;
};

// Logout client
export const logoutClient = () => {
  localStorage.removeItem(CURRENT_CLIENT_KEY);
};

// Add new client (from admin)
export const addClient = (formData: ClientFormData, password?: string): Client => {
  const clients = getAllClients();
  // Use mobile as password if not provided
  const clientPassword = password || formData.mobileNo || "123456";
  const newClient: Client = {
    ...formData,
    id: generateClientId(),
    formStatus: "pending",
    password: clientPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  clients.push(newClient);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  return newClient;
};

// Update client
export const updateClient = (id: string, formData: Partial<ClientFormData>): Client | null => {
  const clients = getAllClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) return null;

  clients[index] = {
    ...clients[index],
    ...formData,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  
  // Update current client if logged in
  const currentClient = getCurrentClient();
  if (currentClient && currentClient.id === id) {
    localStorage.setItem(CURRENT_CLIENT_KEY, JSON.stringify(clients[index]));
  }
  
  return clients[index];
};

// Update client status
export const updateClientStatus = (id: string, status: Client["formStatus"]): Client | null => {
  const clients = getAllClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) return null;

  clients[index] = {
    ...clients[index],
    formStatus: status,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  return clients[index];
};

// Delete client
export const deleteClient = (id: string): boolean => {
  const clients = getAllClients();
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Get statistics
export const getClientStats = () => {
  const clients = getAllClients();
  return {
    total: clients.length,
    pending: clients.filter((c) => c.formStatus === "pending").length,
    completed: clients.filter((c) => c.formStatus === "completed").length,
    submitted: clients.filter((c) => c.formStatus === "submitted").length,
  };
};

// Export clients to JSON
export const exportClientsToJson = (): string => {
  return JSON.stringify(getAllClients(), null, 2);
};

// Import clients from JSON
export const importClientsFromJson = (jsonData: string): number => {
  try {
    const importedClients = JSON.parse(jsonData) as Client[];
    const existingClients = getAllClients();
    const newClients = [...existingClients, ...importedClients];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newClients));
    return importedClients.length;
  } catch {
    return 0;
  }
};
