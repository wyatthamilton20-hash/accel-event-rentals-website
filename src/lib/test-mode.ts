export const IS_TEST_MODE: boolean = process.env.QUOTE_TEST_MODE !== "false";

export function tagSubject(s: string): string {
  return IS_TEST_MODE ? `[TEST] ${s}` : s;
}

export const testBannerCopy: string =
  "Test mode is on — submissions are not yet booked into our rental system.";
