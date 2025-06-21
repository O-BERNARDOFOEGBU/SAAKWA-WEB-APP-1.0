
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, MessageCircle, Upload, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingCalculator = ({ selectedClothes, pickupDate, deliveryDate, pickupTimeSlot, deliveryTimeSlot, onBack }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const clothingPrices = {
    "T-Shirt": 200,
    "Shirt": 300,
    "Trouser": 400,
    "Jeans": 500,
    "Short": 150,
    "Dress": 600,
    "Skirt": 350,
    "Blouse": 350,
    "Jacket": 700,
    "Sweater": 550,
    "Coat": 800,
    "Suit": 1000,
    "Tie": 100,
    "Scarf": 150,
    "Socks": 50,
    "Underwear": 100,
    "Bedding": 750,
    "Curtain": 900,
    "Towel": 200,
    "Table Cloth": 300,
  };

  const totalAmount = selectedClothes.reduce((total, item) => {
    return total + (clothingPrices[item.type] || 0) * item.quantity;
  }, 0);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "Receipt uploaded",
        description: "Your payment receipt has been uploaded successfully",
      });
    }
  };

  const openWhatsApp = () => {
    const message = `Hi! I need help confirming my payment for Saakwa Laundry booking. Total amount: ₦${totalAmount.toLocaleString()}`;
    const phoneNumber = "2348123456789"; // Replace with actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSignUp = async () => {
    if (!customerEmail || !customerPassword || !customerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in email, password, and full name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: customerEmail,
        password: customerPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: customerName
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account. You can continue with your booking.",
      });
      
      setShowAuthModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

    // If user is not authenticated, show auth modal first
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          selected_clothes: selectedClothes,
          pickup_date: pickupDate,
          delivery_date: deliveryDate,
          pickup_time_slot: pickupTimeSlot,
          delivery_time_slot: deliveryTimeSlot,
          total_amount: totalAmount,
          payment_status: uploadedFile ? 'pending' : 'pending'
        });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your laundry booking has been submitted successfully. We'll contact you soon!",
      });

      setShowPaymentModal(false);
      // Reset form or redirect
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
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
                  placeholder="Enter your full address for pickup"
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
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span>{item.quantity} x {item.type}</span>
                    <span>₦{((clothingPrices[item.type] || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              {/* Schedule Summary */}
              <div className="mt-4 pt-3 border-t space-y-2 text-sm">
                {pickupDate && (
                  <div className="flex justify-between">
                    <span>Pickup:</span>
                    <span>{new Date(pickupDate).toLocaleDateString()} {pickupTimeSlot && `at ${pickupTimeSlot}`}</span>
                  </div>
                )}
                {deliveryDate && (
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>{new Date(deliveryDate).toLocaleDateString()} {deliveryTimeSlot && `at ${deliveryTimeSlot}`}</span>
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
                  disabled={!customerName || !customerPhone || !customerAddress || totalAmount === 0}
                >
                  Complete Booking - ₦{totalAmount.toLocaleString()}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auth Modal */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>
              <DialogDescription>
                Create an account to complete your booking
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <Button 
                onClick={handleSignUp}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By creating an account, you can track your orders and get faster service
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Transfer ₦{totalAmount.toLocaleString()} to complete your booking
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Bank Transfer Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Bank:</span>
                    <span className="font-medium">First Bank Nigeria</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Account Name:</span>
                    <span className="font-medium">Saakwa Laundry Services</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">1234567890</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard('1234567890')}
                        className="h-6 w-6 p-0"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Amount:</span>
                    <span className="font-medium text-blue-600">₦{totalAmount.toLocaleString()}</span>
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
                />
                {uploadedFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {uploadedFile.name} uploaded
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
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

              <p className="text-xs text-gray-500 text-center">
                If you don't have a receipt, click WhatsApp to contact us for payment confirmation
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PricingCalculator;
