-- =====================================================================
--  YOGI MANAGEMENT SYSTEM (Zoom ပဋ္ဌာန်း မိသားစု) — Cloudflare D1 Schema
--  Deploy with: wrangler d1 execute yogi --remote --file=./schema.sql
-- =====================================================================

-- 1) Login users (Admin + 10 Dhamma servants = 11 total)
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- SHA-256 hex of the password
  display_name  TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- 2) Kammatthana (meditation stage) yogi records — levels 1..7
--    Every time a yogi is "Post"-ed, a NEW row is created at level+1,
--    keeping the same group_id so the person can be tracked across
--    every stage, while the original-level row remains as history.
CREATE TABLE IF NOT EXISTS yogis (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  unique_id     TEXT UNIQUE NOT NULL,   -- UNIQUEID shown in the table
  group_id      TEXT NOT NULL,          -- same value across a person's levels
  level         INTEGER NOT NULL,       -- 1..7
  seq_no        INTEGER,                -- စဉ် (display order within level)
  reg_date      TEXT,                   -- ရက်စွဲ
  name          TEXT NOT NULL,          -- အမည်
  age           TEXT,                   -- အသက်
  phone         TEXT,                   -- ဖုန်းနံပါတ်
  address       TEXT,                   -- နေရပ်လိပ်စာ
  introducer    TEXT,                   -- မိတ်ဆက်ယောဂီ
  email         TEXT,                   -- EMAIL
  gender        TEXT,                   -- GENDER (ကျား/မ)
  status        TEXT NOT NULL DEFAULT 'Active',  -- Active / Inactive
  status_date   TEXT,                   -- last Active/Inactive click date
  posted        INTEGER NOT NULL DEFAULT 0,      -- 1 once "Post" has been used
  created_by    TEXT,                   -- CREATED BY
  created_at    TEXT DEFAULT (datetime('now')),  -- CREATED AT
  updated_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_yogis_level   ON yogis(level);
CREATE INDEX IF NOT EXISTS idx_yogis_status  ON yogis(status);
CREATE INDEX IF NOT EXISTS idx_yogis_group   ON yogis(group_id);

-- 3) Lead-discussion yogis (ဦးဆောင်ဆွေးနွေး ယောဂီ) — independent list
CREATE TABLE IF NOT EXISTS leaders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  unique_id     TEXT UNIQUE NOT NULL,
  seq_no        INTEGER,
  reg_date      TEXT,
  name          TEXT NOT NULL,
  age           TEXT,
  phone         TEXT,
  address       TEXT,
  email         TEXT,
  gender        TEXT,
  status        TEXT NOT NULL DEFAULT 'Active',
  status_date   TEXT,
  created_by    TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_leaders_status ON leaders(status);

-- =====================================================================
-- Seed the 11 login accounts.
-- Default passwords (please change after first login):
--   Admin              -> Admin@2026
--   ဓမ္မဝန်ဆောင် ၁       -> Yogi@12026
--   ဓမ္မဝန်ဆောင် ၂       -> Yogi@22026
--   ဓမ္မဝန်ဆောင် ၃       -> Yogi@32026
--   ဓမ္မဝန်ဆောင် ၄       -> Yogi@42026
--   ဓမ္မဝန်ဆောင် ၅       -> Yogi@52026
--   ဓမ္မဝန်ဆောင် ၆       -> Yogi@62026
--   ဓမ္မဝန်ဆောင် ၇       -> Yogi@72026
--   ဓမ္မဝန်ဆောင် ၈       -> Yogi@82026
--   ဓမ္မဝန်ဆောင် ၉       -> Yogi@92026
--   ဓမ္မဝန်ဆောင် ၁၀      -> Yogi@102026
-- =====================================================================
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("Admin", "a36aef5a11c4073fbe60314fc9df530a9d5f986533594d1f5190742ff9e0e408", "Admin");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၁", "45e8fd7c0ec6cdfd5feb3a497bd519238e137cb399730ede13eb041a4997ea98", "ဓမ္မဝန်ဆောင် ၁");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၂", "37a560e02a06ddf6bdf4d2c99480281a35c22efb6300ceab126b4a251af7907b", "ဓမ္မဝန်ဆောင် ၂");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၃", "43fb0904586f58bfa8276f2dce3a3137a896f87d7cbc60778c720d926813f1e2", "ဓမ္မဝန်ဆောင် ၃");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၄", "555469fd3e962f90eb86dc19343cf8c33ab36a39105cb0374ad2fd025e8134e0", "ဓမ္မဝန်ဆောင် ၄");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၅", "b9b0376f7511c0118cff6eef8a5d9e197b73eb5015fe5cedffa71590ead68b2b", "ဓမ္မဝန်ဆောင် ၅");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၆", "947f7b23e9fa88a3578b3cab08650e8b1d09a53a3a43c7fbdde4531a7ad2c63d", "ဓမ္မဝန်ဆောင် ၆");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၇", "f19f6e8a871840b878b605593ab85e329c6ec5059b1ee338361e33a6047781f5", "ဓမ္မဝန်ဆောင် ၇");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၈", "4568d538a38943f6e39879526f2593eaa015ba42911c58a48cedd710214a5126", "ဓမ္မဝန်ဆောင် ၈");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၉", "da56d5400b7deda332c80a3dba135d7503daacce0ff51088a68d89ed59bec6cc", "ဓမ္မဝန်ဆောင် ၉");
INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES ("ဓမ္မဝန်ဆောင် ၁၀", "4b92c130572b2abad9b8fbd52c36c1c391854ee580ef1baf10a9a9a5141570cd", "ဓမ္မဝန်ဆောင် ၁၀");
