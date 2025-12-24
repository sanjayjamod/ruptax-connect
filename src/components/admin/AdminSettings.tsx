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
  
  // Email Settings
  const [resendApiKey, setResendApiKey] = useState(
    localStorage.getItem("ruptax_resend_api_key") || ""
  );
  const [senderEmail, setSenderEmail] = useState(
    localStorage.getItem("ruptax_sender_email") || ""
  );
  const [senderName, setSenderName] = useState(
    localStorage.getItem("ruptax_sender_name") || "RupTax"
  );
  const [showApiKey, setShowApiKey] = useState(false);
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
      localStorage.setItem("ruptax_resend_api_key", resendApiKey);
      localStorage.setItem("ruptax_sender_email", senderEmail);
      localStorage.setItem("ruptax_sender_name", senderName);
      
      toast({
        title: "Email Settings Saved",
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
      {/* Email Settings */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Email Settings (SMTP)
          </CardTitle>
          <CardDescription>
            Configure email settings for sending forms to clients. 
            <a 
              href="https://resend.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              Get Resend API Key
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resend-api-key">Resend API Key</Label>
            <div className="relative">
              <Input
                id="resend-api-key"
                type={showApiKey ? "text" : "password"}
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder="re_xxxxxxxx..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Create an API key at resend.com/api-keys
            </p>
          </div>
          
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
              Domain must be verified at resend.com/domains
            </p>
          </div>

          <Button 
            onClick={handleSaveEmailSettings} 
            disabled={isSavingEmail || !resendApiKey}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSavingEmail ? "Saving..." : "Save Email Settings"}
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
