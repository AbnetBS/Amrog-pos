import { redirect } from "next/navigation";

/**
 * /buna — the cafe engine's traditional-coffee makers' screen.
 *
 * Amrogn Chicken (4 Kilo) serves no traditional buna, so there is no buna
 * crew here. The engine keeps the role for legacy/future branches; any old
 * link simply lands on the floor team's Waiter app.
 */
export default function BunaPage() {
  redirect("/waiter");
}
