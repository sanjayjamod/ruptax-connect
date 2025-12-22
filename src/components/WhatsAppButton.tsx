import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "919924640689";
  const message = encodeURIComponent("Hello! I need help with Income Tax Registration.");
  
  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142_70%_45%)] text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse-slow no-print print:hidden"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
