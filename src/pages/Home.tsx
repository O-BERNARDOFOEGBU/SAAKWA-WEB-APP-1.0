import { useState } from "react";
import { MapPin, Star, Users, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const Home = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 py- sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">Saakwa</span> Laundry
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Premium laundry service from Osapa to VI, Marina & Heart of Lekki.
              <span className="text-blue-600 font-semibold"> Save 25% </span>
              with convenient pickup & delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-md transition-colors"
                to={"/checkout"}
              >
                Book Laundry Service
              </Link>
              <Link
                to={"/service-area"}
                className="border-blue-600 border text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg rounded-md transition-colors"
              >
                Check Service Area
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Saakwa?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Professional laundry service with attention to detail. Your
                  clothes are treated with care at our Laundry Houses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Convenient Pickup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Door-to-door service from VI, Marina, and Heart of Lekki.
                  Schedule pickup and delivery at your convenience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">25% Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Get premium laundry service at 25% less than your local
                  Laundry House prices, plus the convenience of delivery.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Select Clothes</h3>
              <p className="text-gray-600">
                Choose your clothing items and get instant pricing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Schedule Pickup</h3>
              <p className="text-gray-600">
                Pick convenient pickup and delivery dates
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">We Collect</h3>
              <p className="text-gray-600">
                Our rider picks up your clothes on schedule
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-lg mb-2">Fresh Delivery</h3>
              <p className="text-gray-600">
                Clean, fresh clothes delivered to your door
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Clock className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Quick Turnaround</h3>
              <p className="text-gray-600">48-72 hour service guaranteed</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Insured Service</h3>
              <p className="text-gray-600">
                Your clothes are protected during transport
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Trusted Partner</h3>
              <p className="text-gray-600">
                Working with established Laundry Houses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Premium Laundry Service?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of satisfied customers in VI, Marina & Heart of Lekki
          </p>
          <Link
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-md transition-colors"
            to={"/checkout"}
          >
            Start Your Order
          </Link>
          <div className="mt-auto pt-12">
            <p className=" text-gray-300">
              Saakwa – Powered by Oparantho Ventures
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
