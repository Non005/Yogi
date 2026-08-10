/**
 * ========================================================================
 *  YOGI MANAGEMENT SYSTEM — Cloudflare Worker API (D1 Database Edition)
 *  Zoom ပဋ္ဌာန်း မိသားစု / ယောဂီများ စီမံခန့်ခွဲမှုစနစ်
 * ========================================================================
 *  Single JSON action-based endpoint. The frontend calls:
 *    POST /            { action, token, ...payload }
 *    GET  /?action=... &token=...&...payload   (read actions only)
 *
 *  Set a secret before deploying (used to sign login tokens):
 *    wrangler secret put AUTH_SECRET
 * ========================================================================
 */

const LEVELS = [
  { id: 1, name: "သတိ ကိုယ့်စိတ်ကိုယ်သိ ယောဂီ" },
  { id: 2, name: "ရုပ် ကမ္မဋ္ဌာန်း ယောဂီ" },
  { id: 3, name: "နာမ် ကမ္မဋ္ဌာန်း ယောဂီ" },
  { id: 4, name: "ရုပ်နာမ် ကမ္မဋ္ဌာန်း ယောဂီ" },
  { id: 5, name: "ခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း ယောဂီ" },
  { id: 6, name: "ဥပါနက္ခခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း ယောဂီ" },
  { id: 7, name: "သိ-ပါယ်-ဆိုက်-ပွား ယောဂီ" }
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS }
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function genId(prefix) {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${t}-${r}`.toUpperCase();
}

/* ---------------------------- Crypto helpers ---------------------------- */

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function b64url(bytesOrStr) {
  let str;
  if (typeof bytesOrStr === "string") {
    str = btoa(unescape(encodeURIComponent(bytesOrStr)));
  } else {
    str = btoa(String.fromCharCode(...new Uint8Array(bytesOrStr)));
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return decodeURIComponent(escape(atob(str)));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signToken(payload, secret) {
  const key = await hmacKey(secret);
  const body = b64url(JSON.stringify(payload));
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const sig = b64url(sigBuf);
  return `${body}.${sig}`;
}

async function verifyToken(token, secret) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const key = await hmacKey(secret);
  const expectedSigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expectedSig = b64url(expectedSigBuf);
  if (expectedSig !== sig) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ------------------------------ Row mapping ------------------------------ */

function levelName(level) {
  const l = LEVELS.find(x => x.id === Number(level));
  return l ? l.name : `Level ${level}`;
}

function toYogiRow(r) {
  return {
    id: r.id,
    uniqueId: r.unique_id,
    groupId: r.group_id,
    level: r.level,
    levelName: levelName(r.level),
    seqNo: r.seq_no,
    regDate: r.reg_date,
    name: r.name,
    age: r.age,
    phone: r.phone,
    address: r.address,
    introducer: r.introducer,
    email: r.email,
    gender: r.gender,
    status: r.status,
    statusDate: r.status_date,
    posted: !!r.posted,
    canPost: !r.posted && Number(r.level) < 7,
    createdBy: r.created_by,
    createdAt: r.created_at
  };
}

function toLeaderRow(r) {
  return {
    id: r.id,
    uniqueId: r.unique_id,
    seqNo: r.seq_no,
    regDate: r.reg_date,
    name: r.name,
    age: r.age,
    phone: r.phone,
    address: r.address,
    email: r.email,
    gender: r.gender,
    status: r.status,
    statusDate: r.status_date,
    createdBy: r.created_by,
    createdAt: r.created_at
  };
}

/* -------------------------------- Handlers -------------------------------- */

async function handleCheckLogin(db, payload, env) {
  const username = String(payload.username || "").trim();
  const password = String(payload.password || "").trim();
  if (!username || !password) {
    return { success: false, message: "အသုံးပြုသူအမည်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်သွင်းပါ။" };
  }

  const user = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
  if (!user) {
    return { success: false, message: "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။" };
  }

  const hash = await sha256Hex(password);
  if (hash !== user.password_hash) {
    return { success: false, message: "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။" };
  }

  const expiresInMs = 8 * 60 * 60 * 1000; // 8 hours
  const payloadToken = { u: user.username, d: user.display_name, iat: Date.now(), exp: Date.now() + expiresInMs };
  const secret = env.AUTH_SECRET || "dev-insecure-secret-change-me";
  const token = await signToken(payloadToken, secret);

  return {
    success: true,
    token,
    expiresInMs,
    user: { username: user.username, displayName: user.display_name, role: "Member" }
  };
}

async function requireAuth(request, env) {
  const url = new URL(request.url);
  let token = "";
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
  if (!token) token = url.searchParams.get("token") || "";

  const secret = env.AUTH_SECRET || "dev-insecure-secret-change-me";
  const session = await verifyToken(token, secret);
  return session;
}

async function handleGetDashboardData(db) {
  const overall = await db.prepare(
    `SELECT
       SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as totalActive,
       SUM(CASE WHEN status='Active' AND gender='ကျား' THEN 1 ELSE 0 END) as activeMale,
       SUM(CASE WHEN status='Active' AND gender='မ' THEN 1 ELSE 0 END) as activeFemale
     FROM yogis`
  ).first();

  const perLevelRes = await db.prepare(
    `SELECT level,
        SUM(CASE WHEN status='Active' AND gender='ကျား' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN status='Active' AND gender='မ' THEN 1 ELSE 0 END) as female,
        SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as total
     FROM yogis GROUP BY level`
  ).all();

  const perLevelMap = {};
  (perLevelRes.results || []).forEach(r => { perLevelMap[r.level] = r; });

  const perLevel = LEVELS.map(l => ({
    level: l.id,
    name: l.name,
    male: (perLevelMap[l.id] && perLevelMap[l.id].male) || 0,
    female: (perLevelMap[l.id] && perLevelMap[l.id].female) || 0,
    total: (perLevelMap[l.id] && perLevelMap[l.id].total) || 0
  }));

  const leaderAgg = await db.prepare(
    `SELECT
       SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as total,
       SUM(CASE WHEN status='Active' AND gender='ကျား' THEN 1 ELSE 0 END) as male,
       SUM(CASE WHEN status='Active' AND gender='မ' THEN 1 ELSE 0 END) as female
     FROM leaders`
  ).first();

  return {
    success: true,
    data: {
      totalActive: overall.totalActive || 0,
      activeMale: overall.activeMale || 0,
      activeFemale: overall.activeFemale || 0,
      perLevel,
      leaders: {
        total: (leaderAgg && leaderAgg.total) || 0,
        male: (leaderAgg && leaderAgg.male) || 0,
        female: (leaderAgg && leaderAgg.female) || 0
      }
    }
  };
}

async function handleGetYogiData(db, payload) {
  const level = Number(payload.level || 1);
  const page = Math.max(1, Number(payload.page || 1));
  const limit = Math.max(1, Math.min(200, Number(payload.limit || 25)));
  const offset = (page - 1) * limit;
  const search = String(payload.searchVal || "").trim();

  let where = "WHERE level = ?";
  const binds = [level];
  if (search) {
    where += " AND (name LIKE ? OR phone LIKE ? OR address LIKE ? OR unique_id LIKE ?)";
    const s = `%${search}%`;
    binds.push(s, s, s, s);
  }

  const countRow = await db.prepare(`SELECT COUNT(*) as c FROM yogis ${where}`).bind(...binds).first();
  const aggRow = await db.prepare(
    `SELECT
       SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as activeTotal,
       SUM(CASE WHEN status='Active' AND gender='ကျား' THEN 1 ELSE 0 END) as activeMale,
       SUM(CASE WHEN status='Active' AND gender='မ' THEN 1 ELSE 0 END) as activeFemale
     FROM yogis ${where}`
  ).bind(...binds).first();

  const rowsRes = await db.prepare(
    `SELECT * FROM yogis ${where}
     ORDER BY (status='Active') DESC, COALESCE(status_date, created_at) DESC, id DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all();

  return {
    success: true,
    data: {
      rows: (rowsRes.results || []).map(toYogiRow),
      total: (countRow && countRow.c) || 0,
      page,
      limit,
      activeTotal: (aggRow && aggRow.activeTotal) || 0,
      activeMale: (aggRow && aggRow.activeMale) || 0,
      activeFemale: (aggRow && aggRow.activeFemale) || 0
    }
  };
}

