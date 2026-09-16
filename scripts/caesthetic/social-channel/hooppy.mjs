import {
  HOOPPY_BASE_URL,
  HOOPPY_CAESTHETIC_PAGES,
  HOOPPY_HARD_DENY_PAGE_IDS,
  assertHooppyPageId,
  loadHooppyToken,
} from "./allowlist.mjs";
import { sanitizeHooppyPage, sanitizeHooppyPost } from "./sanitize.mjs";

const DEFAULT_CAP = 40;

async function hooppyGet(path, { token, fetchImpl = fetch, query = {} } = {}) {
  if (!token) {
    throw Object.assign(new Error("HOOPPY_BEARER_TOKEN_MISSING"), { code: "HOOPPY_BEARER_TOKEN_MISSING" });
  }
  if (path === "/accounts" || path.startsWith("/accounts?")) {
    throw Object.assign(new Error("raw_accounts_forbidden"), { code: "raw_accounts_forbidden" });
  }
  const url = new URL(`${HOOPPY_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== "") url.searchParams.set(key, String(value));
  }
  const res = await fetchImpl(url, {
    method: "GET",
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
  });
  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }
  return { ok: res.ok, status: res.status, body };
}

export async function listSanitizedPages({ token = loadHooppyToken(), fetchImpl = fetch, pageCap = DEFAULT_CAP } = {}) {
  if (!token) {
    throw Object.assign(new Error("HOOPPY_BEARER_TOKEN_MISSING"), { code: "HOOPPY_BEARER_TOKEN_MISSING" });
  }
  const pages = [];
  let page = 1;
  let isHasMore = true;
  while (isHasMore && page <= pageCap) {
    const { ok, status, body } = await hooppyGet("/accounts/pages", {
      token,
      fetchImpl,
      query: { page: String(page) },
    });
    if (!ok) {
      throw Object.assign(new Error(`hooppy_pages_http_${status}`), { code: "hooppy_unavailable" });
    }
    const list = Array.isArray(body.list) ? body.list : [];
    pages.push(...list.map(sanitizeHooppyPage));
    isHasMore = body.is_has_more === true;
    page += 1;
  }
  const allowlisted = pages.filter((row) => HOOPPY_CAESTHETIC_PAGES[row.id] && !row.denied);
  const deniedPresent = pages.filter((row) => HOOPPY_HARD_DENY_PAGE_IDS.includes(row.id));
  return {
    total_rows_seen: pages.length,
    allowlisted,
    hard_deny_present: deniedPresent.map((row) => ({ id: row.id, denied: true })),
    missing_allowlist: Object.keys(HOOPPY_CAESTHETIC_PAGES).filter((id) => !allowlisted.some((row) => row.id === id)),
  };
}

export async function listSanitizedPosts({
  token = loadHooppyToken(),
  fetchImpl = fetch,
  pageId,
  pageCap = 5,
} = {}) {
  if (pageId) assertHooppyPageId(pageId);
  const posts = [];
  let page = 1;
  let isHasMore = true;
  while (isHasMore && page <= pageCap) {
    const query = { page: String(page) };
    if (pageId) query.page_id = pageId;
    const { ok, status, body } = await hooppyGet("/posts", { token, fetchImpl, query });
    if (!ok) {
      throw Object.assign(new Error(`hooppy_posts_http_${status}`), { code: "hooppy_unavailable" });
    }
    const list = Array.isArray(body.list) ? body.list : [];
    posts.push(...list.map(sanitizeHooppyPost));
    isHasMore = body.is_has_more === true;
    page += 1;
  }
  return {
    total_rows: posts.length,
    posts: posts.slice(0, 50),
  };
}

async function hooppyPost(path, { token, fetchImpl = fetch, body } = {}) {
  if (!token) {
    throw Object.assign(new Error("HOOPPY_BEARER_TOKEN_MISSING"), { code: "HOOPPY_BEARER_TOKEN_MISSING" });
  }
  if (path === "/accounts" || path.startsWith("/accounts?")) {
    throw Object.assign(new Error("raw_accounts_forbidden"), { code: "raw_accounts_forbidden" });
  }
  const res = await fetchImpl(`${HOOPPY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = {};
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

export async function createScheduledPost({
  token = loadHooppyToken(),
  fetchImpl = fetch,
  pageId,
  sourceId,
  caption,
  mediaId,
  publicationDate,
} = {}) {
  const allowedPageId = assertHooppyPageId(pageId);
  if (!mediaId) {
    throw Object.assign(new Error("missing_media_id"), { code: "missing_media_id" });
  }
  const payload = {
    publication_when_type: 2,
    publication_how_type: 1,
    publication_date: publicationDate,
    selected_pages_ids: [allowedPageId],
    texts: [{ text: String(caption || ""), source_id: Number(sourceId) }],
    attachments: [{ type: "photos", data: [{ id: String(mediaId), type: "video" }] }],
  };
  const { ok, status, body } = await hooppyPost("/posts", { token, fetchImpl, body: payload });
  if (!ok || !body?.id) {
    throw Object.assign(new Error(`hooppy_create_http_${status}`), { code: "hooppy_create_failed" });
  }
  return { hooppy_post_id: String(body.id), page_id: allowedPageId, queued: true };
}

export async function reconcileHooppyPost({
  token = loadHooppyToken(),
  fetchImpl = fetch,
  hooppyPostId,
  pageId,
} = {}) {
  const { posts } = await listSanitizedPosts({ token, fetchImpl, pageId, pageCap: 8 });
  const match = posts.find((row) => String(row.id) === String(hooppyPostId));
  if (!match) {
    return { status: "uncertain", code: "POST_NOT_IN_QUEUE", hooppy_post_id: hooppyPostId };
  }
  const hasUrl = Boolean(match.published_url);
  const hasError = Boolean(match.errors_for_source_ids);
  if (hasError) return { status: "failed", code: "SOURCE_ERROR", post: match };
  if (match.is_published && hasUrl) return { status: "LIVE_VERIFIED", post: match };
  if (match.is_published && !hasUrl) return { status: "DELIVERY_UNVERIFIED", post: match };
  return { status: "queued", post: match };
}
