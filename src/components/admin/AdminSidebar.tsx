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
  FolderOpen,
  Mail,
  MessageCircle,
  RotateCcw,
  Moon,
  Sun,
  ClipboardList,
  Trash2,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface AdminSidebarProps {
  onAddClient?: () => void;
  onImportExcel?: () => void;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onClearAllData?: () => void;
  onOpenNotes?: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const AdminSidebar = ({
  onAddClient,
  onImportExcel,
  onExportJSON,
  onExportCSV,
  onClearAllData,
  onOpenNotes,
  activeSection = "dashboard",
  onSectionChange,
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const handleLogout = async () => {
    await signOut();
    navigate("/admin-login");
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
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
      title: "Client Profiles",
      icon: FolderOpen,
      section: "profiles",
    },
    {
      title: "Fill Form",
      icon: FileText,
      section: "fill-form",
    },
    {
      title: "Filled Forms",
      icon: ClipboardList,
      section: "filled-forms",
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
    {
      title: "Settings",
      icon: Settings,
      section: "settings",
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
    {
      title: "Clear All Data",
      icon: Trash2,
      onClick: onClearAllData,
      className: "text-destructive hover:bg-destructive/10",
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
                    className={`transition-all duration-200 ${(item as any).className || ''}`}
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
          <SidebarGroupLabel>Theme</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={toggleTheme}
                  tooltip={isDarkMode ? "Light Mode" : "Dark Mode"}
                  className="transition-all duration-200"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
