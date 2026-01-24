import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendLicenseRequest {
  userId?: string;
  email?: string;
  licenseKey?: string;
}

// Generate a license key in format BZSUITE-XXXX-XXXX-XXXX-XXXX
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments: string[] = [];
  
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return `BZSUITE-${segments.join('-')}`;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-license-key function called");
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email: directEmail, licenseKey: providedKey }: SendLicenseRequest = await req.json();
    
    if (!userId && !directEmail) {
      console.error("Missing userId or email");
      return new Response(
        JSON.stringify({ error: "userId or email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let userEmail: string;

    // If direct email is provided, use it directly
    if (directEmail) {
      userEmail = directEmail;
      console.log("Using direct email:", userEmail);
    } else {
      console.log("Looking up user:", userId);

      // Create Supabase client with service role
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get user email from auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId!);
      
      if (userError || !userData?.user) {
        console.error("User not found:", userError);
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      userEmail = userData.user.email!;
      if (!userEmail) {
        console.error("User has no email");
        return new Response(
          JSON.stringify({ error: "User has no email address" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log("Sending to email:", userEmail);

    // Generate or use provided license key
    const licenseKey = providedKey || generateLicenseKey();
    console.log("License key:", licenseKey);

    // Send email with license key
    // Using Resend's test domain until custom domain is verified
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "BizSuite <onboarding@resend.dev>",
      to: [userEmail],
      subject: "🎉 Your BizSuite Lifetime License Key",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">🎉 Thank You!</h1>
                <p style="color: #71717a; margin-top: 8px;">Your BizSuite purchase is complete</p>
              </div>
              
              <!-- License Key Box -->
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: rgba(255,255,255,0.8); margin: 0 0 8px 0; font-size: 14px;">Your Lifetime License Key</p>
                <p style="color: white; margin: 0; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 2px;">${licenseKey}</p>
              </div>
              
              <!-- Instructions -->
              <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #0369a1; margin: 0 0 12px 0; font-size: 16px;">How to Activate:</h3>
                <ol style="color: #0c4a6e; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Go to the <a href="https://logchainapp.lovable.app/pricing" style="color: #3b82f6;">Pricing Page</a></li>
                  <li>Enter your license key in the activation form</li>
                  <li>Click "Activate" to unlock lifetime access</li>
                </ol>
              </div>
              
              <!-- Features -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #18181b; margin: 0 0 12px 0; font-size: 16px;">What's Included:</h3>
                <ul style="color: #52525b; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>✅ Lifetime access to all features</li>
                  <li>✅ Works 100% offline</li>
                  <li>✅ Free updates for 1 year</li>
                  <li>✅ Local data storage</li>
                  <li>✅ No recurring fees</li>
                </ul>
              </div>
              
              <!-- Support -->
              <div style="border-top: 1px solid #e4e4e7; padding-top: 24px; text-align: center;">
                <p style="color: #71717a; margin: 0; font-size: 14px;">
                  Need help? Contact us at <a href="mailto:parambuilds@proton.me" style="color: #3b82f6;">parambuilds@proton.me</a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                © 2024 BizSuite. Built with ❤️ for Indian SMBs.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `License key sent to ${userEmail}`,
        licenseKey,
        emailId: emailData?.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-license-key:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
