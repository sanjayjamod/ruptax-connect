import { useState, useMemo } from "react";
import { Client } from "@/types/client";
import { updateClient } from "@/lib/clientStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  IndianRupee, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  Building2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentSectionProps {
  clients: Client[];
  onRefresh: () => void;
}

const PaymentSection = ({ clients, onRefresh }: PaymentSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentAmount: 0,
    paymentPaid: 0,
    paymentNotes: "",
  });
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  // Group clients by school
  const schoolGroups = useMemo(() => {
    const groups: Record<string, Client[]> = {};
    
    clients.forEach(client => {
      const schoolName = client.schoolName || "Unknown School";
      if (!groups[schoolName]) {
        groups[schoolName] = [];
      }
      groups[schoolName].push(client);
    });
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered: Record<string, Client[]> = {};
      
      Object.entries(groups).forEach(([school, schoolClients]) => {
        const matchedClients = schoolClients.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          school.toLowerCase().includes(query)
        );
        if (matchedClients.length > 0) {
          filtered[school] = matchedClients;
        }
      });
      
      return filtered;
    }
    
    return groups;
  }, [clients, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    let totalClients = 0;
    let totalAmount = 0;
    let totalPaid = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let partialCount = 0;

    clients.forEach(client => {
      totalClients++;
      const amount = client.paymentAmount || 0;
      const paid = client.paymentPaid || 0;
      totalAmount += amount;
      totalPaid += paid;

      if (paid >= amount && amount > 0) {
        paidCount++;
      } else if (paid > 0 && paid < amount) {
        partialCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      totalClients,
      totalAmount,
      totalPaid,
      totalPending: totalAmount - totalPaid,
      paidCount,
      pendingCount,
      partialCount,
    };
  }, [clients]);

  // School-wise statistics
  const schoolStats = useMemo(() => {
    const stats: Record<string, { total: number; paid: number; pending: number; amount: number; paidAmount: number }> = {};
    
    Object.entries(schoolGroups).forEach(([school, schoolClients]) => {
      let amount = 0;
      let paidAmount = 0;
      let paidCount = 0;
      let pendingCount = 0;
      
      schoolClients.forEach(client => {
        const clientAmount = client.paymentAmount || 0;
        const clientPaid = client.paymentPaid || 0;
        amount += clientAmount;
        paidAmount += clientPaid;
        
        if (clientPaid >= clientAmount && clientAmount > 0) {
          paidCount++;
        } else {
          pendingCount++;
        }
      });
      
      stats[school] = {
        total: schoolClients.length,
        paid: paidCount,
        pending: pendingCount,
        amount,
        paidAmount,
      };
    });
    
    return stats;
  }, [schoolGroups]);

  const toggleSchool = (school: string) => {
    setExpandedSchools(prev => {
      const next = new Set(prev);
      if (next.has(school)) {
        next.delete(school);
      } else {
        next.add(school);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSchools(new Set(Object.keys(schoolGroups)));
  };

  const collapseAll = () => {
    setExpandedSchools(new Set());
  };

  const handleEditPayment = (client: Client) => {
    setEditingClient(client);
    setPaymentForm({
      paymentAmount: client.paymentAmount || 0,
      paymentPaid: client.paymentPaid || 0,
      paymentNotes: client.paymentNotes || "",
    });
  };

  const handleSavePayment = () => {
    if (!editingClient) return;

    const paymentStatus = 
      paymentForm.paymentPaid >= paymentForm.paymentAmount && paymentForm.paymentAmount > 0
        ? 'paid'
        : paymentForm.paymentPaid > 0
        ? 'partial'
        : 'pending';

    updateClient(editingClient.id, {
      paymentAmount: paymentForm.paymentAmount,
      paymentPaid: paymentForm.paymentPaid,
      paymentNotes: paymentForm.paymentNotes,
      paymentStatus,
      paymentDate: new Date().toISOString(),
    } as any);

    toast({ title: "Payment Updated", description: `Payment info saved for ${editingClient.name}` });
    setEditingClient(null);
    onRefresh();
  };

  const getPaymentBadge = (client: Client) => {
    const amount = client.paymentAmount || 0;
    const paid = client.paymentPaid || 0;

    if (paid >= amount && amount > 0) {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>;
    } else if (paid > 0) {
      return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Partial</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-xs text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paidCount}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.partialCount}</p>
                <p className="text-xs text-muted-foreground">Partial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <IndianRupee className="h-4 w-4" /> Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold text-primary">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <p className="text-2xl font-bold text-green-600">₹{stats.totalPaid.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Received</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10">
              <p className="text-2xl font-bold text-red-600">₹{stats.totalPending.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      {/* School Groups */}
      <div className="space-y-3">
        {Object.entries(schoolGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([school, schoolClients]) => {
            const stat = schoolStats[school];
            const isExpanded = expandedSchools.has(school);
            
            return (
              <Collapsible key={school} open={isExpanded} onOpenChange={() => toggleSchool(school)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <Building2 className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-semibold text-sm">{school}</p>
                            <p className="text-xs text-muted-foreground">
                              {stat.total} teachers • {stat.paid} paid • {stat.pending} pending
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-right">
                            <p className="font-medium">₹{stat.paidAmount.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">of ₹{stat.amount.toLocaleString('en-IN')}</p>
                          </div>
                          <Badge variant={stat.pending === 0 ? "default" : "secondary"}>
                            {stat.pending === 0 ? "All Paid" : `${stat.pending} Pending`}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-right">Pending</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schoolClients.map((client) => {
                            const amount = client.paymentAmount || 0;
                            const paid = client.paymentPaid || 0;
                            const pending = amount - paid;
                            
                            return (
                              <TableRow key={client.id}>
                                <TableCell className="font-mono text-xs">{client.id}</TableCell>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell className="text-right">₹{amount.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right text-green-600">₹{paid.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right text-red-600">₹{pending.toLocaleString('en-IN')}</TableCell>
                                <TableCell>{getPaymentBadge(client)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPayment(client)}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
      </div>

      {Object.keys(schoolGroups).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <IndianRupee className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No clients found</p>
        </div>
      )}

      {/* Edit Payment Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Payment - {editingClient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Total Amount (₹)</label>
              <Input
                type="number"
                value={paymentForm.paymentAmount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                placeholder="Enter total amount"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amount Paid (₹)</label>
              <Input
                type="number"
                value={paymentForm.paymentPaid}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentPaid: Number(e.target.value) }))}
                placeholder="Enter paid amount"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={paymentForm.paymentNotes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentNotes: e.target.value }))}
                placeholder="Payment notes..."
              />
            </div>
            <div className="p-3 rounded-lg bg-muted text-sm">
              <div className="flex justify-between">
                <span>Pending Amount:</span>
                <span className="font-bold text-red-600">
                  ₹{(paymentForm.paymentAmount - paymentForm.paymentPaid).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <Button onClick={handleSavePayment} className="w-full">
              <Save className="h-4 w-4 mr-2" /> Save Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentSection;