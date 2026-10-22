import { describe, expect, it } from "vitest";
import { resolveMatch, type MatchAnswer } from "./courseMatch";

const base: MatchAnswer = {
  who: "",
  goal: "",
  when: "",
  age: "",
};

describe("resolveMatch", () => {
  it("routes children to kids course with age band", () => {
    const result = resolveMatch({
      ...base,
      who: "child",
      age: "9-11",
      when: "weekend",
    });
    expect(result.courseId).toBe("kids");
    expect(result.kidsLevelId).toBe("elementary");
    expect(result.scheduleHint).toBe("weekend_am");
    expect(result.reasonKey).toBe("cmatch_reason_kids");
  });

  it("routes adult HSK goal to hsk course", () => {
    const result = resolveMatch({
      ...base,
      who: "adult",
      goal: "hsk",
      when: "weekday",
    });
    expect(result.courseId).toBe("hsk");
    expect(result.scheduleHint).toBe("wd_afternoon");
  });

  it("routes online goal to online course", () => {
    const result = resolveMatch({
      ...base,
      who: "adult",
      goal: "online",
    });
    expect(result.courseId).toBe("online");
  });
});
