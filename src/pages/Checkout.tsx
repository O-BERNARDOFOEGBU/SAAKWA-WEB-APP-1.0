import { useEffect, useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import ClothingSelector from "@/components/ClothingSelector";
import SchedulePicker from "@/components/SchedulePicker";
import PricingCalculator from "@/components/PricingCalculator";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState("home");
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [pickupDate, setPickupDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [pickupTimeSlot, setPickupTimeSlot] = useState(null);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user } = useAuth();

  const handleSelectPricing = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentStep("pricing");
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
          <AuthForm
            onSuccess={() => setCurrentStep("pricing")}
            onClose={() => setShowAuthModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Checkout;
