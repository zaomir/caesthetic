import { inWorkWindow, msUntilWindowOpen, zonedParts } from "../../../services/social-browser-operator/scripts/lib/europe-work-window.mjs";

export const VALERIE_WINDOW = Object.freeze({
  tz: "America/New_York",
  start: "09:00",
  end: "17:00",
  weekdays: Object.freeze([1, 2, 3, 4, 5]),
});

export function windowState(now = process.env.CAE_SOCIAL_WINDOW_NOW ? new Date(process.env.CAE_SOCIAL_WINDOW_NOW) : new Date()) {
  const parts = zonedParts(now, VALERIE_WINDOW.tz);
  const open = inWorkWindow(parts, VALERIE_WINDOW);
  const waitMs = open ? 0 : msUntilWindowOpen(now, VALERIE_WINDOW);
  const next = new Date(now.getTime() + waitMs);
  const nextParts = zonedParts(next, VALERIE_WINDOW.tz);
  return {
    open,
    tz: VALERIE_WINDOW.tz,
    start: VALERIE_WINDOW.start,
    end: VALERIE_WINDOW.end,
    local_date: parts.localDate,
    local_minutes: parts.minutes,
    weekday: parts.weekday,
    next_open_local: open ? null : `${nextParts.localDate} ${VALERIE_WINDOW.start} ${VALERIE_WINDOW.tz}`,
    next_open_at: open ? null : next.toISOString(),
  };
}
