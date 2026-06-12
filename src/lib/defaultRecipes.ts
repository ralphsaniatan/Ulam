import { PantryIngredientItem, CustomRecipeItem } from "./types";

export const defaultPantryItems: PantryIngredientItem[] = [
  // Proteins
  { id: "chicken-cuts", name: "Chicken Cuts", category: "Proteins", status: "OUT" },
  { id: "pork-ribs", name: "Pork Ribs", category: "Proteins", status: "OUT" },
  { id: "beef-cubes", name: "Beef Cubes", category: "Proteins", status: "OUT" },
  { id: "minced-beef", name: "Minced Beef", category: "Proteins", status: "OUT" },
  { id: "tilapia", name: "Tilapia Fish", category: "Proteins", status: "OUT" },
  { id: "hotdogs", name: "Hotdogs", category: "Proteins", status: "OUT" },
  { id: "eggs", name: "Eggs", category: "Proteins", status: "OUT" },

  // Produce
  { id: "sayote", name: "Sayote", category: "Produce", status: "OUT" },
  { id: "ginger", name: "Ginger", category: "Produce", status: "OUT" },
  { id: "spinach", name: "Spinach", category: "Produce", status: "OUT" },
  { id: "gabi", name: "Gabi (Taro)", category: "Produce", status: "OUT" },
  { id: "radish", name: "Radish", category: "Produce", status: "OUT" },
  { id: "kangkong", name: "Kangkong", category: "Produce", status: "OUT" },
  { id: "garlic", name: "Garlic", category: "Produce", status: "PLENTY" },
  { id: "onions", name: "Onions", category: "Produce", status: "PLENTY" },
  { id: "potatoes", name: "Potatoes", category: "Produce", status: "OUT" },
  { id: "cabbage", name: "Cabbage", category: "Produce", status: "OUT" },
  { id: "corn", name: "Corn Ears", category: "Produce", status: "OUT" },
  { id: "carrots", name: "Carrots", category: "Produce", status: "OUT" },
  { id: "tomatoes", name: "Tomatoes", category: "Produce", status: "OUT" },
  { id: "eggplant", name: "Eggplant (Talong)", category: "Produce", status: "OUT" },
  { id: "bitter-melon", name: "Bitter Melon (Ampalaya)", category: "Produce", status: "OUT" },

  // Pantry Staples
  { id: "singang-mix", name: "Sinigang Mix", category: "Pantry Staples", status: "OUT" },
  { id: "soy-sauce", name: "Soy Sauce (Toyo)", category: "Pantry Staples", status: "PLENTY" },
  { id: "vinegar", name: "Vinegar (Suka)", category: "Pantry Staples", status: "PLENTY" },
  { id: "peppercorn", name: "Black Peppercorn", category: "Pantry Staples", status: "PLENTY" },
  { id: "tomato-sauce", name: "Tomato Sauce", category: "Pantry Staples", status: "OUT" },
  { id: "mushroom-cream", name: "Cream of Mushroom Can", category: "Pantry Staples", status: "OUT" },
  { id: "mung-beans", name: "Mung Beans (Monggo)", category: "Pantry Staples", status: "OUT" },
  { id: "chicharon", name: "Chicharon", category: "Pantry Staples", status: "OUT" },
  { id: "cooking-oil", name: "Cooking Oil", category: "Pantry Staples", status: "PLENTY" },
  { id: "fresh-cream", name: "Fresh Cream", category: "Pantry Staples", status: "OUT" }
];

