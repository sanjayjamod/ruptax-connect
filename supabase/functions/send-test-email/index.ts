import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: string;
  senderEmail: string;
  senderName: string;
  testEmail: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure,
      senderEmail,
      senderName,
      testEmail,
    }: TestEmailRequest = await req.json();

    console.log("Attempting to send test email to:", testEmail);
    console.log("SMTP Host:", smtpHost);
    console.log("SMTP Port:", smtpPort);
    console.log("SMTP Secure:", smtpSecure);
    console.log("From:", senderEmail);

    // Validate required fields
    if (!smtpHost || !smtpUsername || !smtpPassword || !senderEmail || !testEmail) {
      throw new Error("Missing required SMTP configuration");
    }

    // Create email content
    const emailContent = `
From: "${senderName}" <${senderEmail}>
To: ${testEmail}
Subject: RupTax - SMTP Test Email
MIME-Version: 1.0
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #22c55e; margin-bottom: 20px; }
    p { color: #333; line-height: 1.6; }
    .success { background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ SMTP Test Successful!</h1>
    <div class="success">
      <strong>Congratulations!</strong> Your AWS SES SMTP configuration is working correctly.
    </div>
    <p><strong>SMTP Host:</strong> ${smtpHost}</p>
    <p><strong>SMTP Port:</strong> ${smtpPort}</p>
    <p><strong>Security:</strong> ${smtpSecure.toUpperCase()}</p>
    <p><strong>Sender:</strong> ${senderName} &lt;${senderEmail}&gt;</p>
    <p><strong>Test Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
    <div class="footer">
      <p>This is a test email from RupTax Tax Management System.</p>
      <p>Created By: Smart Computer Vinchhiya</p>
    </div>
  </div>
</body>
</html>
`;

    // Determine TLS settings
    const useTLS = smtpSecure === "tls" || smtpSecure === "ssl";
    const port = parseInt(smtpPort);

    // Use Deno's SMTP client approach with raw socket
    // For AWS SES, we'll use the HTTPS API approach instead
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: port === 465 ? 465 : 587,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      if (n === null) return "";
      return decoder.decode(buffer.subarray(0, n));
    };

    const sendCommand = async (command: string): Promise<string> => {
      await conn.write(encoder.encode(command + "\r\n"));
      return await readResponse();
    };

    try {
      // Read greeting
      let response = await readResponse();
      console.log("Server greeting:", response);

      // EHLO
      response = await sendCommand(`EHLO ruptax.local`);
      console.log("EHLO response:", response);

      // AUTH LOGIN
      response = await sendCommand("AUTH LOGIN");
      console.log("AUTH response:", response);

      // Username (base64)
      response = await sendCommand(btoa(smtpUsername));
      console.log("Username response:", response);

      // Password (base64)
      response = await sendCommand(btoa(smtpPassword));
      console.log("Password response:", response);

      if (!response.startsWith("235")) {
        throw new Error("Authentication failed: " + response);
      }

      // MAIL FROM
      response = await sendCommand(`MAIL FROM:<${senderEmail}>`);
      console.log("MAIL FROM response:", response);

      // RCPT TO
      response = await sendCommand(`RCPT TO:<${testEmail}>`);
      console.log("RCPT TO response:", response);

      // DATA
      response = await sendCommand("DATA");
      console.log("DATA response:", response);

      // Send email content
      response = await sendCommand(emailContent + "\r\n.");
      console.log("Email content response:", response);

      if (!response.startsWith("250")) {
        throw new Error("Failed to send email: " + response);
      }

      // QUIT
      await sendCommand("QUIT");
      
      conn.close();

      console.log("Test email sent successfully to:", testEmail);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Test email sent successfully to ${testEmail}` 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (smtpError) {
      conn.close();
      throw smtpError;
    }
  } catch (error: any) {
    console.error("Error in send-test-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send test email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
