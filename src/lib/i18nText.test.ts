import { describe, expect, it } from "vitest";
import { emptyI18nText, loc, slugify } from "./i18nText";

const t = (key: string) => `T:${key}`;

describe("loc", () => {
  it("prefers the active language from jsonb", () => {
    expect(
      loc("en", t, { mn: "Сайн", en: "Hello", zh: "你好" }),
    ).toBe("Hello");
  });

  it("falls back to translation key when lang missing", () => {
    expect(loc("zh", t, { mn: "Сайн" }, "hello_key")).toBe("T:hello_key");
  });

  it("falls back across languages when no key", () => {
    expect(loc("en", t, { mn: "Сайн" })).toBe("Сайн");
  });

  it("trims whitespace and ignores blank strings", () => {
    expect(loc("en", t, { en: "  " }, "fallback")).toBe("T:fallback");
  });
});

describe("slugify", () => {
  it("normalizes spaces and punctuation", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("keeps mongolian and chinese characters", () => {
    expect(slugify("Ханз 学院")).toBe("ханз-学院");
  });

  it("returns a generated id for empty input", () => {
    expect(slugify("   ")).toMatch(/^item-/);
  });
});

describe("emptyI18nText", () => {
  it("returns blank mn/en/zh", () => {
    expect(emptyI18nText()).toEqual({ mn: "", en: "", zh: "" });
  });
});
