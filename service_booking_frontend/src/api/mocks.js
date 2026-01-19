/**
 * Seeded mock data used by the booking flow when backend is unavailable.
 * Keep IDs stable so selections/URLs remain consistent across reloads.
 */

export const MOCK_BRANDS = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Samsung' },
  { id: 3, name: 'Google' },
  { id: 4, name: 'OnePlus' },
  { id: 5, name: 'Xiaomi' }
];

export const MOCK_MODELS_BY_BRAND_ID = {
  1: [
    { id: 101, brand_id: 1, name: 'iPhone 13' },
    { id: 102, brand_id: 1, name: 'iPhone 14' },
    { id: 103, brand_id: 1, name: 'iPhone 15' }
  ],
  2: [
    { id: 201, brand_id: 2, name: 'Galaxy S22' },
    { id: 202, brand_id: 2, name: 'Galaxy S23' },
    { id: 203, brand_id: 2, name: 'Galaxy A54' }
  ],
  3: [
    { id: 301, brand_id: 3, name: 'Pixel 7' },
    { id: 302, brand_id: 3, name: 'Pixel 8' }
  ],
  4: [
    { id: 401, brand_id: 4, name: 'OnePlus 10' },
    { id: 402, brand_id: 4, name: 'OnePlus 11' }
  ],
  5: [
    { id: 501, brand_id: 5, name: 'Redmi Note 12' },
    { id: 502, brand_id: 5, name: 'Xiaomi 13' }
  ]
};

export const MOCK_PROBLEMS = [
  { id: 1, name: 'Screen replacement' },
  { id: 2, name: 'Battery replacement' },
  { id: 3, name: 'Charging port issue' },
  { id: 4, name: 'Water damage' },
  { id: 5, name: 'Speaker / microphone issue' }
];
