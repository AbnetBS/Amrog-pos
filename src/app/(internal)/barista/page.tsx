import { redirect } from "next/navigation";

/**
 * /barista — the cafe engine's separate machine-coffee lane.
 *
 * Amrogn Chicken (4 Kilo) runs a single beverage crew: the Juice & Cold Drinks
 * station at /juice handles soft drinks, cold beverages AND fresh juices. The
 * lane still exists in the engine for legacy branches, so this route redirects
 * instead of 404-ing an old bookmarked tablet.
 */
export default function BaristaPage() {
  redirect("/juice");
}
