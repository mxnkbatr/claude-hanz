import { describe, expect, it } from "vitest";
import { toDateTime } from "./date";

describe("toDateTime", () => {
  it("converts dotted dates to ISO-like form", () => {
    expect(toDateTime("2026.08.01")).toBe("2026-08-01");
  });

  it("leaves already-hyphenated dates alone", () => {
    expect(toDateTime("2026-08-01")).toBe("2026-08-01");
  });
});