async function handleSaveYogi(db, payload, session) {
  const level = Number(payload.level || 1);
  const name = String(payload.name || "").trim();
  if (!name) return { success: false, message: "အမည် ဖြည့်သွင်းရန် လိုအပ်ပါသည်။" };

  const uniqueId = genId(`Y${level}`);
  const groupId = genId("G");
  const regDate = payload.regDate || todayStr();
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO yogis
      (unique_id, group_id, level, seq_no, reg_date, name, age, phone, address, introducer, email, gender, status, status_date, posted, created_by, created_at, updated_at)
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(seq_no),0)+1 FROM yogis WHERE level=?), ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, 0, ?, ?, ?)`
  ).bind(
    uniqueId, groupId, level, level, regDate, name,
    payload.age || "", payload.phone || "", payload.address || "",
    payload.introducer || "", payload.email || "", payload.gender || "",
    regDate, session.u, now, now
  ).run();

  return { success: true, message: "ယောဂီစာရင်း အောင်မြင်စွာ သွင်းပြီးပါပြီ။", uniqueId };
}

async function handleUpdateYogi(db, payload) {
  const id = Number(payload.id);
  if (!id) return { success: false, message: "ID မတွေ့ပါ။" };

  await db.prepare(
    `UPDATE yogis SET name=?, age=?, phone=?, address=?, introducer=?, email=?, gender=?, reg_date=?, updated_at=?
     WHERE id=?`
  ).bind(
    payload.name || "", payload.age || "", payload.phone || "", payload.address || "",
    payload.introducer || "", payload.email || "", payload.gender || "",
    payload.regDate || todayStr(), new Date().toISOString(), id
  ).run();

  return { success: true, message: "စာရင်း ပြင်ဆင်ပြီးပါပြီ။" };
}

async function handleDeleteYogi(db, payload) {
  const id = Number(payload.id);
  if (!id) return { success: false, message: "ID မတွေ့ပါ။" };
  await db.prepare("DELETE FROM yogis WHERE id=?").bind(id).run();
  return { success: true, message: "စာရင်း ဖျက်ပြီးပါပြီ။" };
}

async function handleToggleYogiStatus(db, payload) {
  const id = Number(payload.id);
  if (!id) return { success: false, message: "ID မတွေ့ပါ။" };

  const row = await db.prepare("SELECT * FROM yogis WHERE id=?").bind(id).first();
  if (!row) return { success: false, message: "စာရင်း မတွေ့ပါ။" };

  const newStatus = row.status === "Active" ? "Inactive" : "Active";
  const clickDate = todayStr();

  await db.prepare("UPDATE yogis SET status=?, status_date=?, updated_at=? WHERE id=?")
    .bind(newStatus, clickDate, new Date().toISOString(), id).run();

  return { success: true, message: `Status → ${newStatus}`, status: newStatus };
}

async function handlePostYogi(db, payload, session) {
  const id = Number(payload.id);
  if (!id) return { success: false, message: "ID မတွေ့ပါ။" };

  const row = await db.prepare("SELECT * FROM yogis WHERE id=?").bind(id).first();
  if (!row) return { success: false, message: "စာရင်း မတွေ့ပါ။" };
  if (row.posted) return { success: false, message: "ဤစာရင်းကို Post လုပ်ပြီးသားဖြစ်ပါသည်။" };
  if (Number(row.level) >= 7) return { success: false, message: "နောက်ဆုံးအဆင့် ဖြစ်နေပြီဖြစ်၍ Post လုပ်၍မရပါ။" };

  const nextLevel = Number(row.level) + 1;
  const postDate = todayStr();
  const now = new Date().toISOString();
  const uniqueId = genId(`Y${nextLevel}`);

  await db.batch([
    db.prepare(
      `INSERT INTO yogis
        (unique_id, group_id, level, seq_no, reg_date, name, age, phone, address, introducer, email, gender, status, status_date, posted, created_by, created_at, updated_at)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(seq_no),0)+1 FROM yogis WHERE level=?), ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, 0, ?, ?, ?)`
    ).bind(
      uniqueId, row.group_id, nextLevel, nextLevel, postDate, row.name,
      row.age, row.phone, row.address, row.introducer, row.email, row.gender,
      postDate, session.u, now, now
    ),
    db.prepare("UPDATE yogis SET posted=1, updated_at=? WHERE id=?").bind(now, id)
  ]);

  return { success: true, message: `${levelName(nextLevel)} စာရင်းသို့ Auto ရောက်ရှိသွားပါပြီ။`, uniqueId };
}

async function handleImportYogi(db, payload, session) {
  const level = Number(payload.level || 1);
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  if (!rows.length) return { success: false, message: "Import လုပ်ရန် ဒေတာ မတွေ့ပါ။" };

  const now = new Date().toISOString();
  let inserted = 0;
  const stmts = [];
  for (const r of rows) {
    const name = String(r.name || "").trim();
    if (!name) continue;
    const uniqueId = genId(`Y${level}`);
    const groupId = genId("G");
    const regDate = r.regDate || todayStr();
    stmts.push(
      db.prepare(
        `INSERT INTO yogis
          (unique_id, group_id, level, seq_no, reg_date, name, age, phone, address, introducer, email, gender, status, status_date, posted, created_by, created_at, updated_at)
         VALUES (?, ?, ?, (SELECT COALESCE(MAX(seq_no),0)+1 FROM yogis WHERE level=?), ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, 0, ?, ?, ?)`
      ).bind(
        uniqueId, groupId, level, level, regDate, name,
        r.age || "", r.phone || "", r.address || "", r.introducer || "",
        r.email || "", r.gender || "", regDate, session.u, now, now
      )
    );
    inserted++;
  }
  if (stmts.length) await db.batch(stmts);

  return { success: true, message: `${inserted} ဦး Import အောင်မြင်ပါသည်။`, count: inserted };
}

/* ------------------------------ Leaders CRUD ------------------------------ */

async function handleGetLeaderData(db, payload) {
  const page = Math.max(1, Number(payload.page || 1));
  const limit = Math.max(1, Math.min(200, Number(payload.limit || 25)));
  const offset = (page - 1) * limit;
  const search = String(payload.searchVal || "").trim();

  let where = "WHERE 1=1";
  const binds = [];
  if (search) {
    where += " AND (name LIKE ? OR phone LIKE ? OR address LIKE ? OR unique_id LIKE ?)";
    const s = `%${search}%`;
    binds.push(s, s, s, s);
  }

  const countRow = await db.prepare(`SELECT COUNT(*) as c FROM leaders ${where}`).bind(...binds).first();
  const aggRow = await db.prepare(
    `SELECT
       SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as activeTotal,
       SUM(CASE WHEN status='Active' AND gender='ကျား' THEN 1 ELSE 0 END) as activeMale,
       SUM(CASE WHEN status='Active' AND gender='မ' THEN 1 ELSE 0 END) as activeFemale
     FROM leaders ${where}`
  ).bind(...binds).first();

  const rowsRes = await db.prepare(
    `SELECT * FROM leaders ${where}
     ORDER BY (status='Active') DESC, COALESCE(status_date, created_at) DESC, id DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all();

  return {
    success: true,
    data: {
      rows: (rowsRes.results || []).map(toLeaderRow),
      total: (countRow && countRow.c) || 0,
      page, limit,
      activeTotal: (aggRow && aggRow.activeTotal) || 0,
      activeMale: (aggRow && aggRow.activeMale) || 0,
      activeFemale: (aggRow && aggRow.activeFemale) || 0
    }
  };
}

