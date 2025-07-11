import { useState } from "react";
import { Plus, Minus, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clothingCategories, ClothingItem } from "@/utils/clothing-items";
import { useNavigate } from "react-router-dom";

interface ClothingSelectorProps {
  selectedClothes: ClothingItem[];
  setSelectedClothes: (clothes: ClothingItem[]) => void;
  onNext: () => void;
}

const ClothingSelector = ({
  selectedClothes,
  setSelectedClothes,
  onNext,
}: ClothingSelectorProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const allClothingItems = Object.values(clothingCategories).flat();
  const displayItems =
    selectedCategory === "All Categories"
      ? allClothingItems
      : clothingCategories[
          selectedCategory as keyof typeof clothingCategories
        ] || [];

  const updateQuantity = (itemId: string, change: number) => {
    const existingItem = selectedClothes?.find((item) => item.id === itemId);
    const clothingItem = allClothingItems?.find((item) => item.id === itemId);

    if (existingItem) {
      const newQuantity = Math.max(0, existingItem.quantity + change);
      if (newQuantity === 0) {
        setSelectedClothes(
          selectedClothes?.filter((item) => item.id !== itemId)
        );
      } else {
        setSelectedClothes(
          selectedClothes?.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } else if (change > 0 && clothingItem) {
      setSelectedClothes([
        ...selectedClothes,
        { ...clothingItem, quantity: 1 },
      ]);
    }
  };

  const getQuantity = (itemId: string) => {
    const item = selectedClothes?.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const totalItems = selectedClothes?.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalCost = selectedClothes?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Clothes
          </h1>
          <p className="text-gray-600">
            Choose the items you want to launder. Prices are 25% less than usual
            prices in VI/Marina/Heart of Lekki and environs
          </p>

          <div className="mt-4 max-w-xs">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                {Object.keys(clothingCategories).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {displayItems.map((item) => {
                const quantity = getQuantity(item.id);
                return (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="text-center pb-2">
                      <div className="text-4xl mb-2">{item.image}</div>
                      <CardTitle className="text-sm leading-tight">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-blue-600 font-semibold">
                        ₦{item?.price?.toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={quantity === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold text-lg w-8 text-center">
                          {quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedClothes?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No items selected
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedClothes?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₦{(item?.price * item?.quantity)?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <hr className="my-4" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total ({totalItems} items)</span>
                      <span className="text-blue-600">
                        ₦{totalCost?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 text-center mt-2">
                      You save ₦{Math.round(totalCost * 0.25)?.toLocaleString()}{" "}
                      vs your local Laundry house prices!
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-6"
                  onClick={onNext}
                  disabled={selectedClothes?.length === 0}
                >
                  Continue to Schedule - ₦{totalCost?.toLocaleString()}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingSelector;
