import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { getAllTaxForms } from "@/lib/taxFormStorage";
import { getClientById } from "@/lib/clientStorage";
import { TaxFormData } from "@/types/taxForm";
import { Client } from "@/types/client";
import { 
  Search, 
  FileText, 
  Printer,
  Download,
  Calendar,
  User,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FilledForm {
  taxForm: TaxFormData;
  client: Client | undefined;
}

const FilledFormsSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [filledForms, setFilledForms] = useState<FilledForm[]>([]);

  useEffect(() => {
    loadFilledForms();
  }, []);

  const loadFilledForms = () => {
    const forms = getAllTaxForms();
    const formsWithClients: FilledForm[] = forms.map(form => ({
      taxForm: form,
      client: getClientById(form.clientId),
    }));
    setFilledForms(formsWithClients);
  };

  // Get unique financial years
  const financialYears = useMemo(() => {
    const years = [...new Set(filledForms.map(f => f.taxForm.salaryData?.financialYear || '2025-2026'))];
    return years.sort().reverse();
  }, [filledForms]);

  // Filter forms
  const filteredForms = useMemo(() => {
    let result = filledForms;

    if (yearFilter !== "all") {
      result = result.filter(f => f.taxForm.salaryData?.financialYear === yearFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.taxForm.clientId.toLowerCase().includes(query) ||
        f.client?.name.toLowerCase().includes(query) ||
        f.client?.panNo?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [filledForms, yearFilter, searchQuery]);

  // Group forms by year
  const groupedByYear = useMemo(() => {
    const groups: Record<string, FilledForm[]> = {};
    filteredForms.forEach(form => {
      const year = form.taxForm.salaryData?.financialYear || '2025-2026';
      if (!groups[year]) groups[year] = [];
      groups[year].push(form);
    });
    return groups;
  }, [filteredForms]);

  const handleViewForm = (clientId: string) => {
    navigate(`/tax-form-admin?clientId=${clientId}`);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
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
                {filteredForms.length} forms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <FileText className="h-4 w-4 text-primary" />
              Filled Tax Forms ({filteredForms.length})
            </CardTitle>
            <div className="flex gap-2">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {financialYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by client ID, name, PAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      <CardContent className="p-0">
        {yearFilter === "all" ? (
          // Grouped view
          <div className="divide-y">
            {Object.entries(groupedByYear).sort(([a], [b]) => b.localeCompare(a)).map(([year, forms]) => (
              <div key={year} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {year}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {forms.length} form{forms.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {forms.map((form) => (
                    <Card 
                      key={form.taxForm.clientId + form.taxForm.salaryData?.financialYear} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewForm(form.taxForm.clientId)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                              {form.client?.name.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{form.client?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">ID: {form.taxForm.clientId}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleViewForm(form.taxForm.clientId);
                              }}
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Tax: ₹{(form.taxForm.taxCalculationB?.netTaxPayable || 0).toLocaleString('en-IN')}</span>
                          {form.client?.completedAt && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              {new Date(form.client.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table view for single year
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[80px]">Client ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">PAN</TableHead>
                  <TableHead className="hidden sm:table-cell">Financial Year</TableHead>
                  <TableHead className="hidden lg:table-cell">Completed Date</TableHead>
                  <TableHead className="text-right">Net Tax</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow 
                    key={form.taxForm.clientId + form.taxForm.salaryData?.financialYear}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewForm(form.taxForm.clientId)}
                  >
                    <TableCell className="font-mono text-xs">{form.taxForm.clientId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{form.client?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {form.client?.panNo || '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {form.taxForm.salaryData?.financialYear || '2025-2026'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {form.client?.completedAt ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          {new Date(form.client.completedAt).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(form.taxForm.taxCalculationB?.netTaxPayable || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={(e) => { 
                            e.stopPropagation();
                            handleViewForm(form.taxForm.clientId);
                          }}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={(e) => { 
                            e.stopPropagation();
                            handleViewForm(form.taxForm.clientId);
                          }}
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        {filteredForms.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No filled forms found</p>
            <p className="text-sm">Forms will appear here after you fill them</p>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default FilledFormsSection;
