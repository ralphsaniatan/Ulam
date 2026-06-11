import { Recipe } from "./types";

export const defaultRecipes: Recipe[] = [
  {
    id: "chicken-tinola",
    name: "Chicken Tinola",
    category: "Family Dinner",
    ingredients: [
      { id: "chicken-tinola-1", item: "Local Chicken Cuts", quantity: "1kg", aisle: "Meat & Frozen" },
      { id: "chicken-tinola-2", item: "Sayote", quantity: "2 pcs", aisle: "Fresh Produce" },
      { id: "chicken-tinola-3", item: "Ginger", quantity: "1 thumb", aisle: "Fresh Produce" },
      { id: "chicken-tinola-4", item: "Spinach", quantity: "1 bunch", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Mashed Sayote in Chicken Broth",
      baon: "Chicken Tinola (Dry)",
    }
  },
  {
    id: "pork-sinigang",
    name: "Pork Sinigang (Mild)",
    category: "Family Dinner",
    ingredients: [
      { id: "pork-sinigang-1", item: "Pork Ribs", quantity: "1kg", aisle: "Meat & Frozen" },
      { id: "pork-sinigang-2", item: "Gabi (Taro)", quantity: "3 pcs", aisle: "Fresh Produce" },
      { id: "pork-sinigang-3", item: "Radish", quantity: "1 pc", aisle: "Fresh Produce" },
      { id: "pork-sinigang-4", item: "Kangkong", quantity: "1 bunch", aisle: "Fresh Produce" },
      { id: "pork-sinigang-5", item: "Sinigang Mix", quantity: "1 pack", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: {
      toddler: "Soft-boiled Gabi & Squash Mashed",
      baon: "Sinigang Meat & Rice",
    }
  },
  {
    id: "chicken-adobo",
    name: "Chicken Adobo",
    category: "Family Dinner",
    ingredients: [
      { id: "chicken-adobo-1", item: "Chicken Thighs", quantity: "1kg", aisle: "Meat & Frozen" },
      { id: "chicken-adobo-2", item: "Garlic", quantity: "1 head", aisle: "Fresh Produce" },
      { id: "chicken-adobo-3", item: "Toyo", quantity: "1/2 cup", aisle: "Pantry Staples & Asian Aisle" },
      { id: "chicken-adobo-4", item: "Suka", quantity: "1/4 cup", aisle: "Pantry Staples & Asian Aisle" },
      { id: "chicken-adobo-5", item: "Peppercorn", quantity: "1 tbsp", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: {
      toddler: "Shredded Chicken without sauce",
      baon: "Crispy Adobo Flakes",
    }
  },
  {
    id: "ginisang-sayote",
    name: "Ginisang Sayote",
    category: "Family Dinner",
    ingredients: [
      { id: "ginisang-sayote-1", item: "Lean Minced Beef", quantity: "500g", aisle: "Meat & Frozen" },
      { id: "ginisang-sayote-2", item: "Sayote", quantity: "3 pcs", aisle: "Fresh Produce" },
      { id: "ginisang-sayote-3", item: "Onions", quantity: "1 pc", aisle: "Fresh Produce" },
      { id: "ginisang-sayote-4", item: "Garlic", quantity: "1 head", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Mashed Sayote",
      baon: "Sayote & Beef over Rice",
    }
  },
  {
    id: "beef-nilaga",
    name: "Beef Nilaga",
    category: "Family Dinner",
    ingredients: [
      { id: "beef-nilaga-1", item: "Beef (Cubed)", quantity: "1kg", aisle: "Meat & Frozen" },
      { id: "beef-nilaga-2", item: "Potatoes", quantity: "3 pcs", aisle: "Fresh Produce" },
      { id: "beef-nilaga-3", item: "Cabbage", quantity: "1/2 head", aisle: "Fresh Produce" },
      { id: "beef-nilaga-4", item: "Corn Ears", quantity: "2 pcs", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Mashed Potatoes and Soft Beef",
      baon: "Beef Nilaga (Less Soup)",
    }
  },
  {
    id: "chicken-afritada",
    name: "Chicken Afritada",
    category: "Family Dinner",
    ingredients: [
      { id: "chicken-afritada-1", item: "Chicken pieces", quantity: "1kg", aisle: "Meat & Frozen" },
      { id: "chicken-afritada-2", item: "Tomato Sauce", quantity: "1 pouch", aisle: "Pantry Staples & Asian Aisle" },
      { id: "chicken-afritada-3", item: "Carrots", quantity: "2 pcs", aisle: "Fresh Produce" },
      { id: "chicken-afritada-4", item: "Potatoes", quantity: "2 pcs", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Mashed Potatoes in Tomato Sauce",
      baon: "Afritada without bones",
    }
  },
  {
    id: "burger-steak",
    name: "Burger Steak",
    category: "Family Dinner",
    ingredients: [
      { id: "burger-steak-1", item: "Minced Beef", quantity: "500g", aisle: "Meat & Frozen" },
      { id: "burger-steak-2", item: "Cream of Mushroom Can", quantity: "1 can", aisle: "Pantry Staples & Asian Aisle" },
      { id: "burger-steak-3", item: "Garlic", quantity: "1 head", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Mini Patty (No Gravy)",
      baon: "Burger Steak over Rice",
    }
  },
  {
    id: "ginisang-monggo",
    name: "Ginisang Monggo",
    category: "Family Dinner",
    ingredients: [
      { id: "ginisang-monggo-1", item: "Mung Beans", quantity: "250g", aisle: "Pantry Staples & Asian Aisle" },
      { id: "ginisang-monggo-2", item: "Spinach Leaves", quantity: "1 bunch", aisle: "Fresh Produce" },
      { id: "ginisang-monggo-3", item: "Garlic", quantity: "1 head", aisle: "Fresh Produce" },
      { id: "ginisang-monggo-4", item: "Chicharon", quantity: "1 pack", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: {
      toddler: "Plain Mashed Monggo",
      baon: "Monggo over Rice",
    }
  },
  {
    id: "fish-sarciado",
    name: "Fish Sarciado",
    category: "Family Dinner",
    ingredients: [
      { id: "fish-sarciado-1", item: "Tilapia", quantity: "2 pcs", aisle: "Meat & Frozen" },
      { id: "fish-sarciado-2", item: "Eggs", quantity: "2 pcs", aisle: "Pantry Staples & Asian Aisle" },
      { id: "fish-sarciado-3", item: "Tomatoes", quantity: "4 pcs", aisle: "Fresh Produce" },
      { id: "fish-sarciado-4", item: "Onions", quantity: "1 pc", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Flaked Tilapia (Careful for bones)",
      baon: "Sarciado & Rice",
    }
  },
  {
    id: "tortang-talong",
    name: "Tortang Talong",
    category: "Family Dinner",
    ingredients: [
      { id: "tortang-talong-1", item: "Local Eggplants", quantity: "3 pcs", aisle: "Fresh Produce" },
      { id: "tortang-talong-2", item: "Eggs", quantity: "3 pcs", aisle: "Pantry Staples & Asian Aisle" },
      { id: "tortang-talong-3", item: "Cooking Oil", quantity: "1 bottle", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: {
      toddler: "Eggplant Hash",
      baon: "Tortang Talong Bites",
    }
  },
  {
    id: "chicken-pastel",
    name: "Chicken Pastel",
    category: "Family Dinner",
    ingredients: [
      { id: "chicken-pastel-1", item: "Chicken Cubes", quantity: "500g", aisle: "Meat & Frozen" },
      { id: "chicken-pastel-2", item: "Fresh Cream", quantity: "1 tetra", aisle: "Fresh Produce" },
      { id: "chicken-pastel-3", item: "Hotdogs", quantity: "4 pcs", aisle: "Meat & Frozen" },
      { id: "chicken-pastel-4", item: "Carrots", quantity: "2 pcs", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Soft Carrots in Cream",
      baon: "Chicken Pastel over Rice",
    }
  },
  {
    id: "ginisang-ampalaya",
    name: "Ginisang Ampalaya",
    category: "Family Dinner",
    ingredients: [
      { id: "ginisang-ampalaya-1", item: "Bitter Melon", quantity: "2 pcs", aisle: "Fresh Produce" },
      { id: "ginisang-ampalaya-2", item: "Beaten Eggs", quantity: "2 pcs", aisle: "Pantry Staples & Asian Aisle" },
      { id: "ginisang-ampalaya-3", item: "Garlic", quantity: "1 head", aisle: "Fresh Produce" },
      { id: "ginisang-ampalaya-4", item: "Onions", quantity: "1 pc", aisle: "Fresh Produce" },
    ],
    pivots: {
      toddler: "Scrambled Eggs (No Ampalaya)",
      baon: "Ampalaya & Egg",
    }
  },
  
  // School Baon Track
  {
    id: "adobo-flakes",
    name: "Crispy Adobo Flakes",
    category: "School Baon",
    ingredients: [
      { id: "adobo-flakes-1", item: "Leftover Adobo Meat", quantity: "1 cup", aisle: "Meat & Frozen" },
      { id: "adobo-flakes-2", item: "Garlic Rice", quantity: "1 serving", aisle: "Pantry Staples & Asian Aisle" },
      { id: "adobo-flakes-3", item: "Oil", quantity: "2 tbsp", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Soft Adobo Flakes", baon: "Crispy Adobo Flakes" }
  },
  {
    id: "chicken-longganisa",
    name: "Skinless Longganisa",
    category: "School Baon",
    ingredients: [
      { id: "chicken-longganisa-1", item: "Ground Chicken", quantity: "500g", aisle: "Meat & Frozen" },
      { id: "chicken-longganisa-2", item: "Brown Sugar", quantity: "3 tbsp", aisle: "Pantry Staples & Asian Aisle" },
      { id: "chicken-longganisa-3", item: "Garlic Powder", quantity: "1 tbsp", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Mini Longganisa Bites", baon: "Skinless Longganisa & Rice" }
  },
  {
    id: "pork-lumpia",
    name: "Mini Pork Lumpia",
    category: "School Baon",
    ingredients: [
      { id: "pork-lumpia-1", item: "Ground Pork", quantity: "500g", aisle: "Meat & Frozen" },
      { id: "pork-lumpia-2", item: "Spring Onions", quantity: "1 bunch", aisle: "Fresh Produce" },
      { id: "pork-lumpia-3", item: "Lumpia Wrapper Pack", quantity: "1 pack", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Deconstructed Lumpia Filling", baon: "Mini Pork Lumpia" }
  },
  {
    id: "tortang-giniling",
    name: "Tortang Giniling",
    category: "School Baon",
    ingredients: [
      { id: "tortang-giniling-1", item: "Minced Beef", quantity: "500g", aisle: "Meat & Frozen" },
      { id: "tortang-giniling-2", item: "Beaten Eggs", quantity: "4 pcs", aisle: "Pantry Staples & Asian Aisle" },
      { id: "tortang-giniling-3", item: "Finely Diced Potatoes", quantity: "2 pcs", aisle: "Fresh Produce" },
    ],
    pivots: { toddler: "Soft Giniling & Egg", baon: "Tortang Giniling" }
  },
  {
    id: "pinoy-spaghetti",
    name: "Sweet Pinoy Spaghetti",
    category: "School Baon",
    ingredients: [
      { id: "pinoy-spaghetti-1", item: "Hotdogs", quantity: "5 pcs", aisle: "Meat & Frozen" },
      { id: "pinoy-spaghetti-2", item: "Filipino Style Spaghetti Sauce", quantity: "1 pouch", aisle: "Pantry Staples & Asian Aisle" },
      { id: "pinoy-spaghetti-3", item: "Eden Cheese", quantity: "1 block", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Cut Spaghetti Noodles", baon: "Sweet Pinoy Spaghetti" }
  },
  {
    id: "bangus-sisig",
    name: "Bangus Sisig (Mild)",
    category: "School Baon",
    ingredients: [
      { id: "bangus-sisig-1", item: "Frozen Bangus", quantity: "1 pack", aisle: "Meat & Frozen" },
      { id: "bangus-sisig-2", item: "Calamansi", quantity: "5 pcs", aisle: "Fresh Produce" },
      { id: "bangus-sisig-3", item: "Mayonnaise", quantity: "3 tbsp", aisle: "Pantry Staples & Asian Aisle" },
      { id: "bangus-sisig-4", item: "Onion", quantity: "1 pc", aisle: "Fresh Produce" },
    ],
    pivots: { toddler: "Flaked Bangus (No Mayo)", baon: "Bangus Sisig (Mild)" }
  },
  
  // Snack Track
  {
    id: "macaroni-sopas",
    name: "Creamy Macaroni Sopas",
    category: "Snack Track",
    ingredients: [
      { id: "macaroni-sopas-1", item: "Elbow Macaroni", quantity: "250g", aisle: "Pantry Staples & Asian Aisle" },
      { id: "macaroni-sopas-2", item: "Evaporated Milk", quantity: "1 can", aisle: "Pantry Staples & Asian Aisle" },
      { id: "macaroni-sopas-3", item: "Cabbage", quantity: "1/4 head", aisle: "Fresh Produce" },
      { id: "macaroni-sopas-4", item: "Hotdogs", quantity: "4 pcs", aisle: "Meat & Frozen" },
    ],
    pivots: { toddler: "Soft Macaroni & Broth", baon: "Creamy Macaroni Sopas" }
  },
  {
    id: "pancit-canton",
    name: "Pancit Canton",
    category: "Snack Track",
    ingredients: [
      { id: "pancit-canton-1", item: "Flour Noodles", quantity: "1 pack", aisle: "Pantry Staples & Asian Aisle" },
      { id: "pancit-canton-2", item: "Shredded Carrots", quantity: "1 pc", aisle: "Fresh Produce" },
      { id: "pancit-canton-3", item: "Cabbage", quantity: "1/4 head", aisle: "Fresh Produce" },
      { id: "pancit-canton-4", item: "Soy Sauce", quantity: "2 tbsp", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Soft Noodles & Veggies", baon: "Pancit Canton" }
  },
  {
    id: "champorado",
    name: "Champorado",
    category: "Snack Track",
    ingredients: [
      { id: "champorado-1", item: "Jasmine Rice", quantity: "1 cup", aisle: "Pantry Staples & Asian Aisle" },
      { id: "champorado-2", item: "Cocoa Powder", quantity: "1/4 cup", aisle: "Pantry Staples & Asian Aisle" },
      { id: "champorado-3", item: "Evaporated Milk", quantity: "1 can", aisle: "Pantry Staples & Asian Aisle" },
      { id: "champorado-4", item: "Sugar", quantity: "1/4 cup", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Less Sugar Champorado", baon: "Champorado" }
  },
  {
    id: "cheese-pimiento",
    name: "Pandesal Pimiento",
    category: "Snack Track",
    ingredients: [
      { id: "cheese-pimiento-1", item: "Fresh Bakery Pandesal", quantity: "1 bag", aisle: "Pantry Staples & Asian Aisle" },
      { id: "cheese-pimiento-2", item: "Eden Cheese", quantity: "1 block", aisle: "Pantry Staples & Asian Aisle" },
      { id: "cheese-pimiento-3", item: "Mayo", quantity: "1/2 cup", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Plain Pandesal with Cheese", baon: "Pandesal Pimiento" }
  },
  {
    id: "airfried-turon",
    name: "Baked Turon",
    category: "Snack Track",
    ingredients: [
      { id: "airfried-turon-1", item: "Local Bananas", quantity: "6 pcs", aisle: "Fresh Produce" },
      { id: "airfried-turon-2", item: "Lumpia Wrapper", quantity: "1 pack", aisle: "Pantry Staples & Asian Aisle" },
      { id: "airfried-turon-3", item: "Brown Sugar", quantity: "1/2 cup", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Mashed Banana", baon: "Baked Turon" }
  },
  {
    id: "fruit-salad",
    name: "Pinoy Fruit Salad",
    category: "Snack Track",
    ingredients: [
      { id: "fruit-salad-1", item: "Fruit Cocktail", quantity: "1 large can", aisle: "Pantry Staples & Asian Aisle" },
      { id: "fruit-salad-2", item: "Condensed Milk", quantity: "1 can", aisle: "Pantry Staples & Asian Aisle" },
      { id: "fruit-salad-3", item: "All-Purpose Cream", quantity: "2 cans", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Fruit Pieces (No Syrup)", baon: "Pinoy Fruit Salad" }
  },
  {
    id: "steamed-puto",
    name: "Steamed Puto",
    category: "Snack Track",
    ingredients: [
      { id: "steamed-puto-1", item: "All-Purpose Flour", quantity: "2 cups", aisle: "Pantry Staples & Asian Aisle" },
      { id: "steamed-puto-2", item: "Baking Powder", quantity: "1 tbsp", aisle: "Pantry Staples & Asian Aisle" },
      { id: "steamed-puto-3", item: "Eden Cheese", quantity: "1 block", aisle: "Pantry Staples & Asian Aisle" },
    ],
    pivots: { toddler: "Steamed Puto Bites", baon: "Steamed Puto" }
  }
];
