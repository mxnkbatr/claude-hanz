import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "./ProductCard";
import type { ProductLive } from "../lib/cms";

vi.mock("../i18n/I18nContext", () => ({
  useI18n: () => ({
    lang: "en",
    t: (key: string) => key,
    setLang: () => undefined,
    langs: ["mn", "en", "zh"],
  }),
}));

const product: ProductLive = {
  id: "prod1",
  titleKey: "prod1",
  title: { en: "Porcelain set", mn: "Шаазан", zh: "瓷器" },
  tagKey: "tag_brand",
  cat: "porcelain",
  price: 120000,
  inStock: true,
  image: "/images/shop-1.webp",
  descKey: "prod1_d",
};

describe("ProductCard", () => {
  it("renders localized title and links to product detail", () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Porcelain set")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/shop/prod1");
    expect(screen.getByText("cat_porcelain")).toBeInTheDocument();
  });
});