export const defaultRecipes: CustomRecipeItem[] = [
  {
    id: "chicken-tinola",
    title: "Chicken Tinola",
    videoUrl: "https://www.youtube.com/watch?v=coU1C_g8Dlc",
    associatedIngredientIds: ["chicken-cuts", "sayote", "ginger", "spinach"],
    cookingInstructions: "1. Sauté garlic, onions, and ginger in a pot.\n2. Add chicken cuts and cook until slightly browned.\n3. Pour in water or rice washing, bring to a boil, then simmer until chicken is tender.\n4. Add sayote and cook for 5 minutes.\n5. Turn off heat, stir in spinach leaves, and cover for a few minutes before serving."
  },
  {
    id: "pork-sinigang",
    title: "Pork Sinigang",
    videoUrl: "https://www.youtube.com/watch?v=coU1C_g8Dlc", // fallback link
    associatedIngredientIds: ["pork-ribs", "gabi", "radish", "kangkong", "singang-mix"],
    cookingInstructions: "1. Boil pork ribs in water with onions and tomatoes until tender.\n2. Add gabi (taro cubes) and simmer until soft.\n3. Add radish and cook for 3 minutes.\n4. Add sinigang mix to adjust sourness to taste.\n5. Add kangkong stalks, then leaves. Simmer for 1 minute and serve hot."
  },
  {
    id: "chicken-adobo",
    title: "Chicken Adobo",
    videoUrl: "https://www.youtube.com/watch?v=coU1C_g8Dlc",
    associatedIngredientIds: ["chicken-cuts", "garlic", "soy-sauce", "vinegar", "peppercorn"],
    cookingInstructions: "1. Marinate chicken cuts in soy sauce, crushed garlic, and black peppercorns for 30 minutes.\n2. In a pan, sear chicken until browned.\n3. Pour in marinade and bring to a boil. Simmer for 15 minutes.\n4. Add vinegar (do not stir immediately) and simmer for another 10 minutes until sauce reduces and chicken is fully tender."
  },
  {
    id: "ginisang-sayote",
    title: "Ginisang Sayote",
    associatedIngredientIds: ["minced-beef", "sayote", "onions", "garlic"],
    cookingInstructions: "1. Sauté garlic and onions in oil.\n2. Add minced beef and cook until brown.\n3. Toss in sliced sayote.\n4. Pour in a splash of water, cover, and cook until sayote is tender but crisp. Season with salt and pepper."
  },
  {
    id: "beef-nilaga",
    title: "Beef Nilaga",
    associatedIngredientIds: ["beef-cubes", "potatoes", "cabbage", "corn"],
    cookingInstructions: "1. Boil beef cubes in water with onions and peppercorns until fork-tender (1.5-2 hours).\n2. Add corn ears and cook for 10 minutes.\n3. Add potato halves and cook until soft.\n4. Add cabbage leaves, simmer for 2 minutes, then season with fish sauce (patis) and serve."
  },
  {
    id: "chicken-afritada",
    title: "Chicken Afritada",
    associatedIngredientIds: ["chicken-cuts", "tomato-sauce", "carrots", "potatoes"],
    cookingInstructions: "1. Pan-fry potato and carrot cubes until slightly browned, then set aside.\n2. Sauté garlic and onions, then add chicken cuts and cook until browned.\n3. Pour in tomato sauce and water, cover and simmer until chicken is cooked.\n4. Return potatoes and carrots. Add seasonings and simmer until sauce thickens."
  },
  {
    id: "burger-steak",
    title: "Burger Steak",
    associatedIngredientIds: ["minced-beef", "mushroom-cream", "garlic"],
    cookingInstructions: "1. Shape minced beef into round patties, season with salt and pepper, and pan-fry until fully cooked.\n2. In the same pan, sauté chopped garlic.\n3. Pour in cream of mushroom can and simmer with a splash of water/soy sauce until smooth.\n4. Pour mushroom gravy over patties and serve."
  },
  {
    id: "ginisang-monggo",
    title: "Ginisang Monggo",
    associatedIngredientIds: ["mung-beans", "spinach", "garlic", "chicharon"],
    cookingInstructions: "1. Boil mung beans in water until soft and ruptured.\n2. In a separate pot, sauté garlic and onions.\n3. Pour in boiled mung beans (with liquid).\n4. Simmer, then stir in spinach leaves.\n5. Season to taste and top with crushed chicharon before serving."
  },
  {
    id: "fish-sarciado",
    title: "Fish Sarciado",
    associatedIngredientIds: ["tilapia", "eggs", "tomatoes", "onions"],
    cookingInstructions: "1. Fry tilapia fish until crispy and golden brown, then set aside.\n2. Sauté onions, garlic, and plenty of chopped tomatoes until tomatoes are soft.\n3. Pour in a little water, season with fish sauce, and beat eggs and pour them into the sauce.\n4. Place fried tilapia into the sauce, simmer for a minute, and serve."
  },
  {
    id: "tortang-talong",
    title: "Tortang Talong",
    associatedIngredientIds: ["eggplant", "eggs", "cooking-oil"],
    cookingInstructions: "1. Grill eggplants until skin is charred. Peel off skin while keeping the stems intact.\n2. Flatten eggplants with a fork.\n3. Dip flattened eggplant in beaten eggs seasoned with salt.\n4. Pan-fry in hot cooking oil until egg is cooked and golden brown on both sides."
  },
  {
    id: "chicken-pastel",
    title: "Chicken Pastel",
    associatedIngredientIds: ["chicken-cuts", "fresh-cream", "hotdogs", "carrots"],
    cookingInstructions: "1. Sauté garlic and onions, then brown chicken cuts.\n2. Add sliced hotdogs and carrot cubes, sauté for a few minutes.\n3. Add fresh cream, simmer gently on low heat until chicken and carrots are tender and sauce is creamy. Season with salt and pepper."
  },
  {
    id: "ginisang-ampalaya",
    title: "Ginisang Ampalaya",
    associatedIngredientIds: ["bitter-melon", "eggs", "garlic", "onions"],
    cookingInstructions: "1. Slice bitter melon thinly and rub with salt to reduce bitterness. Rinse thoroughly.\n2. Sauté garlic and onions, then add bitter melon slices. Cook for 3-5 minutes.\n3. Pour in beaten eggs. Let it set slightly, then stir gently until eggs are fully cooked."
  }
];
