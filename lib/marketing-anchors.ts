/** Query param for landing page section scroll (no hash URLs). */
export const LANDING_SECTION_PARAM = "section" as const;

/** DOM ids for scroll targets. Impact uses `impact-focus` (2nd metric) so the first card isn’t covered by the nav. */
export const LANDING_SCROLL_IDS = {
  mission: "mission",
  curriculum: "curriculum",
  impact: "impact-focus",
} as const;

export type LandingSectionKey = keyof typeof LANDING_SCROLL_IDS;

export function getLandingScrollElementId(key: LandingSectionKey): string {
  return LANDING_SCROLL_IDS[key];
}

/** Valid ?section= values for the marketing home page. */
export function parseLandingSection(
  raw: string | null
): LandingSectionKey | null {
  if (raw === "mission" || raw === "curriculum" || raw === "impact") {
    return raw;
  }
  return null;
}
