import { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SchedulePickerProps {
  pickupDate: Date | null;
  setPickupDate: (date: Date | null) => void;
  deliveryDate: Date | null;
  setDeliveryDate: (date: Date | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const SchedulePicker = ({ 
  pickupDate, 
  setPickupDate, 
  deliveryDate, 
  setDeliveryDate, 
  onNext, 
  onBack 
}: SchedulePickerProps) => {
  const [pickupOpen, setPickupOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM'
  ];

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const minDeliveryDate = pickupDate ? new Date(pickupDate.getTime() + 2 * 24 * 60 * 60 * 1000) : tomorrow;

  // Function to check if a date is Thursday (4) or Saturday (6)
  const isThursdayOrSaturday = (date: Date) => {
    const day = date.getDay();
    return day === 4 || day === 6; // 4 = Thursday, 6 = Saturday
  };

  // Disable dates that are not Thursday or Saturday, or are before tomorrow
  const isPickupDateDisabled = (date: Date) => {
    return date < tomorrow || !isThursdayOrSaturday(date);
  };

  // Disable dates that are not Thursday or Saturday, or are before minimum delivery date
  const isDeliveryDateDisabled = (date: Date) => {
    return date < minDeliveryDate || !isThursdayOrSaturday(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clothes
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Pickup & Delivery</h1>
          <p className="text-gray-600">Choose your preferred pickup and delivery dates. We provide 48-72 hour service on Thursdays and Saturdays only.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pickup Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                Pickup Date
              </CardTitle>
              <CardDescription>
                When should we collect your clothes? (Thursdays & Saturdays only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pickupDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={(date) => {
                      setPickupDate(date);
                      setPickupOpen(false);
                    }}
                    disabled={isPickupDateDisabled}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant="outline"
                      className="justify-start text-sm"
                      size="sm"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-green-600" />
                Delivery Date
              </CardTitle>
              <CardDescription>
                When should we return your clean clothes? (Thursdays & Saturdays only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover open={deliveryOpen} onOpenChange={setDeliveryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                    disabled={!pickupDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={(date) => {
                      setDeliveryDate(date);
                      setDeliveryOpen(false);
                    }}
                    disabled={isDeliveryDateDisabled}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant="outline"
                      className="justify-start text-sm"
                      size="sm"
                      disabled={!deliveryDate}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold">Pickup Areas</div>
                  <div className="text-gray-600">VI, Marina, Heart of Lekki</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold">Service Days</div>
                  <div className="text-gray-600">Thursdays & Saturdays only</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold">Service Hours</div>
                  <div className="text-gray-600">9:00 AM - 7:00 PM</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={onNext}
            disabled={!pickupDate || !deliveryDate}
            className="px-8"
          >
            Continue to Pricing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePicker;
