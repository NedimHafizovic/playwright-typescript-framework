export interface Product {
  name: string;
  price: number;
}

/** Product catalogue of the Sauce Demo store, used as the test oracle. */
export const products = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99 },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const satisfies Record<string, Product>;

export const catalogue: Product[] = Object.values(products);

export const TAX_RATE = 0.08;

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/** Returns the catalogue in the order the store is expected to display it. */
export function sortedCatalogue(option: SortOption): Product[] {
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
  const byPrice = (a: Product, b: Product) => a.price - b.price;
  const sorted = [...catalogue];

  switch (option) {
    case 'az':
      return sorted.sort(byName);
    case 'za':
      return sorted.sort(byName).reverse();
    case 'lohi':
      return sorted.sort((a, b) => byPrice(a, b) || byName(a, b));
    case 'hilo':
      return sorted.sort((a, b) => byPrice(b, a) || byName(a, b));
  }
}

/** Mirrors the store's order summary so tests never hard-code totals. */
export function orderSummary(items: Product[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: (subtotal + tax).toFixed(2),
  };
}
