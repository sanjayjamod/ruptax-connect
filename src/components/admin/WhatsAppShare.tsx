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
import { MessageCircle, Send, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Client } from "@/types/client";

interface WhatsAppShareProps {
  client: Client | null;
  onSharePDF?: () => void;
}

const WhatsAppShare = ({ client, onSharePDF }: WhatsAppShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const phoneNumber = client?.mobileNo?.replace(/\D/g, "") || "";
  const fullPhoneNumber = phoneNumber.startsWith("91") ? phoneNumber : `91${phoneNumber}`;

  const defaultMessage = client
    ? `નમસ્તે ${client.nameGujarati || client.name},\n\nઆપની ${new Date().getFullYear()}-${new Date().getFullYear() + 1} ની Income Tax Form ભરાઇ ગઈ છે.\n\nઆભાર,\nSmart Computer Vinchhiya`
    : "Hello! Your tax form has been completed.";

  const handleSendMessage = () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Client mobile number not found",
        variant: "destructive",
      });
      return;
    }

    const message = encodeURIComponent(customMessage || defaultMessage);
    window.open(`https://web.whatsapp.com/send?phone=${fullPhoneNumber}&text=${message}`, "_blank");
    setIsOpen(false);
    
    toast({
      title: "WhatsApp Opened",
      description: "Send the message and share the PDF manually",
    });
  };

  const handleShareWithPDF = () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Client mobile number not found",
        variant: "destructive",
      });
      return;
    }

    // First generate PDF (user will save it)
    if (onSharePDF) {
      onSharePDF();
    }

    // Then open WhatsApp Web
    const message = encodeURIComponent(
      `${customMessage || defaultMessage}\n\n📄 PDF file attached`
    );
    
    setTimeout(() => {
      window.open(`https://web.whatsapp.com/send?phone=${fullPhoneNumber}&text=${message}`, "_blank");
    }, 500);

    setIsOpen(false);
    
    toast({
      title: "PDF Generated",
      description: "Save the PDF, then attach it in WhatsApp Web",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[hsl(142_70%_45%)] border-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_45%)]/10"
          disabled={!client}
        >
          <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[hsl(142_70%_45%)]" />
            Share via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Send tax form notification to {client?.name || "client"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Client Phone</Label>
            <Input
              value={phoneNumber ? `+91 ${phoneNumber}` : "No phone number"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <textarea
              id="message"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={defaultMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSendMessage} 
              className="w-full bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_40%)]"
            >
              <Send className="h-4 w-4 mr-2" /> Send Message Only
            </Button>
            <Button 
              onClick={handleShareWithPDF} 
              variant="outline"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" /> Generate PDF & Open WhatsApp
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            WhatsApp Web will open in a new tab. Attach the saved PDF manually.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppShare;
