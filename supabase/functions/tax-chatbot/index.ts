import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