async function handleSaveLeader(db, payload, session) {
  const name = String(payload.name || "").trim();
  if (!name) return { success: false, message: "အမည် ဖြည့်သွင်းရန် လိုအပ်ပါသည်။" };

  const uniqueId = genId("L");
  const regDate = payload.regDate || todayStr();
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO leaders
      (unique_id, seq_no, reg_date, name, age, phone, address, email, gender, status, status_date, created_by, created_at, updated_at)
     VALUES (?, (SELECT COALESCE(MAX(seq_no),0)+1 FROM leaders), ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?)`
  ).bind(
    uniqueId, regDate, name, payload.age || "", payload.phone || "",
    payload.address || "", payload.email || "", payload.gender || "",
    regDate, session.u, now, now
  ).run();

  return { success: true, message: "ဦးဆောင်ဆွေးနွေးယောဂီ အောင်မြင်စွာ သွင်းပြီးပါပြီ။", uniqueId };
}

async function handleUpdateLeader(db, payload) {
  const id = Number(payload.id);
  if (!id) return { success: false, message: "ID မတွေ့ပါ။" };
  await db.prepare(
    `UPDATE leaders SET name=?, age=?, phone=?, address=?, email=?, gender=?, reg_date=?, updated_at=? WHERE id=?`
  ).bind(
    payload.name || "", payload.age || "", payload.phone || "", payload.address || "",
    payload.email || "", payload.gender || "", payload.regDate || todayStr(),
    new Date().toISOString(), id
  ).run();
  return { success: true, message: "စာရင်း ပြင်ဆင်ပြီးပါပြီ။" };
}

async function handleDeleteLeader(db, payload) {
  const id = Number(payload.id);
  if (!id) return { success: false, message: "ID မတွေ့ပါ။" };
  await db.prepare("DELETE FROM leaders WHERE id=?").bind(id).run();
  return { success: true, message: "စာရင်း ဖျက်ပြီးပါပြီ။" };
}

async function handleToggleLeaderStatus(db, payload) {
  const id = Number(payload.id);
  if (!id) return { success: false, message: "ID မတွေ့ပါ။" };
  const row = await db.prepare("SELECT * FROM leaders WHERE id=?").bind(id).first();
  if (!row) return { success: false, message: "စာရင်း မတွေ့ပါ။" };
  const newStatus = row.status === "Active" ? "Inactive" : "Active";
  await db.prepare("UPDATE leaders SET status=?, status_date=?, updated_at=? WHERE id=?")
    .bind(newStatus, todayStr(), new Date().toISOString(), id).run();
  return { success: true, message: `Status → ${newStatus}`, status: newStatus };
}

async function handleImportLeader(db, payload, session) {
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  if (!rows.length) return { success: false, message: "Import လုပ်ရန် ဒေတာ မတွေ့ပါ။" };
  const now = new Date().toISOString();
  const stmts = [];
  let inserted = 0;
  for (const r of rows) {
    const name = String(r.name || "").trim();
    if (!name) continue;
    const uniqueId = genId("L");
    const regDate = r.regDate || todayStr();
    stmts.push(
      db.prepare(
        `INSERT INTO leaders
          (unique_id, seq_no, reg_date, name, age, phone, address, email, gender, status, status_date, created_by, created_at, updated_at)
         VALUES (?, (SELECT COALESCE(MAX(seq_no),0)+1 FROM leaders), ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?)`
      ).bind(uniqueId, regDate, name, r.age || "", r.phone || "", r.address || "", r.email || "", r.gender || "", regDate, session.u, now, now)
    );
    inserted++;
  }
  if (stmts.length) await db.batch(stmts);
  return { success: true, message: `${inserted} ဦး Import အောင်မြင်ပါသည်။`, count: inserted };
}

/* --------------------------- Total (rollup) list --------------------------- */

async function handleGetTotalListData(db) {
  const out = [];
  for (const l of LEVELS) {
    const res = await db.prepare(
      `SELECT id, unique_id, name, age, gender, phone, reg_date, status
       FROM yogis WHERE level=? AND status='Active' ORDER BY id DESC`
    ).bind(l.id).all();
    out.push({ level: l.id, name: l.name, rows: (res.results || []) });
  }

  const leadersRes = await db.prepare(
    `SELECT id, unique_id, name, age, gender, phone, reg_date, status
     FROM leaders WHERE status='Active' ORDER BY id DESC`
  ).all();
  out.push({ level: 8, name: "ဦးဆောင်ဆွေးနွေး ယောဂီ", rows: (leadersRes.results || []) });

  return { success: true, data: out };
}

/* --------------------------------- Router --------------------------------- */

const PUBLIC_ACTIONS = new Set(["checkLogin", "ping"]);

async function routeAction(action, payload, env, session) {
  const db = env.DB;

  switch (action) {
    case "ping":
      return { success: true, message: "pong" };

    case "checkLogin":
      return handleCheckLogin(db, payload, env);

    case "getDashboardData":
      return handleGetDashboardData(db);

    case "getYogiData":
      return handleGetYogiData(db, payload);

    case "saveYogi":
      return handleSaveYogi(db, payload, session);

    case "updateYogi":
      return handleUpdateYogi(db, payload);

    case "deleteYogi":
      return handleDeleteYogi(db, payload);

    case "toggleYogiStatus":
      return handleToggleYogiStatus(db, payload);

    case "postYogi":
      return handlePostYogi(db, payload, session);

    case "importYogi":
      return handleImportYogi(db, payload, session);

    case "getTotalListData":
      return handleGetTotalListData(db);

    case "getLeaderData":
      return handleGetLeaderData(db, payload);

    case "saveLeader":
      return handleSaveLeader(db, payload, session);

    case "updateLeader":
      return handleUpdateLeader(db, payload);

    case "deleteLeader":
      return handleDeleteLeader(db, payload);

    case "toggleLeaderStatus":
      return handleToggleLeaderStatus(db, payload);

    case "importLeader":
      return handleImportLeader(db, payload, session);

    default:
      return { success: false, message: `Unknown action: ${action}` };
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (!env.DB) {
      return json({ success: false, message: "D1 database binding (DB) is not configured on this worker." }, 500);
    }

    let action = "";
    let payload = {};

    try {
      if (request.method === "GET") {
        const url = new URL(request.url);
        action = url.searchParams.get("action") || "";
        payload = Object.fromEntries(url.searchParams.entries());
      } else {
        const body = await request.json().catch(() => ({}));
        action = body.action || "";
        payload = body;
      }
    } catch (e) {
      return json({ success: false, message: "Invalid request payload." }, 400);
    }

    if (!action) {
      return json({ success: true, message: "Yogi Management System API is running." });
    }

    let session = null;
    if (!PUBLIC_ACTIONS.has(action)) {
      session = await requireAuth(request, env);
      if (!session) {
        return json({ success: false, message: "Session expired or unauthorized." }, 401);
      }
    }

    try {
      const result = await routeAction(action, payload, env, session);
      return json(result);
    } catch (err) {
      console.error(`[Worker Error] action=${action}`, err);
      return json({ success: false, message: "Server error: " + (err && err.message ? err.message : String(err)) }, 500);
    }
  }
};
