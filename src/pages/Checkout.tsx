import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ClothingSelector from "@/components/ClothingSelector";
import SchedulePicker from "@/components/SchedulePicker";
import PricingCalculator from "@/components/PricingCalculator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState("home");
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [pickupDate, setPickupDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [pickupTimeSlot, setPickupTimeSlot] = useState(null);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const handleSelectPricing = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentStep("pricing");
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });

      setIsResetMode(false);
      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset Error",
        description:
          error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });

      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      setFullName("");
      setCurrentStep("pricing");
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Error",
        description:
          error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      setCurrentStep("pricing");
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Error",
        description:
          error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "schedule":
        return (
          <SchedulePicker
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
            pickupTimeSlot={pickupTimeSlot}
            setPickupTimeSlot={setPickupTimeSlot}
            deliveryTimeSlot={deliveryTimeSlot}
            setDeliveryTimeSlot={setDeliveryTimeSlot}
            onNext={() => {
              handleSelectPricing();
              if (typeof window !== "undefined") {
                localStorage.setItem("pickupDate", JSON.stringify(pickupDate));
                localStorage.setItem(
                  "deliveryDate",
                  JSON.stringify(deliveryDate)
                );
                localStorage.setItem(
                  "pickupTimeSlot",
                  JSON.stringify(pickupTimeSlot)
                );
                localStorage.setItem(
                  "deliveryTimeSlot",
                  JSON.stringify(deliveryTimeSlot)
                );
              }
            }}
            onBack={() => setCurrentStep("clothes")}
          />
        );
      case "pricing":
        return (
          <PricingCalculator
            selectedClothes={selectedClothes}
            pickupDate={pickupDate}
            deliveryDate={deliveryDate}
            pickupTimeSlot={pickupTimeSlot}
            deliveryTimeSlot={deliveryTimeSlot}
            onBack={() => setCurrentStep("schedule")}
          />
        );
      default:
        return (
          <ClothingSelector
            selectedClothes={selectedClothes}
            setSelectedClothes={setSelectedClothes}
            onNext={() => {
              setCurrentStep("schedule");
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "selectedClothes",
                  JSON.stringify(selectedClothes)
                );
              }
            }}
          />
        );
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const selectedClothes = localStorage.getItem("selectedClothes");
      setSelectedClothes(selectedClothes ? JSON.parse(selectedClothes) : []);

      const pickupDate = localStorage.getItem("pickupDate");
      setPickupDate(pickupDate ? new Date(JSON.parse(pickupDate)) : null);

      const deliveryDate = localStorage.getItem("deliveryDate");
      setDeliveryDate(deliveryDate ? new Date(JSON.parse(deliveryDate)) : null);

      const pickupTimeSlot = localStorage.getItem("pickupTimeSlot");
      setPickupTimeSlot(pickupTimeSlot ? JSON.parse(pickupTimeSlot) : null);

      const deliveryTimeSlot = localStorage.getItem("deliveryTimeSlot");
      setDeliveryTimeSlot(
        deliveryTimeSlot ? JSON.parse(deliveryTimeSlot) : null
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pickupDate = localStorage.getItem("pickupDate");
      const deliveryDate = localStorage.getItem("deliveryDate");
      const pickupTimeSlot = localStorage.getItem("pickupTimeSlot");
      const deliveryTimeSlot = localStorage.getItem("deliveryTimeSlot");

      if (pickupDate && deliveryDate && pickupTimeSlot && deliveryTimeSlot) {
        if (user) {
          setCurrentStep("pricing");
        } else {
          setCurrentStep("schedule");
        }
      }
    }
  }, [user]);

  return (
    <>
      {renderStep()}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isResetMode ? "Reset Password" : "Sign In or Create Account"}
            </DialogTitle>
            <DialogDescription>
              {isResetMode
                ? "Enter your email to receive password reset instructions"
                : "Sign in to your account or create a new one to book our services"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="auth-email">Email *</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {!isResetMode && (
              <>
                <div>
                  <Label htmlFor="auth-password">Password *</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="auth-name">
                    Full Name (for new accounts)
                  </Label>
                  <Input
                    id="auth-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              {isResetMode ? (
                <>
                  <Button
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Sending..." : "Send Reset Email"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsResetMode(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="flex-1"
                    variant="outline"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>

                  <Button
                    onClick={handleSignUp}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                </>
              )}
            </div>

            {!isResetMode && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              {isResetMode
                ? "You'll receive an email with instructions to reset your password"
                : "Existing customers can sign in, new customers can create an account"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Checkout;
