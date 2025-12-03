import { useMemo } from "react";
import { Client } from "@/types/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, Building, IndianRupee, Filter, BarChart3 } from "lucide-react";

interface AdvancedFiltersProps {
  clients: Client[];
  filters: {
    school: string;
    paySchool: string;
    status: string;
    salaryRange: string;
  };
  onFilterChange: (key: string, value: string) => void;
  groupBy: string;
  onGroupByChange: (value: string) => void;
}

const AdvancedFilters = ({ clients, filters, onFilterChange, groupBy, onGroupByChange }: AdvancedFiltersProps) => {
  // Extract unique values for filters
  const uniqueSchools = useMemo(() => {
    const schools = new Set(clients.map(c => c.schoolName).filter(Boolean));
    return Array.from(schools).sort();
  }, [clients]);

  const uniquePaySchools = useMemo(() => {
    const paySchools = new Set(clients.map(c => c.payCenterName || c.schoolNameGujarati).filter(Boolean));
    return Array.from(paySchools).sort();
  }, [clients]);

  // Salary statistics
  const salaryStats = useMemo(() => {
    const stats = {
      above10L: 0,
      between5Lto10L: 0,
      between3Lto5L: 0,
      below3L: 0,
      noSalary: 0,
    };

    clients.forEach(c => {
      const income = parseInt(c.annualIncome) || 0;
      if (income >= 1000000) stats.above10L++;
      else if (income >= 500000) stats.between5Lto10L++;
      else if (income >= 300000) stats.between3Lto5L++;
      else if (income > 0) stats.below3L++;
      else stats.noSalary++;
    });

    return stats;
  }, [clients]);

  // Group statistics
  const groupStats = useMemo(() => {
    if (groupBy === "none") return null;

    const groups: Record<string, number> = {};
    
    clients.forEach(c => {
      let key = "";
      switch (groupBy) {
        case "school":
          key = c.schoolName || "Unknown";
          break;
        case "paySchool":
          key = c.payCenterName || c.schoolNameGujarati || "Unknown";
          break;
        case "status":
          key = c.formStatus;
          break;
        case "designation":
          key = c.designation || c.designationGujarati || "Unknown";
          break;
      }
      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [clients, groupBy]);

  return (
    <div className="space-y-4">
      {/* Salary Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <IndianRupee className="h-4 w-4 text-primary" />
            Salary Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => onFilterChange("salaryRange", filters.salaryRange === "above10L" ? "all" : "above10L")}
              className={`p-3 rounded-lg border text-center transition-colors ${
                filters.salaryRange === "above10L" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="text-lg font-bold">{salaryStats.above10L}</div>
              <div className="text-xs">₹10L+ Above</div>
            </button>
            <button
              onClick={() => onFilterChange("salaryRange", filters.salaryRange === "5Lto10L" ? "all" : "5Lto10L")}
              className={`p-3 rounded-lg border text-center transition-colors ${
                filters.salaryRange === "5Lto10L" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="text-lg font-bold">{salaryStats.between5Lto10L}</div>
              <div className="text-xs">₹5L - 10L</div>
            </button>
            <button
              onClick={() => onFilterChange("salaryRange", filters.salaryRange === "3Lto5L" ? "all" : "3Lto5L")}
              className={`p-3 rounded-lg border text-center transition-colors ${
                filters.salaryRange === "3Lto5L" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="text-lg font-bold">{salaryStats.between3Lto5L}</div>
              <div className="text-xs">₹3L - 5L</div>
            </button>
            <button
              onClick={() => onFilterChange("salaryRange", filters.salaryRange === "below3L" ? "all" : "below3L")}
              className={`p-3 rounded-lg border text-center transition-colors ${
                filters.salaryRange === "below3L" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="text-lg font-bold">{salaryStats.below3L}</div>
              <div className="text-xs">Below ₹3L</div>
            </button>
            <button
              onClick={() => onFilterChange("salaryRange", filters.salaryRange === "noSalary" ? "all" : "noSalary")}
              className={`p-3 rounded-lg border text-center transition-colors ${
                filters.salaryRange === "noSalary" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="text-lg font-bold">{salaryStats.noSalary}</div>
              <div className="text-xs">No Data</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Row */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-primary" />
            Filters & Grouping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* School Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs">શાળા નું નામ</Label>
              <Select value={filters.school} onValueChange={(v) => onFilterChange("school", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {uniqueSchools.map((school) => (
                    <SelectItem key={school} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pay School Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs">પગાર શાળા</Label>
              <Select value={filters.paySchool} onValueChange={(v) => onFilterChange("paySchool", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Pay Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pay Schools</SelectItem>
                  {uniquePaySchools.map((ps) => (
                    <SelectItem key={ps} value={ps}>{ps}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group By */}
            <div className="space-y-1.5">
              <Label className="text-xs">Group By</Label>
              <Select value={groupBy} onValueChange={onGroupByChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="No Grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="school">શાળા નું નામ</SelectItem>
                  <SelectItem value="paySchool">પગાર શાળા</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="designation">Designation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="space-y-1.5">
              <Label className="text-xs">&nbsp;</Label>
              <button
                onClick={() => {
                  onFilterChange("school", "all");
                  onFilterChange("paySchool", "all");
                  onFilterChange("status", "all");
                  onFilterChange("salaryRange", "all");
                  onGroupByChange("none");
                }}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Statistics */}
      {groupStats && groupStats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Group Statistics ({groupBy === "school" ? "શાળા" : groupBy === "paySchool" ? "પગાર શાળા" : groupBy})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {groupStats.map(([name, count]) => (
                <Badge 
                  key={name} 
                  variant="secondary" 
                  className="text-sm py-1 px-3 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    if (groupBy === "school") onFilterChange("school", name);
                    else if (groupBy === "paySchool") onFilterChange("paySchool", name);
                    else if (groupBy === "status") onFilterChange("status", name);
                  }}
                >
                  {name}: <span className="font-bold ml-1">{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedFilters;