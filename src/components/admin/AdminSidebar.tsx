import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Upload,
  Download,
  StickyNote,
  Calculator,
  UserPlus,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  onAddClient?: () => void;
  onImportExcel?: () => void;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onOpenNotes?: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const AdminSidebar = ({
  onAddClient,
  onImportExcel,
  onExportJSON,
  onExportCSV,
  onOpenNotes,
  activeSection = "dashboard",
  onSectionChange,
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate("/admin-login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      section: "dashboard",
    },
    {
      title: "Teachers",
      icon: Users,
      section: "teachers",
    },
    {
      title: "Tax Forms",
      icon: FileText,
      section: "forms",
    },
    {
      title: "Calculator",
      icon: Calculator,
      section: "calculator",
    },
    {
      title: "Notes",
      icon: StickyNote,
      section: "notes",
      onClick: onOpenNotes,
    },
  ];

  const actionItems = [
    {
      title: "Add Teacher",
      icon: UserPlus,
      onClick: onAddClient,
    },
    {
      title: "Import Excel",
      icon: Upload,
      onClick: onImportExcel,
    },
    {
      title: "Export JSON",
      icon: Download,
      onClick: onExportJSON,
    },
    {
      title: "Export CSV",
      icon: Download,
      onClick: onExportCSV,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg shadow-md">
            R
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-foreground">RupTax</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    isActive={activeSection === item.section}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else if (onSectionChange) {
                        onSectionChange(item.section);
                      }
                    }}
                    tooltip={item.title}
                    className="transition-all duration-200"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={item.onClick}
                    tooltip={item.title}
                    className="transition-all duration-200"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
