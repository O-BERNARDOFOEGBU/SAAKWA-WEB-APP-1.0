import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { submitRiderOnboarding } from "@/api/marketplaceApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RiderOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentLat, setCurrentLat] = useState("");
  const [currentLng, setCurrentLng] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const detectCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast({
        title: "Location unavailable",
        description: "Geolocation is not available in this browser.",
        variant: "destructive",
      });
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLat(String(position.coords.latitude));
        setCurrentLng(String(position.coords.longitude));
        setDetecting(false);
      },
      () => {
        toast({
          title: "Location permission denied",
          description: "Allow location access to onboard as rider.",
          variant: "destructive",
        });
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in to submit a rider onboarding request.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!name || !phone || !currentLat || !currentLng) {
      toast({
        title: "Incomplete profile",
        description: "Fill your name, phone, and location before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitRiderOnboarding({
        userId: user.id,
        name,
        phone,
        currentLat: Number(currentLat),
        currentLng: Number(currentLng),
      });

      toast({
        title: "Application submitted",
        description:
          "Your rider profile is pending admin approval. Assignments will start after approval.",
      });

      navigate("/");
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err?.message ?? "Could not submit rider onboarding.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Rider Onboarding</h1>
        <p className="mt-2 text-gray-600">
          Submit your rider profile with your current location. Assignment radius is capped at 5km.
        </p>

        <Card className="mt-6 max-w-2xl">
          <CardHeader>
            <CardTitle>Rider Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rider-name">Full Name</Label>
              <Input
                id="rider-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rider-phone">Phone</Label>
              <Input
                id="rider-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="rider-lat">Current Latitude</Label>
                <Input
                  id="rider-lat"
                  type="number"
                  value={currentLat}
                  onChange={(event) => setCurrentLat(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rider-lng">Current Longitude</Label>
                <Input
                  id="rider-lng"
                  type="number"
                  value={currentLng}
                  onChange={(event) => setCurrentLng(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={detectCurrentLocation} disabled={detecting}>
                {detecting ? "Detecting..." : "Use My Current Location"}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RiderOnboarding;
