import { coursesMeta, kidsLevels } from "./content";

export type CourseFilter =
  | "all"
  | "classroom"
  | "online"
  | "corporate"
  | "short"
  | "kids";

export const courseFilters: CourseFilter[] = [
  "all",
  "classroom",
  "online",
  "corporate",
  "short",
  "kids",
];

export type MatchAnswer = {
  who: "child" | "adult" | "";
  goal: "speak" | "hsk" | "year" | "online" | "kids" | "classroom" | "";
  when: "weekday" | "weekend" | "";
  age: "7-8" | "9-11" | "12-14" | "";
};

export type MatchResult = {
  courseId: string;
  kidsLevelId?: string;
  scheduleHint?: "wd_afternoon" | "wd_evening" | "weekend_am" | "weekend_pm";
  titleKey: string;
  descKey: string;
  reasonKey: string;
};

export function resolveMatch(a: MatchAnswer): MatchResult {
  const scheduleHint =
    a.when === "weekend"
      ? "weekend_am"
      : a.when === "weekday"
        ? "wd_afternoon"
        : undefined;

  if (a.who === "child" || a.goal === "kids") {
    const levelId =
      a.age === "9-11"
        ? "elementary"
        : a.age === "12-14"
          ? "intermediate"
          : "beginner";
    const level = kidsLevels.find((l) => l.id === levelId) ?? kidsLevels[0];
    return {
      courseId: "kids",
      kidsLevelId: level.id,
      scheduleHint,
      titleKey: "course_kids_t",
      descKey: level.descKey,
      reasonKey: "cmatch_reason_kids",
    };
  }

  if (a.goal === "online") {
    return {
      courseId: "online",
      scheduleHint,
      titleKey: "course_online_t",
      descKey: "course_online_d",
      reasonKey: "cmatch_reason_online",
    };
  }
  if (a.goal === "hsk") {
    return {
      courseId: "hsk",
      scheduleHint,
      titleKey: "course_hsk_t",
      descKey: "course_hsk_d",
      reasonKey: "cmatch_reason_hsk",
    };
  }
  if (a.goal === "year") {
    return {
      courseId: "year",
      scheduleHint,
      titleKey: "course_year_t",
      descKey: "course_year_d",
      reasonKey: "cmatch_reason_year",
    };
  }
  if (a.goal === "speak") {
    return {
      courseId: "speak",
      scheduleHint,
      titleKey: "course_speak_t",
      descKey: "course_speak_d",
      reasonKey: "cmatch_reason_speak",
    };
  }

  const classroom = coursesMeta.find((c) => c.id === "classroom")!;
  return {
    courseId: classroom.id,
    scheduleHint,
    titleKey: classroom.titleKey,
    descKey: classroom.descKey,
    reasonKey: "cmatch_reason_classroom",
  };
}

export function filterKeyLabel(f: CourseFilter): string {
  if (f === "all") return "filter_all";
  if (f === "classroom") return "tag_classroom";
  if (f === "online") return "tag_online";
  if (f === "corporate") return "tag_corporate";
  if (f === "short") return "tag_short";
  return "tag_kids";
}
