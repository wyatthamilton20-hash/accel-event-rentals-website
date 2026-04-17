export interface CategoryDef {
  slug: string;
  label: string;
  groupIds: number[];
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "tents", label: "Tents", groupIds: [119] },
  { slug: "chairs", label: "Chairs", groupIds: [61] },
  { slug: "tables", label: "Tables", groupIds: [60] },
  { slug: "bars", label: "Bars", groupIds: [120, 133] },
  { slug: "tabletop", label: "Tabletop", groupIds: [131, 126, 127, 125] },
  { slug: "catering", label: "Catering", groupIds: [121] },
  { slug: "decor", label: "Decor", groupIds: [97] },
  { slug: "linens", label: "Linens", groupIds: [124] },
  { slug: "lounge", label: "Lounge", groupIds: [132] },
  { slug: "lighting", label: "Lighting", groupIds: [82] },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByLabel(label: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.label === label);
}
