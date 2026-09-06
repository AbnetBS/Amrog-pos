"use client";

import WaiterApp from "@/components/rms/WaiterApp";

/**
 * /buna — THE BUNA MAKERS' SCREEN.
 *
 * Two people make the traditional coffee at their own place, indoors and
 * outdoors, and when the room is full they take orders like waiters too. So
 * this is the WAITER app (tables, menu, send) with the buna lane pinned on top
 * and the noise turned off: their phone rings only for a traditional-buna line
 * arriving, or for food ready on a table they accepted. QR orders, guest
 * top-ups and bill requests never wake them.
 */
export default function BunaPage() {
  return <WaiterApp role="buna" />;
}
