
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MessageCircle, Copy, Check } from "lucide-react";

const PricingCalculator = ({
  selectedClothes,
  pickupDate,
  deliveryDate,
  pickupTimeSlot,
  deliveryTimeSlot,
  onBack,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();

  // Auto-populate customer name from user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !customerName) {
        try {
          // First try to get from user metadata
          const fullName = user.user_metadata?.full_name;
          if (fullName) {
            setCustomerName(fullName);
            return;
          }

          // If not in metadata, try to get from profiles table
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (!error && profile?.full_name) {
            setCustomerName(profile.full_name);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user, customerName]);

  // Calculate total using the same logic as ClothingSelector
  const totalAmount = selectedClothes.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  console.log("PricingCalculator - Selected clothes:", selectedClothes);
  console.log("PricingCalculator - Total amount:", totalAmount);
  console.log("PricingCalculator - Current user:", user);
  console.log("PricingCalculator - Current session:", session);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in to upload receipts",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      // Include customer name in filename for easy identification
      const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${
        user.id
      }/${sanitizedCustomerName}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (error) throw error;

      setUploadedFile({
        name: file.name,
        path: data.path,
        url: data.path,
      });

      toast({
        title: "Receipt uploaded",
        description: "Your payment receipt has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const openWhatsApp = () => {
    const message = `Hi! I need help confirming my payment for Saakwa Laundry booking. Total amount: ₦${totalAmount.toLocaleString()}`;
    const phoneNumber = "2349160391653";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const saveBookingToDatabase = async (userId) => {
    try {
      console.log("Attempting to save booking with userId:", userId);
      const bookingData = {
        user_id: userId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        selected_clothes: selectedClothes,
        pickup_date: pickupDate,
        delivery_date: deliveryDate,
        pickup_time_slot: pickupTimeSlot,
        delivery_time_slot: deliveryTimeSlot,
        total_amount: totalAmount,
        payment_status: uploadedFile ? "pending" : "pending",
        receipt_url: uploadedFile ? uploadedFile.path : null,
      };

      console.log("Booking data to save:", bookingData);

      const { data, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select();

      if (error) {
        console.error("Supabase booking error:", error);
        throw error;
      }

      console.log("Booking saved successfully:", data);

      // Send email notification after successful booking
      if (data && data[0]) {
        try {
          console.log("Sending email notification...");
          const { data: emailData, error: emailError } = await supabase.functions.invoke(
            'send-order-notification',
            {
              body: {
                id: data[0].id,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress,
                selected_clothes: selectedClothes,
                pickup_date: pickupDate,
                delivery_date: deliveryDate,
                pickup_time_slot: pickupTimeSlot,
                delivery_time_slot: deliveryTimeSlot,
                total_amount: totalAmount,
                payment_status: uploadedFile ? "pending" : "pending",
                receipt_url: uploadedFile ? uploadedFile.path : null,
                created_at: data[0].created_at,
              }
            }
          );

          if (emailError) {
            console.error("Email notification error:", emailError);
          } else {
            console.log("Email notification sent successfully:", emailData);
          }
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
          // Don't throw here as the booking was successful
        }
      }

      toast({
        title: "Booking Confirmed!",
        description:
          "Your laundry booking has been submitted successfully. We'll contact you soon!",
      });

      // Clear the form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setUploadedFile(null);
      setShowPaymentModal(true);

      return data;
    } catch (error) {
      console.error("Error saving booking:", error);
      throw error;
    }
  };

  const handleCompleteBooking = async () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if user is already authenticated
    if (!user || !session) {
      toast({
        title: "Please Sign In",
        description:
          "You need to sign in or create an account to complete your booking.",
        variant: "destructive",
      });
      return;
    }

    console.log("User is authenticated, proceeding to payment...");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    // Double-check authentication
    if (!user || !session) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in to complete your booking.",
        variant: "destructive",
      });
      setShowPaymentModal(false);
      return;
    }

    setLoading(true);
    try {
      await saveBookingToDatabase(user.id);
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Error",
        description: `Failed to submit booking: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schedule
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Pickup Address *</Label>
                <Textarea
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter your full address as it appears on Google Maps for pickup."
                  required
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedClothes.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b"
                  >
                    <span>
                      {item.quantity} x {item.name}
                    </span>
                    <span>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Schedule Summary */}
              <div className="mt-4 pt-3 border-t space-y-2 text-sm">
                {pickupDate && (
                  <div className="flex justify-between">
                    <span>Pickup:</span>
                    <span>
                      {new Date(pickupDate).toLocaleDateString()}{" "}
                      {pickupTimeSlot && `at ${pickupTimeSlot}`}
                    </span>
                  </div>
                )}
                {deliveryDate && (
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>
                      {new Date(deliveryDate).toLocaleDateString()}{" "}
                      {deliveryTimeSlot && `at ${deliveryTimeSlot}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="font-semibold text-lg text-right mt-4 pt-3 border-t">
                Total: ₦{totalAmount.toLocaleString()}
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleCompleteBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={
                    !customerName ||
                    !customerPhone ||
                    !customerAddress ||
                    totalAmount === 0 ||
                    !user
                  }
                >
                  {!user
                    ? "Please Sign In First"
                    : `Complete Booking - ₦${totalAmount.toLocaleString()}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Transfer ₦{totalAmount.toLocaleString()} to complete your
                booking
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Bank Transfer Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Bank:</span>
                    <span className="font-medium">Moniepoint</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Account Name:</span>
                    <span className="font-medium">OPARANTHO VENTURES</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">7060859311</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard("7060859311")}
                        className="h-6 w-6 p-0"
                      >
                        {copied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Amount:</span>
                    <span className="font-medium text-blue-600">
                      ₦{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="receipt">Upload Payment Receipt</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="mt-1"
                  disabled={uploading || !user}
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                )}
                {uploadedFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {uploadedFile.name} uploaded
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={loading || !user}
                  className="flex-1"
                >
                  {loading
                    ? "Processing..."
                    : `Confirm Payment - ₦${totalAmount.toLocaleString()}`}
                </Button>

                <Button
                  variant="outline"
                  onClick={openWhatsApp}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>

              {!user && (
                <p className="text-xs text-red-500 text-center">
                  Please sign in to complete payment
                </p>
              )}

              <p className="text-xs font-medium text-gray-600 text-center">
                Made a transfer without a receipt? Click Confirm Payment, then
                message us on WhatsApp to confirm. You can also message us
                anytime to speed up your pickup.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PricingCalculator;
