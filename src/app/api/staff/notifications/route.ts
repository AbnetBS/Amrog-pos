import { NextResponse } from "next/server";
import { db } from "@/db";
import { staffUsers } from "@/db/schema";
import { ensureTablesExist } from "@/db/migrate";
import { eq } from "drizzle-orm";
import { requireStaff } from "@/lib/session";

/**
 * POCKET OFF-DUTY SWITCH (owner's decision, Sept 2026).
 *
 * Staff phones kept ringing at home after closing. This route is the
 * per-person switch behind the "Off duty" button in every staff app:
 *
 *   GET → { notificationsEnabled }   the caller's current state
 *   PUT → { notificationsEnabled }   body { notificationsEnabled: boolean }
 *
 * The state lives on the STAFF record, not the device, so one tap silences
 * every phone and tablet subscribed under that person's name - and the next
 * PIN sign-in (staff/login) switches it back on, so a shift can never start
 * silent because somebody forgot. The switch only mutes PUSHES; the staff
 * screens themselves keep updating live while they are open.
 *
 * Session-guarded: a person can only switch their OWN alerts, never anyone
 * else's (the staff id comes from the signed cookie, never the body).
 */
export async function GET() {
  const __auth = await requireStaff();
  if (!__auth.ok) return __auth.response;
  const staff = __auth.session;
  await ensureTablesExist();
  try {
    const rows = await db
      .select({ notificationsEnabled: staffUsers.notificationsEnabled })
      .from(staffUsers)
      .where(eq(staffUsers.id, staff.staffId))
      .limit(1);
    // Unknown staff row (deleted while the cookie was still valid): assume
    // ON - failing open means an alarm is never wrongly silenced.
    return NextResponse.json({ notificationsEnabled: rows.length === 0 ? true : rows[0].notificationsEnabled !== false });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const __auth = await requireStaff();
  if (!__auth.ok) return __auth.response;
  const staff = __auth.session;
  await ensureTablesExist();
  try {
    const body = await request.json().catch(() => ({}));
    // Strict boolean: anything that is not exactly true/false is rejected
    // rather than guessed (a half-understood call must never silence a phone
    // by accident).
    if (typeof body?.notificationsEnabled !== "boolean") {
      return NextResponse.json({ error: "notificationsEnabled (boolean) required" }, { status: 400 });
    }
    const updated = await db
      .update(staffUsers)
      .set({ notificationsEnabled: body.notificationsEnabled })
      .where(eq(staffUsers.id, staff.staffId))
      .returning({ notificationsEnabled: staffUsers.notificationsEnabled });
    return NextResponse.json({
      notificationsEnabled: updated.length === 0 ? body.notificationsEnabled : updated[0].notificationsEnabled !== false,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
