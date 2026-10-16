import { kidsLevels } from "./content";

export type CourseFilter =
  | "all"
  | "kids"
  | "hsk"
  | "csca"
  | "speak"
  | "year";

export const courseFilters: CourseFilter[] = [
  "all",
  "kids",
  "hsk",
  "csca",
  "speak",
  "year",
];

export type MatchAnswer = {
  who: "child" | "adult" | "";
  goal: "speak" | "hsk" | "csca" | "year" | "kids" | "";
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

export const matchQuestions = [
  {
    id: "who",
    promptKey: "cmatch_q_who",
    options: [
      { value: "child", labelKey: "cmatch_a_child" },
      { value: "adult", labelKey: "cmatch_a_adult" },
    ],
  },
  {
    id: "goal",
    promptKey: "cmatch_q_goal",
    optionsFor: {
      child: [{ value: "kids", labelKey: "cmatch_a_kids_fun" }],
      adult: [
        { value: "speak", labelKey: "cmatch_a_speak" },
        { value: "hsk", labelKey: "cmatch_a_hsk" },
        { value: "csca", labelKey: "cmatch_a_csca" },
        { value: "year", labelKey: "cmatch_a_year" },
      ],
    },
  },
  {
    id: "when",
    promptKey: "cmatch_q_when",
    options: [
      { value: "weekday", labelKey: "cmatch_a_weekday" },
      { value: "weekend", labelKey: "cmatch_a_weekend" },
    ],
  },
  {
    id: "age",
    promptKey: "cmatch_q_age",
    onlyWhen: { who: "child" },
    options: [
      { value: "7-8", labelKey: "kids_lvl_beginner_age" },
      { value: "9-11", labelKey: "kids_lvl_elementary_age" },
      { value: "12-14", labelKey: "kids_lvl_intermediate_age" },
    ],
  },
] as const;

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
      titleKey: level.labelKey,
      descKey: level.descKey,
      reasonKey: "cmatch_reason_kids",
    };
  }

  if (a.goal === "csca") {
    return {
      courseId: "csca",
      scheduleHint,
      titleKey: "course_csca_t",
      descKey: "course_csca_d",
      reasonKey: "cmatch_reason_csca",
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
  return {
    courseId: "speak",
    scheduleHint,
    titleKey: "course_speak_t",
    descKey: "course_speak_d",
    reasonKey: "cmatch_reason_speak",
  };
}

export function filterKeyLabel(f: CourseFilter): string {
  if (f === "all") return "filter_all";
  if (f === "kids") return "tag_kids";
  if (f === "hsk") return "cmatch_filter_hsk";
  if (f === "csca") return "cmatch_filter_csca";
  if (f === "speak") return "cmatch_filter_speak";
  return "cmatch_filter_year";
}
