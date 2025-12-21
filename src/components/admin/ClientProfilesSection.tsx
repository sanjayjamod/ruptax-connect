import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Client } from "@/types/client";
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Eye, 
  FileText,
  Building2,
  Clock,
  CheckCircle,
  Send
} from "lucide-react";

interface ClientProfilesSectionProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
  onViewForm: (client: Client) => void;
}

const ClientProfilesSection = ({ clients, onEditClient, onViewForm }: ClientProfilesSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(c =>
      c.id.includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.mobileNo.includes(query) ||
      c.panNo?.toLowerCase().includes(query) ||
      c.schoolName?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Send className="h-3 w-3 mr-1" />Submitted</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Client List */}
      <div className="lg:col-span-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <User className="h-4 w-4 text-primary" />
                Client Profiles ({filteredClients.length})
              </CardTitle>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, mobile, PAN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">School</TableHead>
                    <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${selectedClient?.id === client.id ? 'bg-muted/50' : ''}`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <TableCell className="font-mono text-xs">{client.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.nameGujarati}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {client.schoolName || '-'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {client.mobileNo}
                      </TableCell>
                      <TableCell>{getStatusBadge(client.formStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); onEditClient(client); }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); onViewForm(client); }}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Client Details Panel */}
      <div className="lg:col-span-1">
        <Card className="border-border/50 shadow-sm sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Eye className="h-4 w-4 text-primary" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedClient.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedClient.nameGujarati}</p>
                    {getStatusBadge(selectedClient.formStatus)}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">School:</span>
                    <span className="font-medium">{selectedClient.schoolName || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-medium">{selectedClient.mobileNo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedClient.email || '-'}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Additional Info</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">PAN:</span> {selectedClient.panNo || '-'}</div>
                      <div><span className="text-muted-foreground">Aadhar:</span> {selectedClient.aadharNo || '-'}</div>
                      <div><span className="text-muted-foreground">Designation:</span> {selectedClient.designation || '-'}</div>
                      <div><span className="text-muted-foreground">Bank A/C:</span> {selectedClient.bankAcNo || '-'}</div>
                      <div><span className="text-muted-foreground">Annual Income:</span> ₹{parseInt(selectedClient.annualIncome || '0').toLocaleString('en-IN')}</div>
                      <div><span className="text-muted-foreground">AY:</span> {selectedClient.assessmentYear || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" className="flex-1" onClick={() => onEditClient(selectedClient)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit Profile
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => onViewForm(selectedClient)}>
                    <FileText className="h-4 w-4 mr-1" /> View Form
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Select a client to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfilesSection;
