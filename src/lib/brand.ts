/**
 * Brand guard — the business is "Amrogn Chicken".
 * This deployment was built on the engine originally made for a cafe, so old
 * seeds, old admin edits and cached DB rows may still carry that cafe's name.
 * Every display path runs through this so customers and staff only ever see
 * the Amrogn Chicken brand.
 */
export const BRAND_NAME = "Amrogn Chicken";

/** The single branch this deployment is configured for. */
export const BRANCH_NAME = "4 Kilo Branch";
export const BRANCH_LOCATION = "Ambassador Mall, Ground Floor, 4 Kilo";

export function fixBrandText(v: unknown): string {
  if (typeof v !== "string" || !v) return v as string;
  let out = v
    // Legacy engine names -> Amrogn Chicken
    .replace(/FanaQueen(\s+Cafe)?/gi, BRAND_NAME)
    .replace(/Fana\s+Cafe(\s*&\s*Restaurant)?/gi, BRAND_NAME)
    .replace(/\bCafe\s+Cafe(\s+Cafe)?\b/gi, "Cafe")
    .replace(/\s{2,}/g, " ")
    .trim();
  // Normalize the common Amrogn spellings to the official one.
  if (/^amrog(n|ne|gn)?\s*chicken$/i.test(out)) out = BRAND_NAME;
  return out;
}

/**
 * Address guard — Amrogn Chicken's 4 Kilo branch is on the ground floor of
 * Ambassador Mall (in front of the Parliament), not at the old cafe address.
 * Old seeds, admin edits and cached rows may still carry the old building name.
 */
export function fixAddressText(v: unknown): string {
  if (typeof v !== "string" || !v) return v as string;
  return v
    .replace(/town\s+square\s+building/gi, "Ambassador Mall")
    .replace(/town\s+square\s+bldg\.?/gi, "Ambassador Mall")
    .replace(/golagul\s+building/gi, "Ambassador Mall")
    .replace(/golagul\s+bldg\.?/gi, "Ambassador Mall")
    .replace(/22\s*square,?\s*(djibouti\s+street,?)?\s*bole/gi, "4 Kilo")
    .replace(/golagul/gi, "Ambassador Mall")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Combined normalizer for serving text content to clients. */
export function fixSiteText(v: unknown): string {
  return fixAddressText(fixBrandText(v));
}
