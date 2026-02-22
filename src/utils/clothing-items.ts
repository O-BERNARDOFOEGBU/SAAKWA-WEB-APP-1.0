export interface ClothingItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

export interface ClothingCategories {
  [category: string]: ClothingItem[];
}

export const clothingCategories: ClothingCategories = {
  "Traditional Wear": [
    {
      id: "native-colored",
      name: "Native (Colored)",
      price: 3200,
      image: "👘",
    },
    { id: "native-white", name: "Native (White)", price: 3700, image: "🤍" },
    {
      id: "complete-agbada",
      name: "Complete Agbada",
      price: 7700,
      image: "👳",
    },
    { id: "jalamia", name: "Jalamia", price: 2700, image: "🕌" },
    {
      id: "long-native-gown",
      name: "Long Native/Ankara Gown",
      price: 2700,
      image: "👗",
    },
    {
      id: "big-native-gown",
      name: "Big Native/Ankara Gown",
      price: 3200,
      image: "👗",
    },
    {
      id: "short-native-gown",
      name: "Short Native Gown",
      price: 2200,
      image: "👗",
    },
    {
      id: "cele-white-garment",
      name: "Cele White Garment (Gown with Cap)",
      price: 2700,
      image: "⚪",
    },
  ],
  "Formal Wear": [
    { id: "suit-white", name: "Suit (White)", price: 3700, image: "🤵" },
    { id: "suit-colored", name: "Suit (Colored)", price: 3200, image: "🤵" },
    {
      id: "long-sleeve-colored",
      name: "Long Sleeve Shirt (Colored)",
      price: 1200,
      image: "👔",
    },
    {
      id: "long-sleeve-white",
      name: "Long Sleeve Shirt (White)",
      price: 1800,
      image: "👔",
    },
    {
      id: "short-sleeve-colored",
      name: "Short Sleeve Shirt (Colored)",
      price: 1100,
      image: "👕",
    },
    {
      id: "short-sleeve-white",
      name: "Short Sleeve Shirt (White)",
      price: 1700,
      image: "👕",
    },
    {
      id: "corporate-jacket",
      name: "Corporate Jacket",
      price: 2200,
      image: "🧥",
    },
    { id: "plain-trousers", name: "Plain Trousers", price: 1800, image: "👖" },
  ],
  "Casual Wear": [
    {
      id: "polo-colored",
      name: "Polo/Round Neck (Colored)",
      price: 1000,
      image: "👕",
    },
    {
      id: "polo-white",
      name: "Polo/Round Neck (White)",
      price: 1200,
      image: "👕",
    },
    { id: "jeans", name: "Jeans", price: 1900, image: "👖" },
    { id: "jean-shorts", name: "Jean Shorts", price: 1700, image: "🩳" },
    { id: "joggers", name: "Joggers", price: 1700, image: "🩱" },
    {
      id: "shorts-knickers",
      name: "Shorts / Knickers",
      price: 1100,
      image: "🩳",
    },
    // { id: "pants", name: "Pants", price: 1700, image: "👖" }, --incase pant trousers
  ],
  "Women's Wear": [
    { id: "wedding-gown", name: "Wedding Gown", price: 25000, image: "👰" },
    {
      id: "short-aso-ebi",
      name: "Short Aso-Ebi Gown (with Design)",
      price: 10700,
      image: "💃",
    },
    {
      id: "long-aso-ebi",
      name: "Long Aso-Ebi Gown",
      price: 12700,
      image: "💃",
    },
    { id: "short-gown", name: "Short Gown", price: 1700, image: "👗" },
    { id: "long-gown", name: "Long Gown", price: 2200, image: "👗" },
    { id: "blouse", name: "Blouse", price: 1000, image: "👚" },
    { id: "crop-tops", name: "Crop Tops", price: 800, image: "👕" },
    { id: "bra", name: "Bra", price: 1700, image: "👙" },
    { id: "lingerie", name: "Lingerie", price: 2200, image: "👙" },
    { id: "up-and-down", name: "Up & Down (Any)", price: 2900, image: "👗" },
  ],
  "Tops & Outerwear": [
    {
      id: "sweat-tops",
      name: "Sweat Tops / Sweaters",
      price: 2700,
      image: "🧥",
    },
    { id: "hoodies", name: "Hoodies", price: 3200, image: "👕" },
    { id: "singlet", name: "Singlet", price: 700, image: "👕" },
  ],
  Underwear: [
    { id: "boxers", name: "Boxers", price: 800, image: "🩲" },
    { id: "panties", name: "Panties", price: 1700, image: "🩲" },
  ],
  Accessories: [
    { id: "face-cap", name: "Face Cap", price: 1700, image: "🧢" },
    { id: "hat", name: "Hat", price: 1000, image: "👒" },
    { id: "sneakers", name: "Sneakers", price: 3200, image: "👟" },
  ],
  "Home Textiles": [
    {
      id: "regular-duvet-colored",
      name: "Regular Duvet (Colored)",
      price: 4700,
      image: "🛏️",
    },
    {
      id: "regular-duvet-white",
      name: "Regular Duvet (White)",
      price: 4700,
      image: "🛏️",
    },
    {
      id: "big-duvet-colored",
      name: "Big Duvet (Colored)",
      price: 5700,
      image: "🛏️",
    },
    {
      id: "big-duvet-white",
      name: "Big Duvet (White)",
      price: 6700,
      image: "🛏️",
    },
    { id: "duvet-cover", name: "Duvet Cover", price: 2700, image: "🛏️" },
    {
      id: "bed-sheet-colored",
      name: "Bed Sheet (Colored)",
      price: 2700,
      image: "🛏️",
    },
    {
      id: "bed-sheet-white",
      name: "Bed Sheet (White)",
      price: 3200,
      image: "🛏️",
    },
    { id: "pillow-case", name: "Pillow Case", price: 500, image: "🛏️" },
    { id: "big-curtain", name: "Big Curtain", price: 5700, image: "🪟" },
    { id: "towel-colored", name: "Towel (Colored)", price: 2200, image: "🏖️" },
    {
      id: "towel-white-big",
      name: "Towel (White, Big)",
      price: 2700,
      image: "🏖️",
    },
    { id: "bathrobe", name: "Bathrobe", price: 5700, image: "🥽" },
  ],
  "Special Services": [
    { id: "student-uniform", name: "Student Uniform", price: 900, image: "🎓" },
    { id: "ironing-only", name: "Ironing Only", price: 900, image: "🔥" },
    {
      id: "ironing-native",
      name: "Ironing Only (Native)",
      price: 1700,
      image: "🔥",
    },
    {
      id: "express-delivery",
      name: "Express Delivery (Same Day)",
      price: 10000,
      image: "🚀",
    },
  ],
};
