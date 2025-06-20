
import { useState } from 'react';
import { Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const clothingCategories = {
  'Traditional Wear': [
    { id: 'native-colored', name: 'Native (Colored)', price: 3200, image: '👘' },
    { id: 'native-white', name: 'Native (White)', price: 3700, image: '🤍' },
    { id: 'complete-agbada', name: 'Complete Agbada', price: 7700, image: '👳' },
    { id: 'jalamia', name: 'Jalamia', price: 2700, image: '🕌' },
    { id: 'long-native-gown', name: 'Long Native/Ankara Gown', price: 2700, image: '👗' },
    { id: 'big-native-gown', name: 'Big Native/Ankara Gown', price: 3200, image: '👗' },
    { id: 'short-native-gown', name: 'Short Native Gown', price: 2200, image: '👗' },
    { id: 'cele-white-garment', name: 'Cele White Garment (Gown with Cap)', price: 2700, image: '⚪' },
  ],
  'Formal Wear': [
    { id: 'suit-white', name: 'Suit (White)', price: 3700, image: '🤵' },
    { id: 'suit-colored', name: 'Suit (Colored)', price: 3200, image: '🤵' },
    { id: 'long-sleeve-colored', name: 'Long Sleeve Shirt (Colored)', price: 1200, image: '👔' },
    { id: 'long-sleeve-white', name: 'Long Sleeve Shirt (White)', price: 1800, image: '👔' },
    { id: 'short-sleeve-colored', name: 'Short Sleeve Shirt (Colored)', price: 1100, image: '👕' },
    { id: 'short-sleeve-white', name: 'Short Sleeve Shirt (White)', price: 1700, image: '👕' },
    { id: 'corporate-jacket', name: 'Corporate Jacket', price: 2200, image: '🧥' },
    { id: 'plain-trousers', name: 'Plain Trousers', price: 1800, image: '👖' },
  ],
  'Casual Wear': [
    { id: 'polo-colored', name: 'Polo/Round Neck (Colored)', price: 1000, image: '👕' },
    { id: 'polo-white', name: 'Polo/Round Neck (White)', price: 1200, image: '👕' },
    { id: 'jeans', name: 'Jeans', price: 1900, image: '👖' },
    { id: 'jean-shorts', name: 'Jean Shorts', price: 1700, image: '🩳' },
    { id: 'joggers', name: 'Joggers', price: 1700, image: '🩱' },
    { id: 'shorts-knickers', name: 'Shorts / Knickers', price: 1100, image: '🩳' },
    { id: 'pants', name: 'Pants', price: 1700, image: '👖' },
  ],
  'Women\'s Wear': [
    { id: 'wedding-gown', name: 'Wedding Gown', price: 25000, image: '👰' },
    { id: 'short-aso-ebi', name: 'Short Aso-Ebi Gown (with Design)', price: 10700, image: '💃' },
    { id: 'long-aso-ebi', name: 'Long Aso-Ebi Gown', price: 12700, image: '💃' },
    { id: 'short-gown', name: 'Short Gown', price: 1700, image: '👗' },
    { id: 'long-gown', name: 'Long Gown', price: 2200, image: '👗' },
    { id: 'blouse', name: 'Blouse', price: 1000, image: '👚' },
    { id: 'crop-tops', name: 'Crop Tops', price: 800, image: '👕' },
    { id: 'bra', name: 'Bra', price: 1700, image: '👙' },
    { id: 'lingerie', name: 'Lingerie', price: 2200, image: '👙' },
    { id: 'up-and-down', name: 'Up & Down (Any)', price: 2900, image: '👗' },
  ],
  'Tops & Outerwear': [
    { id: 'sweat-tops', name: 'Sweat Tops / Sweaters', price: 2700, image: '🧥' },
    { id: 'hoodies', name: 'Hoodies', price: 3200, image: '👕' },
    { id: 'singlet', name: 'Singlet', price: 700, image: '👕' },
  ],
  'Underwear': [
    { id: 'boxers', name: 'Boxers', price: 800, image: '🩲' },
  ],
  'Accessories': [
    { id: 'face-cap', name: 'Face Cap', price: 1700, image: '🧢' },
    { id: 'hat', name: 'Hat', price: 1000, image: '👒' },
    { id: 'sneakers', name: 'Sneakers', price: 3200, image: '👟' },
  ],
  'Home Textiles': [
    { id: 'regular-duvet-colored', name: 'Regular Duvet (Colored)', price: 4700, image: '🛏️' },
    { id: 'regular-duvet-white', name: 'Regular Duvet (White)', price: 4700, image: '🛏️' },
    { id: 'big-duvet-colored', name: 'Big Duvet (Colored)', price: 5700, image: '🛏️' },
    { id: 'big-duvet-white', name: 'Big Duvet (White)', price: 6700, image: '🛏️' },
    { id: 'duvet-cover', name: 'Duvet Cover', price: 2700, image: '🛏️' },
    { id: 'bed-sheet-colored', name: 'Bed Sheet (Colored)', price: 2700, image: '🛏️' },
    { id: 'bed-sheet-white', name: 'Bed Sheet (White)', price: 3200, image: '🛏️' },
    { id: 'pillow-case', name: 'Pillow Case', price: 500, image: '🛏️' },
    { id: 'big-curtain', name: 'Big Curtain', price: 5700, image: '🪟' },
    { id: 'towel-colored', name: 'Towel (Colored)', price: 2200, image: '🏖️' },
    { id: 'towel-white-big', name: 'Towel (White, Big)', price: 2700, image: '🏖️' },
    { id: 'bathrobe', name: 'Bathrobe', price: 5700, image: '🥽' },
  ],
  'Special Services': [
    { id: 'student-uniform', name: 'Student Uniform', price: 900, image: '🎓' },
    { id: 'ironing-only', name: 'Ironing Only', price: 900, image: '🔥' },
    { id: 'ironing-native', name: 'Ironing Only (Native)', price: 1700, image: '🔥' },
    { id: 'express-delivery', name: 'Express Delivery (Same Day)', price: 7700, image: '🚀' },
  ],
};

interface ClothingSelectorProps {
  selectedClothes: any[];
  setSelectedClothes: (clothes: any[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ClothingSelector = ({ selectedClothes, setSelectedClothes, onNext, onBack }: ClothingSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  const allClothingItems = Object.values(clothingCategories).flat();
  const displayItems = selectedCategory === 'All Categories' 
    ? allClothingItems 
    : clothingCategories[selectedCategory as keyof typeof clothingCategories] || [];

  const updateQuantity = (itemId: string, change: number) => {
    const existingItem = selectedClothes.find(item => item.id === itemId);
    const clothingItem = allClothingItems.find(item => item.id === itemId);
    
    if (existingItem) {
      const newQuantity = Math.max(0, existingItem.quantity + change);
      if (newQuantity === 0) {
        setSelectedClothes(selectedClothes.filter(item => item.id !== itemId));
      } else {
        setSelectedClothes(
          selectedClothes.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } else if (change > 0 && clothingItem) {
      setSelectedClothes([...selectedClothes, { ...clothingItem, quantity: 1 }]);
    }
  };

  const getQuantity = (itemId: string) => {
    const item = selectedClothes.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const totalItems = selectedClothes.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = selectedClothes.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Clothes</h1>
          <p className="text-gray-600">Choose the items you want to launder. Prices are 25% less than VI/Marina rates!</p>
          
          <div className="mt-4 max-w-xs">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="text-center pb-2">
                      <div className="text-4xl mb-2">{item.image}</div>
                      <CardTitle className="text-sm leading-tight">{item.name}</CardTitle>
                      <CardDescription className="text-blue-600 font-semibold">
                        ₦{item.price.toLocaleString()}
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
                        <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
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
                {selectedClothes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClothes.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm">{item.name} x{item.quantity}</span>
                        <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <hr className="my-4" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total ({totalItems} items)</span>
                      <span className="text-blue-600">₦{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-green-600 text-center mt-2">
                      You save ₦{Math.round(totalCost * 0.25).toLocaleString()} vs VI/Marina prices!
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-6" 
                  onClick={onNext}
                  disabled={selectedClothes.length === 0}
                >
                  Continue to Schedule
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
