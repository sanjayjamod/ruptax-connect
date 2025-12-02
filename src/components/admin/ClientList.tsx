import { useState } from "react";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2, Eye, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClientListProps {
  clients: Client[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewForm: (client: Client) => void;
}

const ClientList = ({
  clients,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onViewForm,
}: ClientListProps) => {
  const getStatusBadge = (status: Client["formStatus"]) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      completed: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      submitted: "bg-green-500/20 text-green-600 border-green-500/30",
    };
    const labels = {
      pending: "Pending",
      completed: "Completed",
      submitted: "Submitted",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by ID, Name, Mobile, PAN, School..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Client ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Mobile</TableHead>
              <TableHead className="font-semibold">PAN</TableHead>
              <TableHead className="font-semibold">School</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No clients found. Add a new client to get started.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-semibold text-primary">
                    {client.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      {client.nameGujarati && (
                        <div className="text-sm text-muted-foreground">{client.nameGujarati}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{client.mobileNo}</TableCell>
                  <TableCell className="font-mono">{client.panNo}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{client.schoolName}</TableCell>
                  <TableCell>{getStatusBadge(client.formStatus)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewForm(client)}
                        title="View/Fill Form"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(client)}
                        title="Edit Client"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete Client">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {client.name} ({client.id})? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(client.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {clients.length} client{clients.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default ClientList;
