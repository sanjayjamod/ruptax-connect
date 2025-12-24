import { useMemo } from "react";
import { Client } from "@/types/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Filter, BarChart3, X, TrendingUp } from "lucide-react";

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

  const hasActiveFilters = filters.school !== "all" || filters.paySchool !== "all" || 
    filters.status !== "all" || filters.salaryRange !== "all" || groupBy !== "none";

  const salaryRangeItems = [
    { key: "above10L", label: "₹10L+", sublabel: "High Income", count: salaryStats.above10L, gradient: "from-emerald-500 to-green-600" },
    { key: "5Lto10L", label: "₹5L-10L", sublabel: "Upper Mid", count: salaryStats.between5Lto10L, gradient: "from-blue-500 to-cyan-600" },
    { key: "3Lto5L", label: "₹3L-5L", sublabel: "Mid Range", count: salaryStats.between3Lto5L, gradient: "from-violet-500 to-purple-600" },
    { key: "below3L", label: "<₹3L", sublabel: "Lower Range", count: salaryStats.below3L, gradient: "from-amber-500 to-orange-600" },
    { key: "noSalary", label: "No Data", sublabel: "Missing", count: salaryStats.noSalary, gradient: "from-slate-500 to-gray-600" },
  ];

  return (
    <div className="space-y-4">
      {/* Salary Statistics */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-gradient-to-r from-muted/30 to-muted/10 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-sm">Income Distribution</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Click to filter
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {salaryRangeItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onFilterChange("salaryRange", filters.salaryRange === item.key ? "all" : item.key)}
                className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 ${
                  filters.salaryRange === item.key 
                    ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg scale-[1.02]` 
                    : "bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-border"
                }`}
              >
                <div className={`text-2xl font-bold ${filters.salaryRange === item.key ? '' : 'bg-gradient-to-br ' + item.gradient + ' bg-clip-text text-transparent'}`}>
                  {item.count}
                </div>
                <div className={`text-sm font-medium ${filters.salaryRange === item.key ? 'text-white/90' : 'text-foreground'}`}>
                  {item.label}
                </div>
                <div className={`text-xs ${filters.salaryRange === item.key ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {item.sublabel}
                </div>
                {filters.salaryRange === item.key && (
                  <div className="absolute top-2 right-2">
                    <X className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-gradient-to-r from-muted/30 to-muted/10 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-sm">Filters & Grouping</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onFilterChange("school", "all");
                  onFilterChange("paySchool", "all");
                  onFilterChange("status", "all");
                  onFilterChange("salaryRange", "all");
                  onGroupByChange("none");
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pay School Filter - First */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">પગાર શાળા (Pay School)</Label>
              <Select value={filters.paySchool} onValueChange={(v) => onFilterChange("paySchool", v)}>
                <SelectTrigger className="h-10 rounded-lg bg-background">
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

            {/* School Filter - Second */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">શાળા નું નામ (School)</Label>
              <Select value={filters.school} onValueChange={(v) => onFilterChange("school", v)}>
                <SelectTrigger className="h-10 rounded-lg bg-background">
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

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v)}>
                <SelectTrigger className="h-10 rounded-lg bg-background">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  </SelectItem>
                  <SelectItem value="completed">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Completed
                    </span>
                  </SelectItem>
                  <SelectItem value="submitted">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Submitted
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group By */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Group By</Label>
              <Select value={groupBy} onValueChange={onGroupByChange}>
                <SelectTrigger className="h-10 rounded-lg bg-background">
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
          </div>
        </div>
      </div>

      {/* Group Statistics */}
      {groupStats && groupStats.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm animate-fade-in">
          <div className="border-b border-border bg-gradient-to-r from-muted/30 to-muted/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-sm">
                Group Statistics - {groupBy === "school" ? "શાળા" : groupBy === "paySchool" ? "પગાર શાળા" : groupBy}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {groupStats.map(([name, count], index) => (
                <Badge 
                  key={name} 
                  variant="secondary" 
                  className="text-sm py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 shadow-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    if (groupBy === "school") onFilterChange("school", name);
                    else if (groupBy === "paySchool") onFilterChange("paySchool", name);
                    else if (groupBy === "status") onFilterChange("status", name);
                  }}
                >
                  <span className="max-w-[200px] truncate">{name}</span>
                  <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold">
                    {count}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
