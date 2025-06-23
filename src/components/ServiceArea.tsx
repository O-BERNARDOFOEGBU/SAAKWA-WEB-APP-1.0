import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServiceAreaProps {
  onBack: () => void;
}

const ServiceArea = ({ onBack }: ServiceAreaProps) => {
  const serviceAreas = [
    {
      name: "Victoria Island (VI)",
      description:
        "All areas including Ahmadu Bello Way, Tiamiyu Savage, Adeola Odeku",
      coverage: "100%",
      timing: "9 AM - 7 PM",
    },
    {
      name: "Marina",
      description:
        "Lagos Island, Marina area, and surrounding business districts",
      coverage: "100%",
      timing: "9 AM - 7 PM",
    },
    {
      name: "Heart of Lekki",
      description:
        "Lekki Phase 1, Admiralty Way, and central Lekki areas, All the way to Osapa, Agungi, Chevron to Ikota",
      coverage: "100%",
      timing: "9 AM - 7 PM",
    },
  ];

  const openWhatsApp = () => {
    const message = `Hi! I have a complaint for Saakwa Laundry`;
    const phoneNumber = "2349160391653";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Areas
          </h1>
          <p className="text-gray-600">
            We provide premium laundry pickup and delivery services across these
            areas.
          </p>
        </div>

        {/* Map Placeholder */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Interactive Map Coming Soon
                </h3>
                <p className="text-gray-600">
                  View our complete service coverage area
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Areas Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {serviceAreas.map((area, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      {area.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {area.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Coverage</span>
                    <span className="font-semibold text-green-600">
                      {area.coverage}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Service Hours</span>
                    <span className="font-semibold">{area.timing}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                Service Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-semibold">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-semibold">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-semibold">10:00 AM - 4:00 PM</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Same-day pickup available for orders placed before 2:00 PM
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 text-green-600 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold">Customer Service</div>
                  <div className="text-gray-600">+234 916 039 1653 </div>
                  <div className="text-sm text-gray-500">Available 24/7</div>
                </div>
                <div>
                  <div className="font-semibold">Email Support</div>
                  <div className="text-gray-600">support@saakwa.com</div>
                  <div className="text-sm text-gray-500">
                    Response within 2 hours
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Emergency Line</div>
                  <div className="text-sm text-gray-500">For quick support</div>
                  <div className="text-sm text-gray-500">
                    Drop us a message on{" "}
                    <button
                      onClick={openWhatsApp}
                      className="inline-flex items-center text-blue-600 hover:underline hover:text-blue-700 transition"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </button>{" "}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-blue-600 text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Experience Saakwa?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of satisfied customers who trust us with their
              laundry. Premium service, great savings, and convenient pickup &
              delivery.
            </p>
            <Button
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={onBack}
            >
              Start Your Order
            </Button>
            <div className="mt-auto pt-12">
              <p className=" text-gray-300">
                Saakwa – Powered by Oparantho Ventures
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceArea;
