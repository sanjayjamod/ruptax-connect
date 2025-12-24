import { useMemo } from "react";
import { Client } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  School, 
  Building2, 
  FileCheck, 
  Clock, 
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeachersSectionProps {
  clients: Client[];
}

interface GroupStats {
  name: string;
  total: number;
  completed: number;
  pending: number;
}

const TeachersSection = ({ clients }: TeachersSectionProps) => {
  const navigate = useNavigate();

  // Summary stats
  const summary = useMemo(() => {
    const total = clients.length;
    const completed = clients.filter(c => c.formStatus === 'completed' || c.formStatus === 'submitted').length;
    const pending = clients.filter(c => c.formStatus === 'pending').length;
    return { total, completed, pending };
  }, [clients]);

  // Group by Pay School
  const paySchoolGroups = useMemo(() => {
    const groups: Record<string, GroupStats> = {};
    
    clients.forEach(c => {
      const key = c.payCenterName || c.schoolNameGujarati || 'Unknown';
      if (!groups[key]) {
        groups[key] = { name: key, total: 0, completed: 0, pending: 0 };
      }
      groups[key].total++;
      if (c.formStatus === 'completed' || c.formStatus === 'submitted') {
        groups[key].completed++;
      } else {
        groups[key].pending++;
      }
    });
    
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [clients]);

  // Group by School
  const schoolGroups = useMemo(() => {
    const groups: Record<string, GroupStats> = {};
    
    clients.forEach(c => {
      const key = c.schoolName || 'Unknown';
      if (!groups[key]) {
        groups[key] = { name: key, total: 0, completed: 0, pending: 0 };
      }
      groups[key].total++;
      if (c.formStatus === 'completed' || c.formStatus === 'submitted') {
        groups[key].completed++;
      } else {
        groups[key].pending++;
      }
    });
    
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [clients]);

  const handleGroupClick = (groupName: string, type: 'paySchool' | 'school') => {
    // Navigate to fill-form with filter
    navigate(`/admin-dashboard?section=filled-forms&${type}=${encodeURIComponent(groupName)}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/20 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-3xl font-bold text-foreground">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-500/20 p-3">
                <FileCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Forms Completed</p>
                <p className="text-3xl font-bold text-foreground">{summary.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-amber-500/20 p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Forms Pending</p>
                <p className="text-3xl font-bold text-foreground">{summary.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pay School Groups */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            પગાર શાળા (Pay School) Groups
            <Badge variant="secondary" className="ml-2">{paySchoolGroups.length} Groups</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border">
              {paySchoolGroups.map((group) => (
                <div 
                  key={group.name} 
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleGroupClick(group.name, 'paySchool')}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[250px]">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.total} teachers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {group.completed}
                      </Badge>
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                        <Clock className="h-3 w-3 mr-1" />
                        {group.pending}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* School Groups */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <School className="h-5 w-5 text-primary" />
            શાળા નું નામ (School) Groups
            <Badge variant="secondary" className="ml-2">{schoolGroups.length} Groups</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border">
              {schoolGroups.map((group) => (
                <div 
                  key={group.name} 
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleGroupClick(group.name, 'school')}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/10 p-2">
                      <School className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[250px]">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.total} teachers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {group.completed}
                      </Badge>
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                        <Clock className="h-3 w-3 mr-1" />
                        {group.pending}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeachersSection;
