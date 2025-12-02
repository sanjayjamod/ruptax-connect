import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `आप एक भारतीय आयकर विशेषज्ञ सहायक हैं। आप हिंदी, गुजराती और अंग्रेजी में मदद कर सकते हैं।

आपकी विशेषज्ञता में शामिल है:
- आयकर रिटर्न (ITR) फाइलिंग
- टैक्स स्लैब और दरें (नई और पुरानी टैक्स व्यवस्था)
- सेक्शन 80C, 80D, 80G आदि के तहत कटौती
- फॉर्म 16, फॉर्म 16A, फॉर्म 16B
- TDS (स्रोत पर कर कटौती)
- पैन कार्ड और आधार से संबंधित प्रश्न
- वेतनभोगी कर्मचारियों के लिए कर गणना
- शिक्षकों और सरकारी कर्मचारियों के लिए विशेष मार्गदर्शन

कृपया:
- सरल भाषा में समझाएं
- उदाहरण दें जहां संभव हो
- नवीनतम कर नियमों का संदर्भ दें
- यदि किसी प्रश्न का उत्तर निश्चित नहीं है, तो पेशेवर कर सलाहकार से परामर्श लेने की सलाह दें

Assessment Year 2026-27 के लिए:
- नई टैक्स व्यवस्था (डिफ़ॉल्ट): 
  - ₹3 लाख तक: कोई टैक्स नहीं
  - ₹3-7 लाख: 5%
  - ₹7-10 लाख: 10%
  - ₹10-12 लाख: 15%
  - ₹12-15 लाख: 20%
  - ₹15 लाख से ऊपर: 30%
- पुरानी व्यवस्था में 80C के तहत ₹1.5 लाख तक की छूट`;

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
