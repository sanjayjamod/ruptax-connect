import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { MessageCircle, Send, Loader2, Bot, User, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TaxFormData } from "@/types/taxForm";
import { Client } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TaxChatbotProps {
  activeForm?: string;
  formData?: TaxFormData | null;
  client?: Client | null;
}

// Use supabase.functions.invoke for authenticated calls
const formHelpMessages: Record<string, string> = {
  pagar: "નમસ્તે! 🙏 હું પગાર ફોર્મ ભરવામાં મદદ કરું છું.\n\n• Basic Pay, Grade Pay, DA ભરો\n• HRA, Medical Allowance\n• GPF/CPF કપાત\n• Profession Tax\n• Net Salary ગણતરી\n\nકોઈ પ્રશ્ન પૂછો!",
  declaration: "નમસ્તે! 🙏 Declaration Form માટે મદદ:\n\n• Bank Interest (બચત ખાતું)\n• NSC/FD વ્યાજ\n• LIC Premium\n• PPF રોકાણ\n• Housing Loan\n• 80C/80D કપાત\n\nકોઈ પ્રશ્ન પૂછો!",
  formA: "નમસ્તે! 🙏 આવકવેરા ફોર્મ A માટે મદદ:\n\n• કુલ પગાર ગણતરી\n• HRA મુક્તિ\n• Standard Deduction ₹75,000\n• Profession Tax\n• અન્ય આવક (વ્યાજ, પરીક્ષા)\n• Gross Total Income\n\nકોઈ પ્રશ્ન પૂછો!",
  formB: "નમસ્તે! 🙏 આવકવેરા ફોર્મ B માટે મદદ:\n\n• 80C કપાત (₹1.5 લાખ સુધી)\n• GPF, CPF, LIC, PPF\n• 80D Medical Insurance\n• Tax Slab ગણતરી\n• Rebate 87A\n• Education Cess 4%\n\nકોઈ પ્રશ્ન પૂછો!",
  form16a: "નમસ્તે! 🙏 Form 16A માટે મદદ:\n\n• Part A - TDS Details\n• Employer Information\n• PAN, TAN Details\n• Tax Deducted Summary\n• Quarter-wise TDS\n\nકોઈ પ્રશ્ન પૂછો!",
  form16b: "નમસ્તે! 🙏 Form 16B માટે મદદ:\n\n• Part B - Income Details\n• Gross Salary Breakdown\n• Deductions under Chapter VI-A\n• Tax Computation\n• Net Tax Payable\n\nકોઈ પ્રશ્ન પૂછો!"
};

const TaxChatbot = ({ activeForm, formData, client }: TaxChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Create data summary for personalized advice
  const getDataSummary = () => {
    if (!formData) return null;
    
    const salary = formData.salaryData.totals;
    const decl = formData.declarationData;
    const taxB = formData.taxCalculationB;
    
    return {
      clientName: client?.name || "Client",
      grossSalary: salary.totalSalary,
      totalDeductions: salary.totalDeduction,
      netSalary: salary.netPay,
      gpf: salary.gpf,
      cpf: salary.cpf,
      professionTax: salary.professionTax,
      licPremium: decl.licPremium,
      ppf: decl.ppf,
      medicalInsurance: decl.medicalInsurance,
      housingLoan: decl.housingLoanInterest + decl.housingLoanPrincipal,
      total80C: taxB.total80C,
      taxableIncome: taxB.taxableIncome,
      totalTaxPayable: taxB.totalTaxPayable,
      taxPaid: taxB.taxPaid,
      balanceTax: taxB.balanceTax
    };
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: formHelpMessages[activeForm || ""] || "નમસ્તે! 🙏 હું તમારો આવકવેરા સહાયક છું.\n\nતમે મને પૂછી શકો છો:\n• ITR ફાઇલિંગ\n• ટેક્સ કપાત (80C, 80D)\n• ફોર્મ 16 વિશે\n• TDS ગણતરી\n• GPF/CPF/LIC રોકાણો\n• પગાર ફોર્મ ભરવા વિશે\n\nતમારો પ્રશ્ન ગુજરાતીમાં પૂછો!"
    }
  ]);
  
  // Update welcome message when active form changes
  useEffect(() => {
    if (activeForm && formHelpMessages[activeForm]) {
      setMessages([{
        role: "assistant",
        content: formHelpMessages[activeForm]
      }]);
    }
  }, [activeForm]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to use the chatbot",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tax-chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg], 
          activeForm,
          dataSummary: getDataSummary()
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1) {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "માફ કરશો, કંઈક ખોટું થયું. કૃપા કરીને ફરીથી પ્રયાસ કરો." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    streamChat(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            આવકવેરા સહાયક
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="તમારો પ્રશ્ન અહીં લખો..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI આવકવેરા સહાયક • ITR • TDS • ફોર્મ 16
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaxChatbot;
