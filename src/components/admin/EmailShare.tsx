import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Send, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";

interface EmailShareProps {
  client: Client | null;
  formData: TaxFormData | null;
}

const EmailShare = ({ client, formData }: EmailShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customSubject, setCustomSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const clientEmail = client?.email || "";

  const defaultSubject = client
    ? `Income Tax Form ${new Date().getFullYear()}-${new Date().getFullYear() + 1} - ${client.name}`
    : "Your Tax Form";

  const defaultMessage = client
    ? `નમસ્તે ${client.nameGujarati || client.name},\n\nઆપની ${new Date().getFullYear()}-${new Date().getFullYear() + 1} ની Income Tax Form ભરાઇ ગઈ છે.\n\nઆભાર,\nSmart Computer Vinchhiya`
    : "Hello! Your tax form has been completed.";

  const handleSendEmail = async () => {
    if (!clientEmail) {
      toast({
        title: "Error",
        description: "Client email not found",
        variant: "destructive",
      });
      return;
    }

    // Check if SMTP settings are configured
    const smtpHost = localStorage.getItem("ruptax_smtp_host");
    const smtpUsername = localStorage.getItem("ruptax_smtp_username");
    const smtpPassword = localStorage.getItem("ruptax_smtp_password");
    
    if (!smtpHost || !smtpUsername || !smtpPassword) {
      toast({
        title: "SMTP Not Configured",
        description: "Please configure SMTP settings in Admin Settings first",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // For now, open email client as fallback
      // In production, this would call an edge function to send via SMTP
      const subject = encodeURIComponent(customSubject || defaultSubject);
      const body = encodeURIComponent(customMessage || defaultMessage);
      
      window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, "_blank");
      
      setIsOpen(false);
      toast({
        title: "Email Client Opened",
        description: "Compose your email and attach the PDF manually",
      });
    } catch (error) {
      console.error("Email error:", error);
      toast({
        title: "Error",
        description: "Failed to open email client",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 border-blue-600 hover:bg-blue-600/10"
          disabled={!client}
        >
          <Mail className="h-4 w-4 mr-1" /> Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Send via Email
          </DialogTitle>
          <DialogDescription>
            Send tax form to {client?.name || "client"} via email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Client Email</Label>
            <Input
              value={clientEmail || "No email address"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder={defaultSubject}
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-message">Message</Label>
            <textarea
              id="email-message"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={defaultMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSendEmail} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSending || !clientEmail}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isSending ? "Opening..." : "Open Email Client"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Your default email client will open. Attach the tax form PDF manually.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailShare;
