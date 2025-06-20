
import { ArrowLeft, Check, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface PricingCalculatorProps {
  selectedClothes: any[];
  pickupDate: Date | null;
  deliveryDate: Date | null;
  onBack: () => void;
}

const PricingCalculator = ({ selectedClothes, pickupDate, deliveryDate, onBack }: PricingCalculatorProps) => {
  const subtotal = selectedClothes.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = Math.round(subtotal * 0.10); // 10% service fee
  const total = subtotal + serviceFee;
  const savings = Math.round(subtotal * 0.25); // 25% savings vs VI/Marina

  const totalItems = selectedClothes.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Schedule
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Summary & Pricing</h1>
          <p className="text-gray-600">Review your order details and complete your booking.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedClothes.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">₦{item.price.toLocaleString()} each</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">x{item.quantity}</div>
                        <div className="text-blue-600 font-semibold">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Details */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-blue-600 mb-1">Pickup Date</div>
                    <div className="text-lg">{pickupDate ? format(pickupDate, "EEEE, MMMM d, yyyy") : 'Not selected'}</div>
                    <div className="text-sm text-gray-600">Time slot to be confirmed</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-600 mb-1">Delivery Date</div>
                    <div className="text-lg">{deliveryDate ? format(deliveryDate, "EEEE, MMMM d, yyyy") : 'Not selected'}</div>
                    <div className="text-sm text-gray-600">Time slot to be confirmed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Features */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Free pickup & delivery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Professional washing & pressing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Quality inspection</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Eco-friendly detergents</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Insurance coverage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">24/7 customer support</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {/* Pricing Summary */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
                <CardDescription>{totalItems} items total</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Laundry Service</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (10%)</span>
                    <span>₦{serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Your Savings</span>
                    <span>-₦{savings.toLocaleString()}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₦{total.toLocaleString()}</span>
                </div>
                
                <div className="text-xs text-gray-600 text-center">
                  Still ₦{savings.toLocaleString()} less than local VI/Marina prices
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Complete Booking
                </Button>
                
                <div className="text-center space-y-2 pt-4">
                  <div className="text-sm font-semibold text-gray-900">Need Help?</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>+234 XXX XXX XXXX</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>support@saakwa.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
