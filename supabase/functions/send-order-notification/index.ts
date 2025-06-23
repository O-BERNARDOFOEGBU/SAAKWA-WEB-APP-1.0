
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_TAZVn2DS_L1614CiA13toqZLa5ipUHE8N");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  selected_clothes: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  pickup_date: string;
  delivery_date: string;
  pickup_time_slot: string;
  delivery_time_slot: string;
  total_amount: number;
  payment_status?: string;
  receipt_url?: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received order notification request");
    
    const orderData: OrderNotificationRequest = await req.json();
    console.log("Order data:", orderData);

    // Format the selected clothes list
    const clothesList = orderData.selected_clothes
      .map(item => `• ${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`)
      .join('\n');

    // Format the email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🧺 New Saakwa Laundry Order</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Total Amount:</strong> ₦${orderData.total_amount.toLocaleString()}</p>
            <p><strong>Payment Status:</strong> ${orderData.payment_status || 'Pending'}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.created_at).toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-top: 0;">👤 Customer Information</h3>
            <p><strong>Name:</strong> ${orderData.customer_name}</p>
            <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
            <p><strong>Address:</strong> ${orderData.customer_address}</p>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-top: 0;">📅 Schedule</h3>
            <div style="display: flex; gap: 20px;">
              <div style="flex: 1;">
                <h4 style="color: #2563eb; margin-bottom: 5px;">📦 Pickup</h4>
                <p style="margin: 0;"><strong>Date:</strong> ${new Date(orderData.pickup_date).toLocaleDateString('en-GB')}</p>
                <p style="margin: 0;"><strong>Time:</strong> ${orderData.pickup_time_slot}</p>
              </div>
              <div style="flex: 1;">
                <h4 style="color: #16a34a; margin-bottom: 5px;">🚚 Delivery</h4>
                <p style="margin: 0;"><strong>Date:</strong> ${new Date(orderData.delivery_date).toLocaleDateString('en-GB')}</p>
                <p style="margin: 0;"><strong>Time:</strong> ${orderData.delivery_time_slot}</p>
              </div>
            </div>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e293b; margin-top: 0;">👕 Items Ordered</h3>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; font-family: monospace;">
${clothesList}
            </div>
            <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
              <strong style="font-size: 18px; color: #2563eb;">Total: ₦${orderData.total_amount.toLocaleString()}</strong>
            </div>
          </div>

          ${orderData.receipt_url ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0;"><strong>💳 Payment Receipt:</strong> Customer uploaded a payment receipt</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Receipt URL: ${orderData.receipt_url}</p>
          </div>
          ` : ''}
        </div>
        
        <div style="background-color: #64748b; color: white; padding: 15px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">Saakwa Laundry - Powered by Oparantho Ventures</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Saakwa Laundry <onboarding@resend.dev>",
      to: ["Bernardofoegbu71@gmail.com"],
      subject: `🧺 New Order - ${orderData.customer_name} - ₦${orderData.total_amount.toLocaleString()}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
