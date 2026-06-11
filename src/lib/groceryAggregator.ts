import { RecipeIngredient } from "./types";

export interface AggregatedIngredient {
  id: string; // We'll generate a consistent ID based on the normalized name
  name: string;
  displayQuantity: string;
  aisle: RecipeIngredient["aisle"];
}

// Normalize specific ingredient names to group them better
const nameMapping: Record<string, string> = {
  "finely diced potatoes": "potatoes",
  "local chicken cuts": "chicken",
  "chicken pieces": "chicken",
  "chicken cubes": "chicken",
  "lean minced beef": "minced beef",
  "sliced hotdogs": "hotdogs",
  "franks": "hotdogs",
  "local eggplants": "eggplants",
  "local bananas": "bananas",
  "local ginger": "ginger",
  "spinach leaves": "spinach",
  "beaten eggs": "eggs",
  "onion": "onions",
  "mayo": "mayonnaise",
};

function normalizeName(name: string): string {
  let lower = name.toLowerCase().trim();
  lower = lower.replace(/^frozen\s+/i, '');
  return nameMapping[lower] || lower;
}

// Convert fraction strings like "1/2" to 0.5
function parseNumber(val: string): number {
  if (val.includes('/')) {
    const [num, den] = val.split('/');
    return parseInt(num) / parseInt(den);
  }
  return parseFloat(val);
}

// Convert common units to a base unit for aggregation
function normalizeQuantity(quantityStr: string): { amount: number, unit: string } {
  // E.g., "500g", "1 kg", "1/2 head", "3 pcs", "2 tbsp"
  const match = quantityStr.trim().match(/^([\d\.\/]+)\s*(.*)$/);
  
  if (!match) {
    // If we can't parse it, just return it as a string of '1' with the whole thing as unit
    return { amount: 1, unit: quantityStr };
  }

  let amount = parseNumber(match[1]);
  let unit = match[2].toLowerCase().trim();

  // Handle pluralization standardization
  if (unit === 'pc' || unit === 'pieces') unit = 'pcs';
  if (unit === 'clove') unit = 'cloves';
  if (unit === 'tbsp' || unit === 'tbsps') unit = 'tbsp';

  // Base conversions
  if (unit === 'kg') {
    amount *= 1000;
    unit = 'g';
  }

  return { amount, unit };
}

function formatQuantity(amount: number, unit: string): string {
  // Convert back to human readable
  if (unit === 'g' && amount >= 1000) {
    const kg = amount / 1000;
    return `${kg}kg`;
  }
  
  // Format numbers cleanly (e.g., 1.5 instead of 1.500)
  const formattedAmount = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2).replace(/\.?0+$/, '');
  
  // If unit is empty (e.g., just "2"), don't add space
  if (!unit) return formattedAmount;
  
  // Add space except for g/kg/ml etc
  if (['g', 'kg', 'ml', 'l'].includes(unit)) {
    return `${formattedAmount}${unit}`;
  }
  return `${formattedAmount} ${unit}`;
}

// Capitalize first letters for display
function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export function aggregateIngredients(ingredients: RecipeIngredient[]): AggregatedIngredient[] {
  const aggregated: Record<string, { amount: number, unit: string, aisle: RecipeIngredient["aisle"] }> = {};
  const unparsable: AggregatedIngredient[] = [];

  for (const ing of ingredients) {
    const normName = normalizeName(ing.item);
    
    // Ignore leftovers since they don't need to be bought at the store
    if (normName.includes("leftover")) {
      continue;
    }

    const { amount, unit } = normalizeQuantity(ing.quantity);

    const key = `${normName}|${unit}`;

    // If unit is just a string we couldn't parse properly (amount = 1), keep it separate
    // Or if it's a completely weird string, we just push it to unparsable
    if (Number.isNaN(amount)) {
      unparsable.push({
        id: ing.id,
        name: toTitleCase(normName),
        displayQuantity: ing.quantity,
        aisle: ing.aisle
      });
      continue;
    }

    if (!aggregated[key]) {
      aggregated[key] = { amount: 0, unit, aisle: ing.aisle };
    }
    aggregated[key].amount += amount;
  }

  const result: AggregatedIngredient[] = [];
  
  for (const [key, data] of Object.entries(aggregated)) {
    const [name, unit] = key.split('|');
    result.push({
      id: `agg-${name.replace(/\s+/g, '-')}-${unit}`, // Unique ID based on aggregated name/unit
      name: toTitleCase(name),
      displayQuantity: formatQuantity(data.amount, unit),
      aisle: data.aisle
    });
  }

  return [...result, ...unparsable].sort((a, b) => a.name.localeCompare(b.name));
}
