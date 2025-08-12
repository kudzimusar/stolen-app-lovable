import { useMemo, useRef } from "react";
import Fuse from "fuse.js";

export type TaxonomyType = "category" | "brand" | "series" | "model" | "variant";

export interface TaxonomyNode {
  id: string;
  name: string;
  type: TaxonomyType;
  children?: TaxonomyNode[];
  synonyms?: string[];
}

export interface SearchResult {
  node: TaxonomyNode;
  path: TaxonomyNode[]; // from root to node
}

// Minimal seed taxonomy. In production, hydrate from API/DB and cache client-side.
const taxonomyRoots: TaxonomyNode[] = [
  {
    id: "phones",
    name: "Phones",
    type: "category",
    children: [
      {
        id: "apple",
        name: "Apple",
        type: "brand",
        synonyms: ["iphone", "apple phone"],
        children: [
          {
            id: "iphone",
            name: "iPhone",
            type: "series",
            children: [
              { id: "iphone-15", name: "iPhone 15", type: "model", synonyms: ["15", "2023"] },
              { id: "iphone-15-pro", name: "iPhone 15 Pro", type: "model", synonyms: ["15 pro"] },
              { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", type: "model", synonyms: ["15 pro max"] },
              { id: "iphone-13-mini", name: "iPhone 13 Mini", type: "model", synonyms: ["13 mini"] },
            ],
          },
        ],
      },
      {
        id: "samsung",
        name: "Samsung",
        type: "brand",
        synonyms: ["galaxy", "samsung phone"],
        children: [
          {
            id: "galaxy-s",
            name: "Galaxy S",
            type: "series",
            children: [
              { id: "galaxy-s24-ultra", name: "Galaxy S24 Ultra", type: "model", synonyms: ["s24 ultra"] },
            ],
          },
          {
            id: "galaxy-tab",
            name: "Galaxy Tab",
            type: "series",
            children: [
              { id: "tab-s9", name: "Tab S9", type: "model" },
            ],
          },
        ],
      },
      { id: "google", name: "Google", type: "brand", children: [ { id: "pixel", name: "Pixel", type: "series", children: [ { id: "pixel-8-pro", name: "Pixel 8 Pro", type: "model" } ] } ] },
    ],
  },
  {
    id: "laptops",
    name: "Laptops",
    type: "category",
    children: [
      {
        id: "apple-laptop",
        name: "Apple",
        type: "brand",
        synonyms: ["macbook", "apple laptop"],
        children: [
          {
            id: "macbook-pro",
            name: "MacBook Pro",
            type: "series",
            children: [
              { id: "mbp-m3-14", name: "MacBook Pro M3 14-inch", type: "model", synonyms: ["m3 14", "14\" m3"] },
            ],
          },
        ],
      },
      { id: "dell", name: "Dell", type: "brand", children: [ { id: "xps", name: "XPS", type: "series", children: [ { id: "xps-13-i7", name: "XPS 13 i7", type: "model" } ] } ] },
      { id: "lenovo", name: "Lenovo", type: "brand", children: [ { id: "thinkpad", name: "ThinkPad", type: "series", children: [ { id: "x1-carbon", name: "X1 Carbon", type: "model" } ] } ] },
    ],
  },
  {
    id: "cameras",
    name: "Cameras",
    type: "category",
    children: [
      { id: "canon", name: "Canon", type: "brand", children: [ { id: "eos-r", name: "EOS R", type: "series", children: [ { id: "eos-r6-ii", name: "EOS R6 Mark II", type: "model" } ] } ] },
      { id: "gopro", name: "GoPro", type: "brand", children: [ { id: "hero", name: "HERO", type: "series", children: [ { id: "hero12", name: "HERO12 Black", type: "model" } ] } ] },
    ],
  },
  {
    id: "consoles",
    name: "Consoles",
    type: "category",
    children: [
      { id: "microsoft", name: "Microsoft", type: "brand", children: [ { id: "xbox", name: "Xbox", type: "series", children: [ { id: "series-x", name: "Series X", type: "model" } ] } ] },
      { id: "nintendo", name: "Nintendo", type: "brand", children: [ { id: "switch", name: "Switch", type: "series", children: [ { id: "switch-oled", name: "Switch OLED", type: "model" } ] } ] },
    ],
  },
];

function flatten(nodes: TaxonomyNode[], path: TaxonomyNode[] = []): Array<{ node: TaxonomyNode; path: TaxonomyNode[] }> {
  const out: Array<{ node: TaxonomyNode; path: TaxonomyNode[] }> = [];
  nodes.forEach((n) => {
    const p = [...path, n];
    out.push({ node: n, path: p });
    if (n.children?.length) out.push(...flatten(n.children, p));
  });
  return out;
}

const flat = flatten(taxonomyRoots);

const fuse = new Fuse(
  flat.map((f) => ({
    key: f.node.id,
    name: f.node.name,
    type: f.node.type,
    synonyms: f.node.synonyms ?? [],
    path: f.path,
    node: f.node,
  })),
  {
    keys: ["name", "synonyms"],
    threshold: 0.35, // typo tolerance
    ignoreLocation: true,
    includeScore: true,
  }
);

export function useTaxonomy() {
  const indexRef = useRef(fuse);

  const search = useMemo(() => {
    return (query: string): SearchResult[] => {
      if (!query.trim()) return [];
      const res = indexRef.current.search(query.trim());
      return res.slice(0, 12).map((r) => ({ node: r.item.node, path: r.item.path }));
    };
  }, []);

  const nextChildren = (path: TaxonomyNode[]) => {
    const last = path[path.length - 1];
    return last?.children ?? taxonomyRoots;
  };

  const tokensFromPath = (path: TaxonomyNode[]) => path.map((p) => p.name.toLowerCase());

  return {
    roots: taxonomyRoots,
    search,
    nextChildren,
    tokensFromPath,
  };
}
