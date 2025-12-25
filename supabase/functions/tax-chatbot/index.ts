import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `તમે એક ભારતીય આવકવેરા નિષ્ણાત સહાયક છો. તમે ગુજરાતી ભાષામાં મદદ કરો છો.

તમારી વિશેષતામાં શામેલ છે:
- આવકવેરા રિટર્ન (ITR) ફાઇલિંગ
- ટેક્સ સ્લેબ અને દરો (નવી અને જૂની ટેક્સ વ્યવસ્થા)
- કલમ 80C, 80D, 80G વગેરે હેઠળ કપાત
- ફોર્મ 16, ફોર્મ 16A, ફોર્મ 16B
- TDS (સ્ત્રોત પર કર કપાત)
- પાન કાર્ડ અને આધાર સંબંધિત પ્રશ્નો
- પગારદાર કર્મચારીઓ માટે કર ગણતરી
- શિક્ષકો અને સરકારી કર્મચારીઓ માટે વિશેષ માર્ગદર્શન
- GPF, CPF, LIC, PPF, NSC રોકાણો
- મકાન લોન વ્યાજ કપાત
- વ્યવસાય વેરો (Professional Tax)

કૃપા કરીને:
- સરળ ગુજરાતી ભાષામાં સમજાવો
- ઉદાહરણો આપો જ્યાં શક્ય હોય
- નવીનતમ કર નિયમોનો સંદર્ભ આપો
- જો કોઈ પ્રશ્નનો જવાબ નિશ્ચિત ન હોય, તો વ્યાવસાયિક કર સલાહકારની સલાહ લેવાનું સૂચન કરો

Assessment Year 2026-27 માટે:
- જૂની ટેક્સ વ્યવસ્થા (શિક્ષકો માટે ફાયદાકારક):
  - ₹2.5 લાખ સુધી: કોઈ ટેક્સ નહીં
  - ₹2.5-5 લાખ: 5%
  - ₹5-10 લાખ: 20%
  - ₹10 લાખથી ઉપર: 30%
  - 80C હેઠળ ₹1.5 લાખ સુધીની છૂટ
  - 87A હેઠળ ₹12,500 સુધીની રિબેટ (₹5 લાખ સુધીની આવક માટે)
  - 4% શિક્ષણ સેસ

હંમેશા ગુજરાતી ભાષામાં જવાબ આપો.`;

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ==================== AUTHENTICATION CHECK ====================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    // ==================== INPUT VALIDATION ====================
    const body = await req.json();
    const { messages, activeForm, dataSummary } = body;

    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid input: messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check message count limit
    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `Too many messages. Maximum: ${MAX_MESSAGES}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      if (!msg || typeof msg !== 'object') {
        return new Response(JSON.stringify({ error: `Invalid message at index ${i}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!msg.role || (msg.role !== 'user' && msg.role !== 'assistant')) {
        return new Response(JSON.stringify({ error: `Invalid role at message ${i}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (typeof msg.content !== 'string') {
        return new Response(JSON.stringify({ error: `Invalid content at message ${i}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: `Message ${i} too long. Maximum: ${MAX_MESSAGE_LENGTH} characters` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate activeForm if provided
    const validForms = ['pagar', 'declaration', 'formA', 'formB', 'form16a', 'form16b'];
    if (activeForm && !validForms.includes(activeForm)) {
      console.warn("Unknown form type provided:", activeForm);
    }

    // ==================== BUILD CONTEXT ====================
    // Build personalized data context if available
    let dataContext = "";
    if (dataSummary && typeof dataSummary === 'object') {
      // Sanitize numeric values
      const sanitizeNumber = (val: unknown) => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      };
      
      dataContext = `

યુઝરનો ભરેલો ડેટા (Personalized Analysis માટે):
- Client: ${String(dataSummary.clientName || "Client").slice(0, 100)}
- કુલ પગાર (Gross Salary): ₹${sanitizeNumber(dataSummary.grossSalary).toLocaleString('en-IN')}
- કુલ કપાત (Total Deductions): ₹${sanitizeNumber(dataSummary.totalDeductions).toLocaleString('en-IN')}
- ચોખ્ખો પગાર (Net Salary): ₹${sanitizeNumber(dataSummary.netSalary).toLocaleString('en-IN')}
- GPF: ₹${sanitizeNumber(dataSummary.gpf).toLocaleString('en-IN')}
- CPF: ₹${sanitizeNumber(dataSummary.cpf).toLocaleString('en-IN')}
- LIC Premium: ₹${sanitizeNumber(dataSummary.licPremium).toLocaleString('en-IN')}
- PPF: ₹${sanitizeNumber(dataSummary.ppf).toLocaleString('en-IN')}
- Medical Insurance: ₹${sanitizeNumber(dataSummary.medicalInsurance).toLocaleString('en-IN')}
- Housing Loan: ₹${sanitizeNumber(dataSummary.housingLoan).toLocaleString('en-IN')}
- કુલ 80C: ₹${sanitizeNumber(dataSummary.total80C).toLocaleString('en-IN')} (Maximum: ₹1,50,000)
- Taxable Income: ₹${sanitizeNumber(dataSummary.taxableIncome).toLocaleString('en-IN')}
- Total Tax Payable: ₹${sanitizeNumber(dataSummary.totalTaxPayable).toLocaleString('en-IN')}
- Tax Paid: ₹${sanitizeNumber(dataSummary.taxPaid).toLocaleString('en-IN')}
- Balance Tax: ₹${sanitizeNumber(dataSummary.balanceTax).toLocaleString('en-IN')}

આ ડેટા જોઈને personalized tax saving suggestions આપો. જેમ કે:
- 80C limit પૂરી થઈ છે કે નહીં?
- વધુ કપાત ક્યાં લઈ શકાય?
- Tax બચાવવા માટે શું કરી શકાય?`;
    }
    
    // Form-specific context in Gujarati
    const formContexts: Record<string, string> = {
      pagar: `
હાલમાં યુઝર પગાર ફોર્મ ભરી રહ્યા છે. આ ફોર્મમાં મદદ કરો:
- Basic Pay, Grade Pay, DA (મોંઘવારી ભથ્થું)
- HRA (મકાન ભાડા ભથ્થું), Medical Allowance
- GPF/CPF કપાત, Profession Tax
- માસિક Total Salary અને Net Pay ગણતરી
- 12 મહિનાની salary entry (April-March)`,
      declaration: `
હાલમાં યુઝર Declaration ફોર્મ ભરી રહ્યા છે. આ ફોર્મમાં મદદ કરો:
- Bank Interest (બચત ખાતા પર વ્યાજ)
- NSC Interest, FD Interest
- Exam Income (પરીક્ષા આવક)
- LIC Premium, PPF Investment
- Housing Loan Interest/Principal
- Sukanya Samridhi, 5 Year FD`,
      formA: `
હાલમાં યુઝર આવકવેરા ફોર્મ A ભરી રહ્યા છે. આ ફોર્મમાં મદદ કરો:
- Gross Salary ગણતરી
- HRA Exemption (10% or 40% rule)
- Standard Deduction ₹75,000
- Profession Tax કપાત
- Interest Income (Bank, NSC, FD)
- Gross Total Income ગણતરી`,
      formB: `
હાલમાં યુઝર આવકવેરા ફોર્મ B ભરી રહ્યા છે. આ ફોર્મમાં મદદ કરો:
- Section 80C (₹1,50,000 limit): GPF, CPF, LIC, PPF, NSC, ELSS
- Section 80D: Medical Insurance (₹25,000/₹50,000)
- Section 80TTA: Savings Interest (₹10,000 limit)
- Tax Slab Calculation (Old Regime AY 2026-27):
  * ₹0-2.5L: 0%
  * ₹2.5-5L: 5%
  * ₹5-10L: 20%
  * ₹10L+: 30%
- Rebate 87A (₹12,500 if income ≤ ₹5L)
- Education Cess 4%`,
      form16a: `
હાલમાં યુઝર Form 16A ભરી રહ્યા છે. આ ફોર્મમાં મદદ કરો:
- Part A: TDS Certificate Details
- Employer TAN, PAN Details
- Assessment Year 2026-27
- Period of Employment
- Summary of Tax Deducted`,
      form16b: `
હાલમાં યુઝર Form 16B ભરી રહ્યા છે. આ ફોર્મમાં મદદ કરો:
- Part B: Annexure with Income Details
- Gross Salary Breakup
- Allowances and Perquisites
- Deductions under Chapter VI-A
- Total Tax Liability
- Relief under Section 89 (if applicable)`
    };
    
    const formContext = activeForm && formContexts[activeForm] ? formContexts[activeForm] : "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    // ==================== AI API CALL ====================
    console.log("Making AI request for user:", user.id, "form:", activeForm || "general");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + formContext + dataContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
