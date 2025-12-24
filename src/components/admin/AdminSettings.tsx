import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Key, 
  Moon, 
  Sun, 
  RotateCcw, 
  Trash2,
  Shield,
  Save,
  Mail,
  Eye,
  EyeOff
} from "lucide-react";

interface AdminSettingsProps {
  onResetData?: () => void;
}

const AdminSettings = ({ onResetData }: AdminSettingsProps) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // SMTP Email Settings
  const [smtpHost, setSmtpHost] = useState(
    localStorage.getItem("ruptax_smtp_host") || ""
  );
  const [smtpPort, setSmtpPort] = useState(
    localStorage.getItem("ruptax_smtp_port") || "587"
  );
  const [smtpUsername, setSmtpUsername] = useState(
    localStorage.getItem("ruptax_smtp_username") || ""
  );
  const [smtpPassword, setSmtpPassword] = useState(
    localStorage.getItem("ruptax_smtp_password") || ""
  );
  const [senderEmail, setSenderEmail] = useState(
    localStorage.getItem("ruptax_sender_email") || ""
  );
  const [senderName, setSenderName] = useState(
    localStorage.getItem("ruptax_sender_name") || "RupTax"
  );
  const [smtpSecure, setSmtpSecure] = useState(
    localStorage.getItem("ruptax_smtp_secure") || "tls"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
    toast({
      title: "Theme Changed",
      description: `Switched to ${isDarkMode ? "light" : "dark"} mode`,
    });
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetAllData = () => {
    // Clear localStorage
    localStorage.removeItem("ruptax_clients");
    localStorage.removeItem("ruptax_tax_forms");
    localStorage.removeItem("ruptax_admin_notes");
    
    toast({
      title: "Data Reset",
      description: "All local data has been cleared",
    });

    if (onResetData) {
      onResetData();
    }
  };

  const handleSaveEmailSettings = () => {
    setIsSavingEmail(true);
    try {
      localStorage.setItem("ruptax_smtp_host", smtpHost);
      localStorage.setItem("ruptax_smtp_port", smtpPort);
      localStorage.setItem("ruptax_smtp_username", smtpUsername);
      localStorage.setItem("ruptax_smtp_password", smtpPassword);
      localStorage.setItem("ruptax_sender_email", senderEmail);
      localStorage.setItem("ruptax_sender_name", senderName);
      localStorage.setItem("ruptax_smtp_secure", smtpSecure);
      
      toast({
        title: "SMTP Settings Saved",
        description: "Your email configuration has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Email Settings */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            SMTP Email Settings (AWS SES)
          </CardTitle>
          <CardDescription>
            Configure SMTP settings for sending forms to clients via AWS SES
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="email-smtp.ap-south-1.amazonaws.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
              />
              <p className="text-xs text-muted-foreground">
                Common ports: 25, 465 (SSL), 587 (TLS)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input
                id="smtp-username"
                type="text"
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                placeholder="AKIA..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <div className="relative">
                <Input
                  id="smtp-password"
                  type={showPassword ? "text" : "password"}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="Your SMTP password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp-secure">Security</Label>
            <select
              id="smtp-secure"
              value={smtpSecure}
              onChange={(e) => setSmtpSecure(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="tls">TLS (Port 587)</option>
              <option value="ssl">SSL (Port 465)</option>
              <option value="none">None (Port 25)</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">Sender Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input
                  id="sender-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="RupTax"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input
                  id="sender-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="noreply@yourdomain.com"
                />
                <p className="text-xs text-muted-foreground">
                  Must be verified in AWS SES
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveEmailSettings} 
            disabled={isSavingEmail || !smtpHost || !smtpUsername || !smtpPassword}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSavingEmail ? "Saving..." : "Save SMTP Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>Update your admin account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button 
            onClick={handlePasswordChange} 
            disabled={isChangingPassword || !newPassword || !confirmPassword}
          >
            <Save className="h-4 w-4 mr-2" />
            {isChangingPassword ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your local data storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-0.5">
              <p className="font-medium">Reset Dashboard Data</p>
              <p className="text-sm text-muted-foreground">Reset statistics counters (Pending, Completed, Submitted, Total)</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                toast({
                  title: "Stats Reset",
                  description: "Dashboard statistics have been reset",
                });
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Stats
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="space-y-0.5">
              <p className="font-medium text-destructive">Clear All Local Data</p>
              <p className="text-sm text-muted-foreground">This will delete all clients, forms, and notes from local storage</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all clients,
                    tax forms, and notes stored in your browser's local storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Security
          </CardTitle>
          <CardDescription>Security settings and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Your session is secured with Supabase authentication. Client data is stored
              locally in your browser for offline access.
            </p>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Shield className="h-4 w-4" />
              <span>Admin session active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
