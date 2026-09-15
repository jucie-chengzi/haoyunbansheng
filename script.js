/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 1 部分 / 共 9 部分                                ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-01]  初始预设值 + 通用工具                      ║
   ║   [JS-01A] 数据版本 + 迁移中心                       ║
   ║   [JS-01B] localStorage 存储层                        ║
   ║   [JS-01C] 单位系统                                   ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-01] 初始预设值 + 通用工具 ══════════ */
const INITIAL_VALUES = {
  identity: '画师',
  artist: '',
  platform: 'QQ',
  orderDate: '',
  scheduleDate: '',
  workDays: '',
  deadline: '',
  client: '',
  project: '',
  attribute: '',
  character: '',
  depositMode: 'percent',
  deposit: '20',
};

function fmt(n) { return "¥" + Number(n || 0).toFixed(2); }
function num2(n) { return Number(n || 0).toFixed(2); }
function pct(n) { return num2(n) + '%'; }

function trimNum(n) {
  const s = Number(n || 0).toFixed(2);
  return s.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}
function pctShort(n) { return trimNum(n) + '%'; }

function escapeHtml(s) {
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
function escapeAttr(s) { return escapeHtml(s); }
function $(id) { return document.getElementById(id); }

function opLabel(op) { return op === 'multiply' ? '×' : '＋'; }
function opSymbol(op) { return op === 'multiply' ? '×' : '＋'; }
function discOpLabel(op) { return op === 'multiply' ? '×' : '−'; }
function discOpSymbol(op) { return op === 'multiply' ? '×' : '−'; }

function randomTwoDigit() {
  const n = Math.floor(Math.random() * 99) + 1;
  return String(n).padStart(2, '0');
}
function makeOrderNo(orderDate) {
  const ymd = orderDate ? String(orderDate).replace(/-/g, '') : '——';
  return 'NO.' + ymd + randomTwoDigit();
}

function makeUniqueId(prefix) {
  return (prefix || 'id') + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function fmtDateStr(d) {
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}

function normalizeContactType(t) {
  const s = String(t || '').trim().toUpperCase();
  if (s === 'VX' || s === 'WX' || s === 'WECHAT' || s === '微信') return 'VX';
  return 'QQ';
}
function formatContactFull(type, account) {
  const t = normalizeContactType(type);
  const a = String(account || '').trim();
  if (!a) return '';
  return t + '：' + a;
}

function setFieldError(id, hasError) {
  const el = $(id);
  if (!el) return;
  if (hasError) el.classList.add('field-error');
  else el.classList.remove('field-error');
}
function clearAllFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
}

function showSimpleAlert(title, message) {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>${escapeHtml(title || '提示')}</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.7;">${message}</p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">确定</button>
          </div>
        </div>
      </div>
    </div>`;
}

function closeModal() { $('modalRoot').innerHTML = ''; }

/* ---------- 页面切换 + 导航高亮 ---------- */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.dataset.page === id) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const orderPages = ['pageTodo', 'pageCompleted', 'pageCancelled', 'pageDiscarded'];
  if (orderPages.indexOf(id) > -1) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.page === 'pageTodo') btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  /* 无导航项的页面：保持首页高亮 */
  if (id === 'pageTicketFolder' || id === 'pagePriceList' || id === 'pageMemo'
      || id === 'pageUserManual' || id === 'pageAnnouncementHistory') {
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.page === 'pageMain') btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  const rp = $('receiptPanel');
  if (rp) rp.classList.add('hidden');

  const layout = $('receiptLayout');
  if (layout) layout.classList.remove('settings-open');

  if (id === 'pageSchedule' && typeof renderSchedule === 'function') renderSchedule();
  if (id === 'pageStats' && typeof renderStatsPage === 'function') renderStatsPage();
  if (id === 'pageTodo' && typeof renderTodoList === 'function') renderTodoList();
  if (id === 'pageCompleted' && typeof renderCompletedList === 'function') renderCompletedList();
  if (id === 'pageCancelled' && typeof renderCancelledList === 'function') renderCancelledList();
  if (id === 'pageDiscarded' && typeof renderDiscardedList === 'function') renderDiscardedList();
  if (id === 'pageMaster' && typeof renderMasterList === 'function') renderMasterList();
  if (id === 'pageTicketFolder' && typeof renderTicketFolder === 'function') renderTicketFolder();
  if (id === 'pageMemo' && typeof renderMemoList === 'function') renderMemoList();
  if (id === 'pageUserManual' && typeof renderUserManual === 'function') renderUserManual();
  if (id === 'pageAnnouncementHistory' && typeof renderAnnouncementHistory === 'function') renderAnnouncementHistory();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getLicenseMultiplier(licenseId) {
  const perms = getPermissions();
  const p = perms.find(x => x.id === licenseId);
  return p ? Number(p.rate) || 1 : 1;
}
function licenseText(licenseId) {
  const perms = getPermissions();
  const p = perms.find(x => x.id === licenseId);
  if (!p) return '—';
  return p.name + ' ×' + num2(p.rate);
}

document.addEventListener('focusout', function (e) {
  const el = e.target;
  if (!el || el.tagName !== 'INPUT') return;
  if (el.type !== 'number') return;
  if (el.classList.contains('item-qty') || el.classList.contains('sub-qty')) return;
  const v = el.value;
  if (v === '' || v === null || v === undefined) return;
  const n = Number(v);
  if (!isFinite(n)) return;
  el.value = n.toFixed(2);
});


/* ══════════ [JS-01A] 数据版本 + 迁移中心 ══════════ */

const SCHEMA_VERSION = 3;
const SCHEMA_VERSION_KEY = 'listReceiptSchemaVersion';
const MIGRATION_LOG_KEY = 'listReceiptMigrationLog';
const MIGRATION_LOG_MAX = 20;

/* 应用版本号（用于更新公告） */
const APP_VERSION = '1.0.2';
const ANNOUNCEMENT_SEEN_KEY = 'listReceiptAnnouncementSeen';

/* IndexedDB 常量 */
const IDB_NAME = 'listReceiptFiles';
const IDB_VERSION = 1;
const IDB_STORE_FILES = 'files';

function getSchemaVersion() {
  const raw = localStorage.getItem(SCHEMA_VERSION_KEY);
  const v = parseInt(raw, 10);
  if (isNaN(v) || v < 0) return 0;
  return v;
}
function setSchemaVersion(v) {
  localStorage.setItem(SCHEMA_VERSION_KEY, String(v));
}

function appendMigrationLog(entry) {
  try {
    const list = JSON.parse(localStorage.getItem(MIGRATION_LOG_KEY)) || [];
    list.push(Object.assign({ at: Date.now() }, entry));
    while (list.length > MIGRATION_LOG_MAX) list.shift();
    localStorage.setItem(MIGRATION_LOG_KEY, JSON.stringify(list));
  } catch (e) {}
}
function getMigrationLog() {
  try { return JSON.parse(localStorage.getItem(MIGRATION_LOG_KEY)) || []; }
  catch (e) { return []; }
}

const MIGRATIONS = {

  1: function migrateToV1(ctx) {
    const todos = getTodos();
    let touchedTodos = 0;

    todos.forEach(t => {
      let changed = false;

      const cid = String(t.clientId || '').trim();
      if (t.clientId !== cid) { t.clientId = cid; changed = true; }

      const cname = String(t.clientName || '').trim() || cid || '未命名';
      if (t.clientName !== cname) { t.clientName = cname; changed = true; }

      const plat = String(t.platform || '').trim();
      if (t.platform !== plat) { t.platform = plat; changed = true; }

      const ct = String(t.contact || '').trim();
      if (t.contact !== ct) { t.contact = ct; changed = true; }

      if (!t.contactType) { t.contactType = 'QQ'; changed = true; }
      if (!t.status) { t.status = 'active'; changed = true; }
      if (!t.createdAt) { t.createdAt = Date.now(); changed = true; }
      if (!t.updatedAt) { t.updatedAt = t.createdAt; changed = true; }

      ['payable', 'prepaid', 'originalFinal', 'pendingAmount'].forEach(k => {
        if (typeof t[k] !== 'number' || !isFinite(t[k])) {
          t[k] = Number(t[k]) || 0;
          changed = true;
        }
      });

      if (!Array.isArray(t.items)) { t.items = []; changed = true; }
      if (!Array.isArray(t.materials)) { t.materials = []; changed = true; }
      if (!Array.isArray(t.requirements)) { t.requirements = []; changed = true; }

      if (changed) touchedTodos++;
    });

    if (touchedTodos > 0) setTodos(todos);
    ctx.report.push('待办订单规范化：' + touchedTodos + ' 条被更新');
  },

  2: function migrateToV2(ctx) {
    let changed = false;
    try {
      const raw = localStorage.getItem(RECEIPT_SETTINGS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          if (Array.isArray(s.stickers)) {
            ctx.report.push('小票设置已是 v2 结构，跳过');
          } else {
            const arr = [];
            if (s.stickerImg) {
              arr.push({
                id: makeUniqueId('sticker'),
                img: s.stickerImg,
                state: s.stickerImgState || { w: 0, h: 0, l: 0, t: 0, baseW: 0 },
              });
            }
            s.stickers = arr;
            localStorage.setItem(RECEIPT_SETTINGS_KEY, JSON.stringify(s));
            changed = true;
            ctx.report.push('小票设置：贴纸结构升级到数组（共 ' + arr.length + ' 张）');
          }
        }
      }
    } catch (e) {
      ctx.report.push('小票设置升级出错：' + (e && e.message ? e.message : '未知'));
    }
    if (!changed) ctx.report.push('小票设置无需升级');
  },

  3: function migrateToV3(ctx) {
    ctx.report.push('v3：图片迁移由 ImageStore 异步执行');
  },
};

function createMigrationContext() {
  return { report: [], counts: {}, startedAt: Date.now() };
}

function backupAllDataBeforeRepair() {
  const data = {
    __meta: {
      app: '专属结单助手',
      kind: 'pre-repair-backup',
      schemaVersion: getSchemaVersion(),
      exportedAt: new Date().toISOString(),
    },
  };
  const keys = [
    PLATFORM_PRESET_KEY, PLATFORM_DEFAULT_KEY,
    IDENTITY_PRESET_KEY, IDENTITY_DEFAULT_KEY,
    PERMISSION_PRESET_KEY, DEPOSIT_PRESET_KEY,
    PRESET_KEY, PRESET_GROUP_KEY,
    EXTRA_PRESET_KEY, DISCOUNT_PRESET_KEY,
    RECEIPT_SETTINGS_KEY, RECEIPT_PRESET_LIST_KEY,
    TODO_KEY, RECORD_KEY, FLOW_KEY,
    COMPLETED_KEY, CANCELLED_KEY, DISCARDED_KEY,
    MASTER_OVERRIDE_KEY, MASTER_MANUAL_KEY, MASTER_HIDDEN_KEY,
    MEMO_KEY, ANNOUNCEMENT_SEEN_KEY,
  ];
  keys.forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try { data[key] = JSON.parse(raw); }
      catch (e) { data[key] = raw; }
    }
  });
  return JSON.stringify(data, null, 2);
}


/* ══════════ [JS-01B] localStorage 存储层 ══════════ */

/* ---- 平台预设 ---- */
const PLATFORM_PRESET_KEY  = 'listReceiptPlatforms';
const PLATFORM_DEFAULT_KEY = 'listReceiptDefaultPlatform';
const DEFAULT_PLATFORMS = ['小红书', 'QQ', '微信', '微博', '抖音', '画加', '米画师'];

function getPlatforms() {
  try {
    const stored = JSON.parse(localStorage.getItem(PLATFORM_PRESET_KEY));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch(e) {}
  return DEFAULT_PLATFORMS.slice();
}
function setPlatforms(arr) {
  localStorage.setItem(PLATFORM_PRESET_KEY, JSON.stringify(arr));
}
function getPlatformsClean() {
  return getPlatforms().map(x => String(x || '').trim()).filter(x => x !== '');
}
function getDefaultPlatform() {
  const list = getPlatformsClean();
  const def = localStorage.getItem(PLATFORM_DEFAULT_KEY) || '';
  if (list.indexOf(def) > -1) return def;
  return '小红书';
}
function setDefaultPlatform(name) {
  localStorage.setItem(PLATFORM_DEFAULT_KEY, name);
}

/* ---- 身份预设 ---- */
const IDENTITY_PRESET_KEY  = 'listReceiptIdentityPresets';
const IDENTITY_DEFAULT_KEY = 'listReceiptDefaultIdentity';
const DEFAULT_IDENTITIES = ['画师', '美工'];

function getIdentities() {
  try {
    const stored = JSON.parse(localStorage.getItem(IDENTITY_PRESET_KEY));
    if (Array.isArray(stored) && stored.length) {
      return stored.map(x => String(x || '').trim()).filter(x => x);
    }
  } catch(e) {}
  return DEFAULT_IDENTITIES.slice();
}
function setIdentities(arr) {
  const clean = (arr || []).map(x => String(x || '').trim()).filter(x => x);
  localStorage.setItem(IDENTITY_PRESET_KEY, JSON.stringify(clean));
}
function getDefaultIdentity() {
  const list = getIdentities();
  const def = localStorage.getItem(IDENTITY_DEFAULT_KEY) || '';
  if (list.indexOf(def) > -1) return def;
  return list[0] || '画师';
}
function setDefaultIdentity(name) {
  localStorage.setItem(IDENTITY_DEFAULT_KEY, String(name || ''));
}

/* ---- 权限预设 ---- */
const PERMISSION_PRESET_KEY = 'listReceiptPermissionPresets';
const DEFAULT_PERMISSIONS = [
  { id: 'personal',   name: '自用', rate: 1 },
  { id: 'commercial', name: '商用', rate: 2 },
  { id: 'buyout',     name: '买断', rate: 3 },
];
function getPermissions() {
  try {
    const stored = JSON.parse(localStorage.getItem(PERMISSION_PRESET_KEY));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch(e) {}
  return DEFAULT_PERMISSIONS.map(p => ({ ...p }));
}
function setPermissions(arr) {
  localStorage.setItem(PERMISSION_PRESET_KEY, JSON.stringify(arr));
}

/* ---- 定金预设 ---- */
const DEPOSIT_PRESET_KEY = 'listReceiptDepositPreset';
function getDepositPreset() {
  try {
    const stored = JSON.parse(localStorage.getItem(DEPOSIT_PRESET_KEY));
    if (stored && stored.mode) return stored;
  } catch(e) {}
  return { mode: 'percent', value: 20 };
}
function setDepositPreset(obj) {
  localStorage.setItem(DEPOSIT_PRESET_KEY, JSON.stringify(obj));
}

/* ---- 订单（待）数据 key ---- */
const TODO_KEY = 'listReceiptTodoList';

/* ---- 单主覆盖数据 key ---- */
const MASTER_OVERRIDE_KEY = 'listReceiptMasterOverrides';

function getMasterOverrides() {
  try {
    const stored = JSON.parse(localStorage.getItem(MASTER_OVERRIDE_KEY));
    if (stored && typeof stored === 'object') return stored;
  } catch(e) {}
  return {};
}
function setMasterOverrides(obj) {
  try {
    localStorage.setItem(MASTER_OVERRIDE_KEY, JSON.stringify(obj));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function getMasterOverride(clientId) {
  if (!clientId) return null;
  const all = getMasterOverrides();
  return all[clientId] || null;
}
function setMasterOverride(clientId, patch) {
  if (!clientId) return false;
  const all = getMasterOverrides();
  all[clientId] = Object.assign({}, all[clientId] || {}, patch, {
    updatedAt: Date.now(),
  });
  return setMasterOverrides(all);
}
function deleteMasterOverride(clientId) {
  if (!clientId) return;
  const all = getMasterOverrides();
  if (all[clientId]) {
    delete all[clientId];
    setMasterOverrides(all);
  }
}

/* ---- 手动添加的单主 key ---- */
const MASTER_MANUAL_KEY = 'listReceiptMasterManual';

function getManualMasters() {
  try {
    const stored = JSON.parse(localStorage.getItem(MASTER_MANUAL_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setManualMasters(arr) {
  try {
    localStorage.setItem(MASTER_MANUAL_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function getManualMasterById(clientId) {
  if (!clientId) return null;
  return getManualMasters().find(m => m.clientId === clientId) || null;
}
function addManualMaster(obj) {
  if (!obj || !obj.clientId) return null;
  const list = getManualMasters();
  const idx = list.findIndex(m => m.clientId === obj.clientId);
  const rec = Object.assign({
    clientId: obj.clientId,
    platform: obj.platform || '',
    contact: obj.contact || '',
    contactType: normalizeContactType(obj.contactType),
    note: obj.note || '',
    tags: obj.tags || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  if (idx >= 0) {
    list[idx] = Object.assign({}, list[idx], rec, { updatedAt: Date.now() });
  } else {
    list.push(rec);
  }
  if (!setManualMasters(list)) return null;
  return rec;
}
function updateManualMaster(clientId, patch) {
  if (!clientId) return false;
  const list = getManualMasters();
  const idx = list.findIndex(m => m.clientId === clientId);
  if (idx < 0) return false;
  list[idx] = Object.assign({}, list[idx], patch, { updatedAt: Date.now() });
  return setManualMasters(list);
}
function deleteManualMaster(clientId) {
  if (!clientId) return;
  const list = getManualMasters().filter(m => m.clientId !== clientId);
  setManualMasters(list);
}

/* ---- 单主隐藏列表 ---- */
const MASTER_HIDDEN_KEY = 'listReceiptMasterHidden';

function getMasterHidden() {
  try {
    const arr = JSON.parse(localStorage.getItem(MASTER_HIDDEN_KEY));
    if (Array.isArray(arr)) return arr;
  } catch(e) {}
  return [];
}
function setMasterHidden(arr) {
  try {
    localStorage.setItem(MASTER_HIDDEN_KEY, JSON.stringify(arr || []));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function isMasterHidden(key) {
  if (!key) return false;
  return getMasterHidden().indexOf(key) > -1;
}
function hideMaster(key) {
  if (!key) return;
  const arr = getMasterHidden();
  if (arr.indexOf(key) === -1) {
    arr.push(key);
    setMasterHidden(arr);
  }
}
function unhideMaster(key) {
  if (!key) return;
  const arr = getMasterHidden().filter(k => k !== key);
  setMasterHidden(arr);
}

/* ---- 小票设置预设 ---- */
const RECEIPT_PRESET_LIST_KEY = 'listReceiptPresetList';
const MAX_RECEIPT_PRESETS = 5;

function getReceiptPresetList() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECEIPT_PRESET_LIST_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setReceiptPresetList(arr) {
  try {
    localStorage.setItem(RECEIPT_PRESET_LIST_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    const isQuota = e && (e.name === 'QuotaExceededError'
                       || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
                       || e.code === 22);
    if (isQuota) {
      alert('保存失败：浏览器存储空间已满，请清理一些图片或预设后重试。');
    } else {
      alert('保存失败：' + (e && e.message ? e.message : '未知错误'));
    }
    return false;
  }
}
function makeReceiptPresetId() {
  return 'rp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function nextReceiptPresetName() {
  const list = getReceiptPresetList();
  const used = {};
  list.forEach(p => { used[p.name] = true; });
  let i = 1;
  while (used['模板' + i]) i++;
  return '模板' + i;
}

/* ---- 旧记账数据 ---- */
const RECORD_KEY = 'listReceiptRecords';
function getRecords() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECORD_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setRecords(arr) {
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function makeRecordId() {
  return 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/* ---- 流水数据 ---- */
const FLOW_KEY = 'listReceiptFlows';
function getFlows() {
  try {
    const stored = JSON.parse(localStorage.getItem(FLOW_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setFlows(arr) {
  try {
    localStorage.setItem(FLOW_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function makeFlowId() {
  return 'flow_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function addFlow(type, amount, note, date, opt) {
  const amt = Number(amount) || 0;
  if (!type) return null;
  if (!isFinite(amt) || amt < 0) return null;

  opt = opt || {};
  const flows = getFlows();
  const flow = {
    id: makeFlowId(),
    type: type,
    amount: amt,
    note: note || '',
    date: date || fmtDateStr(new Date()),
    todoId: opt.todoId || '',
    completedId: opt.completedId || '',
    cancelledId: opt.cancelledId || '',
    discardedId: opt.discardedId || '',
    createdAt: Date.now(),
  };
  flows.push(flow);
  if (!setFlows(flows)) return null;
  return flow;
}
function removeFlowsByTodoId(todoId) {
  if (!todoId) return;
  const flows = getFlows().filter(f => f.todoId !== todoId);
  setFlows(flows);
}
function removeFlowsByTodoIdAndType(todoId, type) {
  if (!todoId || !type) return;
  const flows = getFlows().filter(f => !(f.todoId === todoId && f.type === type));
  setFlows(flows);
}

/* ---- 结单记录 ---- */
const COMPLETED_KEY = 'listReceiptCompleted';
function getCompleted() {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPLETED_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setCompleted(arr) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function makeCompletedId() {
  return 'done_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function addCompleted(obj) {
  if (!obj) return null;
  const list = getCompleted();
  const rec = Object.assign({
    id: makeCompletedId(),
    createdAt: Date.now(),
  }, obj);
  list.push(rec);
  if (!setCompleted(list)) return null;
  return rec;
}
function getCompletedById(id) {
  return getCompleted().find(x => x.id === id) || null;
}

/* ---- 撤单记录 ---- */
const CANCELLED_KEY = 'listReceiptCancelled';
function getCancelled() {
  try {
    const stored = JSON.parse(localStorage.getItem(CANCELLED_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setCancelled(arr) {
  try {
    localStorage.setItem(CANCELLED_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function makeCancelledId() {
  return 'cancel_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function addCancelled(obj) {
  if (!obj) return null;
  const list = getCancelled();
  const rec = Object.assign({
    id: makeCancelledId(),
    createdAt: Date.now(),
  }, obj);
  list.push(rec);
  if (!setCancelled(list)) return null;
  return rec;
}
function getCancelledById(id) {
  return getCancelled().find(x => x.id === id) || null;
}

/* ---- 废稿记录 ---- */
const DISCARDED_KEY = 'listReceiptDiscarded';
function getDiscarded() {
  try {
    const stored = JSON.parse(localStorage.getItem(DISCARDED_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setDiscarded(arr) {
  try {
    localStorage.setItem(DISCARDED_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function makeDiscardedId() {
  return 'discard_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function addDiscarded(obj) {
  if (!obj) return null;
  const list = getDiscarded();
  const rec = Object.assign({
    id: makeDiscardedId(),
    createdAt: Date.now(),
  }, obj);
  list.push(rec);
  if (!setDiscarded(list)) return null;
  return rec;
}
function getDiscardedById(id) {
  return getDiscarded().find(x => x.id === id) || null;
}

/* ---- 备忘录 ---- */
const MEMO_KEY = 'listReceiptMemos';

function getMemos() {
  try {
    const stored = JSON.parse(localStorage.getItem(MEMO_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setMemos(arr) {
  try {
    localStorage.setItem(MEMO_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function makeMemoId() {
  return 'memo_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}


/* ══════════ [JS-01C] 单位系统 ══════════ */
function unitDirectionByOp(op) {
  return (op === 'multiply') ? 'suffix' : 'prefix';
}
function unitTextByOp(op) {
  return (op === 'multiply') ? '%' : '¥';
}

function setInputUnit(input, unit, direction) {
  if (!input) return;
  const wrap = input.closest('.input-unit-wrap');
  if (!wrap) return;

  wrap.querySelectorAll(':scope > .input-unit').forEach(el => el.remove());

  wrap.classList.toggle('prefix', direction === 'prefix');
  wrap.classList.toggle('suffix', direction !== 'prefix');

  const tag = document.createElement('span');
  tag.className = 'input-unit';
  tag.textContent = unit;

  if (direction === 'prefix') input.before(tag);
  else                        input.after(tag);
}

function applyUnitForInput(input, op) {
  if (!input) return;
  setInputUnit(input, unitTextByOp(op), unitDirectionByOp(op));
}

function unitByOp(op) { return unitTextByOp(op); }

function updateDepositUnit() {
  const mode = $('depositMode') ? $('depositMode').value : 'percent';
  const input = $('deposit');
  if (!input) return;
  if (mode === 'percent') setInputUnit(input, '%', 'suffix');
  else                    setInputUnit(input, '¥', 'prefix');
}
function updateSetDepositUnit() {
  const mode = $('setDepositMode') ? $('setDepositMode').value : 'percent';
  const input = $('setDeposit');
  if (!input) return;
  if (mode === 'percent') setInputUnit(input, '%', 'suffix');
  else                    setInputUnit(input, '¥', 'prefix');
}
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 2 部分 / 共 9 部分                                ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-02]  IndexedDB 封装                             ║
   ║   [JS-02B] 图片 Blob 存取 API + objectURL 管理        ║
   ║   [JS-02C] 存储配额查询 + 持久化申请                  ║
   ║   [JS-01D] 首页工具箱 / 联系我们                      ║
   ║   [JS-01E] 价目表占位 + 备忘录（含执行日期）          ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-02] IndexedDB 封装 ══════════ */

let __idbPromise = null;
let __idbAvailable = true;
let __idbDegradedReason = '';

function isIDBAvailable() { return __idbAvailable; }
function getIDBDegradedReason() { return __idbDegradedReason; }

function openIDB() {
  if (__idbPromise) return __idbPromise;

  __idbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      __idbAvailable = false;
      __idbDegradedReason = '浏览器不支持 IndexedDB';
      reject(new Error(__idbDegradedReason));
      return;
    }

    let req;
    try {
      req = indexedDB.open(IDB_NAME, IDB_VERSION);
    } catch (e) {
      __idbAvailable = false;
      __idbDegradedReason = (e && e.message) || 'IndexedDB 打开异常';
      reject(e);
      return;
    }

    req.onupgradeneeded = function (ev) {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_FILES)) {
        db.createObjectStore(IDB_STORE_FILES, { keyPath: 'id' });
      }
    };

    req.onsuccess = function (ev) {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_FILES)) {
        try { db.close(); } catch (e) {}
        __idbAvailable = false;
        __idbDegradedReason = '数据库结构异常';
        reject(new Error(__idbDegradedReason));
        return;
      }
      resolve(db);
    };

    req.onerror = function (ev) {
      __idbAvailable = false;
      __idbDegradedReason = (ev.target.error && ev.target.error.message) || 'IndexedDB 打开失败';
      reject(ev.target.error || new Error(__idbDegradedReason));
    };

    req.onblocked = function () {
      console.warn('[IDB] open blocked：可能有其它标签页在使用');
    };
  });

  return __idbPromise;
}

function idbPutFile(record) {
  return openIDB().then(db => {
    return new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(IDB_STORE_FILES, 'readwrite'); }
      catch (e) { reject(e); return; }
      const store = tx.objectStore(IDB_STORE_FILES);
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error || new Error('IDB 写入失败'));
      tx.onerror = () => reject(tx.error || new Error('IDB 事务失败'));
      tx.onabort = () => reject(tx.error || new Error('IDB 事务中止'));
    });
  });
}

function idbGetFile(id) {
  if (!id) return Promise.resolve(null);
  return openIDB().then(db => {
    return new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(IDB_STORE_FILES, 'readonly'); }
      catch (e) { reject(e); return; }
      const store = tx.objectStore(IDB_STORE_FILES);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error('IDB 读取失败'));
    });
  });
}

function idbDeleteFile(id) {
  if (!id) return Promise.resolve(false);
  return openIDB().then(db => {
    return new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(IDB_STORE_FILES, 'readwrite'); }
      catch (e) { reject(e); return; }
      const store = tx.objectStore(IDB_STORE_FILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error || new Error('IDB 删除失败'));
    });
  });
}

function idbClearFiles() {
  return openIDB().then(db => {
    return new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(IDB_STORE_FILES, 'readwrite'); }
      catch (e) { reject(e); return; }
      const store = tx.objectStore(IDB_STORE_FILES);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error || new Error('IDB 清空失败'));
    });
  });
}

function idbListFileKeys() {
  return openIDB().then(db => {
    return new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(IDB_STORE_FILES, 'readonly'); }
      catch (e) { reject(e); return; }
      const store = tx.objectStore(IDB_STORE_FILES);
      const keys = [];
      const req = store.openKeyCursor();
      req.onsuccess = function (ev) {
        const cur = ev.target.result;
        if (cur) { keys.push(cur.key); cur.continue(); }
        else     { resolve(keys); }
      };
      req.onerror = () => reject(req.error || new Error('IDB 遍历失败'));
    });
  });
}


/* ══════════ [JS-02B] 图片 Blob 存取 API + objectURL 管理 ══════════ */

/* ---------- Blob ↔ dataURL 基础转换 ---------- */
function blobToDataURL(blob) {
  return new Promise(resolve => {
    if (!blob) { resolve(''); return; }
    try {
      const r = new FileReader();
      r.onload = () => resolve(r.result || '');
      r.onerror = () => resolve('');
      r.readAsDataURL(blob);
    } catch (e) { resolve(''); }
  });
}

function dataURLToBlob(dataUrl) {
  const s = String(dataUrl || '');
  const comma = s.indexOf(',');
  if (s.indexOf('data:') !== 0 || comma < 0) return null;

  const header = s.slice(5, comma);
  const base64 = s.slice(comma + 1);
  const mimeMatch = header.match(/^([^;]+)/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

  if (header.indexOf('base64') === -1) {
    try {
      const bytes = new Uint8Array(base64.length);
      for (let i = 0; i < base64.length; i++) bytes[i] = base64.charCodeAt(i) & 0xff;
      return new Blob([bytes], { type: mime });
    } catch (e) { return null; }
  }

  let binary;
  try { binary = atob(base64); }
  catch (e) { return null; }

  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}


/* ---------- objectURL 缓存 ---------- */
const __objectUrlCache = new Map();
const __objectUrlPending = new Map();

function getFileObjectURL(fileId) {
  if (!fileId) return Promise.resolve('');

  const s = String(fileId);
  if (s.indexOf('blob:') === 0 || s.indexOf('data:') === 0) {
    return Promise.resolve(s);
  }

  if (__objectUrlCache.has(fileId)) return Promise.resolve(__objectUrlCache.get(fileId));
  if (__objectUrlPending.has(fileId)) return __objectUrlPending.get(fileId);

  const p = idbGetFile(fileId).then(rec => {
    if (!rec || !rec.blob) {
      __objectUrlPending.delete(fileId);
      return '';
    }
    const url = URL.createObjectURL(rec.blob);
    __objectUrlCache.set(fileId, url);
    __objectUrlPending.delete(fileId);
    return url;
  }).catch(() => {
    __objectUrlPending.delete(fileId);
    return '';
  });

  __objectUrlPending.set(fileId, p);
  return p;
}

function releaseObjectURL(fileId) {
  if (!fileId) return;
  const url = __objectUrlCache.get(fileId);
  if (url) {
    try { URL.revokeObjectURL(url); } catch (e) {}
    __objectUrlCache.delete(fileId);
  }
  __objectUrlPending.delete(fileId);
}

function releaseAllObjectURLs() {
  __objectUrlCache.forEach(url => {
    try { URL.revokeObjectURL(url); } catch (e) {}
  });
  __objectUrlCache.clear();
  __objectUrlPending.clear();
}

window.addEventListener('pagehide', releaseAllObjectURLs);
window.addEventListener('beforeunload', releaseAllObjectURLs);


/* ---------- 统一入口：Blob 保存 ---------- */
async function saveImageBlob(blob, name) {
  if (!blob) return '';

  if (!__idbAvailable) {
    return await blobToDataURL(blob);
  }

  const id = makeUniqueId('file');
  const rec = {
    id: id,
    blob: blob,
    name: String(name || ''),
    type: String(blob.type || ''),
    size: Number(blob.size || 0),
    createdAt: Date.now(),
  };

  try {
    await idbPutFile(rec);
    return id;
  } catch (e) {
    console.warn('[IDB] 写入失败，降级 base64', e);
    return await blobToDataURL(blob);
  }
}

async function saveBase64Image(dataUrl, name) {
  const s = String(dataUrl || '');
  if (s.indexOf('data:') !== 0) return '';
  const blob = dataURLToBlob(s);
  if (!blob) return '';
  return await saveImageBlob(blob, name);
}

async function resolveImageSrc(ref) {
  if (!ref) return '';
  const s = String(ref);
  if (s.indexOf('data:') === 0 || s.indexOf('blob:') === 0 || s.indexOf('http') === 0) {
    return s;
  }
  const url = await getFileObjectURL(s);
  return url || '';
}

async function deleteImageRef(ref) {
  if (!ref) return;
  const s = String(ref);
  if (s.indexOf('data:') === 0 || s.indexOf('blob:') === 0) return;
  releaseObjectURL(s);
  try { await idbDeleteFile(s); }
  catch (e) {}
}

function isFileIdRef(ref) {
  if (!ref) return false;
  const s = String(ref);
  return !(s.indexOf('data:') === 0
        || s.indexOf('blob:') === 0
        || s.indexOf('http') === 0);
}

async function saveImageFromFile(file, name) {
  if (!file) return '';
  return await saveImageBlob(file, name || file.name || '');
}


/* ══════════ [JS-02C] 存储配额查询 + 持久化申请 ══════════ */

async function queryStorageEstimate() {
  if (navigator.storage && typeof navigator.storage.estimate === 'function') {
    try {
      const est = await navigator.storage.estimate();
      return {
        usage: Number(est.usage) || 0,
        quota: Number(est.quota) || 0,
      };
    } catch (e) {}
  }
  return { usage: 0, quota: 0 };
}

async function isStoragePersisted() {
  if (navigator.storage && typeof navigator.storage.persisted === 'function') {
    try { return !!(await navigator.storage.persisted()); }
    catch (e) {}
  }
  return false;
}

async function requestPersistentStorage() {
  if (navigator.storage && typeof navigator.storage.persist === 'function') {
    try {
      const already = await navigator.storage.persisted();
      if (already) return true;
      return !!(await navigator.storage.persist());
    } catch (e) {}
  }
  return false;
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (v < 1024) return v + ' B';
  if (v < 1024 * 1024) return (v / 1024).toFixed(1) + ' KB';
  if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(2) + ' MB';
  return (v / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}


/* ══════════ [JS-01D] 首页工具箱 / 联系我们 ══════════ */

const CONTACT_INFO = {
  qqGroup: '1109781704',
  email: '2559187312@qq.com',
  note: '使用中遇到问题或想提建议，欢迎联系我们。'
};

/* ---------- 工具箱 ---------- */
function openToolbox() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>工具箱</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="tb-list">
            <div class="tb-item" onclick="toolboxGoDataSync()">
              <div class="tb-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12a9 9 0 1 1 -3-6.7"/>
                  <polyline points="21 3 21 9 15 9"/>
                </svg>
              </div>
              <div class="tb-item-text">
                <div class="tb-item-title">手动同步</div>
                <div class="tb-item-sub">导出 / 导入</div>
              </div>
            </div>

            <div class="tb-item" onclick="toolboxThemeStyle()">
              <div class="tb-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 3 a9 9 0 0 1 0 18"/>
                  <circle cx="8" cy="10" r="1"/>
                  <circle cx="12" cy="8" r="1"/>
                  <circle cx="16" cy="12" r="1"/>
                </svg>
              </div>
              <div class="tb-item-text">
                <div class="tb-item-title">主题风格</div>
                <div class="tb-item-sub">配色 / 深色模式</div>
              </div>
              <span class="tb-item-tag">敬请期待</span>
            </div>

            <div class="tb-item" onclick="toolboxRepairData()">
              <div class="tb-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3 a4 4 0 1 0 -5.4 5.4 L4 17 v3 h3 l5.3 -5.3 a4 4 0 1 0 5.4 -5.4 z"/>
                  <line x1="14" y1="4" x2="20" y2="4"/>
                  <line x1="17" y1="7" x2="20" y2="10"/>
                </svg>
              </div>
              <div class="tb-item-text">
                <div class="tb-item-title">数据修复</div>
                <div class="tb-item-sub">升级存档 / 补流水 / 建单主档案</div>
              </div>
            </div>

            <div class="tb-item" onclick="toolboxGoUserManual()">
              <div class="tb-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4 h12 a2 2 0 0 1 2 2 v14 h-12 a2 2 0 0 0 -2 2 z"/>
                  <path d="M4 4 v18"/>
                  <path d="M8 9 h6"/>
                  <path d="M8 13 h6"/>
                </svg>
              </div>
              <div class="tb-item-text">
                <div class="tb-item-title">用户手册</div>
                <div class="tb-item-sub">操作说明 / 常见问题</div>
              </div>
            </div>

            <div class="tb-item" onclick="toolboxGoAnnouncementHistory()">
              <div class="tb-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 11 v2 a1 1 0 0 0 1 1 h2 l4 4 v-12 l-4 4 h-2 a1 1 0 0 0 -1 1 z"/>
                  <path d="M15 8 a6 6 0 0 1 0 8"/>
                  <path d="M18 5 a10 10 0 0 1 0 14"/>
                </svg>
              </div>
              <div class="tb-item-text">
                <div class="tb-item-title">更新公告</div>
                <div class="tb-item-sub">历史更新记录</div>
              </div>
            </div>

            <div class="tb-item" onclick="openContactUs()">
              <div class="tb-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15 a2 2 0 0 1 -2 2 H7 l-4 4 V5 a2 2 0 0 1 2 -2 h14 a2 2 0 0 1 2 2 z"/>
                  <path d="M8 10 H16"/>
                  <path d="M8 13 H13"/>
                </svg>
              </div>
              <div class="tb-item-text">
                <div class="tb-item-title">联系我们</div>
                <div class="tb-item-sub">QQ 群 / 邮箱</div>
              </div>
            </div>
          </div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}

function toolboxGoDataSync() {
  closeModal();
  showPage('pageDataSync');
}

function toolboxThemeStyle() {
  openThemeModal();
}

function toolboxRepairData() {
  closeModal();
  repairData();
}

function toolboxGoUserManual() {
  closeModal();
  showPage('pageUserManual');
}

function toolboxGoAnnouncementHistory() {
  closeModal();
  showPage('pageAnnouncementHistory');
}

/* ---------- 票夹 ---------- */
function openTicketFolder() {
  showPage('pageTicketFolder');
}

/* ---------- 联系我们 ---------- */
function openContactUs() {
  const info = CONTACT_INFO || {};
  const qq = escapeHtml(info.qqGroup || '—');
  const mail = escapeHtml(info.email || '—');
  const note = escapeHtml(info.note || '');

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>联系我们</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 14px;">${note}</p>
          <div class="contact-card">
            <div class="contact-row">
              <div class="contact-label">QQ 群</div>
              <div class="contact-value">${qq}</div>
              <button type="button" class="contact-copy" title="复制" onclick="copyContactValue('${qq}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15 H4 a2 2 0 0 1 -2 -2 V4 a2 2 0 0 1 2 -2 h9 a2 2 0 0 1 2 2 v1"/>
                </svg>
              </button>
            </div>
            <div class="contact-row">
              <div class="contact-label">邮箱</div>
              <div class="contact-value">${mail}</div>
              <button type="button" class="contact-copy" title="复制" onclick="copyContactValue('${mail}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15 H4 a2 2 0 0 1 -2 -2 V4 a2 2 0 0 1 2 -2 h9 a2 2 0 0 1 2 2 v1"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}

function copyContactValue(v) {
  if (!v || v === '—') { alert('暂无可复制的内容'); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(v).then(() => {
      alert('已复制：' + v);
    }).catch(() => fallbackCopy(v));
  } else {
    fallbackCopy(v);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); alert('已复制：' + text); }
  catch(e) { alert('复制失败，请手动选择复制'); }
  document.body.removeChild(ta);
}


/* ══════════ [JS-01E] 价目表占位 + 备忘录 ══════════ */

/* ---------- 价目表（暂未实装） ---------- */
function openPriceList() {
  showPage('pagePriceList');
}
function backFromPriceList() {
  showPage('pageMain');
}

/* ---------- 备忘录 ---------- */
function openMemo() {
  showPage('pageMemo');
  /* 进入页面时自动聚焦输入框 */
  setTimeout(() => {
    const el = $('memoInput');
    if (el) el.focus();
  }, 200);
}
function backFromMemo() {
  showPage('pageMain');
}

function renderMemoList() {
  const box = $('memoListContainer');
  if (!box) return;

  const memos = getMemos();

  /* 排序规则：
     1. 有执行日期的在上，按执行日期升序（最近的先）
     2. 同一天的，按创建时间倒序
     3. 没有执行日期的在下，按创建时间倒序 */
  memos.sort((a, b) => {
    const da = String(a.dueDate || '').trim();
    const db = String(b.dueDate || '').trim();

    if (da && db) {
      if (da !== db) return da.localeCompare(db);
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    if (da && !db) return -1;
    if (!da && db) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  if (!memos.length) {
    box.innerHTML = `
      <div class="memo-empty">
        <div class="memo-empty-icon">📝</div>
        <div>还没有待办<br><span style="font-size:12px;opacity:0.75;">在上面输入框写点什么，按回车或点「添加」</span></div>
      </div>`;
    return;
  }

  const todayStr = fmtDateStr(new Date());

  box.innerHTML = '<div class="memo-list">' + memos.map(m => {
    const id = escapeAttr(m.id);
    const doneCls = m.done ? ' is-done' : '';

    const dueDate = String(m.dueDate || '').trim();
    let dueHtml = '';
    if (dueDate) {
      const overdue = !m.done && dueDate < todayStr;
      const overdueCls = overdue ? ' is-overdue' : '';
      dueHtml = `<span class="memo-item-due${overdueCls}">${escapeHtml(dueDate)}</span>`;
    }

    return `
      <div class="memo-item${doneCls}" id="memoItem_${id}">
        <button type="button" class="memo-item-check" onclick="askMemoComplete('${id}')" title="完成">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            ${m.done ? '<polyline points="8 12 11 15 16 9"/>' : ''}
          </svg>
        </button>
        <div class="memo-item-text">${escapeHtml(m.text || '')}</div>
        ${dueHtml}
        <button type="button" class="memo-item-del" onclick="askMemoDelete('${id}')" title="删除">×</button>
      </div>`;
  }).join('') + '</div>';
}

function addMemoItem() {
  const input = $('memoInput');
  const dateInput = $('memoDueDate');
  if (!input) return;

  const text = String(input.value || '').trim();
  if (!text) { input.focus(); return; }

  const memos = getMemos();
  memos.push({
    id: makeMemoId(),
    text: text,
    done: false,
    dueDate: dateInput ? String(dateInput.value || '').trim() : '',
    createdAt: Date.now(),
  });
  if (!setMemos(memos)) return;

  input.value = '';
  if (dateInput) dateInput.value = '';
  input.focus();
  renderMemoList();
}

function askMemoDelete(id) {
  const memos = getMemos();
  const m = memos.find(x => x.id === id);
  if (!m) return;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>删除待办</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.7;">确定删除这条待办吗？</p>
          <p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0;line-height:1.6;word-break:break-word;">
            ${escapeHtml(m.text || '')}
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmMemoDelete('${escapeAttr(id)}')">确定删除</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmMemoDelete(id) {
  const memos = getMemos().filter(x => x.id !== id);
  setMemos(memos);
  closeModal();
  renderMemoList();
}

function askMemoComplete(id) {
  const memos = getMemos();
  const m = memos.find(x => x.id === id);
  if (!m) return;

  /* 已完成状态下再次点击：询问是否取消完成 */
  if (m.done) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>取消完成</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <p style="margin:8px 0;line-height:1.7;">要把这条待办标记为"未完成"吗？</p>
            <p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0;line-height:1.6;word-break:break-word;">
              ${escapeHtml(m.text || '')}
            </p>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn ghost" onclick="closeModal()">取消</button>
              <button class="action-btn" onclick="confirmMemoUncomplete('${escapeAttr(id)}')">确定取消</button>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  /* 未完成状态：询问是否完成 */
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>完成待办</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.7;">确定完成这条待办吗？</p>
          <p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0;line-height:1.6;word-break:break-word;">
            ${escapeHtml(m.text || '')}
          </p>
          <p style="font-size:12px;color:var(--ink-soft);margin:12px 0 0;line-height:1.7;">
            完成后该条会从列表移除，且不可恢复。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmMemoComplete('${escapeAttr(id)}')">确定完成</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmMemoComplete(id) {
  closeModal();

  /* 先做打钩动画：把该项标记为 is-done，稍后删除 */
  const item = $('memoItem_' + id);
  if (item) {
    item.classList.add('is-done');
    const checkBtn = item.querySelector('.memo-item-check svg');
    if (checkBtn) {
      /* 临时把 svg 换成打钩态（加 polyline） */
      const existing = checkBtn.querySelector('polyline');
      if (!existing) {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly.setAttribute('points', '8 12 11 15 16 9');
        checkBtn.appendChild(poly);
      }
    }
  }

  /* 300ms 后从数据里删除并重渲染 */
  setTimeout(() => {
    const memos = getMemos().filter(x => x.id !== id);
    setMemos(memos);
    renderMemoList();
  }, 320);
}

function confirmMemoUncomplete(id) {
  const memos = getMemos();
  const idx = memos.findIndex(x => x.id === id);
  if (idx >= 0) {
    memos[idx].done = false;
    setMemos(memos);
  }
  closeModal();
  renderMemoList();
}
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 3 部分 / 共 9 部分                                ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-02]  身份联动 / 重置                            ║
   ║   [JS-02B] 身份预设 + 权限预设 管理                   ║
   ║   [JS-02C] 工期自动算截稿日期 + 定金锁定              ║
   ║   [JS-02D] 平台下拉 + 平台管理弹窗 + 主页同步         ║
   ║   [JS-03]  用户手册渲染（模块化重写）                 ║
   ║   [JS-04]  更新公告历史渲染                           ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-02] 身份联动 / 重置 ══════════ */
function onIdentityChange() {}

function syncMainFromSettings() {
  if ($('identity') && $('setIdentity')) $('identity').value = $('setIdentity').value;
  if ($('artist') && $('setName'))       $('artist').value   = $('setName').value;
}

function resetAll() {
  const today = fmtDateStr(new Date());

  if ($('client'))       $('client').value       = INITIAL_VALUES.client;
  if ($('project'))      $('project').value      = INITIAL_VALUES.project;
  if ($('attribute'))    $('attribute').value    = INITIAL_VALUES.attribute;
  if ($('character'))    $('character').value    = INITIAL_VALUES.character;
  if ($('orderDate'))    $('orderDate').value    = today;
  if ($('scheduleDate')) $('scheduleDate').value = today;
  if ($('workDays'))     $('workDays').value     = INITIAL_VALUES.workDays;
  if ($('deadline'))     $('deadline').value     = INITIAL_VALUES.deadline;

  syncPlatformsToMain(getDefaultPlatform());

  const dp = getDepositPreset();
  if ($('depositMode')) $('depositMode').value = dp.mode;
  if ($('deposit'))     $('deposit').value     = dp.value;
  updateDepositUnit();

  const pt = $('placeholderToggle');
  if (pt) pt.checked = false;

  if (typeof applyPlaceholderMode === 'function') applyPlaceholderMode(false);
  if (typeof setDepositModeLocked === 'function') setDepositModeLocked(false);

  const gContainer = $('groupsContainer');
  if (gContainer) {
    gContainer.innerHTML = '';
    if (typeof addGroup === 'function') addGroup();
  }

  if ($('extrasContainer'))    $('extrasContainer').innerHTML = '';
  if ($('discountsContainer')) $('discountsContainer').innerHTML = '';
  if ($('giftsContainer'))     $('giftsContainer').innerHTML = '';

  if (typeof clearPreview === 'function') clearPreview();
  clearAllFieldErrors();

  if ($('receiptPanel')) $('receiptPanel').classList.add('hidden');
  const tb = $('receiptToolbar');
  if (tb) tb.classList.add('hidden');

  if ($('outRealPrepaidRow')) $('outRealPrepaidRow').style.display = 'none';

  window.__receiptGenerated = false;
  window.__receiptImported = false;
  window.__receiptWarnIgnore = false;
}


/* ══════════ [JS-02B] 身份预设 + 权限预设 管理 ══════════ */

/* ---------- 身份预设 ---------- */
function renderIdentitySelect() {
  const sel = $('setIdentity');
  if (!sel) return;

  const list = getIdentities();
  const cur = sel.value || getDefaultIdentity();

  sel.innerHTML = list.map(n =>
    `<option value="${escapeAttr(n)}">${escapeHtml(n)}</option>`
  ).join('');

  if (list.indexOf(cur) > -1) sel.value = cur;
  else if (list.length) sel.value = list[0];

  if ($('identity')) $('identity').value = sel.value;
}

function renderIdentityList() {
  const box = $('identityList');
  if (!box) return;

  const list = getIdentities();
  if (!list.length) {
    box.innerHTML = '<p style="font-size:12px;color:var(--ink-soft);margin:4px 0;">暂无身份，点击下方「添加身份」创建。</p>';
    return;
  }

  box.innerHTML = list.map((name, i) => `
    <div class="identity-row">
      <input class="identity-name" value="${escapeAttr(name)}" oninput="updateIdentityName(${i}, this.value)" />
      <button class="icon-btn" onclick="deleteIdentity(${i})" title="删除">×</button>
    </div>
  `).join('');
}

function updateIdentityName(i, name) {
  const list = getIdentities();
  if (!list[i]) return;
  list[i] = String(name || '').trim();
  setIdentities(list);
  renderIdentitySelect();
  syncMainFromSettings();
}

function deleteIdentity(i) {
  const list = getIdentities();
  if (list.length <= 1) { alert('至少保留一个身份预设'); return; }
  const removed = list[i];
  list.splice(i, 1);
  setIdentities(list);

  if (getDefaultIdentity() === removed) {
    setDefaultIdentity(list[0] || '画师');
  }

  renderIdentityList();
  renderIdentitySelect();
  syncMainFromSettings();
}

function openAddIdentityModal() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加身份</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <label>身份名称</label>
          <input id="newIdentityName" placeholder="如：企划方 / 店家" maxlength="20" />
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="saveNewIdentity()">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('newIdentityName'); if (el) el.focus(); }, 50);
}

function saveNewIdentity() {
  const name = ($('newIdentityName') ? $('newIdentityName').value : '').trim();
  if (!name) {
    showSimpleAlert('提示', '请填写身份名称。');
    return;
  }
  const list = getIdentities();
  if (list.indexOf(name) > -1) {
    showSimpleAlert('提示', '「' + escapeHtml(name) + '」已存在。');
    return;
  }
  list.push(name);
  setIdentities(list);

  if (!localStorage.getItem(IDENTITY_DEFAULT_KEY)) {
    setDefaultIdentity(name);
  }

  closeModal();
  renderIdentityList();
  renderIdentitySelect();
  syncMainFromSettings();
  showSimpleAlert('已添加', '身份「' + escapeHtml(name) + '」已保存。');
}

/* ---------- 权限预设 ---------- */
function renderPermissionList() {
  const perms = getPermissions();
  const box = $('permissionList');
  if (!box) return;
  if (!perms.length) {
    box.innerHTML = '<p style="font-size:12px;color:var(--ink-soft);margin:4px 0;">暂无权限，点击下方「添加权限」创建。</p>';
    return;
  }
  box.innerHTML = perms.map((p, i) => `
    <div class="perm-row">
      <input class="perm-name" value="${escapeAttr(p.name)}" oninput="updatePermissionName(${i}, this.value)" />
      <span class="perm-x">×</span>
      <input class="perm-rate" type="number" step="0.1" value="${num2(p.rate)}" oninput="updatePermissionRate(${i}, this.value)" />
      <button class="icon-btn" onclick="deletePermission(${i})" title="删除">×</button>
    </div>
  `).join('');
}

function updatePermissionName(i, name) {
  const perms = getPermissions();
  if (!perms[i]) return;
  perms[i].name = name;
  setPermissions(perms);
  syncPermissionsToMain();
  refreshAllItemLicenses();
}
function updatePermissionRate(i, rate) {
  const perms = getPermissions();
  if (!perms[i]) return;
  perms[i].rate = Number(rate) || 1;
  setPermissions(perms);
  syncPermissionsToMain();
  refreshAllItemLicenses();
}
function deletePermission(i) {
  const perms = getPermissions();
  if (perms.length <= 1) { alert('至少保留一个权限预设'); return; }
  perms.splice(i, 1);
  setPermissions(perms);
  renderPermissionList();
  syncPermissionsToMain();
  refreshAllItemLicenses();
}

function openAddPermissionModal() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加权限</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;gap:12px;align-items:flex-end;margin-top:8px;">
            <div style="flex:1;">
              <label>权限名称</label>
              <input id="permName" placeholder="如：企商 / 开团" />
            </div>
            <div style="flex:0 0 auto;padding-bottom:8px;font-size:18px;color:var(--ink-soft);line-height:1;">×</div>
            <div style="flex:0 0 110px;">
              <label>倍率</label>
              <input id="permRate" type="number" step="0.1" placeholder="如：3" />
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:12px;">
            权限倍率：稿件价格将乘以该数值。例如 ×2 表示商用为原价 2 倍。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="saveNewPermission()">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('permName'); if (el) el.focus(); }, 50);
}

function saveNewPermission() {
  const name = ($('permName').value || '').trim();
  const rate = Number($('permRate').value);
  if (!name) { $('permName').focus(); return; }
  if (!isFinite(rate) || rate <= 0) { $('permRate').focus(); return; }
  const perms = getPermissions();
  perms.push({ id: 'p_' + Date.now() + '_' + Math.floor(Math.random() * 1000), name, rate });
  setPermissions(perms);
  closeModal();
  renderPermissionList();
  syncPermissionsToMain();
  refreshAllItemLicenses();
}

function syncPermissionsToMain() {
  const perms = getPermissions();
  const box = $('permissionDisplay');
  if (!box) return;
  if (!perms.length) { box.innerHTML = '—'; return; }
  box.innerHTML = perms.map(p =>
    `<div><span>${escapeHtml(p.name)}</span><span>×${num2(p.rate)}</span></div>`
  ).join('');
}

function refreshAllItemLicenses() {
  const perms = getPermissions();
  document.querySelectorAll('.item-license').forEach(sel => {
    const cur = sel.value;
    sel.innerHTML =
      `<option value="">请选择</option>` +
      perms.map(p => `<option value="${escapeAttr(p.id)}">${escapeHtml(p.name)}</option>`).join('');
    if (cur && perms.find(p => p.id === cur)) sel.value = cur;
    else sel.value = '';
  });
}

function syncDepositFromSettings() {
  const mode = $('setDepositMode').value;
  const value = $('setDeposit').value;
  setDepositPreset({ mode, value: value === '' ? '' : Number(value) });
  $('depositMode').value = mode;
  $('deposit').value = value;
  updateSetDepositUnit();
  updateDepositUnit();
}


/* ══════════ [JS-02C] 工期自动算截稿日期 + 定金锁定 ══════════ */
function addDaysToDateStr(dateStr, days) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return '';
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + Number(days));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function recalcDeadlineFromDays() {
  const scheduleDate = $('scheduleDate') ? $('scheduleDate').value : '';
  const daysRaw = $('workDays') ? $('workDays').value : '';
  const days = Number(daysRaw);
  if (!scheduleDate || !isFinite(days) || days <= 0) return;
  const newDeadline = addDaysToDateStr(scheduleDate, days);
  if (newDeadline && $('deadline')) $('deadline').value = newDeadline;
}

function onDeadlineManualChange() {
  if ($('workDays')) $('workDays').value = '';
}

function bindWorkDaysLogic() {
  if ($('scheduleDate')) $('scheduleDate').addEventListener('change', recalcDeadlineFromDays);
  if ($('workDays'))     $('workDays').addEventListener('input',  recalcDeadlineFromDays);
  if ($('deadline'))     $('deadline').addEventListener('change', onDeadlineManualChange);
  if ($('orderDate')) {
    $('orderDate').addEventListener('change', function () {
      if (!$('scheduleDate')) return;
      if (!$('scheduleDate').value) {
        $('scheduleDate').value = $('orderDate').value || '';
        recalcDeadlineFromDays();
      }
    });
  }
}

function bindDepositUnitLogic() {
  if ($('depositMode')) {
    $('depositMode').addEventListener('change', updateDepositUnit);
  }
  if ($('setDepositMode')) {
    $('setDepositMode').addEventListener('change', function () {
      updateSetDepositUnit();
      syncDepositFromSettings();
    });
  }
  updateDepositUnit();
  updateSetDepositUnit();
}

function setDepositModeLocked(locked) {
  const sel = $('depositMode');
  if (!sel) return;

  if (locked) {
    sel.dataset.prevMode = sel.value || 'percent';
    sel.value = 'amount';
    sel.disabled = true;
    sel.style.opacity = '0.7';
    sel.style.cursor = 'not-allowed';
    updateDepositUnit();
  } else {
    sel.disabled = false;
    sel.style.opacity = '';
    sel.style.cursor = '';
    const prev = sel.dataset.prevMode;
    if (prev && (prev === 'percent' || prev === 'amount')) {
      sel.value = prev;
    }
    delete sel.dataset.prevMode;
    updateDepositUnit();
  }
}


/* ══════════ [JS-02D] 平台下拉 + 平台管理弹窗 + 主页同步 ══════════ */
const PLATFORM_ADD_VALUE = '__ADD__';

function renderSetPlatformSelect() {
  const list = getPlatformsClean();
  const sel = $('setPlatform');
  if (!sel) return;
  const cur = getDefaultPlatform();
  sel.innerHTML =
    list.map(p =>
      `<option value="${escapeAttr(p)}">${escapeHtml(p)}</option>`
    ).join('') +
    `<option value="${PLATFORM_ADD_VALUE}">＋ 添加平台</option>`;
  if (list.indexOf(cur) > -1) sel.value = cur;
  else if (list.length) sel.value = list[0];
}

function onSetPlatformChange() {
  const sel = $('setPlatform');
  if (!sel) return;
  const v = sel.value;

  if (v === PLATFORM_ADD_VALUE) {
    const list = getPlatformsClean();
    const def = getDefaultPlatform();
    if (list.indexOf(def) > -1) sel.value = def;
    else if (list.length) sel.value = list[0];
    openPlatformManagerModal();
    return;
  }

  setDefaultPlatform(v);
  syncPlatformsToMain(v);
  if (typeof renderMasterPlatformSelect === 'function') {
    renderMasterPlatformSelect();
  }
}

function syncPlatformsToMain(preferred) {
  const list = getPlatformsClean();
  const sel = $('platform');
  if (!sel) return;
  const cur = (preferred !== undefined && preferred !== null)
    ? preferred
    : (sel.value || getDefaultPlatform());
  sel.innerHTML = list.map(p =>
    `<option value="${escapeAttr(p)}">${escapeHtml(p)}</option>`
  ).join('');
  if (list.indexOf(cur) > -1) sel.value = cur;
  else if (list.length) sel.value = list[0];
}

function openPlatformManagerModal() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closePlatformManager()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>管理平台</h3>
          <button class="icon-btn" onclick="closePlatformManager()">×</button>
        </div>
        <div class="modal-body">
          <label style="margin-top:0;">所有平台（可修改名称 · 至少保留一个）</label>
          <div id="platManagerList"></div>
          <button class="add-item-btn" onclick="addPlatformInManager()" style="margin-top:10px;">+ 添加平台</button>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:12px;">
            提示：输入完成后关闭本窗口即可，数据会自动保存并同步到主页下拉。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closePlatformManager()">完成</button>
          </div>
        </div>
      </div>
    </div>`;
  renderPlatformManagerList();
}

function renderPlatformManagerList() {
  const list = getPlatforms();
  const box = $('platManagerList');
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p style="font-size:12px;color:var(--ink-soft);margin:4px 0;">暂无平台，点击下方按钮添加。</p>';
    return;
  }
  box.innerHTML = list.map((name, i) => `
    <div class="plat-row">
      <input class="plat-name" value="${escapeAttr(name)}" oninput="updatePlatformName(${i}, this.value)" placeholder="平台名称" />
      <button class="icon-btn" onclick="deletePlatformInManager(${i})" title="删除">×</button>
    </div>
  `).join('');
}

function updatePlatformName(i, name) {
  const list = getPlatforms();
  if (i < 0 || i >= list.length) return;
  list[i] = name;
  setPlatforms(list);
  refreshPlatformUI();
}

function deletePlatformInManager(i) {
  const list = getPlatforms();
  if (list.length <= 1) { alert('至少保留一个平台'); return; }
  list.splice(i, 1);
  setPlatforms(list);
  renderPlatformManagerList();
  refreshPlatformUI();
}

function addPlatformInManager() {
  const list = getPlatforms();
  list.push('');
  setPlatforms(list);
  renderPlatformManagerList();
  const inputs = document.querySelectorAll('#platManagerList .plat-row .plat-name');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function closePlatformManager() {
  let list = getPlatformsClean();
  if (!list.length) list = [DEFAULT_PLATFORMS[0]];
  setPlatforms(list);

  const def = localStorage.getItem(PLATFORM_DEFAULT_KEY) || '';
  if (list.indexOf(def) === -1) {
    setDefaultPlatform(list[0]);
  }

  closeModal();
  refreshPlatformUI();
}

function refreshPlatformUI() {
  renderSetPlatformSelect();
  syncPlatformsToMain();
  if (typeof renderMasterPlatformSelect === 'function') {
    renderMasterPlatformSelect();
  }
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-03] 用户手册渲染（模块化重写）                   ║
   ╚══════════════════════════════════════════════════════╝ */

/* 每个模块包含若干条目，条目点击后弹窗显示 html 内容 */
var USER_MANUAL_MODULES = [
  {
    id: 'quickstart',
    title: '快速上手',
    items: [
      {
        title: '一、整体流程',
        html: `
          <p>本应用把接单流程拆成「小票 → 订单 → 结单」三步：</p>
          <ol>
            <li><strong>填写小票</strong>：在「小票」页填写企划信息、稿件、费用，点「确定生成」。</li>
            <li><strong>导入订单</strong>：生成小票后，点小票右上角第一个图标「导入订单」。</li>
            <li><strong>跟踪与结单</strong>：到「订单 → 待」页逐项勾选完成，全部完成后点「结单」。</li>
          </ol>
          <p>结单后小票会自动归档到「票夹」，同时计入「统计」。</p>
        `
      },
      {
        title: '二、账号初始化',
        html: `
          <p>第一次使用建议先到「设置 → 基础信息」：</p>
          <ul>
            <li>填写你的身份和 ID（会显示在小票上）</li>
            <li>选择常用接单平台</li>
            <li>设置默认定金比例</li>
            <li>配置权限倍率（如自用 ×1、商用 ×2）</li>
          </ul>
          <p>之后每次打开小票页都会自动带出这些默认值。</p>
        `
      },
      {
        title: '三、常用入口',
        html: `
          <p>首页右上角四个图标分别是：</p>
          <ul>
            <li><strong>工具箱</strong>：手动同步 / 数据修复 / 用户手册 / 更新公告 / 联系我们</li>
            <li><strong>票夹</strong>：所有历史小票汇总</li>
            <li><strong>价目表</strong>：开发中</li>
            <li><strong>备忘录</strong>：记录待办，可选执行日期</li>
          </ul>
        `
      },
      {
        title: '四、数据保存',
        html: `
          <p>所有数据保存在浏览器本地，不会上传到任何服务器。</p>
          <p>建议定期到「工具箱 → 手动同步 → 导出数据」备份，防止误删。</p>
          <p>换设备时导出 JSON，在新设备导入即可。</p>
        `
      }
    ]
  },
  {
    id: 'receipt',
    title: '小票',
    items: [
      {
        title: '企划信息',
        html: `
          <p>带 <span style="color:#e74c3c">*</span> 的字段为必填：</p>
          <ul>
            <li>单主 ID</li>
            <li>接单日期</li>
            <li>排单日期</li>
            <li>截稿日期</li>
          </ul>
          <p>点单主 ID 右侧的<strong>小人图标</strong>，可从「单主」列表快速选人。</p>
          <p>填写「工期」会自动推算截稿日期；手动改截稿日期后工期会清空。</p>
        `
      },
      {
        title: '占位单',
        html: `
          <p>打开「占位」开关后：</p>
          <ul>
            <li>可以暂时不填稿件内容</li>
            <li>只需要填一个排单费金额</li>
            <li>小票会显示「占位待定」</li>
          </ul>
          <p>之后在订单详情页点「转立项单」，可选择是否用排单费抵扣预付款。</p>
        `
      },
            {
        title: '定制细则',
        html: `
          <p>支持多稿件组，每组可加多个稿件。</p>
          <p>每个稿件可以同时挂两类东西：</p>
          <ul>
            <li><strong>增项</strong>：每件加价，算法可选 ×（按基础价的百分比）或 ＋（固定金额）</li>
            <li><strong>节点</strong>：按比例拆分，一个稿件的所有节点比例合计必须 = 100%</li>
          </ul>
          <p><strong>两类可以共存。</strong>例如基础价 100、增项「复杂设 +20」，再加节点「草稿 30%」——节点按 <strong>120 × 30%</strong> 计算，即 36。</p>
          <p>每个稿件都必须选择「权限」，权限倍率会乘到该稿件小计上。</p>
        `
      },
      {
        title: '其他费用',
        html: `
          <p>小票页最下方的「其他」面板包含三类：</p>
          <ul>
            <li><strong>订单级附加费用</strong>：基于订单总价，算法 × 或 ＋</li>
            <li><strong>订单级优惠折扣</strong>：基于订单总价，算法 × 或 −</li>
            <li><strong>赠品</strong>：不计入应付，仅在小票上展示</li>
          </ul>
        `
      },
      {
        title: '小票设置',
        html: `
          <p>点小票右上角的<strong>画笔图标</strong>打开右侧设置面板，可以：</p>
          <ul>
            <li>上传票头 / 票尾 / 背景图，支持拖拽、缩放、拉伸</li>
            <li>修改背景色、字体主色 / 辅色</li>
            <li>选择字体（含内置在线字体、可导入本地字体）</li>
            <li>调整整体字号（黑点是默认值，点击恢复）</li>
            <li>保存 / 加载小票预设（最多 5 个）</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'order',
    title: '订单',
    items: [
      {
        title: '四类订单',
        html: `
          <p>订单分为四类，用四个圆按钮切换：</p>
          <ul>
            <li><strong>待</strong>：进行中的订单</li>
            <li><strong>结</strong>：已完成结单</li>
            <li><strong>撤</strong>：已撤单（可记录跑单费或退款）</li>
            <li><strong>废</strong>：已废稿（可记录废稿费或退款）</li>
          </ul>
        `
      },
      {
        title: '结单',
        html: `
          <p>订单详情页所有事项都勾选完成后，点卡片右侧「结单」按钮。</p>
          <p>结单弹窗里可以：</p>
          <ul>
            <li>给尾款打折（按总应收比例 / 按尾款比例 / 具体金额）</li>
            <li>选择「已收到」→ 订单结单，进入「结」页面，计入实收统计</li>
            <li>选择「尚未收到」→ 订单标记为待结，金额留在待结统计里</li>
          </ul>
        `
      },
      {
        title: '撤单 / 废稿',
        html: `
          <p>点订单卡片右侧「⋮」菜单：</p>
          <ul>
            <li><strong>撤单</strong>：可退全款 / 退尾款 / 收跑单费</li>
            <li><strong>废稿</strong>：可收废稿费 / 不收 / 退费</li>
          </ul>
          <p>撤单和废稿都会把订单从「待」页面移走，并在对应页面留下记录。</p>
        `
      },
      {
        title: '素材与要求',
        html: `
          <p>订单详情页的「素材」「要求」是两个文件夹按钮：</p>
          <ul>
            <li>点文件夹按钮上传图片，支持多选</li>
            <li>缩略图点击可以查看大图</li>
            <li>右上角 × 可以删除单张图片</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'stats',
    title: '排单与统计',
    items: [
      {
        title: '排单日历',
        html: `
          <p>「排单」页用日历展示每日的截稿与开单安排：</p>
          <ul>
            <li><span style="color:#e74c3c">●</span> 红点：当天有订单截稿</li>
            <li><span style="color:#2b7fff">●</span> 蓝点：当天有占位单开单</li>
            <li>红蓝双色：当天同时有截稿和开单</li>
          </ul>
          <p>点有标记的日期，弹出当天清单，再点订单可跳转到详情页。</p>
        `
      },
      {
        title: '统计卡片',
        html: `
          <p>「统计」页按范围汇总数据，范围可选：月 / 年 / 本周 / 最近七天 / 自定义。</p>
          <p>顶部「收支合计」= 实收 − 退款 − 支出。</p>
          <p>点统计卡片可查看明细列表。</p>
        `
      },
      {
        title: '记账',
        html: `
          <p>统计页右上角「记账」按钮可快速记录订单外的收支：</p>
          <ul>
            <li><strong>收入</strong>：客户补款、稿费等进账</li>
            <li><strong>支出</strong>：外包、软件、材料费等（不含退款）</li>
            <li><strong>退款</strong>：退给客户的款项</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'master',
    title: '单主',
    items: [
      {
        title: '自动汇总',
        html: `
          <p>「单主」页会自动汇总所有订单涉及的单主，包括：</p>
          <ul>
            <li>累计消费（实收 − 退款）</li>
            <li>累计订单数</li>
            <li>待结金额</li>
            <li>最近一次接单时间</li>
          </ul>
          <p>点卡片进入单主详情，可看历史订单和小票票夹。</p>
        `
      },
      {
        title: '添加 / 编辑',
        html: `
          <p>点右上角「添加」可以手动建立单主档案，填写 ID、平台、联系方式、备注。</p>
          <p>在单主详情页点「编辑」可修改，还能填写标签（逗号分隔）。</p>
        `
      },
      {
        title: '筛选与管理',
        html: `
          <p>点「筛选」可以按订单数或金额筛选：</p>
          <ul>
            <li>订单数 ≥ N</li>
            <li>累计消费 ≥ ¥N</li>
          </ul>
          <p>点「管理」进入多选模式，可批量删除单主（只从列表移除，不删除订单和流水）。</p>
        `
      }
    ]
  },
  {
    id: 'data',
    title: '数据安全',
    items: [
      {
        title: '数据存储位置',
        html: `
          <p>所有数据存在浏览器本地：</p>
          <ul>
            <li><strong>localStorage</strong>：订单、流水、预设、设置等文字数据</li>
            <li><strong>IndexedDB</strong>：小票图片、素材、要求图片等文件</li>
          </ul>
          <p>不会上传到任何服务器。</p>
        `
      },
      {
        title: '备份与恢复',
        html: `
          <p>「工具箱 → 手动同步」：</p>
          <ul>
            <li><strong>导出数据</strong>：下载 JSON 文件，包含所有设置和图片</li>
            <li><strong>导入数据</strong>：从 JSON 文件恢复</li>
          </ul>
          <p>导入时会覆盖同名数据，但不会删除本设备上备份里没有的项。</p>
        `
      },
      {
        title: '数据修复',
        html: `
          <p>「工具箱 → 数据修复」用于：</p>
          <ul>
            <li>升级存档到最新版本规则</li>
            <li>补录历史订单缺失的流水</li>
            <li>建立单主档案索引</li>
          </ul>
          <p>修复前会自动备份，可重复点击不会重复累加。</p>
        `
      }
    ]
  },
  {
    id: 'faq',
    title: '常见问题',
    items: [
      {
        title: '小票无法生成怎么办？',
        html: `
          <p>检查以下必填项是否完整：</p>
          <ul>
            <li>单主 ID、接单日期、排单日期、截稿日期</li>
            <li>每个稿件的名称、单价、数量、权限</li>
            <li>如果用了节点，所有节点的比例合计必须 = 100%</li>
          </ul>
          <p>点「确定生成」时若有问题，会弹窗列出所有缺项，可点提示直接跳到对应位置。</p>
        `
      },
      {
        title: '本地字体刷新后消失了？',
        html: `
          <p>本地字体通过 FontFace API 临时加载，仅在当前浏览器会话有效。</p>
          <p>刷新页面后需要重新导入。如需长期使用，建议改用系统自带字体，或每次打开前手动导入。</p>
        `
      },
      {
        title: '提示「存储空间已满」怎么办？',
        html: `
          <p>浏览器为每个网站分配的存储空间有限，主要是图片占得多。</p>
          <p>建议：</p>
          <ol>
            <li>先到「工具箱 → 手动同步 → 导出数据」做备份</li>
            <li>检查「小票设置」里有没有不需要的旧图片，点「清除」删掉</li>
            <li>检查「票夹」里不需要的小票，进对应订单删除</li>
            <li>清理完再导入备份</li>
          </ol>
        `
      },
      {
        title: '怎么把数据迁移到新设备？',
        html: `
          <p>三步：</p>
          <ol>
            <li>旧设备打开「工具箱 → 手动同步 → 导出数据」，得到 JSON 文件</li>
            <li>把 JSON 文件传到新设备（微信 / QQ / 邮件等）</li>
            <li>新设备打开「工具箱 → 手动同步 → 导入数据」，选择文件</li>
          </ol>
          <p>导入后会提示恢复了多少项设置和多少张图片，页面自动刷新。</p>
        `
      },
      {
        title: '占位单是什么？怎么转成正式订单？',
        html: `
          <p>占位单是「先占坑、还没定稿」的订单。打开小票页的「占位」开关即可创建，只需填排单费。</p>
          <p>要转正式单：</p>
          <ol>
            <li>订单列表点进占位单的详情页</li>
            <li>点「转立项单」按钮</li>
            <li>如果已收排单费，会问「是否用排单费抵扣预付款」，按需选择</li>
            <li>填写立项内容后点「确定生成」，再点小票右上角第一个图标导入</li>
          </ol>
        `
      },
      {
        title: '结单、撤单、废稿有什么区别？',
        html: `
          <ul>
            <li><strong>结单</strong>：正常完成，进入「结」页面，计入实收</li>
            <li><strong>撤单</strong>：单主取消，可退全款 / 退尾款 / 收跑单费，进入「撤」页面</li>
            <li><strong>废稿</strong>：作品废弃，可收废稿费 / 不收 / 退费，进入「废」页面</li>
          </ul>
          <p>三者都会从「待」页面移除，但记录所在页面不同。</p>
        `
      },
      {
        title: '为什么统计数字和订单金额对不上？',
        html: `
          <p>统计的「实收」按<strong>流水发生日期</strong>汇总，而不是订单日期。</p>
          <p>比如 8 月的订单，尾款 9 月才收，那么 8 月的实收里只有预付款，9 月才有尾款。</p>
          <p>「待结」则会一直挂在未结清订单上，跟日期范围无关（只统计当前未完成的订单）。</p>
        `
      },
      {
        title: '权限倍率是怎么用的？',
        html: `
          <p>权限倍率在「设置 → 基础信息 → 使用权限预设」里配置。</p>
          <p>每个稿件选择权限后，该稿件的<strong>小计 × 权限倍率</strong>参与订单总价计算。</p>
          <p>例如：稿件单价 100 元 × 2 件 = 200 元，权限选「商用 ×2」→ 实际计入 400 元。</p>
        `
      },
      {
        title: '节点比例为什么必须等于 100%？',
        html: `
          <p>节点是「按总价按比例拆分」的收款节点（如草稿 30%、线稿 30%、成图 40%）。</p>
          <p>如果一个稿件的节点比例合计不等于 100%，说明拆分不完或超出总价，无法确定金额。</p>
          <p>生成小票时会校验，合计 ≠ 100% 会提示无法生成。</p>
        `
      },
      {
        title: '预付款什么时候会自动计算？',
        html: `
          <p>预付款有三种算法，按订单类型自动选择：</p>
          <ul>
            <li><strong>占位单</strong>：直接等于填写的排单费</li>
            <li><strong>纯节点单</strong>（所有稿件都用节点计价）：预付款 = 第一个节点的金额之和</li>
            <li><strong>普通订单</strong>：按定金模式计算（百分比或固定金额）</li>
          </ul>
        `
      },
      {
        title: '「未知单主」是什么？',
        html: `
          <p>如果订单创建时没填「单主 ID」，就会归到「未知单主」这个虚拟条目下。</p>
          <p>它不是真正的单主档案，不能编辑备注，建议到对应订单补全 ID。</p>
        `
      },
      {
        title: '图片文件存在哪里？会被压缩吗？',
        html: `
          <p>上传的图片存在浏览器的 IndexedDB 里，以原图 Blob 保存，不做压缩。</p>
          <p>小票图片是 html2canvas 生成的 PNG，按小票当前尺寸 2 倍分辨率导出。</p>
        `
      },
      {
        title: '为什么小票长按拖动/缩放没反应？',
        html: `
          <p>小票上的图片（票头 / 票尾 / 背景）需要先进入编辑态才能操作：</p>
          <ol>
            <li>点小票右上角画笔图标打开设置面板</li>
            <li>点「票头图片 / 票尾图片 / 背景图片」按钮</li>
            <li>进入编辑态后：图片任意位置可拖，右下角红点等比缩放，边缘虚线可拉伸</li>
          </ol>
          <p>保存图片或关闭设置面板时会自动退出编辑态。</p>
        `
      },
            {
        title: '增项和节点能一起用吗？',
        html: `
          <p>能。同一稿件里可以同时挂增项和节点。</p>
          <p>计算时：先算增项，得到<strong>单元原价</strong>，节点再按这个原价 × 比例算。</p>
          <p>例如基础价 100、增项 +20、节点 草稿 30% → 草稿金额 = 120 × 30% = 36。</p>
          <p>小票上增项显示为 <code>└</code>，节点显示为 <code>◆</code>，方便区分。</p>
        `
      },
    ]
  },
  {
    id: 'algorithm',
    title: '算法',
    items: [
            {
        title: '单稿件小计',
        html: `
          <p>普通稿件：</p>
          <span class="um-formula">小计 = (基础价 + 增项合计) × 数量 × 权限倍率</span>
          <p>含节点的稿件：</p>
          <span class="um-formula">小计 = (单元原价 × 各节点比例%之和) × 数量 × 权限倍率</span>
          <p>因为节点比例合计必须 = 100%，两种算法最终金额一致。</p>
        `
      },
      {
        title: '增项计算',
        html: `
          <p>两种算法：</p>
          <ul>
            <li><strong>×（按单价比例）</strong>：增项金额 = 单价 × 数值 / 100</li>
            <li><strong>＋（固定金额）</strong>：增项金额 = 数值</li>
          </ul>
          <p>增项金额会累加到单价上，再乘以数量与权限倍率。</p>
        `
      },
            {
        title: '节点计算',
        html: `
          <span class="um-formula">节点金额 = 单元原价 × 节点比例% × 数量 × 权限倍率</span>
          <p>其中 <strong>单元原价 = 基础价 + 增项合计</strong>。</p>
          <p>一个稿件的所有节点比例合计必须 = 100%。</p>
        `
      },
      {
        title: '增项与节点混合',
        html: `
          <p>同一稿件可以同时有增项和节点。计算顺序：</p>
          <ol>
            <li>先算<strong>增项合计</strong>（× 按基础价百分比，＋ 按固定金额）</li>
            <li><strong>单元原价 = 基础价 + 增项合计</strong></li>
            <li>节点按<strong>单元原价</strong>× 比例算</li>
          </ol>
          <p>举例：基础价 100，增项「复杂设 +20」，节点「草稿 30%」</p>
          <span class="um-formula">单元原价 = 100 + 20 = 120
草稿金额 = 120 × 30% = 36</span>
          <p>小票上：增项前面是 <code>└</code>，节点前面是 <code>◆</code>，两者区分显示。</p>
        `
      },
      {
        title: '稿件组小计',
        html: `
          <span class="um-formula">组小计 = 组内所有稿件小计之和</span>
          <p>组小计是组附加费用和组优惠折扣的计算基数。</p>
        `
      },
      {
        title: '组附加费用',
        html: `
          <ul>
            <li><strong>×（按组小计比例）</strong>：组附加费 = 组小计 × 数值 / 100</li>
            <li><strong>＋（固定金额）</strong>：组附加费 = 数值</li>
          </ul>
        `
      },
      {
        title: '组优惠折扣',
        html: `
          <p>计算基数是「组小计 + 组附加费用」：</p>
          <ul>
            <li><strong>×（按比例）</strong>：组优惠 = (组小计 + 组附加费) × 数值 / 100</li>
            <li><strong>−（固定金额）</strong>：组优惠 = 数值</li>
          </ul>
          <span class="um-formula">组合计 = 组小计 + 组附加费 − 组优惠</span>
        `
      },
      {
        title: '订单总价',
        html: `
          <span class="um-formula">订单总价 = 所有稿件组合计之和</span>
          <p>订单级附加费用和订单级优惠都以这个总价为基数计算。</p>
        `
      },
      {
        title: '订单级附加费用与优惠',
        html: `
          <ul>
            <li><strong>订单附加费</strong>：× 时 = 订单总价 × 数值 / 100；＋ 时 = 数值</li>
            <li><strong>订单优惠</strong>：× 时 = 订单总价 × 数值 / 100；− 时 = 数值</li>
          </ul>
          <span class="um-formula">应付金额 = 订单总价 + 订单附加费 − 订单优惠</span>
        `
      },
      {
        title: '预付款计算',
        html: `
          <p>按订单类型自动选择算法：</p>
          <ul>
            <li><strong>占位单</strong>：预付款 = 排单费（固定金额）</li>
            <li><strong>纯节点单</strong>（所有稿件都用节点计价）：预付款 = 每个稿件的第一个节点金额之和</li>
            <li><strong>普通订单</strong>：
              <ul>
                <li>定金模式为百分比：预付款 = 应付金额 × 定金%</li>
                <li>定金模式为固定金额：预付款 = 定金数值</li>
              </ul>
            </li>
          </ul>
        `
      },
      {
        title: '尾款',
        html: `
          <span class="um-formula">尾款 = 应付金额 − 预付款</span>
          <p>结单时如果有优惠，实收尾款 = 尾款 − 优惠金额。</p>
        `
      },
      {
        title: '结单优惠',
        html: `
          <p>结单时可以给尾款打折，三种方式：</p>
          <ul>
            <li><strong>按总应收比例</strong>：优惠 = 应付金额 × 数值 / 100</li>
            <li><strong>按尾款比例</strong>：优惠 = 原尾款 × 数值 / 100</li>
            <li><strong>具体金额</strong>：优惠 = 数值</li>
          </ul>
          <span class="um-formula">实收尾款 = 原尾款 − 优惠金额（不低于 0）</span>
        `
      },
      {
        title: '统计实收',
        html: `
          <span class="um-formula">统计实收 = 所有非退款、非支出的流水金额之和</span>
          <p>包含：预付款、排单费、尾款、废稿费、跑单费、记账收入。</p>
          <p>按流水的发生日期归入对应统计范围。</p>
        `
      },
      {
        title: '统计待结',
        html: `
          <p>统计当前所有未结清订单的尾款：</p>
          <ul>
            <li>标记为「待结」的订单：累加其 pendingAmount</li>
            <li>未完成的普通订单：累加其原尾款</li>
          </ul>
          <p>待结不受日期范围影响，只要订单没结清就计入。</p>
        `
      },
      {
        title: '统计结余',
        html: `
          <span class="um-formula">结余 = 实收 − 退款 − 支出</span>
        `
      },
      {
        title: '单主累计消费',
        html: `
          <p>每位单主卡片上显示的「累计消费」按流水汇总：</p>
          <ul>
            <li>该单主关联的所有非退款、非支出流水：+ 金额</li>
                     <li>退款类型流水：− 金额</li>
          </ul>
          <p>只统计与该单主相关的订单和结单记录产生的流水。</p>
        `
      }
    ]
  },
  {
    id: 'pricelist',
    title: '价目表',
    items: [
      {
        title: '一、入口与结构',
        html: `
          <p>从<strong>首页右上角第三个图标</strong>进入价目表。</p>
          <p>价目表分两个页面：</p>
          <ul>
            <li><strong>预览页</strong>：展示最终效果，可导出图片</li>
            <li><strong>设置页</strong>：编辑内容与样式</li>
          </ul>
          <p>设置页有两个标签：<strong>内容</strong>（写什么）和 <strong>样式</strong>（长什么样）。</p>
        `
      },
      {
        title: '二、模板',
        html: `
          <p>模板决定价目表的<strong>底图</strong>和<strong>正文 / 署名 / 底注的位置</strong>。</p>
          <p>在「样式 → 模板」里选一个，选中后底图和三个区域的位置会自动切换。</p>
          <p class="rs-tip-sm">模板由开发者预先内置，暂不支持用户自行上传模板。</p>
        `
      },
      {
        title: '三、价格分类',
        html: `
          <p>在「内容 → 价格分类」里点「+ 添加分类」新建。</p>
          <p>每个分类包含：</p>
          <ul>
            <li><strong>分类名</strong>：比如「吧唧」「纸片类」</li>
            <li><strong>标签</strong>：显示在分类名下方的小胶囊，逗号分隔</li>
            <li><strong>条目</strong>：每一行是一个稿件，可填名称、多档价格、备注</li>
          </ul>
          <p>分类头右侧可以：</p>
          <ul>
            <li>选<strong>所在页</strong>（手动分页时生效）</li>
            <li><strong>上移 / 下移</strong>调整顺序</li>
            <li>删除</li>
          </ul>
        `
      },
      {
        title: '四、附加模块',
        html: `
          <p>在「内容 → 附加模块」下，固定三个模块：</p>
          <ul>
            <li><strong>用途</strong></li>
            <li><strong>附加</strong></li>
            <li><strong>优惠</strong></li>
          </ul>
          <p>顺序固定，不可调整。每个模块可以：</p>
          <ul>
            <li>改标题名</li>
            <li>设置所在页</li>
            <li>启用 / 停用</li>
            <li>逐行填写内容</li>
          </ul>
          <p>右上角的<strong>「横排」</strong>开关，控制内容是一行排列还是逐行排列。单栏模式下会自动横排。</p>
        `
      },
      {
        title: '五、流程与须知',
        html: `
          <p>「约稿流程」「约稿须知」是<strong>全局共用</strong>的，在「快捷操作」里编辑。</p>
          <p>填写一次后，所有价目表都会自动使用。</p>
          <p>开启「流程 / 须知另起一页」后，它们会强制新开一页，<strong>左栏是流程、右栏是须知</strong>。</p>
          <p>关闭时接在价目表内容末尾，仍保持左右两栏。</p>
        `
      },
      {
        title: '六、标题样式与颜色',
        html: `
          <p>三组标题可以<strong>各自</strong>选样式：分类标题 / 附加模块标题 / 流程须知标题。</p>
          <p>每个可选四种：<strong>色块、编号、胶囊、竖线</strong>。</p>
          <hr style="border:none;border-top:1px dashed var(--line-soft);margin:12px 0;" />
          <p>颜色分三组：</p>
          <ul>
            <li><strong>标题文字色</strong>：三种标题的<strong>文字</strong>共用一个</li>
            <li><strong>装饰色</strong>：色块圆点 / 编号 / 胶囊底 / 竖线这些装饰元素的颜色
              <ul>
                <li>「装饰色统一」打开 → 三种标题共用一个色</li>
                <li>关闭 → 三个色卡各自独立</li>
              </ul>
            </li>
            <li><strong>内容色</strong>：条目名、价格、正文</li>
            <li><strong>小字色</strong>：备注、注脚</li>
          </ul>
          <p>标题右侧的↺按钮可一键恢复默认颜色。</p>
        `
      },
      {
        title: '七、实时预览',
        html: `
          <p>设置页可以<strong>边改边看</strong>：</p>
          <ul>
            <li>桌面端：右侧常驻预览，改任何设置立即刷新</li>
            <li>移动端：顶部有「实时预览」折叠条，点开展开 45% 高度</li>
          </ul>
          <p>展开状态会被记住，下次进入保持上次的状态。</p>
        `
      },
      {
        title: '八、预设存储 / 加载',
        html: `
          <p>顶部按钮：</p>
          <ul>
            <li><strong>存储</strong>：把当前全部内容 + 外观 + 流程须知存成一份预设</li>
            <li><strong>加载</strong>：套用已存的预设</li>
            <li><strong>恢复</strong>：仅把外观恢复默认，不动内容</li>
          </ul>
          <p>最多存 5 份预设。加载时外观会重置为极简黑白，内容按预设替换。</p>
        `
      },
      {
        title: '九、导出图片',
        html: `
          <p>预览页右上角「保存图片」把每一页导出为一张 PNG。</p>
          <p>多页时会得到 <code>价目表_1.png</code>、<code>价目表_2.png</code>…</p>
          <p>导出时页面右下角的页码会被隐藏。</p>
        `
      }
    ]
  },
];

var __umCurrentModuleId = '';

function renderUserManual() {
  const navBox = $('umNav');
  const contentBox = $('umContent');
  if (!navBox || !contentBox) return;

  /* 首次进入：默认选中第一个模块 */
  if (!__umCurrentModuleId || !USER_MANUAL_MODULES.find(m => m.id === __umCurrentModuleId)) {
    __umCurrentModuleId = USER_MANUAL_MODULES[0].id;
  }

  /* 顶部导航 */
  navBox.innerHTML = USER_MANUAL_MODULES.map(m => {
    const cls = 'um-nav-btn' + (m.id === __umCurrentModuleId ? ' active' : '');
    return `<button type="button" class="${cls}" onclick="selectUserManualModule('${escapeAttr(m.id)}')">${escapeHtml(m.title)}</button>`;
  }).join('');

  /* 内容区：当前模块的条目列表 */
  const module = USER_MANUAL_MODULES.find(m => m.id === __umCurrentModuleId);
  if (!module || !module.items || !module.items.length) {
    contentBox.innerHTML = `
      <div class="um-empty">
        <div class="um-empty-icon">📖</div>
        <div>该模块暂无内容</div>
      </div>`;
    return;
  }

  contentBox.innerHTML = '<div class="um-list">' + module.items.map((item, i) => {
    return `
      <div class="um-item" onclick="openUmDialog('${escapeAttr(module.id)}', ${i})">
        <div class="um-item-text">${escapeHtml(item.title)}</div>
        <div class="um-item-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 6 15 12 9 18"/>
          </svg>
        </div>
      </div>`;
  }).join('') + '</div>';
}

function selectUserManualModule(moduleId) {
  __umCurrentModuleId = moduleId;
  renderUserManual();
}

function openUmDialog(moduleId, itemIndex) {
  const module = USER_MANUAL_MODULES.find(m => m.id === moduleId);
  if (!module || !module.items[itemIndex]) return;
  const item = module.items[itemIndex];

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>${escapeHtml(item.title)}</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="um-dialog-content">${item.html || '<p>暂无内容</p>'}</div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}

function backFromUserManual() {
  showPage('pageMain');
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-04] 更新公告历史渲染                             ║
   ╚══════════════════════════════════════════════════════╝ */

var __announcementHistoryOpenMap = {};

function renderAnnouncementHistory() {
  const box = $('announcementHistoryList');
  if (!box) return;

  const announcements = (typeof ANNOUNCEMENTS !== 'undefined' && ANNOUNCEMENTS) ? ANNOUNCEMENTS : {};

  const versions = Object.keys(announcements);
  if (!versions.length) {
    box.innerHTML = `
      <div class="announcement-history-empty">
        <div class="announcement-history-empty-icon">📢</div>
        <div>暂无历史更新公告</div>
      </div>`;
    return;
  }

  /* 版本号降序：最新在上 */
  versions.sort((a, b) => {
    const pa = a.split('.').map(n => parseInt(n, 10) || 0);
    const pb = b.split('.').map(n => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const va = pa[i] || 0;
      const vb = pb[i] || 0;
      if (va !== vb) return vb - va;
    }
    return 0;
  });

  const latestVersion = versions[0];

  box.innerHTML = versions.map(v => {
    const item = announcements[v] || {};
    const isLatest = (v === latestVersion);
    const isOpen = !!__announcementHistoryOpenMap[v];

    return `
      <div class="announcement-history-item ${isLatest ? 'is-latest' : ''} ${isOpen ? 'is-open' : ''}"
           data-version="${escapeAttr(v)}">
        <div class="announcement-history-head" onclick="toggleAnnouncementHistoryItem('${escapeAttr(v)}')">
          <div class="announcement-history-title">
            <span>${escapeHtml(item.title || '更新公告')}</span>
            <span class="announcement-history-version">v${escapeHtml(v)}</span>
            ${isLatest ? '<span class="announcement-history-latest-tag">最新</span>' : ''}
          </div>
          <div class="announcement-history-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 6 15 12 9 18"/>
            </svg>
          </div>
        </div>
        <div class="announcement-history-body">
          ${item.html || '<p style="color:var(--ink-soft);font-size:13px;">本次更新暂无说明</p>'}
        </div>
      </div>`;
  }).join('');
}

function toggleAnnouncementHistoryItem(version) {
  if (!version) return;
  __announcementHistoryOpenMap[version] = !__announcementHistoryOpenMap[version];

  const el = document.querySelector('.announcement-history-item[data-version="' + CSS.escape(version) + '"]');
  if (el) {
    if (__announcementHistoryOpenMap[version]) el.classList.add('is-open');
    else                                        el.classList.remove('is-open');
  }
}

function backFromAnnouncementHistory() {
  showPage('pageMain');
}
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 4 部分 / 共 9 部分                                ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-05]  稿件组 ★动态编号★                          ║
   ║   [JS-06]  组内稿件                                   ║
   ║   [JS-07]  预设匹配下拉面板                           ║
   ║   [JS-08]  组附加费用（单位跟随算法）                 ║
   ║   [JS-09]  组优惠折扣（单位跟随算法）                 ║
   ║   [JS-10]  增项 / 节点 弹窗（双入口 + 单位）          ║
   ║   [JS-11]  制品预设填充 ★节点按 × % 填入★             ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-05] 稿件组 ★动态编号★ ══════════ */

function renumberGroups() {
  const blocks = document.querySelectorAll('#groupsContainer .group-block');
  blocks.forEach((block, i) => {
    const n = i + 1;
    block.dataset.groupNum = n;
    const label = block.querySelector('.group-title-input label');
    if (label) {
      label.textContent = `稿件组名称（留空则默认"稿件组 ${n}"）`;
    }
  });
}

function addGroup(presetTitle) {
  const container = $('groupsContainer');
  if (!container) return null;
  const div = document.createElement('div');
  div.className = 'group-block';

  div.innerHTML = `
    <div class="group-head">
      <div class="group-title-input">
        <label>稿件组名称（留空则默认"稿件组 1"）</label>
        <input class="group-title" placeholder="如：立绘组 / 头像组" value="${escapeHtml(presetTitle || '')}" />
      </div>
      <button class="icon-btn" onclick="removeGroup(this)" title="清空该组（保留结构）">×</button>
    </div>
    <div class="group-extras"></div>
    <button class="add-item-btn" onclick="addGroupExtra(this)">+ 组附加费用</button>
    <div class="group-discounts"></div>
    <button class="add-item-btn" onclick="addGroupDiscount(this)">+ 组优惠折扣</button>
    <div class="group-items-label">稿件（可填写或添加预设）</div>
    <div class="group-items"></div>
    <button class="add-item-btn" onclick="addItemToGroup(this)">+ 添加稿件</button>
    <div class="group-subtotal">组小计：<span class="g-subtotal-val">¥0.00</span></div>
  `;
  container.appendChild(div);
  addItemToGroup(div.querySelector('.group-items'), null);
  renumberGroups();
  return div;
}

function resolveGroupLabel(block, fallbackIdx) {
  const raw = block.querySelector('.group-title').value.trim();
  const num = block.dataset.groupNum || fallbackIdx;
  return raw ? ('稿件组' + num + '：' + raw) : ('稿件组' + num);
}

function removeGroup(btn) {
  const container = $('groupsContainer');
  if (!container) return;
  const blocks = container.querySelectorAll('.group-block');

  if (blocks.length <= 1) {
    const block = blocks[0];
    if (!block) return;
    block.querySelector('.group-items').innerHTML = '';
    block.querySelector('.group-extras').innerHTML = '';
    block.querySelector('.group-discounts').innerHTML = '';
    block.querySelector('.group-title').value = '';
    addItemToGroup(block.querySelector('.group-items'), null);
    renumberGroups();
    return;
  }

  btn.closest('.group-block').remove();
  renumberGroups();
}

function onPlaceholderToggle() {
  const on = $('placeholderToggle') && $('placeholderToggle').checked;

  if (on) clearAllFieldErrors();

  if (typeof setDepositModeLocked === 'function') {
    setDepositModeLocked(!!on);
  }
  if (typeof applyPlaceholderMode === 'function') {
    applyPlaceholderMode(!!on);
  }
}


/* ══════════ [JS-06] 组内稿件 ══════════ */
function addItemToGroup(target, presetObj) {
  let itemsEl = null;
  if (typeof target === 'string') {
    itemsEl = $(target);
  } else if (target && target.nodeType === 1) {
    if (target.classList.contains('group-items')) {
      itemsEl = target;
    } else {
      const gb = target.closest('.group-block');
      itemsEl = gb ? gb.querySelector('.group-items') : target.closest('.group-items');
    }
  }
  if (!itemsEl) return;

  const __perms = getPermissions();
  const __licenseOptions =
    `<option value=""></option>` +
    __perms.map(p =>
      `<option value="${escapeAttr(p.id)}">${escapeHtml(p.name)}</option>`
    ).join('');

  const div = document.createElement('div');
  div.className = 'item-block';
  div.innerHTML = `
    <div class="row">
      <div>
        <label>稿件名称（可输入或从预设选择）</label>
        <div class="item-name-wrap">
          <input class="item-name" placeholder="输入或选择预设" value="${presetObj ? escapeHtml(presetObj.name) : ''}" oninput="onItemNameInput(this)" onfocus="onItemNameFocus(this)" onkeydown="onItemNameKeydown(this, event)" autocomplete="off" autocorrect="off" spellcheck="false" />
          <button type="button" class="item-name-arrow" onclick="pickPresetForItem(this)" title="选择稿件预设" aria-label="选择稿件预设">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4 L6 8 L10 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div>
        <label>单价</label>
        <div class="input-unit-wrap prefix">
          <input type="number" step="0.01" class="item-price" />
          <span class="input-unit">¥</span>
        </div>
      </div>
      <div><label>数量</label><input type="number" step="1" class="item-qty" value="1" /></div>
      <div>
        <select class="item-license" title="权限">
          ${__licenseOptions}
        </select>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="icon-btn" onclick="openSubItemModal(this)" title="添加增项或节点">+</button>
        <button class="icon-btn" onclick="removeItemInGroup(this)" title="删除稿件">×</button>
      </div>
    </div>
  `;
  itemsEl.appendChild(div);
  if (presetObj) fillPresetIntoBlock(div, presetObj);
}

function removeItemInGroup(btn) {
  const itemBlock = btn.closest('.item-block');
  if (!itemBlock) return;
  const gb = btn.closest('.group-block');
  const itemsEl = gb ? gb.querySelector('.group-items') : btn.closest('.group-items');
  if (!itemsEl) return;

  const blocks = itemsEl.querySelectorAll('.item-block');
  if (blocks.length <= 1) {
    const block = blocks[0];
    block.querySelector('.item-name').value = '';
    block.querySelectorAll('.sub-item').forEach(s => s.remove());
    block.querySelector('.item-price').value = '';
    block.querySelector('.item-qty').value = '1';
    const lic = block.querySelector('.item-license');
    if (lic) lic.value = '';
    delete block.dataset.isNodes;
    return;
  }
  itemBlock.remove();
}


/* ══════════ [JS-07] 预设匹配下拉面板 ══════════ */
function getOrCreateMatchPanel(input) {
  const wrap = input.closest('.item-name-wrap');
  if (!wrap) return null;
  let panel = wrap.querySelector('.preset-match-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'preset-match-panel hidden';
    wrap.appendChild(panel);
  }
  return panel;
}

function renderMatchPanel(input) {
  const panel = getOrCreateMatchPanel(input);
  if (!panel) return;
  const q = (input.value || '').trim();
  const list = getPresets().filter(p => p.name && (!q || p.name.indexOf(q) > -1)).slice(0, 8);
  if (!list.length) { panel.classList.add('hidden'); panel.innerHTML = ''; return; }
  panel.innerHTML = list.map((p, i) =>
    `<div class="pm-item ${i === 0 ? 'active' : ''}" data-name="${escapeAttr(p.name)}">${escapeHtml(p.name)}</div>`
  ).join('');
  panel.classList.remove('hidden');
  if (!panel.__delegated) {
    panel.addEventListener('mousedown', function (e) {
      const item = e.target.closest('.pm-item');
      if (!item) return;
      const name = item.dataset.name;
      const inputEl = panel.closest('.item-name-wrap').querySelector('.item-name');
      selectPresetByName(inputEl, name);
    });
    panel.__delegated = true;
  }
}

document.addEventListener('mousedown', function (e) {
  if (!e.target.closest('.item-name-wrap')) {
    document.querySelectorAll('.preset-match-panel').forEach(p => p.classList.add('hidden'));
  }
});

function onItemNameInput(input) { renderMatchPanel(input); }
function onItemNameFocus(input) { renderMatchPanel(input); }
function onItemNameKeydown(input, e) {
  const panel = getOrCreateMatchPanel(input);
  if (!panel) return;
  const items = panel.querySelectorAll('.pm-item');
  if (!items.length) return;
  let idx = [].indexOf.call(items, panel.querySelector('.pm-item.active'));
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    idx = Math.min(items.length - 1, idx + 1);
    items.forEach(el => el.classList.remove('active'));
    items[idx].classList.add('active');
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    idx = Math.max(0, idx - 1);
    items.forEach(el => el.classList.remove('active'));
    items[idx].classList.add('active');
  } else if (e.key === 'Enter') {
    const active = panel.querySelector('.pm-item.active');
    if (active && !panel.classList.contains('hidden')) {
      e.preventDefault();
      selectPresetByName(input, active.dataset.name);
    }
  } else if (e.key === 'Escape') {
    panel.classList.add('hidden');
  }
}

function selectPresetByName(input, name) {
  const preset = getPresets().find(p => p.name === name);
  const panel = getOrCreateMatchPanel(input);
  if (panel) panel.classList.add('hidden');
  if (!preset) return;
  const block = input.closest('.item-block');
  if (preset.mode === 'sides') {
    window.__pendingPreset = preset;
    window.__currentBlock = block;
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head"><h3>选择：${escapeHtml(preset.name)}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="modal-body">
            <div class="actions">
              <button class="action-btn" onclick="applySidesToCurrent('single')">单面（${fmt(preset.singlePrice)}）</button>
              <button class="action-btn" onclick="applySidesToCurrent('double')">双面（${fmt(preset.doublePrice)}）</button>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }
  fillPresetIntoBlock(block, preset);
}

function refreshPresetDatalist() {
  document.querySelectorAll('.item-name:focus').forEach(renderMatchPanel);
}


/* ══════════ [JS-08] 组附加费用 ══════════ */
function addGroupExtra(btnOrBlock, preset) {
  let block;
  if (btnOrBlock && btnOrBlock.nodeType === 1 && btnOrBlock.classList.contains('group-block')) {
    block = btnOrBlock;
  } else if (btnOrBlock && btnOrBlock.closest) {
    block = btnOrBlock.closest('.group-block');
  } else {
    block = btnOrBlock;
  }
  if (!block) return;
  const container = block.querySelector('.group-extras');
  if (!container) return;

  const p = preset || { op: 'multiply', name: '', value: '' };
  const div = document.createElement('div');
  div.className = 'ge-row';
  div.innerHTML = `
    <div>
      <label>组附加费用名称（可输入或从预设选择）</label>
      <div class="item-name-wrap">
        <input placeholder="输入或选择预设" class="ge-name" value="${escapeHtml(p.name || '')}" autocomplete="off" spellcheck="false" />
        <button type="button" class="item-name-arrow" onclick="pickExtraPresetForGroup(this)" title="选择附加费用预设" aria-label="选择附加费用预设">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4 L6 8 L10 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="ge-op">
      <label>算法</label>
      <select class="ge-op-select">
        <option value="multiply" ${p.op === 'multiply' ? 'selected' : ''}>×</option>
        <option value="add" ${p.op === 'add' ? 'selected' : ''}>＋</option>
      </select>
    </div>
    <div>
      <label>数值</label>
      <div class="input-unit-wrap">
        <input placeholder="数值" type="number" step="0.01" class="ge-value" value="${p.value !== undefined && p.value !== null && p.value !== '' ? num2(p.value) : ''}" />
      </div>
    </div>
    <div class="ge-actions">
      <button class="icon-btn" onclick="addGroupExtra(this)" title="添加附加费用">+</button>
      <button class="icon-btn" onclick="this.closest('.ge-row').remove()" title="删除">×</button>
    </div>
  `;
  container.appendChild(div);

  const opSel = div.querySelector('.ge-op-select');
  const valInput = div.querySelector('.ge-value');
  applyUnitForInput(valInput, p.op);
  if (opSel && valInput) {
    opSel.addEventListener('change', function () {
      applyUnitForInput(valInput, opSel.value);
    });
  }
}

function pickExtraPresetForGroup(btn) {
  const row = btn.closest('.ge-row');
  openExtraPresetPicker(function (preset) {
    if (!preset || !row) return;
    row.querySelector('.ge-name').value = preset.name;
    row.querySelector('.ge-op-select').value = preset.op;
    row.querySelector('.ge-value').value = num2(preset.value);
    applyUnitForInput(row.querySelector('.ge-value'), preset.op);
  });
}


/* ══════════ [JS-09] 组优惠折扣 ══════════ */
function addGroupDiscount(btnOrBlock, preset) {
  let block;
  if (btnOrBlock && btnOrBlock.nodeType === 1 && btnOrBlock.classList.contains('group-block')) {
    block = btnOrBlock;
  } else if (btnOrBlock && btnOrBlock.closest) {
    block = btnOrBlock.closest('.group-block');
  } else {
    block = btnOrBlock;
  }
  if (!block) return;
  const container = block.querySelector('.group-discounts');
  if (!container) return;

  const p = preset || { op: 'multiply', name: '', value: '' };
  const div = document.createElement('div');
  div.className = 'ge-row';
  div.innerHTML = `
    <div>
      <label>组优惠折扣名称（可输入或从预设选择）</label>
      <div class="item-name-wrap">
        <input placeholder="输入或选择预设" class="gd-name" value="${escapeHtml(p.name || '')}" autocomplete="off" spellcheck="false" />
        <button type="button" class="item-name-arrow" onclick="pickDiscountPresetForGroup(this)" title="选择优惠折扣预设" aria-label="选择优惠折扣预设">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4 L6 8 L10 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="ge-op">
      <label>算法</label>
      <select class="gd-op-select">
        <option value="multiply" ${p.op === 'multiply' ? 'selected' : ''}>×</option>
        <option value="subtract" ${p.op === 'subtract' ? 'selected' : ''}>−</option>
      </select>
    </div>
    <div>
      <label>数值</label>
      <div class="input-unit-wrap">
        <input placeholder="数值" type="number" step="0.01" class="gd-value" value="${p.value !== undefined && p.value !== null && p.value !== '' ? num2(p.value) : ''}" />
      </div>
    </div>
    <div class="ge-actions">
      <button class="icon-btn" onclick="addGroupDiscount(this)" title="添加优惠折扣">+</button>
      <button class="icon-btn" onclick="this.closest('.ge-row').remove()" title="删除">×</button>
    </div>
  `;
  container.appendChild(div);

  const opSel = div.querySelector('.gd-op-select');
  const valInput = div.querySelector('.gd-value');
  applyUnitForInput(valInput, p.op);
  if (opSel && valInput) {
    opSel.addEventListener('change', function () {
      applyUnitForInput(valInput, opSel.value);
    });
  }
}

function pickDiscountPresetForGroup(btn) {
  const row = btn.closest('.ge-row');
  openDiscountPresetPicker(function (preset) {
    if (!preset || !row) return;
    row.querySelector('.gd-name').value = preset.name;
    row.querySelector('.gd-op-select').value = preset.op;
    row.querySelector('.gd-value').value = num2(preset.value);
    applyUnitForInput(row.querySelector('.gd-value'), preset.op);
  });
}


/* ══════════ [JS-10] 增项 / 节点 弹窗 ══════════ */

function openSubItemModal(btn) {
  const block = btn.closest('.item-block');
  window.__currentBlock = block;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()" style="max-width:420px;">
        <div class="modal-head">
          <h3>添加</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 16px;">
            请选择要添加的类型：
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="action-btn" style="flex:1;min-width:140px;" onclick="openAddonModal()">添加增项</button>
            <button class="action-btn ghost" style="flex:1;min-width:140px;" onclick="openNodeModal()">添加节点</button>
          </div>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:16px;">
            增项：每件加价；算法可选 ×（按单价比例）或 ＋（固定金额）。<br/>
            节点：按总价 × 比例拆分；一个稿件的所有节点比例合计必须为 100%。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:14px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
          </div>
        </div>
      </div>
    </div>`;
}

function openAddonModal() {
  const block = window.__currentBlock;
  if (!block) { closeModal(); return; }

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加增项</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin-top:8px;">
            <div><label>增项名称</label><input id="subName" placeholder="如：加急 / 描线" /></div>
            <div><label>算法</label>
              <select id="subOp" onchange="onSubOpChange()">
                <option value="multiply">×</option>
                <option value="add">＋</option>
              </select>
            </div>
            <div>
              <label>数值</label>
              <div class="input-unit-wrap suffix" id="subValueWrap">
                <input id="subValue" type="number" step="0.01" />
                <span class="input-unit" id="subValueUnit">%</span>
              </div>
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:10px;">
            × ：增项金额 = 单价 × 数值 / 100（即数值按 % 计算）。<br/>
            ＋ ：增项金额 = 数值（固定金额，单位元）。
          </p>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="backToSubItemChoice()">← 返回</button>
            <button class="action-btn" onclick="confirmSubItem()">确定</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('subName'); if (el) el.focus(); }, 50);
}

function onSubOpChange() {
  const op = $('subOp') ? $('subOp').value : 'multiply';
  const input = $('subValue');
  if (input) applyUnitForInput(input, op);
}

function openNodeModal() {
  const block = window.__currentBlock;
  if (!block) { closeModal(); return; }

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加节点</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin-top:8px;">
            <div><label>节点名称</label><input id="subName" placeholder="如：草稿 / 线稿 / 成图" /></div>
            <div><label>算法</label>
              <input value="×" readonly style="opacity:0.7;" />
            </div>
            <div>
              <label>比例</label>
              <div class="input-unit-wrap suffix">
                <input id="subValue" type="number" step="0.01" placeholder="如：30" />
                <span class="input-unit">%</span>
              </div>
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:10px;">
            节点金额 = 总价 × 比例 / 100。一个稿件的所有节点比例合计必须 = 100%。
          </p>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="backToSubItemChoice()">← 返回</button>
            <button class="action-btn" onclick="confirmNodeItem()">确定</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('subName'); if (el) el.focus(); }, 50);
}

function backToSubItemChoice() {
  const block = window.__currentBlock;
  if (!block) { closeModal(); return; }
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()" style="max-width:420px;">
        <div class="modal-head">
          <h3>添加</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 16px;">
            请选择要添加的类型：
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="action-btn" style="flex:1;min-width:140px;" onclick="openAddonModal()">添加增项</button>
            <button class="action-btn ghost" style="flex:1;min-width:140px;" onclick="openNodeModal()">添加节点</button>
          </div>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:16px;">
            增项：每件加价；算法可选 ×（按单价比例）或 ＋（固定金额）。<br/>
            节点：按总价 × 比例拆分；一个稿件的所有节点比例合计必须为 100%。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:14px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmSubItem() {
  const block = window.__currentBlock;
  if (!block) { closeModal(); return; }
  const name = $('subName').value.trim();
  const op = $('subOp').value;
  const value = $('subValue').value;
  if (!name) { $('subName').focus(); return; }
  addSubItem(block, name, op, value);
  closeModal();
}

function confirmNodeItem() {
  const block = window.__currentBlock;
  if (!block) { closeModal(); return; }
  const name = $('subName').value.trim();
  const value = $('subValue').value;
  if (!name) { $('subName').focus(); return; }
  if (value === '' || !isFinite(Number(value))) { $('subValue').focus(); return; }

  addSubItem(block, name, 'multiply', value, { isNode: true });
  closeModal();
}

function addSubItem(block, name, op, value, options) {
  options = options || {};
  const isNode = !!options.isNode;
  const o = isNode ? 'multiply' : (op || 'add');

  let v;
  if (value === '' || value === null || value === undefined) {
    v = '';
  } else if (isNode) {
    v = String(Number(value) || 0);
  } else if (o === 'multiply') {
    v = String(Number(value) || 0);
  } else {
    v = num2(value);
  }

  const sub = document.createElement('div');
  sub.className = 'sub-item';
  if (isNode) sub.dataset.isNode = '1';

  sub.innerHTML = `
    <div class="row">
      <div><label>${isNode ? '节点名称' : '增项名称'}</label><input class="sub-name" value="${escapeHtml(name || '')}" /></div>
      <div class="sub-op">
        <label>算法</label>
        <select class="sub-op-select" ${isNode ? 'disabled' : ''}>
          <option value="multiply" ${o === 'multiply' ? 'selected' : ''}>×</option>
          <option value="add" ${o === 'add' ? 'selected' : ''}>＋</option>
        </select>
      </div>
      <div>
        <label>数值</label>
        <div class="input-unit-wrap">
          <input type="number" step="0.01" class="sub-value" value="${v}" />
        </div>
      </div>
      <div><button class="icon-btn" onclick="this.closest('.sub-item').remove()" title="删除">×</button></div>
    </div>`;

  block.appendChild(sub);

  const valInput = sub.querySelector('.sub-value');
  const opSel = sub.querySelector('.sub-op-select');
  applyUnitForInput(valInput, o);

  if (!isNode && opSel && valInput) {
    opSel.addEventListener('change', function () {
      applyUnitForInput(valInput, opSel.value);
    });
  }
}


/* ══════════ [JS-11] 制品预设填充 ══════════ */
function fillPresetIntoBlock(block, preset) {
  if (!block || !preset) return;
  const nameInput  = block.querySelector('.item-name');
  const priceInput = block.querySelector('.item-price');
  const qtyInput   = block.querySelector('.item-qty');

  block.querySelectorAll('.sub-item').forEach(s => s.remove());

  nameInput.value = preset.name;

  if (preset.mode === 'fixed') {
    priceInput.value = num2(preset.fixedPrice);
    qtyInput.value = 1;
  } else if (preset.mode === 'sides') {
    const side = preset._side || 'single';
    nameInput.value = preset.name + (side === 'double' ? '（双面）' : '（单面）');
    priceInput.value = num2(side === 'double' ? preset.doublePrice : preset.singlePrice);
    qtyInput.value = 1;
  } else if (preset.mode === 'base_addon') {
    priceInput.value = num2(preset.basePrice);
    qtyInput.value = 1;
    (preset.addons || []).forEach(a => addSubItem(block, a.name, a.op, a.value));
  } else if (preset.mode === 'nodes') {
    priceInput.value = num2(preset.basePrice);
    qtyInput.value = 1;
    (preset.nodes || []).forEach(n => {
      addSubItem(block, n.name, 'multiply', Number(n.ratio) || 0, { isNode: true });
    });
  } else if (preset.mode === 'base_addon_nodes') {
    priceInput.value = num2(preset.basePrice);
    qtyInput.value = 1;
    (preset.addons || []).forEach(a => addSubItem(block, a.name, a.op, a.value));
    (preset.nodes || []).forEach(n => {
      addSubItem(block, n.name, 'multiply', Number(n.ratio) || 0, { isNode: true });
    });
  }
}

function pickPresetForItem(btn) {
  const block = btn.closest('.item-block');
  openPresetModal(function(preset) {
    if (!preset) return;
    if (preset.mode === 'sides') {
      window.__pendingPreset = preset;
      window.__currentBlock = block;
      $('modalRoot').innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-head"><h3>选择：${escapeHtml(preset.name)}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
            <div class="modal-body">
              <div class="actions">
                <button class="action-btn" onclick="applySidesToCurrent('single')">单面（${fmt(preset.singlePrice)}）</button>
                <button class="action-btn" onclick="applySidesToCurrent('double')">双面（${fmt(preset.doublePrice)}）</button>
              </div>
            </div>
          </div>
        </div>`;
      return;
    }
    block.querySelector('.item-name').value = preset.name;
    fillPresetIntoBlock(block, preset);
  });
}

function applySidesToCurrent(side) {
  const preset = window.__pendingPreset;
  const block = window.__currentBlock;
  closeModal();
  if (!preset || !block) return;
  block.querySelector('.item-name').value = preset.name + (side === 'double' ? '（双面）' : '（单面）');
  block.querySelector('.item-price').value = num2(side === 'double' ? preset.doublePrice : preset.singlePrice);
  block.querySelector('.item-qty').value = 1;
  block.querySelectorAll('.sub-item').forEach(s => s.remove());
  delete block.dataset.isNodes;
}
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 5 部分 / 共 9 部分                                ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-12]  稿件预设数据存取（★含分组）                ║
   ║   [JS-13]  订单级附加费用（单位跟随算法）             ║
   ║   [JS-14]  订单级优惠（单位跟随算法）                 ║
   ║   [JS-15]  赠品（价值固定 ¥ 前缀）                    ║
   ║   [JS-16]  附加费用预设                               ║
   ║   [JS-17]  优惠折扣预设                               ║
   ║   [JS-18]  预设分组管理（★拖动修复 + ★"+"按钮）      ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-12] 稿件预设数据存取 ══════════ */
const PRESET_KEY = 'listReceiptPresets';
const PRESET_GROUP_KEY = 'listReceiptPresetGroups';

/* ---------- 分组读写 ---------- */
function getPresetGroups() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRESET_GROUP_KEY));
    if (Array.isArray(stored)) return stored;
  } catch(e) {}
  return [];
}
function setPresetGroups(arr) {
  try {
    localStorage.setItem(PRESET_GROUP_KEY, JSON.stringify(arr || []));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满。');
    return false;
  }
}
function makePresetGroupId() {
  return 'pg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function getPresetGroupById(id) {
  if (!id) return null;
  return getPresetGroups().find(g => g.id === id) || null;
}

/* ---------- 预设读写 ---------- */
function getPresets() {
  try { return JSON.parse(localStorage.getItem(PRESET_KEY)) || []; }
  catch(e){ return []; }
}
function setPresets(arr) {
  try {
    localStorage.setItem(PRESET_KEY, JSON.stringify(arr));
  } catch(e) {
    alert('保存失败：浏览器存储空间不足，请清理部分预设或图片后重试。');
    return;
  }
  refreshPresetDatalist();
}

/* 按分组获取预设（含未分组） */
function getPresetsByGroup(groupId) {
  const all = getPresets();
  if (groupId === '__UNGROUPED__') {
    return all.filter(p => !p.groupId);
  }
  return all.filter(p => p.groupId === groupId);
}

/* 移动预设到指定分组 */
function movePresetToGroup(presetName, targetGroupId) {
  const presets = getPresets();
  const idx = presets.findIndex(p => p.name === presetName);
  if (idx < 0) return false;
  presets[idx].groupId = targetGroupId || '';
  setPresets(presets);
  return true;
}

function presetSummary(p) {
  if (p.mode === 'fixed') return '固定价 ' + fmt(p.fixedPrice);
  if (p.mode === 'sides') return '单面 ' + fmt(p.singlePrice) + ' / 双面 ' + fmt(p.doublePrice);
  if (p.mode === 'base_addon') {
    let s = '基础价 ' + fmt(p.basePrice);
    if (p.addons && p.addons.length) {
      s += '；增项：' + p.addons.map(a => {
        const v = a.op === 'multiply' ? pctShort(a.value) : num2(a.value);
        return a.name + ' ' + opSymbol(a.op) + v;
      }).join('、');
    }
    return s;
  }
  if (p.mode === 'nodes') {
    return '总价 ' + fmt(p.basePrice) + '；节点：'
      + (p.nodes || []).map(n => n.name + ' ×' + pctShort(n.ratio)).join('、');
  }
  if (p.mode === 'base_addon_nodes') {
    let s = '基础价 ' + fmt(p.basePrice);
    if (p.addons && p.addons.length) {
      s += '；增项：' + p.addons.map(a => {
        const v = a.op === 'multiply' ? pctShort(a.value) : num2(a.value);
        return a.name + ' ' + opSymbol(a.op) + v;
      }).join('、');
    }
    if (p.nodes && p.nodes.length) {
      s += '；节点：' + p.nodes.map(n => n.name + ' ×' + pctShort(n.ratio)).join('、');
    }
    return s;
  }
  return '';
}

function modeLabel(m) {
  return {
    fixed: '固定价',
    sides: '单双面计价',
    base_addon: '基础+增项',
    nodes: '按节点计价',
    base_addon_nodes: '基础+增项+节点',
  }[m] || m;
}

/* ---------- 打开预设选择弹窗（带分组过滤） ---------- */
function openPresetModal(onPick) {
  window.__presetPickCallback = onPick;
  window.__presetModalGroupFilter = 'all';

  const presets = getPresets();
  if (!presets.length) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head"><h3>选择预设稿件</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="modal-body">
            <p style="color:var(--ink-soft);">暂无预设，请先到「设置 → 稿件预设」中添加。</p>
            <div class="actions" style="justify-content:flex-end;"><button class="action-btn" onclick="closeModal()">关闭</button></div>
          </div>
        </div>
      </div>`;
    return;
  }

  renderPresetPickerModal();
}

function renderPresetPickerModal() {
  const groups = getPresetGroups();
  const allPresets = getPresets();
  const filter = window.__presetModalGroupFilter || 'all';

  let presets;
  if (filter === 'all') presets = allPresets;
  else if (filter === '__UNGROUPED__') presets = allPresets.filter(p => !p.groupId);
  else presets = allPresets.filter(p => p.groupId === filter);

  const ungroupedCount = allPresets.filter(p => !p.groupId).length;

  /* 分组标签栏 */
  let tabsHtml = `<button type="button" class="preset-group-tab ${filter === 'all' ? 'active' : ''}" onclick="setPresetModalFilter('all')">全部 (${allPresets.length})</button>`;
  groups.forEach(g => {
    const cnt = allPresets.filter(p => p.groupId === g.id).length;
    tabsHtml += `<button type="button" class="preset-group-tab ${filter === g.id ? 'active' : ''}" onclick="setPresetModalFilter('${escapeAttr(g.id)}')">${escapeHtml(g.name)} (${cnt})</button>`;
  });
  if (ungroupedCount > 0) {
    tabsHtml += `<button type="button" class="preset-group-tab ${filter === '__UNGROUPED__' ? 'active' : ''}" onclick="setPresetModalFilter('__UNGROUPED__')">未分组 (${ungroupedCount})</button>`;
  }

  let rows = '';
  if (!presets.length) {
    rows = `<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);padding:20px 6px;">该分组下暂无预设</td></tr>`;
  } else {
    rows = presets.map(p => {
      const info = presetSummary(p);
      const globalIdx = allPresets.findIndex(x => x.name === p.name);
      return `<tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${modeLabel(p.mode)}</td>
        <td style="color:var(--ink-soft);font-size:12px;">${escapeHtml(info)}</td>
        <td class="pick"><button class="pick-btn" onclick="presetPicked(${globalIdx})">选用</button></td>
      </tr>`;
    }).join('');
  }

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head"><h3>选择预设稿件</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="preset-group-tabs">${tabsHtml}</div>
          <table class="preset-table">
            <thead><tr><th>稿件名称</th><th>计价方式</th><th>说明</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function setPresetModalFilter(groupId) {
  window.__presetModalGroupFilter = groupId || 'all';
  renderPresetPickerModal();
}

function presetPicked(i) {
  const preset = getPresets()[i];
  const cb = window.__presetPickCallback;
  closeModal();
  if (cb) cb(preset);
}


/* ══════════ [JS-13] 订单级附加费用 ══════════ */
function addExtra(preset) {
  const c = $('extrasContainer');
  if (!c) return;
  const p = preset || { op: 'multiply', name: '', value: '' };
  const d = document.createElement('div');
  d.className = 'oe-row';
  d.innerHTML = `
    <div>
      <label style="margin-top:0;">附加费用名称（可输入或从预设选择）</label>
      <div class="item-name-wrap">
        <input placeholder="输入或选择预设" class="extra-name" value="${escapeHtml(p.name || '')}" autocomplete="off" spellcheck="false" />
        <button type="button" class="item-name-arrow" onclick="pickExtraPresetForOrderExtra(this)" title="选择附加费用预设" aria-label="选择附加费用预设">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4 L6 8 L10 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="oe-op">
      <label style="margin-top:0;">算法</label>
      <select class="extra-mode">
        <option value="multiply" ${p.op === 'multiply' ? 'selected' : ''}>×</option>
        <option value="add" ${p.op === 'add' ? 'selected' : ''}>＋</option>
      </select>
    </div>
    <div>
      <label style="margin-top:0;">数值</label>
      <div class="input-unit-wrap">
        <input placeholder="数值" type="number" step="0.01" class="extra-val" value="${p.value !== undefined && p.value !== null && p.value !== '' ? num2(p.value) : ''}" />
      </div>
    </div>
    <div class="oe-actions">
      <button class="icon-btn" onclick="addExtra()" title="添加附加费用">+</button>
      <button class="icon-btn" onclick="this.closest('.oe-row').remove()" title="删除">×</button>
    </div>`;
  c.appendChild(d);

  const opSel = d.querySelector('.extra-mode');
  const valInput = d.querySelector('.extra-val');
  applyUnitForInput(valInput, p.op);
  if (opSel && valInput) {
    opSel.addEventListener('change', function () {
      applyUnitForInput(valInput, opSel.value);
    });
  }
}

function pickExtraPresetForOrderExtra(btn) {
  const row = btn.closest('.oe-row');
  openExtraPresetPicker(function (preset) {
    if (!preset || !row) return;
    row.querySelector('.extra-name').value = preset.name;
    row.querySelector('.extra-mode').value = preset.op;
    row.querySelector('.extra-val').value = num2(preset.value);
    applyUnitForInput(row.querySelector('.extra-val'), preset.op);
  });
}


/* ══════════ [JS-14] 订单级优惠 ══════════ */
function addDiscount(preset) {
  const c = $('discountsContainer');
  if (!c) return;
  const p = preset || { op: 'multiply', name: '', value: '' };
  const d = document.createElement('div');
  d.className = 'oe-row';
  d.innerHTML = `
    <div>
      <label style="margin-top:0;">优惠名称（可输入或从预设选择）</label>
      <div class="item-name-wrap">
        <input placeholder="输入或选择预设" class="discount-name" value="${escapeHtml(p.name || '')}" autocomplete="off" spellcheck="false" />
        <button type="button" class="item-name-arrow" onclick="pickDiscountPresetForRow(this)" title="选择优惠折扣预设" aria-label="选择优惠折扣预设">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4 L6 8 L10 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="oe-op">
      <label style="margin-top:0;">算法</label>
      <select class="discount-mode">
        <option value="multiply" ${p.op === 'multiply' ? 'selected' : ''}>×</option>
        <option value="subtract" ${p.op === 'subtract' ? 'selected' : ''}>−</option>
      </select>
    </div>
    <div>
      <label style="margin-top:0;">数值</label>
      <div class="input-unit-wrap">
        <input placeholder="数值" type="number" step="0.01" class="discount-val" value="${p.value !== undefined && p.value !== null && p.value !== '' ? num2(p.value) : ''}" />
      </div>
    </div>
    <div class="oe-actions">
      <button class="icon-btn" onclick="addDiscount()" title="添加优惠">+</button>
      <button class="icon-btn" onclick="this.closest('.oe-row').remove()" title="删除">×</button>
    </div>`;
  c.appendChild(d);

  const opSel = d.querySelector('.discount-mode');
  const valInput = d.querySelector('.discount-val');
  applyUnitForInput(valInput, p.op);
  if (opSel && valInput) {
    opSel.addEventListener('change', function () {
      applyUnitForInput(valInput, opSel.value);
    });
  }
}

function pickDiscountPresetForRow(btn) {
  const row = btn.closest('.oe-row');
  openDiscountPresetPicker(function (preset) {
    if (!preset || !row) return;
    row.querySelector('.discount-name').value = preset.name;
    row.querySelector('.discount-mode').value = preset.op;
    row.querySelector('.discount-val').value = num2(preset.value);
    applyUnitForInput(row.querySelector('.discount-val'), preset.op);
  });
}


/* ══════════ [JS-15] 赠品 ══════════ */
function addGift() {
  const c = $('giftsContainer');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'kv-row';
  d.innerHTML = `
    <div><input placeholder="名称" class="gift-name" /></div>
    <div>
      <div class="input-unit-wrap prefix">
        <input placeholder="价值" type="number" step="0.01" class="gift-val" />
        <span class="input-unit">¥</span>
      </div>
    </div>
    <div><button class="icon-btn" onclick="this.closest('.kv-row').remove()" title="删除">×</button></div>`;
  c.appendChild(d);
}


/* ══════════ [JS-16] 附加费用预设 ══════════ */
const EXTRA_PRESET_KEY = 'listReceiptExtraPresets';
function getExtraPresets() {
  try { return JSON.parse(localStorage.getItem(EXTRA_PRESET_KEY)) || []; }
  catch(e){ return []; }
}
function setExtraPresets(arr) {
  try {
    localStorage.setItem(EXTRA_PRESET_KEY, JSON.stringify(arr));
  } catch(e) {
    alert('保存失败：浏览器存储空间不足。');
  }
}

function openExtraPresetSetting() { showPage('pageExtraPreset'); renderExtraPresetCards(); }

function renderExtraPresetCards() {
  const presets = getExtraPresets();
  const box = $('extraPresetCards');
  if (!box) return;
  if (!presets.length) { box.innerHTML = '<p style="color:var(--ink-soft);">暂无预设，点击「+ 添加附加费用预设」创建。</p>'; return; }
  box.innerHTML = presets.map((p, i) => {
    const v = p.op === 'multiply' ? pctShort(p.value) : fmt(p.value);
    return `
    <div style="border:1px solid var(--line-soft);padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <div><strong style="font-size:15px;">${escapeHtml(p.name)}</strong>
          <span style="color:var(--ink-soft);font-size:12px;margin-left:8px;">[${opLabel(p.op)} ${v}]</span></div>
        <div style="display:flex;gap:8px;">
          <button class="action-btn ghost" style="padding:6px 14px;font-size:12px;" onclick="editExtraPreset(${i})">编辑</button>
          <button class="action-btn ghost" style="padding:6px 14px;font-size:12px;border-color:var(--red);color:var(--red);" onclick="deleteExtraPreset(${i})">删除</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function deleteExtraPreset(i) {
  const presets = getExtraPresets();
  const name = presets[i] ? presets[i].name : '';
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head"><h3>删除预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <p>确定删除「${escapeHtml(name)}」吗？此操作不可恢复。</p>
          <div class="actions" style="justify-content:flex-end;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeleteExtraPreset(${i})">删除</button>
          </div>
        </div>
      </div>
    </div>`;
}
function confirmDeleteExtraPreset(i) {
  const presets = getExtraPresets();
  presets.splice(i, 1);
  setExtraPresets(presets);
  closeModal();
  renderExtraPresetCards();
}

let editingExtraPresetIndex = -1;
function editExtraPreset(i) { editingExtraPresetIndex = i; openExtraPresetAddModal(getExtraPresets()[i]); }
function openExtraPresetAddModal(data) {
  data = data || { op: 'multiply', name: '', value: '' };
  editingExtraPresetIndex = (arguments.length === 0) ? -1 : editingExtraPresetIndex;
  window.__editingExtraPreset = data;
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>${data.name ? '编辑附加费用预设' : '添加附加费用预设'}</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin-top:8px;">
            <div><label>名称</label><input id="ep_name" value="${escapeHtml(data.name || '')}" placeholder="如：复杂工艺" /></div>
            <div><label>算法</label>
              <select id="ep_op" onchange="onEpOpChange()">
                <option value="multiply" ${data.op==='multiply'?'selected':''}>×</option>
                <option value="add" ${data.op==='add'?'selected':''}>＋</option>
              </select>
            </div>
            <div>
              <label>数值</label>
              <div class="input-unit-wrap">
                <input id="ep_value" type="number" step="0.01" value="${data.value !== undefined && data.value !== null && data.value !== '' ? num2(data.value) : ''}" />
              </div>
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:12px;">
            × ：附加费用 = 小计 × 数值 / 100（数值按 % 计算）。<br/>
            ＋ ：附加费用 = 数值（固定金额，单位元）。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="saveExtraPreset()">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  const opInput = $('ep_value');
  if (opInput) applyUnitForInput(opInput, data.op || 'multiply');
}

function onEpOpChange() {
  const op = $('ep_op') ? $('ep_op').value : 'multiply';
  const valInput = $('ep_value');
  if (valInput) applyUnitForInput(valInput, op);
}

function saveExtraPreset() {
  const name = $('ep_name').value.trim();
  const op = $('ep_op').value;
  const value = Number($('ep_value').value) || 0;
  if (!name) { $('ep_name').focus(); return; }
  const obj = { name, op, value };
  const presets = getExtraPresets();
  if (editingExtraPresetIndex >= 0 && presets[editingExtraPresetIndex]) {
    presets[editingExtraPresetIndex] = obj;
  } else {
    presets.push(obj);
  }
  setExtraPresets(presets);
  editingExtraPresetIndex = -1;
  closeModal();
  renderExtraPresetCards();
}

function openExtraPresetPicker(onPick) {
  window.__extraPickCallback = onPick;
  const presets = getExtraPresets();
  if (!presets.length) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head"><h3>选择附加费用预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="modal-body">
            <p style="color:var(--ink-soft);">暂无预设，请先到「设置 → 附加费用」中添加。</p>
            <div class="actions" style="justify-content:flex-end;"><button class="action-btn" onclick="closeModal()">关闭</button></div>
          </div>
        </div>
      </div>`;
    return;
  }
  let rows = presets.map((p, i) => {
    const v = p.op === 'multiply' ? pctShort(p.value) : fmt(p.value);
    return `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${opLabel(p.op)}</td>
      <td>${v}</td>
      <td class="pick"><button class="pick-btn" onclick="extraPresetPicked(${i})">选用</button></td>
    </tr>`;
  }).join('');
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head"><h3>选择附加费用预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <table class="preset-table">
            <thead><tr><th>名称</th><th>算法</th><th>数值</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
function extraPresetPicked(i) {
  const preset = getExtraPresets()[i];
  const cb = window.__extraPickCallback;
  closeModal();
  if (cb) cb(preset);
}


/* ══════════ [JS-17] 优惠折扣预设 ══════════ */
const DISCOUNT_PRESET_KEY = 'listReceiptDiscountPresets';
function getDiscountPresets() {
  try { return JSON.parse(localStorage.getItem(DISCOUNT_PRESET_KEY)) || []; }
  catch(e){ return []; }
}
function setDiscountPresets(arr) {
  try {
    localStorage.setItem(DISCOUNT_PRESET_KEY, JSON.stringify(arr));
  } catch(e) {
    alert('保存失败：浏览器存储空间不足。');
  }
}

function openDiscountPresetSetting() { showPage('pageDiscountPreset'); renderDiscountPresetCards(); }

function renderDiscountPresetCards() {
  const presets = getDiscountPresets();
  const box = $('discountPresetCards');
  if (!box) return;
  if (!presets.length) { box.innerHTML = '<p style="color:var(--ink-soft);">暂无预设，点击「+ 添加优惠折扣预设」创建。</p>'; return; }
  box.innerHTML = presets.map((p, i) => {
    const v = p.op === 'multiply' ? pctShort(p.value) : fmt(p.value);
    return `
    <div style="border:1px solid var(--line-soft);padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <div><strong style="font-size:15px;">${escapeHtml(p.name)}</strong>
          <span style="color:var(--ink-soft);font-size:12px;margin-left:8px;">[${discOpLabel(p.op)} ${v}]</span></div>
        <div style="display:flex;gap:8px;">
          <button class="action-btn ghost" style="padding:6px 14px;font-size:12px;" onclick="editDiscountPreset(${i})">编辑</button>
          <button class="action-btn ghost" style="padding:6px 14px;font-size:12px;border-color:var(--red);color:var(--red);" onclick="deleteDiscountPreset(${i})">删除</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function deleteDiscountPreset(i) {
  const presets = getDiscountPresets();
  const name = presets[i] ? presets[i].name : '';
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head"><h3>删除预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <p>确定删除「${escapeHtml(name)}」吗？此操作不可恢复。</p>
          <div class="actions" style="justify-content:flex-end;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeleteDiscountPreset(${i})">删除</button>
          </div>
        </div>
      </div>
    </div>`;
}
function confirmDeleteDiscountPreset(i) {
  const presets = getDiscountPresets();
  presets.splice(i, 1);
  setDiscountPresets(presets);
  closeModal();
  renderDiscountPresetCards();
}

let editingDiscountPresetIndex = -1;
function editDiscountPreset(i) { editingDiscountPresetIndex = i; openDiscountPresetAddModal(getDiscountPresets()[i]); }
function openDiscountPresetAddModal(data) {
  data = data || { op: 'multiply', name: '', value: '' };
  editingDiscountPresetIndex = (arguments.length === 0) ? -1 : editingDiscountPresetIndex;
  window.__editingDiscountPreset = data;
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>${data.name ? '编辑优惠折扣预设' : '添加优惠折扣预设'}</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin-top:8px;">
            <div><label>名称</label><input id="dp_name" value="${escapeHtml(data.name || '')}" placeholder="如：同担折扣" /></div>
            <div><label>算法</label>
              <select id="dp_op" onchange="onDpOpChange()">
                <option value="multiply" ${data.op==='multiply'?'selected':''}>×</option>
                <option value="subtract" ${data.op==='subtract'?'selected':''}>−</option>
              </select>
            </div>
            <div>
              <label>数值</label>
              <div class="input-unit-wrap">
                <input id="dp_value" type="number" step="0.01" value="${data.value !== undefined && data.value !== null && data.value !== '' ? num2(data.value) : ''}" />
              </div>
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink-soft);margin-top:12px;">
            × ：优惠金额 = 总价 × 数值 / 100（数值按 % 计算）。<br/>
            − ：优惠金额 = 数值（固定金额，单位元）。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="saveDiscountPreset()">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  const opInput = $('dp_value');
  if (opInput) applyUnitForInput(opInput, data.op || 'multiply');
}

function onDpOpChange() {
  const op = $('dp_op') ? $('dp_op').value : 'multiply';
  const valInput = $('dp_value');
  if (valInput) applyUnitForInput(valInput, op);
}

function saveDiscountPreset() {
  const name = $('dp_name').value.trim();
  const op = $('dp_op').value;
  const value = Number($('dp_value').value) || 0;
  if (!name) { $('dp_name').focus(); return; }
  const obj = { name, op, value };
  const presets = getDiscountPresets();
  if (editingDiscountPresetIndex >= 0 && presets[editingDiscountPresetIndex]) {
    presets[editingDiscountPresetIndex] = obj;
  } else {
    presets.push(obj);
  }
  setDiscountPresets(presets);
  editingDiscountPresetIndex = -1;
  closeModal();
  renderDiscountPresetCards();
}

function openDiscountPresetPicker(onPick) {
  window.__discountPickCallback = onPick;
  const presets = getDiscountPresets();
  if (!presets.length) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head"><h3>选择优惠折扣预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="modal-body">
            <p style="color:var(--ink-soft);">暂无预设，请先到「设置 → 优惠折扣」中添加。</p>
            <div class="actions" style="justify-content:flex-end;"><button class="action-btn" onclick="closeModal()">关闭</button></div>
          </div>
        </div>
      </div>`;
    return;
  }
  let rows = presets.map((p, i) => {
    const v = p.op === 'multiply' ? pctShort(p.value) : fmt(p.value);
    return `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${discOpLabel(p.op)}</td>
      <td>${v}</td>
      <td class="pick"><button class="pick-btn" onclick="discountPresetPicked(${i})">选用</button></td>
    </tr>`;
  }).join('');
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head"><h3>选择优惠折扣预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <table class="preset-table">
            <thead><tr><th>名称</th><th>算法</th><th>数值</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
function discountPresetPicked(i) {
  const preset = getDiscountPresets()[i];
  const cb = window.__discountPickCallback;
  closeModal();
  if (cb) cb(preset);
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-18] 预设分组管理（★拖动修复 + ★"+"按钮）        ║
   ╚══════════════════════════════════════════════════════╝ */

/* 展开状态记忆 */
var __presetGroupOpenMap = {};

/* ---------- 设置页主渲染（覆盖旧 renderPresetCards） ---------- */
function renderPresetCards() {
  const box = $('presetCards');
  if (!box) return;

  const groups = getPresetGroups();
  const allPresets = getPresets();

  /* 排序：按 order 字段 */
  groups.sort((a, b) => (a.order || 0) - (b.order || 0));

  /* 未分组预设 */
  const ungrouped = allPresets.filter(p => !p.groupId);



  let html = '';

  /* 分组列表 */
  groups.forEach((g, gi) => {
    const items = allPresets.filter(p => p.groupId === g.id);
    const isOpen = !!__presetGroupOpenMap[g.id];
    const canUp = gi > 0;
    const canDown = gi < groups.length - 1;

    html += `
      <div class="preset-group-block ${isOpen ? 'is-open' : ''}" data-group-id="${escapeAttr(g.id)}">
        <div class="preset-group-head" onclick="togglePresetGroupOpen('${escapeAttr(g.id)}', event)">
          <div class="preset-group-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 6 15 12 9 18"/>
            </svg>
          </div>
          <div class="preset-group-title">
            <span>${escapeHtml(g.name)}</span>
            <span class="preset-group-count">(${items.length})</span>
          </div>
          <div class="preset-group-actions" onclick="event.stopPropagation()">
            <button type="button" class="preset-group-btn is-add" onclick="openPresetGroupAddPicker('${escapeAttr(g.id)}')" title="从「未分组预设」添加到此组">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button type="button" class="preset-group-btn" onclick="movePresetGroupUp('${escapeAttr(g.id)}')" title="上移" ${canUp ? '' : 'disabled'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
            <button type="button" class="preset-group-btn" onclick="movePresetGroupDown('${escapeAttr(g.id)}')" title="下移" ${canDown ? '' : 'disabled'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </button>
            <button type="button" class="preset-group-btn" onclick="openPresetGroupRenameModal('${escapeAttr(g.id)}')" title="改名">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button type="button" class="preset-group-btn is-danger" onclick="askDeletePresetGroup('${escapeAttr(g.id)}')" title="删除分组">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6 H21"/>
                <path d="M8 6 V4 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V6"/>
                <path d="M6 6 L7 20 a2 2 0 0 0 2 2 h6 a2 2 0 0 0 2 -2 L17 6"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="preset-group-body" data-group-id="${escapeAttr(g.id)}">
          ${items.length ? items.map(p => renderPresetCardItem(p, g.id)).join('') : '<div class="preset-group-empty">该分组暂无预设</div>'}
        </div>
      </div>`;
  });

  /* 未分组块 */
  const ungroupedOpen = !!__presetGroupOpenMap['__UNGROUPED__'];
  html += `
    <div class="preset-group-block is-ungrouped ${ungroupedOpen ? 'is-open' : ''}" data-group-id="__UNGROUPED__">
      <div class="preset-group-head" onclick="togglePresetGroupOpen('__UNGROUPED__', event)">
        <div class="preset-group-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 6 15 12 9 18"/>
          </svg>
        </div>
        <div class="preset-group-title">
          <span>未分组</span>
          <span class="preset-group-count">(${ungrouped.length})</span>
          <span class="preset-group-ungroup-tag">默认</span>
        </div>
      </div>
      <div class="preset-group-body" data-group-id="__UNGROUPED__">
        ${ungrouped.length ? ungrouped.map(p => renderPresetCardItem(p, '__UNGROUPED__')).join('') : '<div class="preset-group-empty">暂无未分组预设</div>'}
      </div>
    </div>`;

  if (!allPresets.length && !groups.length) {
    box.innerHTML = '<p style="color:var(--ink-soft);text-align:center;padding:30px 0;">暂无预设，点击上方「+ 添加预设」创建。</p>';
    return;
  }

  box.innerHTML = html;

  /* 绑定长按拖动 */
  bindPresetCardDrag();
}

/* ---------- 单条预设卡片 ---------- */
function renderPresetCardItem(p, groupId) {
  const globalIdx = getPresets().findIndex(x => x.name === p.name);
  const summary = presetSummary(p);
  return `
    <div class="preset-card" data-preset-name="${escapeAttr(p.name)}" data-group-id="${escapeAttr(groupId)}">
      <div class="preset-card-drag-handle" title="长按拖动排序">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="8"  x2="20" y2="8"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="16" x2="20" y2="16"/>
        </svg>
      </div>
      <div class="preset-card-body">
        <div class="preset-card-name">${escapeHtml(p.name)}</div>
        <div class="preset-card-meta">[${modeLabel(p.mode)}] ${escapeHtml(summary)}</div>
      </div>
      <div class="preset-card-actions">
        <button type="button" class="preset-card-btn" onclick="editPreset(${globalIdx})">编辑</button>
        <button type="button" class="preset-card-btn" onclick="openPresetMoveModal('${escapeAttr(p.name)}')">移动到</button>
        <button type="button" class="preset-card-btn is-danger" onclick="deletePreset(${globalIdx})">删除</button>
      </div>
    </div>`;
}

/* ---------- 展开/收起分组 ---------- */
function togglePresetGroupOpen(groupId, e) {
  if (e && e.target.closest('.preset-group-actions')) return;
  __presetGroupOpenMap[groupId] = !__presetGroupOpenMap[groupId];
  const block = document.querySelector('.preset-group-block[data-group-id="' + CSS.escape(groupId) + '"]');
  if (block) {
    if (__presetGroupOpenMap[groupId]) block.classList.add('is-open');
    else                              block.classList.remove('is-open');
  }
}

/* ---------- 分组：新增 ---------- */
function openPresetGroupAddModal() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加分组</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <label>分组名称</label>
          <input id="newPresetGroupName" placeholder="如：头像类 / 立绘类" maxlength="20" />
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="saveNewPresetGroup()">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('newPresetGroupName'); if (el) el.focus(); }, 50);
}

function saveNewPresetGroup() {
  const name = ($('newPresetGroupName') ? $('newPresetGroupName').value : '').trim();
  if (!name) { showSimpleAlert('提示', '请填写分组名称。'); return; }

  const groups = getPresetGroups();
  if (groups.some(g => g.name === name)) {
    showSimpleAlert('提示', '「' + escapeHtml(name) + '」已存在。');
    return;
  }

  const maxOrder = groups.reduce((m, g) => Math.max(m, g.order || 0), -1);
  groups.push({
    id: makePresetGroupId(),
    name: name,
    order: maxOrder + 1,
  });
  setPresetGroups(groups);

  /* 新分组默认展开 */
  const newGroup = groups[groups.length - 1];
  __presetGroupOpenMap[newGroup.id] = true;

  closeModal();
  renderPresetCards();
}

/* ---------- 分组：改名 ---------- */
function openPresetGroupRenameModal(groupId) {
  const g = getPresetGroupById(groupId);
  if (!g) return;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>重命名分组</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <label>分组名称</label>
          <input id="renamePresetGroupName" value="${escapeAttr(g.name)}" maxlength="20" />
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmRenamePresetGroup('${escapeAttr(groupId)}')">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => {
    const el = $('renamePresetGroupName');
    if (el) { el.focus(); el.select(); }
  }, 50);
}

function confirmRenamePresetGroup(groupId) {
  const name = ($('renamePresetGroupName') ? $('renamePresetGroupName').value : '').trim();
  if (!name) { showSimpleAlert('提示', '请填写分组名称。'); return; }

  const groups = getPresetGroups();
  if (groups.some(g => g.id !== groupId && g.name === name)) {
    showSimpleAlert('提示', '「' + escapeHtml(name) + '」已存在。');
    return;
  }

  const g = groups.find(x => x.id === groupId);
  if (!g) { closeModal(); return; }
  g.name = name;
  setPresetGroups(groups);
  closeModal();
  renderPresetCards();
}

/* ---------- 分组：删除（连同预设一起删） ---------- */
function askDeletePresetGroup(groupId) {
  const g = getPresetGroupById(groupId);
  if (!g) return;

  const count = getPresetsByGroup(groupId).length;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>删除分组</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.7;">
            确定删除分组「<strong>${escapeHtml(g.name)}</strong>」吗？
          </p>
          <p style="font-size:13px;color:#c0392b;margin:6px 0 0;line-height:1.7;">
            该分组下的 <strong>${count}</strong> 条预设将一并删除，且不可恢复。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeletePresetGroup('${escapeAttr(groupId)}')">确定删除</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmDeletePresetGroup(groupId) {
  const groups = getPresetGroups().filter(g => g.id !== groupId);
  setPresetGroups(groups);

  /* 同时删掉该分组下所有预设 */
  const presets = getPresets().filter(p => p.groupId !== groupId);
  setPresets(presets);

  delete __presetGroupOpenMap[groupId];

  closeModal();
  renderPresetCards();
}

/* ---------- 分组：上移/下移 ---------- */
function movePresetGroupUp(groupId) {
  const groups = getPresetGroups();
  groups.sort((a, b) => (a.order || 0) - (b.order || 0));
  const idx = groups.findIndex(g => g.id === groupId);
  if (idx <= 0) return;

  const tmp = groups[idx - 1];
  groups[idx - 1] = groups[idx];
  groups[idx] = tmp;
  groups.forEach((g, i) => { g.order = i; });
  setPresetGroups(groups);
  renderPresetCards();
}

function movePresetGroupDown(groupId) {
  const groups = getPresetGroups();
  groups.sort((a, b) => (a.order || 0) - (b.order || 0));
  const idx = groups.findIndex(g => g.id === groupId);
  if (idx < 0 || idx >= groups.length - 1) return;

  const tmp = groups[idx + 1];
  groups[idx + 1] = groups[idx];
  groups[idx] = tmp;
  groups.forEach((g, i) => { g.order = i; });
  setPresetGroups(groups);
  renderPresetCards();
}

/* ---------- 预设：移动到其他分组 ---------- */
function openPresetMoveModal(presetName) {
  const presets = getPresets();
  const p = presets.find(x => x.name === presetName);
  if (!p) return;

  const groups = getPresetGroups();
  groups.sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentGroupId = p.groupId || '__UNGROUPED__';

  let optionsHtml = `<option value="__UNGROUPED__" ${currentGroupId === '__UNGROUPED__' ? 'selected' : ''}>未分组</option>`;
  groups.forEach(g => {
    optionsHtml += `<option value="${escapeAttr(g.id)}" ${currentGroupId === g.id ? 'selected' : ''}>${escapeHtml(g.name)}</option>`;
  });

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>移动到分组</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.7;">
            把「<strong>${escapeHtml(presetName)}</strong>」移动到：
          </p>
          <label>目标分组</label>
          <select id="presetMoveTarget">${optionsHtml}</select>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmPresetMove('${escapeAttr(presetName)}')">确定</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmPresetMove(presetName) {
  const sel = $('presetMoveTarget');
  if (!sel) { closeModal(); return; }
  const targetGroupId = sel.value === '__UNGROUPED__' ? '' : sel.value;
  movePresetToGroup(presetName, targetGroupId);
  closeModal();
  renderPresetCards();
}

/* ---------- ★ 分组「+ 按钮」：从未分组预设添加到此组 ---------- */
function openPresetGroupAddPicker(targetGroupId) {
  const g = getPresetGroupById(targetGroupId);
  if (!g) { showSimpleAlert('提示', '分组不存在。'); return; }

  const ungrouped = getPresets().filter(p => !p.groupId);

  if (!ungrouped.length) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>添加到「${escapeHtml(g.name)}」</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="um-picker-empty">
              暂无未分组的预设。<br>
              <span style="font-size:11.5px;opacity:0.8;">新建的预设默认为「未分组」，可以在添加后回到这里选入本组。</span>
            </div>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn" onclick="closeModal()">关闭</button>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  renderPresetGroupAddPicker(targetGroupId, '');
}

function renderPresetGroupAddPicker(targetGroupId, searchText) {
  const g = getPresetGroupById(targetGroupId);
  if (!g) { closeModal(); return; }

  const q = String(searchText || '').trim().toLowerCase();
  const ungrouped = getPresets().filter(p => !p.groupId);
  const filtered = q
    ? ungrouped.filter(p => String(p.name || '').toLowerCase().indexOf(q) > -1)
    : ungrouped;

  const rows = filtered.length
    ? filtered.map(p => {
        const summary = presetSummary(p);
        return `
          <div class="um-picker-row">
            <div class="um-picker-body">
              <div class="um-picker-name">${escapeHtml(p.name)}</div>
              <div class="um-picker-meta">[${modeLabel(p.mode)}] ${escapeHtml(summary)}</div>
            </div>
            <button type="button" class="um-picker-add-btn"
                    onclick="pickUngroupedPresetToGroup('${escapeAttr(p.name)}', '${escapeAttr(targetGroupId)}')">
              添加
            </button>
          </div>`;
      }).join('')
    : `<div class="um-picker-empty">没有匹配的预设</div>`;

  const showAllBtn = ungrouped.length > 1
    ? `<button type="button" class="action-btn ghost" style="padding:6px 14px;font-size:12px;"
              onclick="pickAllUngroupedToGroup('${escapeAttr(targetGroupId)}')">
         全部添加（${ungrouped.length}）
       </button>`
    : '';

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加到「${escapeHtml(g.name)}」</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <input class="um-picker-search" id="umPickerSearch"
                 placeholder="搜索未分组预设名称"
                 value="${escapeAttr(searchText || '')}"
                 oninput="onPresetGroupAddPickerSearch(this.value, '${escapeAttr(targetGroupId)}')" />
          <div class="um-picker-list">${rows}</div>
          <div class="actions" style="justify-content:space-between;align-items:center;margin-top:18px;gap:10px;">
            <div>${showAllBtn}</div>
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}

function onPresetGroupAddPickerSearch(value, targetGroupId) {
  renderPresetGroupAddPicker(targetGroupId, value);
  /* 焦点回到搜索框（因为重新渲染会丢焦点），并恢复光标到末尾 */
  const el = $('umPickerSearch');
  if (el) {
    el.focus();
    const v = el.value;
    try { el.setSelectionRange(v.length, v.length); } catch (e) {}
  }
}

function pickUngroupedPresetToGroup(presetName, targetGroupId) {
  if (!presetName || !targetGroupId) return;

  const presets = getPresets();
  const idx = presets.findIndex(p => p.name === presetName && !p.groupId);
  if (idx < 0) {
    /* 该预设可能已被其他操作移走，重新刷新弹窗即可 */
    renderPresetGroupAddPicker(targetGroupId, ($('umPickerSearch') ? $('umPickerSearch').value : ''));
    return;
  }

  presets[idx].groupId = targetGroupId;
  setPresets(presets);

  /* 保持弹窗打开，继续添加（更顺手） */
  const searchVal = $('umPickerSearch') ? $('umPickerSearch').value : '';
  renderPresetGroupAddPicker(targetGroupId, searchVal);

  /* 底部列表也要刷新 */
  renderPresetCards();
}

function pickAllUngroupedToGroup(targetGroupId) {
  if (!targetGroupId) return;

  const presets = getPresets();
  let moved = 0;
  presets.forEach(p => {
    if (!p.groupId) { p.groupId = targetGroupId; moved++; }
  });

  if (!moved) return;
  setPresets(presets);

  closeModal();
  renderPresetCards();

  const g = getPresetGroupById(targetGroupId);
  showSimpleAlert('已添加', '已将 ' + moved + ' 条未分组预设添加到「' + escapeHtml(g ? g.name : '') + '」。');
}

/* ---------- ★ 预设卡片：拖动排序（同组内） ----------
   v3：改成「按下拖动把手即可拖动」，不再依赖长按。
   原因：
     1. iOS Safari 在 pointerdown 里 preventDefault 会吞掉后续 pointermove；
     2. 长按时手指微抖会被误判为滚动，导致长按失败；
     3. setPointerCapture 与 touch-action 的配合不稳定。
   依赖 CSS：.preset-card-drag-handle { touch-action: none; }（已在 [CSS-24] 中）
*/

var __presetDrag = null;

function bindPresetCardDrag() {
  const box = $('presetCards');
  if (!box || box.__presetDragBound) return;
  box.__presetDragBound = true;

  box.addEventListener('pointerdown', onPresetCardPointerDown);
  window.addEventListener('pointermove', onPresetCardPointerMove, { passive: false });
  window.addEventListener('pointerup', onPresetCardPointerUp);
  window.addEventListener('pointercancel', onPresetCardPointerCancel);
}

function onPresetCardPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  const handle = e.target.closest('.preset-card-drag-handle');
  if (!handle) return;
  const card = handle.closest('.preset-card');
  if (!card) return;

  const presetName = card.dataset.presetName;
  const groupId = card.dataset.groupId;
  if (!presetName || !groupId) return;

  /* 清理旧会话 */
  if (__presetDrag) {
    if (__presetDrag.card) __presetDrag.card.classList.remove('is-dragging');
    __presetDrag = null;
  }

  /* ★ 关键：只记录起点。
     不 preventDefault（避免 iOS 吞 pointermove）
     不 setPointerCapture（避免浏览器差异） */
  __presetDrag = {
    card: card,
    presetName: presetName,
    groupId: groupId,
    startX: e.clientX,
    startY: e.clientY,
    pointerId: e.pointerId,
    active: false,
    moveThreshold: 4,   /* 移动超过 4px 即激活拖动 */
  };
}

function onPresetCardPointerMove(e) {
  const s = __presetDrag;
  if (!s) return;
  if (e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

  /* 未激活：检查是否应该激活 */
  if (!s.active) {
    const dx = Math.abs(e.clientX - s.startX);
    const dy = Math.abs(e.clientY - s.startY);
    if (dx > s.moveThreshold || dy > s.moveThreshold) {
      s.active = true;
      s.card.classList.add('is-dragging');
      document.body.classList.add('is-preset-dragging');
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch (err) {}
      }
    }
    return;   /* 激活这一帧不处理位置，下一帧开始处理 */
  }

  /* 已激活：拖动中，此时才 preventDefault */
  e.preventDefault();

  const card = s.card;
  const groupBody = card.closest('.preset-group-body');
  if (!groupBody) return;

  const siblings = Array.from(groupBody.querySelectorAll('.preset-card'))
    .filter(el => el !== card);

  const cardRect = card.getBoundingClientRect();
  const cardCenterY = cardRect.top + cardRect.height / 2;

  let targetCard = null;
  let insertBefore = false;

  for (const sib of siblings) {
    const r = sib.getBoundingClientRect();
    const cy = r.top + r.height / 2;
    if (cardCenterY < cy) {
      targetCard = sib;
      insertBefore = true;
      break;
    }
  }

  siblings.forEach(el => el.classList.remove('is-drop-target'));

  if (targetCard) {
    targetCard.classList.add('is-drop-target');
    if (insertBefore) groupBody.insertBefore(card, targetCard);
    else              groupBody.insertBefore(card, targetCard.nextSibling);
  } else if (siblings.length) {
    groupBody.appendChild(card);
  }
}

function onPresetCardPointerUp(e) {
  const s = __presetDrag;
  if (!s) return;
  if (e && e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

  /* 只是点了把手但没拖动：什么都不做 */
  if (!s.active) {
    __presetDrag = null;
    return;
  }

  finishPresetDrag(s);
}

function onPresetCardPointerCancel(e) {
  const s = __presetDrag;
  if (!s) return;
  if (e && e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

  if (!s.active) {
    __presetDrag = null;
    return;
  }

  finishPresetDrag(s);
}

function finishPresetDrag(s) {
  const card = s.card;
  const groupBody = card.closest('.preset-group-body');

  card.classList.remove('is-dragging');
  document.body.classList.remove('is-preset-dragging');

  if (!groupBody) {
    __presetDrag = null;
    renderPresetCards();
    return;
  }

  groupBody.querySelectorAll('.preset-card.is-drop-target')
    .forEach(el => el.classList.remove('is-drop-target'));

  /* 按 DOM 顺序取名字 */
  const newOrder = Array.from(groupBody.querySelectorAll('.preset-card'))
    .map(el => el.dataset.presetName);

  const groupId = s.groupId;
  const allPresets = getPresets();

  const groupPresets = newOrder
    .map(name => allPresets.find(p => p.name === name))
    .filter(Boolean);

  if (groupPresets.length !== newOrder.length) {
    __presetDrag = null;
    renderPresetCards();
    return;
  }

  const groupIdForCheck = (groupId === '__UNGROUPED__') ? '' : groupId;
  const others = allPresets.filter(p => {
    const pg = p.groupId || '';
    return pg !== groupIdForCheck;
  });

  /* 重建数组：按分组头顺序 + 组内顺序重组 */
  const groups = getPresetGroups().slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const ordered = [];

  groups.forEach(g => {
    if (g.id === groupIdForCheck) {
      groupPresets.forEach(p => ordered.push(p));
    } else {
      others.filter(p => (p.groupId || '') === g.id).forEach(p => ordered.push(p));
    }
  });

  if (groupIdForCheck === '') {
    groupPresets.forEach(p => ordered.push(p));
  } else {
    others.filter(p => !p.groupId).forEach(p => ordered.push(p));
  }

  others.forEach(p => {
    if (ordered.indexOf(p) === -1) ordered.push(p);
  });

  setPresets(ordered);
  __presetDrag = null;
  renderPresetCards();
}
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 6 部分 / 共 9 部分                                ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-19] 小票设置模块（拖拽 / 等比 / 伸缩）          ║
   ║   [JS-20] 本地字体导入                                ║
   ║   [JS-21] applyPlaceholderMode                        ║
   ║   [JS-22] 生成前校验                                  ║
   ║   [JS-23] calcItem                                    ║
   ║   [JS-24] calcGroup                                   ║
   ║   [JS-25] generate                                    ║
   ║   [JS-26] 小票页离开提醒                              ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-19] 小票设置模块 ══════════ */

const RECEIPT_SETTINGS_KEY = 'listReceiptReceiptSettings';

const DEFAULT_RECEIPT_SETTINGS = {
  headerImg: '',
  headerImgState: { w: 0, h: 0, l: 0, t: 0, baseW: 0 },
  footerImg: '',
  footerImgState: { w: 0, h: 0, l: 0, t: 0, baseW: 0 },
  footer1: '十分荣幸为您服务',
  footer2: '欢迎下次光临～',
  bgColor: '#ffffff',
  bgImg: '',
  bgImgState: { w: 0, h: 0, l: 0, t: 0, baseW: 0 },
  bgOpacity: 1,
  font: 'system',
  fontSize: 13.5,
  colorPrimary: '#111111',
  colorSecondary: '#555555',
};

const FONT_FAMILY_MAP = {
  'system': '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Inter", "Helvetica Neue", Arial, sans-serif',
  "'PingFang SC','Microsoft YaHei',sans-serif": "'PingFang SC','Microsoft YaHei',sans-serif",
  "'Source Han Sans SC','Noto Sans SC','Microsoft YaHei',sans-serif": "'Source Han Sans SC','Noto Sans SC','Microsoft YaHei',sans-serif",
  "'Source Han Serif SC','Noto Serif SC','Songti SC',serif": "'Source Han Serif SC','Noto Serif SC','Songti SC',serif",
  "'KaiTi','STKaiti','Kaiti SC',serif": "'KaiTi','STKaiti','Kaiti SC',serif",
  "'YouYuan','STYuanti','Yuanti SC',cursive": "'YouYuan','STYuanti','Yuanti SC',cursive",
  "Georgia,'Times New Roman',serif": "Georgia,'Times New Roman',serif",
  "'Times New Roman',Times,serif": "'Times New Roman',Times,serif",
  "'Courier New',Courier,monospace": "'Courier New',Courier,monospace",
  "'Slideyouran','Yanshi Youran Xiaokai',cursive": "'Slideyouran','Yanshi Youran Xiaokai',cursive",
  "'Playball',cursive": "'Playball',cursive",
  "'Alex Brush',cursive": "'Alex Brush', cursive",
};

const DEFAULT_FONT_SIZE = 13.5;
const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 24;

function getReceiptSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECEIPT_SETTINGS_KEY));
    if (stored && typeof stored === 'object') {
      const merged = Object.assign({}, DEFAULT_RECEIPT_SETTINGS, stored);
      if (!merged.font) {
        merged.font = stored.fontCN || stored.fontEN || 'system';
      }
      if (!merged.footer1 || String(merged.footer1).trim() === '') {
        merged.footer1 = DEFAULT_RECEIPT_SETTINGS.footer1;
      }
      if (!merged.footer2 || String(merged.footer2).trim() === '') {
        merged.footer2 = DEFAULT_RECEIPT_SETTINGS.footer2;
      }
      if (typeof merged.fontSize !== 'number' || !isFinite(merged.fontSize)) {
        merged.fontSize = DEFAULT_FONT_SIZE;
      }
      if (!merged.headerImgState) merged.headerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
      if (!merged.footerImgState) merged.footerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
      if (!merged.bgImgState)     merged.bgImgState     = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
      delete merged.stickers;
      delete merged.stickerImg;
      delete merged.stickerImgState;
      return merged;
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_RECEIPT_SETTINGS));
}

function setReceiptSettings(obj) {
  try {
    localStorage.setItem(RECEIPT_SETTINGS_KEY, JSON.stringify(obj));
    return true;
  } catch(e) {
    const isQuota = e && (e.name === 'QuotaExceededError'
                       || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
                       || e.code === 22);
    if (isQuota) {
      alert(
        '保存失败：浏览器存储空间已满。\n\n' +
        '建议：\n' +
        '1) 换一张更小的图片\n' +
        '2) 点击设置面板里的「清除」删掉其它已上传的图片\n' +
        '3) 到「设置 → 数据同步」导出备份后清理'
      );
    } else {
      alert('保存失败：' + (e && e.message ? e.message : '未知错误'));
    }
    return false;
  }
}

function compressImageFile(file, maxSize, quality) {
  maxSize = maxSize || 1400;
  quality = (quality === undefined) ? 0.82 : quality;

  return new Promise((resolve) => {
    if (!file) { resolve(''); return; }

    const isPng = file.type === 'image/png';
    const reader = new FileReader();

    reader.onload = function (e) {
      const src = e.target.result;
      const img = new Image();

      img.onload = function () {
        const natW = img.naturalWidth || 0;
        const natH = img.naturalHeight || 0;

        if (natW <= maxSize && natH <= maxSize && file.size <= 400 * 1024) {
          resolve(src);
          return;
        }

        let w = natW, h = natH;
        if (w > maxSize || h > maxSize) {
          const scale = Math.min(maxSize / w, maxSize / h);
          w = Math.max(1, Math.round(w * scale));
          h = Math.max(1, Math.round(h * scale));
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const out = isPng
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', quality);
          resolve(out.length >= src.length ? src : out);
        } catch (err) {
          resolve(src);
        }
      };

      img.onerror = function () { resolve(src); };
      img.src = src;
    };

    reader.onerror = function () { resolve(''); };
    reader.readAsDataURL(file);
  });
}

function resolveFontFamily(fontKey) {
  if (!fontKey) return FONT_FAMILY_MAP['system'];
  if (FONT_FAMILY_MAP[fontKey]) return FONT_FAMILY_MAP[fontKey];
  if (fontKey.indexOf('Local_') === 0) {
    return `"${fontKey}", sans-serif`;
  }
  return FONT_FAMILY_MAP['system'];
}

/* ---------- 应用设置 ---------- */
function applyReceiptSettings() {
  const receipt = $('receipt');
  if (!receipt) return;

  const s = getReceiptSettings();

  if ($('rsFooter1') && $('rsFooter1').value !== '') s.footer1 = $('rsFooter1').value;
  if ($('rsFooter2') && $('rsFooter2').value !== '') s.footer2 = $('rsFooter2').value;

  if ($('rsBgColor')) s.bgColor = $('rsBgColor').value;
  if ($('rsColorPrimary')) s.colorPrimary = $('rsColorPrimary').value;
  if ($('rsColorSecondary')) s.colorSecondary = $('rsColorSecondary').value;
  if ($('rsBgOpacity')) s.bgOpacity = parseFloat($('rsBgOpacity').value);
  if ($('rsFont')) s.font = $('rsFont').value;
  if ($('rsFontSize')) {
    const fs = parseFloat($('rsFontSize').value);
    if (isFinite(fs) && fs > 0) s.fontSize = fs;
  }

  if ($('rsBgColorHex')) $('rsBgColorHex').value = s.bgColor;
  if ($('rsColorPrimaryHex')) $('rsColorPrimaryHex').value = s.colorPrimary;
  if ($('rsColorSecondaryHex')) $('rsColorSecondaryHex').value = s.colorSecondary;
  if ($('rsBgOpacityVal')) $('rsBgOpacityVal').textContent = Math.round((s.bgOpacity || 0) * 100) + '%';
  if ($('rsFontSizeVal')) $('rsFontSizeVal').textContent = Number(s.fontSize || DEFAULT_FONT_SIZE).toFixed(1) + 'px';
  updateFontSizeDot();

  setReceiptSettings(s);

  const fontFamily = resolveFontFamily(s.font);
  receipt.style.setProperty('--rc-font', fontFamily);
  receipt.style.setProperty('--rc-ink', s.colorPrimary || '#111111');
  receipt.style.setProperty('--rc-ink-soft', s.colorSecondary || '#555555');
  receipt.style.setProperty('--rc-font-size', (s.fontSize || DEFAULT_FONT_SIZE) + 'px');
  receipt.style.background = s.bgColor || '#ffffff';

  const l1 = $('outFooterLine1');
  const l2 = $('outFooterLine2');
  if (l1) {
    l1.textContent = (s.footer1 && s.footer1.trim()) ? s.footer1 : DEFAULT_RECEIPT_SETTINGS.footer1;
  }
  if (l2) {
    l2.textContent = (s.footer2 && s.footer2.trim()) ? s.footer2 : DEFAULT_RECEIPT_SETTINGS.footer2;
  }

  applyBgImgRef(s.bgImg, s.bgImgState, s.bgOpacity);
  applyBlockImgRef('header', s.headerImg, s.headerImgState);
  applyBlockImgRef('footer', s.footerImg, s.footerImgState);
}

/* ---------- 票头 / 票尾 ---------- */
function applyBlockImg(kind, src, state) {
  const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
  const img = kind === 'header' ? $('outHeaderImg') : $('outFooterImg');
  if (!block || !img) return;

  if (!src) {
    block.classList.remove('show');
    block.style.height = '0px';
    img.removeAttribute('src');
    return;
  }

  state = state || { w: 0, h: 0, l: 0, t: 0, baseW: 0 };

  const doApply = () => {
    block.classList.add('show');

    const blockW = block.offsetWidth || block.clientWidth || 0;

    let ratio = 1;
    if (state.w > 0 && state.baseW > 0 && blockW > 0) {
      ratio = blockW / state.baseW;
    }

    const natW = img.naturalWidth || 1;
    const natH = img.naturalHeight || 1;

    let imgW, imgH;
    if (state.w > 0) {
      imgW = state.w * ratio;
      imgH = (state.h > 0) ? state.h * ratio : (natH / natW) * imgW;
    } else {
      imgW = blockW;
      imgH = (natH / natW) * imgW;
    }

    const imgL = (state.l || 0) * ratio;
    const imgT = (state.t || 0) * ratio;

    img.style.width  = imgW + 'px';
    img.style.height = imgH + 'px';
    img.style.objectFit = 'fill';
    img.style.left = imgL + 'px';
    img.style.top  = imgT + 'px';

    updateBlockHeight(block, img);
    updateImageHandles(block, img);
  };

  if (img.src === src && img.complete && img.naturalWidth > 0) {
    doApply();
  } else {
    img.onload = doApply;
    img.onerror = () => { block.classList.remove('show'); block.style.height = '0px'; };
    img.src = src;
  }
}

function applyBlockImgRef(kind, ref, state) {
  const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
  const img = kind === 'header' ? $('outHeaderImg') : $('outFooterImg');
  if (!block || !img) return;

  if (!ref) {
    applyBlockImg(kind, '', state);
    return;
  }

  resolveImageSrc(ref).then(url => {
    if (!url) {
      applyBlockImg(kind, '', state);
      return;
    }
    applyBlockImg(kind, url, state);
  }).catch(() => {
    applyBlockImg(kind, '', state);
  });
}

function updateBlockHeight(block, img) {
  if (!block || !img) return;
  const imgH = img.offsetHeight || 0;
  const imgT = parseFloat(img.style.top) || 0;
  block.style.height = Math.max(0, imgT + imgH) + 'px';
}

/* ---------- 背景 ---------- */
function applyBgImg(src, state, opacity) {
  const wrap = $('outBgWrap');
  const img = $('outBgImg');
  if (!img || !wrap) return;

  if (!src) {
    wrap.classList.remove('has-img');
    img.classList.remove('has-img');
    img.removeAttribute('src');
    return;
  }

  state = state || { w: 0, h: 0, l: 0, t: 0, baseW: 0 };

  const doApply = () => {
    wrap.classList.add('has-img');
    img.classList.add('has-img');
    img.style.opacity = (opacity === undefined ? 1 : opacity);

    const receipt = $('receipt');
    const receiptW = receipt ? receipt.clientWidth  : 560;
    const receiptH = receipt ? receipt.clientHeight : 800;

    const natW = img.naturalWidth  || 1;
    const natH = img.naturalHeight || 1;

    if (!state.w || state.w === 0) {
      img.style.width  = receiptW + 'px';
      img.style.height = receiptH + 'px';
      img.style.left   = '0px';
      img.style.top    = '0px';
      img.style.objectFit = 'fill';
    } else {
      let ratio = 1;
      if (state.baseW > 0 && receiptW > 0) {
        ratio = receiptW / state.baseW;
      }
      const w = state.w * ratio;
      const h = state.h ? (state.h * ratio) : (natH / natW) * w;
      img.style.width  = w + 'px';
      img.style.height = h + 'px';
      img.style.left   = ((state.l || 0) * ratio) + 'px';
      img.style.top    = ((state.t || 0) * ratio) + 'px';
      img.style.objectFit = 'fill';
    }

    updateImageHandles(wrap, img);
  };

  if (img.src === src && img.complete && img.naturalWidth > 0) {
    doApply();
  } else {
    img.onload = doApply;
    img.onerror = () => { wrap.classList.remove('has-img'); img.classList.remove('has-img'); };
    img.src = src;
  }
}

function applyBgImgRef(ref, state, opacity) {
  const wrap = $('outBgWrap');
  const img = $('outBgImg');
  if (!wrap || !img) return;

  if (!ref) {
    applyBgImg('', state, opacity);
    return;
  }

  resolveImageSrc(ref).then(url => {
    if (!url) {
      applyBgImg('', state, opacity);
      return;
    }
    applyBgImg(url, state, opacity);
  }).catch(() => {
    applyBgImg('', state, opacity);
  });
}


/* ---------- 图片编辑器 ---------- */

var __imgSess = null;

function updateImageHandles(container, img) {
  if (!container || !img) return;

  const l = parseFloat(img.style.left) || 0;
  const t = parseFloat(img.style.top) || 0;
  const w = img.offsetWidth || 0;
  const h = img.offsetHeight || 0;

  const dot = container.querySelector('.receipt-img-handle');
  if (dot) {
    dot.style.left = (l + w - 9) + 'px';
    dot.style.top  = (t + h - 9) + 'px';
  }

  const HR = 7;
  container.querySelectorAll('.img-resize-handle').forEach(function (el) {
    const dir = el.dataset.dir;
    if (dir === 'n') {
      el.style.left = l + 'px';
      el.style.top  = (t - HR) + 'px';
      el.style.width  = w + 'px';
      el.style.height = (HR * 2) + 'px';
    } else if (dir === 's') {
      el.style.left = l + 'px';
      el.style.top  = (t + h - HR) + 'px';
      el.style.width  = w + 'px';
      el.style.height = (HR * 2) + 'px';
    } else if (dir === 'w') {
      el.style.left = (l - HR) + 'px';
      el.style.top  = t + 'px';
      el.style.width  = (HR * 2) + 'px';
      el.style.height = h + 'px';
    } else if (dir === 'e') {
      el.style.left = (l + w - HR) + 'px';
      el.style.top  = t + 'px';
      el.style.width  = (HR * 2) + 'px';
      el.style.height = h + 'px';
    }
  });
}

function positionHandle(kind) {
  if (kind !== 'header' && kind !== 'footer') return;
  const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
  const img   = kind === 'header' ? $('outHeaderImg')   : $('outFooterImg');
  if (!block || !img) return;
  updateImageHandles(block, img);
}
function positionBgHandle() {
  const wrap = $('outBgWrap');
  const img  = $('outBgImg');
  if (!wrap || !img) return;
  updateImageHandles(wrap, img);
}

function bindImageEditor(container, img, key, opts) {
  if (!container || !img) return;
  opts = opts || {};

  const handle        = container.querySelector('.receipt-img-handle');
  const resizeHandles = container.querySelectorAll('.img-resize-handle');

  function killSession() {
    if (!__imgSess) return;
    window.removeEventListener('pointermove', __imgSess.moveFn);
    window.removeEventListener('pointerup',   __imgSess.upFn);
    window.removeEventListener('pointercancel', __imgSess.upFn);
    __imgSess = null;
  }

  function ensureActive() {
    if (__activeReceiptImage !== key) {
      __activeReceiptImage = key;
      updateReceiptImageActiveState();
    }
  }

  function begin(e, mode, dir) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    killSession();
    ensureActive();

    const sess = {
      mode: mode,
      dir: dir || '',
      pid: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      l0: parseFloat(img.style.left) || 0,
      t0: parseFloat(img.style.top)  || 0,
      w0: img.offsetWidth  || 0,
      h0: img.offsetHeight || 0,
      onChange: opts.onChange,
      onEnd: opts.onEnd,
    };
    sess.moveFn = onMove;
    sess.upFn   = onUp;
    __imgSess = sess;

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup',   onUp);
    window.addEventListener('pointercancel', onUp);

    e.preventDefault();
    e.stopPropagation();
  }

  function onMove(e) {
    const s = __imgSess;
    if (!s || e.pointerId !== s.pid) return;
    e.preventDefault();

    const dx = e.clientX - s.sx;
    const dy = e.clientY - s.sy;

    let l = s.l0, t = s.t0, w = s.w0, h = s.h0;

    if (s.mode === 'move') {
      l = s.l0 + dx;
      t = s.t0 + dy;
    } else if (s.mode === 'scale') {
      const ar = (s.w0 > 0 && s.h0 > 0) ? (s.h0 / s.w0) : 1;
      const deltaW = (dx + dy * ar) / 2;
      w = Math.max(20, s.w0 + deltaW);
      h = Math.max(20, w * ar);
    } else if (s.mode === 'resize') {
      const d = s.dir;
      if (d === 'e') {
        w = Math.max(20, s.w0 + dx);
      } else if (d === 'w') {
        w = Math.max(20, s.w0 - dx);
        l = s.l0 + (s.w0 - w);
      } else if (d === 's') {
        h = Math.max(20, s.h0 + dy);
      } else if (d === 'n') {
        h = Math.max(20, s.h0 - dy);
        t = s.t0 + (s.h0 - h);
      }
    }

    img.style.left   = l + 'px';
    img.style.top    = t + 'px';
    img.style.width  = w + 'px';
    img.style.height = h + 'px';
    img.style.objectFit = 'fill';

    updateImageHandles(container, img);

    if (typeof s.onChange === 'function') s.onChange();
  }

  function onUp(e) {
    const s = __imgSess;
    if (!s) return;
    if (e && e.pointerId !== undefined && e.pointerId !== s.pid) return;

    killSession();

    if (typeof s.onEnd === 'function') s.onEnd();
  }

  img.onpointerdown = function (e) { begin(e, 'move'); };
  if (handle) {
    handle.onpointerdown = function (e) { begin(e, 'scale'); };
  }
  resizeHandles.forEach(function (h) {
    h.onpointerdown = function (e) {
      begin(e, 'resize', h.dataset.dir);
    };
  });
}

function setupReceiptImgDrag() {
  (function () {
    const block = $('outHeaderBlock');
    const img   = $('outHeaderImg');
    if (!block || !img || !block.classList.contains('show')) return;
    bindImageEditor(block, img, 'header', {
      onChange: function () { updateBlockHeight(block, img); },
      onEnd:    function () { saveImgState('header', img); }
    });
  })();

  (function () {
    const block = $('outFooterBlock');
    const img   = $('outFooterImg');
    if (!block || !img || !block.classList.contains('show')) return;
    bindImageEditor(block, img, 'footer', {
      onChange: function () { updateBlockHeight(block, img); },
      onEnd:    function () { saveImgState('footer', img); }
    });
  })();

  (function () {
    const wrap = $('outBgWrap');
    const img  = $('outBgImg');
    if (!wrap || !img || !img.classList.contains('has-img')) return;
    bindImageEditor(wrap, img, 'bg', {
      onChange: function () {},
      onEnd:    function () { saveBgState(); }
    });
  })();
}

/* ---------- 打开 / 关闭小票设置 ---------- */
function openReceiptSettings() {
  const layout = $('receiptLayout');
  if (!layout) return;
  layout.classList.add('settings-open');
  fillReceiptSettingsForm();
  applyReceiptSettings();
  renderCustomFontList();
  setTimeout(() => setupReceiptImgDrag(), 150);

  if (window.innerWidth < 768) {
    const shell = document.querySelector('.receipt-shell');
    if (shell && typeof shell.scrollIntoView === 'function') {
      setTimeout(() => {
        shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
}
function closeReceiptSettings() {
  const layout = $('receiptLayout');
  if (layout) layout.classList.remove('settings-open');
  document.querySelectorAll('.receipt-img-block').forEach(el => el.classList.remove('dragging'));
  const bg = $('outBgImg');
  if (bg) bg.classList.remove('dragging');

  __activeReceiptImage = null;
  updateReceiptImageActiveState();
}

function switchRsTab(tab) {
  document.querySelectorAll('.rs-tab').forEach(t => {
    if (t.dataset.tab === tab) t.classList.add('active');
    else t.classList.remove('active');
  });
  document.querySelectorAll('.rs-pane').forEach(p => p.classList.remove('active'));
  if (tab === 'basic' && $('rsPaneBasic')) $('rsPaneBasic').classList.add('active');
  if (tab === 'style' && $('rsPaneStyle')) $('rsPaneStyle').classList.add('active');
}

function fillReceiptSettingsForm() {
  const s = getReceiptSettings();
  if ($('rsFooter1')) $('rsFooter1').value = s.footer1 || '';
  if ($('rsFooter2')) $('rsFooter2').value = s.footer2 || '';
  if ($('rsBgColor')) $('rsBgColor').value = s.bgColor || '#ffffff';
  if ($('rsBgColorHex')) $('rsBgColorHex').value = s.bgColor || '#ffffff';
  if ($('rsBgOpacity')) $('rsBgOpacity').value = (s.bgOpacity === undefined ? 1 : s.bgOpacity);
  if ($('rsBgOpacityVal')) $('rsBgOpacityVal').textContent = Math.round((s.bgOpacity === undefined ? 1 : s.bgOpacity) * 100) + '%';
  if ($('rsColorPrimary')) $('rsColorPrimary').value = s.colorPrimary || '#111111';
  if ($('rsColorPrimaryHex')) $('rsColorPrimaryHex').value = s.colorPrimary || '#111111';
  if ($('rsColorSecondary')) $('rsColorSecondary').value = s.colorSecondary || '#555555';
  if ($('rsColorSecondaryHex')) $('rsColorSecondaryHex').value = s.colorSecondary || '#555555';

  if ($('rsFontSize')) {
    const fs = (typeof s.fontSize === 'number' && isFinite(s.fontSize)) ? s.fontSize : DEFAULT_FONT_SIZE;
    $('rsFontSize').value = fs;
  }
  if ($('rsFontSizeVal')) {
    const fs = (typeof s.fontSize === 'number' && isFinite(s.fontSize)) ? s.fontSize : DEFAULT_FONT_SIZE;
    $('rsFontSizeVal').textContent = Number(fs).toFixed(1) + 'px';
  }
  updateFontSizeDot();

  if ($('rsFont')) {
    let f = s.font || 'system';
    const exists = Array.from($('rsFont').options).some(o => o.value === f);
    if (!exists) f = 'system';
    $('rsFont').value = f;
  }

  ['rsBgColor', 'rsColorPrimary', 'rsColorSecondary'].forEach(id => {
    const el = $(id);
    if (el) updateSwatchActive(id, el.value);
  });
}

function onFontSizeChanged() {
  if ($('rsFontSizeVal') && $('rsFontSize')) {
    const fs = parseFloat($('rsFontSize').value) || DEFAULT_FONT_SIZE;
    $('rsFontSizeVal').textContent = fs.toFixed(1) + 'px';
  }
  applyReceiptSettings();
}

function resetFontSize() {
  if ($('rsFontSize')) $('rsFontSize').value = DEFAULT_FONT_SIZE;
  if ($('rsFontSizeVal')) $('rsFontSizeVal').textContent = DEFAULT_FONT_SIZE.toFixed(1) + 'px';

  const s = getReceiptSettings();
  s.fontSize = DEFAULT_FONT_SIZE;
  setReceiptSettings(s);
  applyReceiptSettings();
}

function updateFontSizeDot() {
  const dot = document.querySelector('.range-default-dot');
  const input = $('rsFontSize');
  if (!dot || !input) return;

  const ratio = (DEFAULT_FONT_SIZE - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN);

  const wrap = dot.parentElement;
  const wrapW = wrap ? wrap.clientWidth : 0;
  const trackW = Math.max(0, wrapW - 16);
  const leftPx = 8 + trackW * ratio;

  dot.style.left = leftPx + 'px';
  dot.style.transform = 'translate(-50%, -50%)';
}

/* ---------- 上传图片 ---------- */
function setupReceiptImgInputs() {
  const map = {
    header: { inputId: 'rsHeaderImgInput' },
    footer: { inputId: 'rsFooterImgInput' },
    bg:     { inputId: 'rsBgImgInput'     },
  };

  Object.keys(map).forEach(kind => {
    const input = $(map[kind].inputId);
    if (!input) return;

    input.addEventListener('change', async function (e) {
      const files = Array.from(e.target.files || []);
      e.target.value = '';
      if (!files.length) return;

      try {
        const s = getReceiptSettings();
        const file = files[0];
        if (!/^image\//.test(file.type)) {
          alert('请选择图片文件。');
          return;
        }

        const ref = await saveImageFromFile(file, file.name || ('receipt_' + kind));
        if (!ref) {
          alert('图片保存失败，请重试。');
          return;
        }

        let oldRef = '';
        if (kind === 'header') { oldRef = s.headerImg; s.headerImg = ref; s.headerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 }; }
        else if (kind === 'footer') { oldRef = s.footerImg; s.footerImg = ref; s.footerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 }; }
        else { oldRef = s.bgImg; s.bgImg = ref; s.bgImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 }; }

        if (oldRef && oldRef !== ref) {
          try { await deleteImageRef(oldRef); } catch (err) {}
        }

        const ok = setReceiptSettings(s);
        if (!ok) return;
        applyReceiptSettings();
        setTimeout(() => setupReceiptImgDrag(), 200);
      } catch (err) {
        alert('图片处理出错：' + (err && err.message ? err.message : '未知错误'));
      }
    });
  });
}

async function clearReceiptImg(kind) {
  const s = getReceiptSettings();

  let oldRef = '';
  if (kind === 'header') {
    oldRef = s.headerImg;
    s.headerImg = '';
    s.headerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  } else if (kind === 'footer') {
    oldRef = s.footerImg;
    s.footerImg = '';
    s.footerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  } else {
    oldRef = s.bgImg;
    s.bgImg = '';
    s.bgImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  }

  setReceiptSettings(s);

  if (oldRef) {
    try { await deleteImageRef(oldRef); } catch (e) {}
  }

  applyReceiptSettings();
  updateReceiptImageActiveState();
  if ($('receiptLayout') && $('receiptLayout').classList.contains('settings-open')) {
    setTimeout(() => setupReceiptImgDrag(), 100);
  }
}

function fitReceiptImg(kind) {
  const s = getReceiptSettings();
  if (kind === 'header') {
    if (!s.headerImg) return;
    s.headerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  } else if (kind === 'footer') {
    if (!s.footerImg) return;
    s.footerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  } else if (kind === 'bg') {
    if (!s.bgImg) return;
    s.bgImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  } else {
    return;
  }
  setReceiptSettings(s);
  applyReceiptSettings();
  if ($('receiptLayout') && $('receiptLayout').classList.contains('settings-open')) {
    setTimeout(() => setupReceiptImgDrag(), 100);
  }
}

/* ---------- 激活态管理 ---------- */
var __activeReceiptImage = null;

function setActiveReceiptImage(kind) {
  const targetKey = kind;
  if (__activeReceiptImage === targetKey) {
    __activeReceiptImage = null;
  } else {
    __activeReceiptImage = targetKey;
  }
  updateReceiptImageActiveState();
  setTimeout(() => setupReceiptImgDrag(), 50);
}

function updateReceiptImageActiveState() {
  const headerBlock = $('outHeaderBlock');
  const footerBlock = $('outFooterBlock');
  if (headerBlock) {
    if (__activeReceiptImage === 'header') headerBlock.classList.add('receipt-img-edit-active');
    else headerBlock.classList.remove('receipt-img-edit-active');
  }
  if (footerBlock) {
    if (__activeReceiptImage === 'footer') footerBlock.classList.add('receipt-img-edit-active');
    else footerBlock.classList.remove('receipt-img-edit-active');
  }

  const bgWrap = $('outBgWrap');
  if (bgWrap) {
    if (__activeReceiptImage === 'bg') bgWrap.classList.add('receipt-img-edit-active');
    else bgWrap.classList.remove('receipt-img-edit-active');
  }

  requestAnimationFrame(function () {
    if (typeof setupReceiptImgDrag === 'function') setupReceiptImgDrag();

    var hb = $('outHeaderBlock'), hi = $('outHeaderImg');
    if (hb && hi && hb.classList.contains('show')) updateImageHandles(hb, hi);
    var fb = $('outFooterBlock'), fi = $('outFooterImg');
    if (fb && fi && fb.classList.contains('show')) updateImageHandles(fb, fi);
    var bw = $('outBgWrap'), bi = $('outBgImg');
    if (bw && bi && bi.classList.contains('has-img')) updateImageHandles(bw, bi);
  });
}

/* ---------- 状态保存 ---------- */
function saveImgState(kind, img) {
  const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
  if (!block) return;
  const s = getReceiptSettings();
  const state = {
    w: parseFloat(img.style.width) || img.offsetWidth,
    h: parseFloat(img.style.height) || img.offsetHeight,
    l: parseFloat(img.style.left) || 0,
    t: parseFloat(img.style.top)  || 0,
    baseW: block.offsetWidth || block.clientWidth || 0,
  };
  if (kind === 'header') s.headerImgState = state;
  else if (kind === 'footer') s.footerImgState = state;
  setReceiptSettings(s);
}

function saveBgState() {
  const bg = $('outBgImg');
  const receipt = $('receipt');
  if (!bg) return;
  const s = getReceiptSettings();
  s.bgImgState = {
    w: parseFloat(bg.style.width)  || bg.offsetWidth,
    h: parseFloat(bg.style.height) || bg.offsetHeight,
    l: parseFloat(bg.style.left)   || 0,
    t: parseFloat(bg.style.top)    || 0,
    baseW: receipt ? (receipt.clientWidth || 0) : 0,
  };
  setReceiptSettings(s);
}

/* ---------- 颜色 / 透明度 ---------- */
function onColorChanged(which) {
  const map = {
    bgColor: ['rsBgColor', 'rsBgColorHex'],
    colorPrimary: ['rsColorPrimary', 'rsColorPrimaryHex'],
    colorSecondary: ['rsColorSecondary', 'rsColorSecondaryHex'],
  };
  const [pickerId, hexId] = map[which] || [];
  if (pickerId && hexId && $(pickerId) && $(hexId)) {
    $(hexId).value = $(pickerId).value;
  }
  if (pickerId && $(pickerId)) {
    updateSwatchActive(pickerId, $(pickerId).value);
  }
  applyReceiptSettings();
}

function pickColor(inputId, color, which) {
  const input = $(inputId);
  if (input) input.value = color;
  onColorChanged(which);
}

function openCustomColor(inputId) {
  const input = $(inputId);
  if (!input) return;
  input.click();
}

function resetColor(inputId, defaultColor, which) {
  const input = $(inputId);
  if (input) input.value = defaultColor;
  onColorChanged(which);
}

function updateSwatchActive(inputId, color) {
  const row = document.querySelector('.color-swatches[data-target="' + inputId + '"]');
  if (!row) return;
  const c = String(color || '').toLowerCase();
  row.querySelectorAll('.color-swatch').forEach(btn => {
    if ((btn.dataset.color || '').toLowerCase() === c) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function onOpacityChanged() {
  if ($('rsBgOpacityVal') && $('rsBgOpacity')) {
    $('rsBgOpacityVal').textContent = Math.round(parseFloat($('rsBgOpacity').value) * 100) + '%';
  }
  applyReceiptSettings();
}

/* ---------- 小票预设 ---------- */
function saveReceiptPreset() {
  applyReceiptSettings();

  const list = getReceiptPresetList();
  if (list.length >= MAX_RECEIPT_PRESETS) {
    showSimpleAlert(
      '无法新增预设',
      '最多只能保存 ' + MAX_RECEIPT_PRESETS + ' 个小票预设。<br>请先在「加载」里删除一个再保存。'
    );
    return;
  }

  const defaultName = nextReceiptPresetName();
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>保存小票预设</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:6px 0 12px;font-size:13px;color:var(--ink-soft);">
            请为这个预设起一个名字（可留空，自动命名为「${escapeHtml(defaultName)}」）。
          </p>
          <label>预设名称</label>
          <input id="rpNewName" placeholder="${escapeAttr(defaultName)}" maxlength="30" />
          <p style="font-size:11.5px;color:var(--ink-soft);margin-top:12px;">
            保存内容包含：票头图 / 票尾图 / 票尾文本 / 背景色 / 背景图 / 字体与颜色 / 字体 / 字体大小。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmSaveReceiptPreset('${escapeAttr(defaultName)}')">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('rpNewName'); if (el) el.focus(); }, 50);
}

function confirmSaveReceiptPreset(defaultName) {
  const raw = ($('rpNewName') && $('rpNewName').value ? $('rpNewName').value : '').trim();
  const name = raw || defaultName || '模板';

  const list = getReceiptPresetList();
  if (list.length >= MAX_RECEIPT_PRESETS) {
    closeModal();
    showSimpleAlert('无法新增预设', '最多只能保存 ' + MAX_RECEIPT_PRESETS + ' 个小票预设。');
    return;
  }

  const settings = JSON.parse(JSON.stringify(getReceiptSettings()));
  list.push({
    id: makeReceiptPresetId(),
    name: name,
    createdAt: Date.now(),
    settings: settings,
  });

  if (!setReceiptPresetList(list)) return;

  closeModal();
  showSimpleAlert('已保存', '预设「' + escapeHtml(name) + '」已保存。');
}

function openReceiptPresetPicker() {
  const list = getReceiptPresetList();

  if (!list.length) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>加载小票预设</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="rp-empty">还没有保存任何预设。<br>先在小票设置里点「存储」创建一个吧。</div>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn" onclick="closeModal()">关闭</button>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  const itemsHtml = list.map((p, i) => {
    const dt = p.createdAt ? new Date(p.createdAt) : null;
    const dateStr = dt
      ? (dt.getFullYear() + '-' +
         String(dt.getMonth() + 1).padStart(2, '0') + '-' +
         String(dt.getDate()).padStart(2, '0'))
      : '';
    const sub = dateStr ? ('保存于 ' + dateStr) : '';
    return `
      <div class="rp-item" onclick="applyReceiptPresetByIndex(${i})">
        <div class="rp-item-name">
          ${escapeHtml(p.name || '未命名')}
          <div class="rp-item-sub">${escapeHtml(sub)}</div>
        </div>
        <button type="button" class="rp-item-del"
                onclick="event.stopPropagation();deleteReceiptPreset(${i})"
                title="删除此预设">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6 H21"/>
            <path d="M8 6 V4 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V6"/>
            <path d="M6 6 L7 20 a2 2 0 0 0 2 2 h6 a2 2 0 0 0 2 -2 L17 6"/>
            <path d="M10 11 V17"/>
            <path d="M14 11 V17"/>
          </svg>
        </button>
      </div>`;
  }).join('');

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>加载小票预设</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="rp-count">共 ${list.length} / ${MAX_RECEIPT_PRESETS} 个预设 · 点击列表项即可套用</div>
          <div class="rp-list">${itemsHtml}</div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}

function applyReceiptPresetByIndex(idx) {
  const list = getReceiptPresetList();
  const preset = list[idx];
  if (!preset) return;
  applyReceiptPreset(preset);
  closeModal();
  showSimpleAlert('已加载', '预设「' + escapeHtml(preset.name || '未命名') + '」已套用。');
}

function applyReceiptPreset(preset) {
  if (!preset || !preset.settings) return;
  const s = Object.assign({}, DEFAULT_RECEIPT_SETTINGS, preset.settings);
  delete s.stickers;
  delete s.stickerImg;
  delete s.stickerImgState;
  setReceiptSettings(s);
  fillReceiptSettingsForm();
  applyReceiptSettings();
  renderCustomFontList();
  if ($('receiptLayout') && $('receiptLayout').classList.contains('settings-open')) {
    setTimeout(() => setupReceiptImgDrag(), 100);
  }
}

function deleteReceiptPreset(idx) {
  const list = getReceiptPresetList();
  const preset = list[idx];
  if (!preset) return;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>删除预设</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:6px 0;">确定删除小票预设「<strong>${escapeHtml(preset.name || '未命名')}</strong>」吗？</p>
          <p style="font-size:12px;color:var(--ink-soft);margin:0;">此操作不可恢复。</p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeleteReceiptPreset(${idx})">确定删除</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmDeleteReceiptPreset(idx) {
  const list = getReceiptPresetList();
  if (!list[idx]) { closeModal(); return; }
  list.splice(idx, 1);
  setReceiptPresetList(list);
  closeModal();
  openReceiptPresetPicker();
}

function resetReceiptSettings() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>恢复默认</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;">确定恢复小票样式的默认设置吗？</p>
          <p style="font-size:13px;color:var(--ink-soft);margin:0;">
            票头图、票尾图、背景图、字体、颜色、字体大小都会被清空。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmResetReceiptSettings()">确定</button>
          </div>
        </div>
      </div>
    </div>`;
}

async function confirmResetReceiptSettings() {
  try {
    const old = getReceiptSettings();
    if (old.headerImg) await deleteImageRef(old.headerImg);
    if (old.footerImg) await deleteImageRef(old.footerImg);
    if (old.bgImg)     await deleteImageRef(old.bgImg);
  } catch (e) {}

  localStorage.removeItem(RECEIPT_SETTINGS_KEY);
  __activeReceiptImage = null;
  closeModal();
  fillReceiptSettingsForm();
  applyReceiptSettings();
  updateReceiptImageActiveState();
  if ($('receiptLayout') && $('receiptLayout').classList.contains('settings-open')) {
    setTimeout(() => setupReceiptImgDrag(), 100);
  }
}


/* ══════════ [JS-20] 本地字体导入 ══════════ */

const registeredFonts = new Map();

function setupFontFileInput() {
  const input = $('rsFontFileInput');
  if (!input) return;

  input.addEventListener('change', async function (e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;

    const validExts = ['.ttf', '.otf', '.woff', '.woff2'];
    const dotIdx = file.name.lastIndexOf('.');
    const ext = dotIdx >= 0 ? file.name.slice(dotIdx).toLowerCase() : '';
    if (!validExts.includes(ext)) {
      setFontUploadStatus('不支持的文件格式，请选择 TTF / OTF / WOFF / WOFF2。', 'error');
      return;
    }

    setFontUploadStatus('正在读取字体…', 'info');

    try {
      const dataUrl = await readFileAsDataURL(file);
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '_');
      let familyName = 'Local_' + baseName;
      let i = 1;
      while (registeredFonts.has(familyName)) {
        familyName = 'Local_' + baseName + '_' + i;
        i++;
      }

      const fontFace = new FontFace(familyName, `url(${dataUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      registeredFonts.set(familyName, { fontFace, fileName: file.name });

      const sel = $('rsFont');
      if (sel) {
        const opt = document.createElement('option');
        opt.value = familyName;
        opt.textContent = '📎 ' + file.name.replace(/\.[^.]+$/, '') + '（本地导入）';
        sel.appendChild(opt);
        sel.value = familyName;

        const s = getReceiptSettings();
        s.font = familyName;
        setReceiptSettings(s);
        applyReceiptSettings();
      }

      setFontUploadStatus(`✓ 已导入「${file.name}」`, 'success');
      renderCustomFontList();
    } catch (err) {
      console.error(err);
      setFontUploadStatus('导入失败：' + (err && err.message ? err.message : '字体文件可能已损坏'), 'error');
    }
  });
}

function setFontUploadStatus(msg, type) {
  const el = $('rsFontUploadStatus');
  if (!el) return;
  el.textContent = msg;
  if (type === 'success') el.style.color = '#2e7d32';
  else if (type === 'error') el.style.color = 'var(--red)';
  else if (type === 'info') el.style.color = 'var(--ink-soft)';
  else el.style.color = '';
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function renderCustomFontList() {
  const box = $('customFontList');
  if (!box) return;
  if (!registeredFonts.size) { box.innerHTML = ''; return; }
  let html = '';
  registeredFonts.forEach((item, familyName) => {
    const displayName = item.fileName.replace(/\.[^.]+$/, '');
    html += `
      <div class="custom-font-row">
        <span class="name" style="font-family:'${escapeAttr(familyName)}';">${escapeHtml(displayName)}</span>
        <span class="tag">本地</span>
        <button class="icon-btn" title="移除" onclick="removeLocalFont('${escapeAttr(familyName)}')">×</button>
      </div>`;
  });
  box.innerHTML = html;
}

function removeLocalFont(familyName) {
  const item = registeredFonts.get(familyName);
  if (!item) return;
  try { document.fonts.delete(item.fontFace); } catch (e) {}
  registeredFonts.delete(familyName);

  const sel = $('rsFont');
  if (sel) {
    const opts = Array.from(sel.options);
    const target = opts.find(o => o.value === familyName);
    if (target) {
      const wasSelected = sel.value === target.value;
      target.remove();
      if (wasSelected) {
        sel.value = 'system';
        const s = getReceiptSettings();
        s.font = 'system';
        setReceiptSettings(s);
        applyReceiptSettings();
      }
    }
  }
  renderCustomFontList();
}

function clearLocalFonts() {
  if (!registeredFonts.size) {
    setFontUploadStatus('当前没有导入的本地字体。', 'info');
    return;
  }
  if (!confirm('确定清空所有已导入的本地字体吗？')) return;
  Array.from(registeredFonts.keys()).forEach(k => removeLocalFont(k));
  setFontUploadStatus('已清空本地字体。', 'info');
}


/* ══════════ [JS-21] applyPlaceholderMode ══════════ */
function applyPlaceholderMode(on) {
  const detailPanel = $('detailGroupPanel');
  const extrasPanel = $('orderExtrasPanel');

  if (on) {
    if (detailPanel) detailPanel.style.display = 'none';
    if (extrasPanel) extrasPanel.style.display = 'none';
    clearAllFieldErrors();
  } else {
    if (detailPanel) detailPanel.style.display = '';
    if (extrasPanel) extrasPanel.style.display = '';
  }
}


/* ══════════ [JS-22] 生成前校验 ══════════ */

function getItemNodeSum(block) {
  let sum = 0;
  block.querySelectorAll('.sub-item[data-is-node="1"] .sub-value').forEach(inp => {
    sum += Number(inp.value) || 0;
  });
  return sum;
}

function validateBeforeGenerate() {
  clearAllFieldErrors();

  const errors = [];
  let firstErrorEl = null;

  const addError = (el, msg) => {
    if (el) el.classList.add('field-error');
    errors.push(msg);
    if (!firstErrorEl && el) firstErrorEl = el;
  };

  const clientEl = $('client');
  if (clientEl && !clientEl.value.trim()) {
    addError(clientEl, '请填写「单主ID」');
  }
  const orderDateEl = $('orderDate');
  if (orderDateEl && !orderDateEl.value) {
    addError(orderDateEl, '请填写「接单日期」');
  }
  const scheduleEl = $('scheduleDate');
  if (scheduleEl && !scheduleEl.value) {
    addError(scheduleEl, '请填写「排单日期」');
  }

  const placeholderOn = $('placeholderToggle') && $('placeholderToggle').checked;

  if (placeholderOn) {
    const depositEl = $('deposit');
    if (depositEl) {
      const v = depositEl.value;
      if (v === '' || v === null || v === undefined) {
        addError(depositEl, '占位单请填写「排单费」（金额可以为 0）');
      } else {
        const n = Number(v);
        if (!isFinite(n) || n < 0) {
          addError(depositEl, '占位单的「排单费」必须 ≥ 0');
        }
      }
    }
    return errors.length ? { ok: false, errors, firstErrorEl } : { ok: true };
  }

  const deadlineEl = $('deadline');
  if (deadlineEl && !deadlineEl.value) {
    addError(deadlineEl, '请填写「截稿日期」');
  }

  const groups = document.querySelectorAll('#groupsContainer .group-block');

  if (!groups.length) {
    errors.push('请至少添加一个「稿件组」');
  } else {
    groups.forEach((gb, gi) => {
      const items = gb.querySelectorAll('.item-block');
      if (!items.length) {
        errors.push(`稿件组 ${gi + 1} 请至少添加一个「稿件」`);
        return;
      }
      items.forEach((item, ii) => {
        const nameEl  = item.querySelector('.item-name');
        const priceEl = item.querySelector('.item-price');
        const qtyEl   = item.querySelector('.item-qty');
        const licEl   = item.querySelector('.item-license');

        if (nameEl && !nameEl.value.trim()) {
          addError(nameEl, `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件：「名称」未填写`);
        }
        if (priceEl && (priceEl.value === '' || !isFinite(Number(priceEl.value)) || Number(priceEl.value) <= 0)) {
          addError(priceEl, `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件：「单价」未填写或无效`);
        }
        if (qtyEl && (qtyEl.value === '' || !isFinite(Number(qtyEl.value)) || Number(qtyEl.value) <= 0)) {
          addError(qtyEl, `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件：「数量」未填写或无效`);
        }
        if (licEl && !licEl.value) {
          addError(licEl, `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件：「权限」未选择`);
        }
        if (item.querySelector('.sub-item[data-is-node="1"]')) {
          const sum = getItemNodeSum(item);
          if (Math.abs(sum - 100) > 0.01) {
            errors.push(
              `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件：「节点比例合计」= ${num2(sum)}%，必须 = 100.00%`
            );
          }
        }
        item.querySelectorAll('.sub-item').forEach((sub, si) => {
          const sname  = sub.querySelector('.sub-name');
          const svalue = sub.querySelector('.sub-value');
          if (sname && !sname.value.trim()) {
            addError(sname, `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件的增项 ${si + 1}：「名称」未填写`);
          }
          if (svalue && (svalue.value === '' || !isFinite(Number(svalue.value)))) {
            addError(svalue, `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件的增项 ${si + 1}：「数值」未填写`);
          }
        });
      });
    });
  }

  if (errors.length) return { ok: false, errors, firstErrorEl };
  return { ok: true };
}


/* ══════════ [JS-23] calcItem ══════════ */
function calcItem(block, licenseOverride) {
  const name = block.querySelector('.item-name').value.trim();
  const price = Number(block.querySelector('.item-price').value) || 0;
  const qty = Number(block.querySelector('.item-qty').value) || 1;
  const license = licenseOverride || block.querySelector('.item-license').value;
  const m = getLicenseMultiplier(license);

  const addons = [];   /* 增项 */
  const nodes = [];    /* 节点 */

  /* 第一步：收集增项和节点 */
  block.querySelectorAll('.sub-item').forEach(sub => {
    const sname = sub.querySelector('.sub-name').value.trim();
    if (!sname) return;
    const svalue = Number(sub.querySelector('.sub-value').value) || 0;

    if (sub.dataset.isNode === '1') {
      /* 节点：比例（后面按单元原价算） */
      nodes.push({
        name: sname,
        op: 'multiply',
        value: svalue,
        ratio: svalue,
        isNode: true,
      });
    } else {
      /* 增项：× 或 ＋ */
      const sopSel = sub.querySelector('.sub-op-select');
      const sop = sopSel ? sopSel.value : 'add';
      addons.push({
        name: sname,
        op: sop,
        value: svalue,
        isNode: false,
      });
    }
  });

  /* 第二步：算增项合计（单元） */
  let addonSum = 0;
  addons.forEach(a => {
    let unit;
    if (a.op === 'multiply') {
      unit = price * a.value / 100;
    } else {
      unit = a.value;
    }
    a.unit = unit;
    a.subtotal = unit * qty * m;
    addonSum += unit;
  });

  /* 单元原价 = 基础价 + 增项合计 */
  const baseUnit = price + addonSum;

  /* 第三步：算节点（基于单元原价 × 比例） */
  let nodeSum = 0;
  nodes.forEach(n => {
    const unit = baseUnit * n.value / 100;
    n.unit = unit;
    n.subtotal = unit * qty * m;
    nodeSum += unit;
  });

  const hasNodes = nodes.length > 0;

  /* 有节点 → 单元合计用节点之和（比例合计=100% 时等于 baseUnit）
     没节点 → 单元合计就是 baseUnit */
  const partsUnitSum = hasNodes ? nodeSum : baseUnit;
  const itemSubtotal = partsUnitSum * qty * m;

  return {
    name, price, qty, license, m,
    addons,
    nodes,
    baseUnit,
    addonSum,
    partsUnitSum,
    itemSubtotal,
    hasNodes,
  };
}


/* ══════════ [JS-24] calcGroup ══════════ */
function calcGroup(groupBlock) {
  const items = [];
  let groupSubtotal = 0;
  let nonNodeSubtotal = 0;
  let nodeItemsFirstAmount = 0;

  groupBlock.querySelectorAll('.item-block').forEach(block => {
    const r = calcItem(block);
    if (!r.name) return;
    items.push(r);
    groupSubtotal += r.itemSubtotal;
    if (r.hasNodes) {
      if (r.nodes[0]) nodeItemsFirstAmount += r.nodes[0].subtotal;
    } else {
      nonNodeSubtotal += r.itemSubtotal;
    }
  });

  const extras = [];
  let extrasTotal = 0;
  groupBlock.querySelectorAll('.group-extras .ge-row').forEach(row => {
    const name = row.querySelector('.ge-name').value.trim();
    const op = row.querySelector('.ge-op-select').value;
    const value = Number(row.querySelector('.ge-value').value) || 0;
    if (!name) return;
    let amount;
    if (op === 'multiply') amount = groupSubtotal * value / 100;
    else amount = value;
    extras.push({ name, op, value, amount, base: groupSubtotal });
    extrasTotal += amount;
  });

  const groupDiscountBase = groupSubtotal + extrasTotal;
  const discounts = [];
  let discountsTotal = 0;
  groupBlock.querySelectorAll('.group-discounts .ge-row').forEach(row => {
    const name = row.querySelector('.gd-name').value.trim();
    const op = row.querySelector('.gd-op-select').value;
    const value = Number(row.querySelector('.gd-value').value) || 0;
    if (!name) return;
    let amount;
    if (op === 'multiply') amount = groupDiscountBase * value / 100;
    else amount = value;
    discounts.push({ name, op, value, amount, base: groupDiscountBase });
    discountsTotal += amount;
  });

  const groupTotal = groupSubtotal + extrasTotal - discountsTotal;

  return {
    items,
    groupSubtotal,
    extras, extrasTotal,
    discounts, discountsTotal,
    groupTotal,
    nonNodeSubtotal,
    nodeItemsFirstAmount,
  };
}


/* ══════════ [JS-25] generate ══════════ */
function setOptionalRow(rowEl, value) {
  if (!rowEl) return;
  if (!value || String(value).trim() === '') rowEl.style.display = 'none';
  else rowEl.style.display = 'flex';
}
/* ---------- 检查身份 / ID 是否已填 ---------- */
function checkIdentityAndName() {
  const identity = $('setIdentity') ? String($('setIdentity').value || '').trim() : '';
  const name     = $('setName')     ? String($('setName').value     || '').trim() : '';

  if (identity && name) return true;

  const missing = [];
  if (!identity) missing.push('身份');
  if (!name)     missing.push('ID');

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>无法生成小票</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.8;">
            生成小票前，请先到「设置 → 基础信息」填写
            <strong>${escapeHtml(missing.join(' 和 '))}</strong>。
          </p>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:10px 0 0;line-height:1.7;">
            这两个信息会显示在小票的落款处，<br>
            用于单主识别你的身份。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:20px;">
            <button class="action-btn ghost" onclick="closeModal()">暂不填写</button>
            <button class="action-btn" onclick="gotoBasicSettingFromReceipt()">去填写 →</button>
          </div>
        </div>
      </div>
    </div>`;
  return false;
}

function gotoBasicSettingFromReceipt() {
  closeModal();
  showPage('pageBasicSetting');
}

function generate() {
  if (!checkIdentityAndName()) return;

  const v = validateBeforeGenerate();
  if (!v.ok) {
    let bodyHtml = '<p style="margin:6px 0 10px;font-weight:600;">请先补全以下必填项：</p>';
    bodyHtml += '<ul style="margin:0;padding-left:20px;font-size:13px;color:var(--ink-soft);line-height:1.85;">';
    v.errors.slice(0, 12).forEach(e => {
      bodyHtml += '<li>' + escapeHtml(e) + '</li>';
    });
    if (v.errors.length > 12) {
      bodyHtml += '<li>…等共 ' + v.errors.length + ' 项未填写</li>';
    }
    bodyHtml += '</ul>';

    showSimpleAlert('无法生成小票', bodyHtml);

    if (v.firstErrorEl && typeof v.firstErrorEl.scrollIntoView === 'function') {
      setTimeout(() => {
        try { v.firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        catch(e) {}
      }, 120);
    }
    return;
  }

  const identity    = $('setIdentity').value;
  const artist      = $('setName').value.trim();
  const platform    = $('platform').value;

  const orderDate    = $('orderDate').value;
  const scheduleDate = $('scheduleDate').value;
  const deadline     = $('deadline').value;
  const client       = $('client').value.trim();
  const project      = $('project').value.trim();
  const attribute    = $('attribute').value.trim();
  const character    = $('character').value.trim();
  const depositMode  = $('depositMode').value;
  const depositInput = Number($('deposit').value) || 0;
  const placeholderOn = $('placeholderToggle') && $('placeholderToggle').checked;

  $('outOrderNo').textContent = makeOrderNo(orderDate);

  if ($('outScheduleDate')) $('outScheduleDate').textContent = scheduleDate || '—';
  if ($('outDeadline'))     $('outDeadline').textContent     = deadline     || '—';
  if ($('outIdentityLabel')) $('outIdentityLabel').textContent = identity;
  if ($('outArtist'))        $('outArtist').textContent        = artist || '—';
  if ($('outPlatform'))      $('outPlatform').textContent      = platform;

  $('outClientAt').textContent = '@' + (client || '—');

  $('outProject').textContent   = project   || '—';
  $('outAttribute').textContent = attribute || '—';
  $('outCharacter').textContent = character || '—';
  setOptionalRow($('rowProject'), project);
  setOptionalRow($('rowAttribute'), attribute);
  setOptionalRow($('rowCharacter'), character);

  const previewRef = previewImageData || '';
  const outPhoto = $('outPhoto');
  if (previewRef) {
    resolveImageSrc(previewRef).then(url => {
      if (url) {
        $('outPhotoImg').src = url;
        outPhoto.style.display = 'block';
      } else {
        $('outPhotoImg').src = '';
        outPhoto.style.display = 'none';
      }
    }).catch(() => {
      $('outPhotoImg').src = '';
      outPhoto.style.display = 'none';
    });
  } else {
    $('outPhotoImg').src = '';
    outPhoto.style.display = 'none';
  }

  const outGroups = $('outGroups');
  outGroups.innerHTML = '';

  let orderSubtotal = 0;
  let totalItemCount = 0;
  let nodeItemCount = 0;
  let groupIndex = 0;
  const nodeFirstDetail = [];

  if (!placeholderOn) {
    document.querySelectorAll('#groupsContainer .group-block').forEach((groupBlock) => {
      groupIndex++;
      const groupLabel = resolveGroupLabel(groupBlock, groupIndex);
      const cg = calcGroup(groupBlock);
      if (cg.items.length === 0 && cg.extras.length === 0 && cg.discounts.length === 0) return;

      orderSubtotal += cg.groupTotal;

      cg.items.forEach(r => {
        totalItemCount++;
        if (r.hasNodes) {
          nodeItemCount++;
          if (r.nodes[0]) {
            nodeFirstDetail.push({
              name: r.name,
              unit: r.nodes[0].unit,
              qty: r.qty,
              multiplier: r.m,
              subtotal: r.nodes[0].subtotal,
            });
          }
        }
      });

      const section = document.createElement('div');
      section.className = 'group-section';

      let html = `<div class="group-section-title">${escapeHtml(groupLabel)}</div>`;
      html += `<table class="list"><thead><tr>
        <th>稿件</th><th class="r">单价</th><th class="c">数量</th><th class="c">权限</th><th class="r">小计</th>
      </tr></thead><tbody>`;

      cg.items.forEach((r, idx) => {
        html += `<tr><td><div class="item-name">${idx + 1}. ${escapeHtml(r.name)}</div></td>
          <td class="r">${fmt(r.price)}</td>
          <td class="c">${r.qty}件</td>
          <td class="c">${licenseText(r.license)}</td>
          <td class="r">${fmt(r.itemSubtotal)}</td></tr>`;

        /* 基础行 */
        html += `<tr class="part-row"><td><div style="padding-left:14px;">└ 基础</div></td>
          <td class="r"><span class="sub">${fmt(r.price)}</span></td>
          <td class="c"><span class="sub">${r.qty}件</span></td>
          <td class="c"><span class="sub">${licenseText(r.license)}</span></td>
          <td class="r"><span class="sub">${fmt(r.price * r.qty * r.m)}</span></td></tr>`;

        /* 增项（└） */
        r.addons.forEach(x => {
          const opStr = opSymbol(x.op) + (x.op === 'multiply' ? pctShort(x.value) : num2(x.value));
          html += `<tr class="part-row"><td><div style="padding-left:26px;">└ ${escapeHtml(x.name)}（${opStr}）</div></td>
            <td class="r"><span class="sub">${fmt(x.unit)}</span></td>
            <td class="c"><span class="sub">${r.qty}件</span></td>
            <td class="c"><span class="sub">${licenseText(r.license)}</span></td>
            <td class="r"><span class="sub">${fmt(x.subtotal)}</span></td></tr>`;
        });

        /* 节点（◆，和增项区分） */
        r.nodes.forEach(x => {
          html += `<tr class="part-row"><td><div style="padding-left:26px;">◆ ${escapeHtml(x.name)}（×${pctShort(x.value)}）</div></td>
            <td class="r"><span class="sub">${fmt(x.unit)}</span></td>
            <td class="c"><span class="sub">${r.qty}件</span></td>
            <td class="c"><span class="sub">${licenseText(r.license)}</span></td>
            <td class="r"><span class="sub">${fmt(x.subtotal)}</span></td></tr>`;
        });
      });

      html += `</tbody></table>`;

      let summaryHtml = '<div class="group-summary">';
      summaryHtml += `<div class="gs-row"><span class="gs-name">原价小计</span><span class="gs-val">${fmt(cg.groupSubtotal)}</span></div>`;

      if (cg.extras.length) {
        const formulas = cg.extras.map(ex => {
          if (ex.op === 'multiply') return `${escapeHtml(ex.name)}：${fmt(ex.base)} ×${pctShort(ex.value)} = ${fmt(ex.amount)}`;
          return `${escapeHtml(ex.name)}：＋${fmt(ex.value)} = ${fmt(ex.amount)}`;
        }).join('；');
        summaryHtml += `<div class="gs-row"><span class="gs-name">附加费用（${formulas}）</span><span class="gs-val">${fmt(cg.extrasTotal)}</span></div>`;
      } else {
        summaryHtml += `<div class="gs-row"><span class="gs-name">附加费用</span><span class="gs-val">${fmt(0)}</span></div>`;
      }

      if (cg.discounts.length) {
        const formulas = cg.discounts.map(dc => {
          if (dc.op === 'multiply') return `${escapeHtml(dc.name)}：${fmt(dc.base)} ×${pctShort(dc.value)} = -${fmt(dc.amount)}`;
          return `${escapeHtml(dc.name)}：−${fmt(dc.value)} = -${fmt(dc.amount)}`;
        }).join('；');
        summaryHtml += `<div class="gs-row"><span class="gs-name">优惠费用（${formulas}）</span><span class="gs-val">-${fmt(cg.discountsTotal)}</span></div>`;
      } else {
        summaryHtml += `<div class="gs-row"><span class="gs-name">优惠费用</span><span class="gs-val">-${fmt(0)}</span></div>`;
      }

      summaryHtml += `<div class="gs-row gs-total"><span>稿件组合计</span><span>${fmt(cg.groupTotal)}</span></div>`;
      summaryHtml += '</div>';

      html += summaryHtml;
      section.innerHTML = html;
      outGroups.appendChild(section);
    });

    if (orderSubtotal === 0) {
      const section = document.createElement('div');
      section.className = 'group-section';
      section.innerHTML = `
        <div class="group-section-title">立项待定</div>
        <div style="padding:10px 0;color:var(--rc-ink-soft);font-size:13px;">
          本条订单尚无立项内容。
        </div>`;
      outGroups.appendChild(section);
    }
  } else {
    const section = document.createElement('div');
    section.className = 'group-section';
    section.innerHTML = `
      <div class="group-section-title">占位待定</div>
      <div style="padding:10px 0;color:var(--rc-ink-soft);font-size:13px;">
        本单为占位单，具体内容待定。
      </div>`;
    outGroups.appendChild(section);
  }

  let orderExtrasTotal = 0;
  const orderExtrasNames = [];
  if (!placeholderOn) {
    document.querySelectorAll('#extrasContainer .oe-row').forEach(row => {
      const name = row.querySelector('.extra-name').value.trim();
      const op = row.querySelector('.extra-mode').value;
      const val = Number(row.querySelector('.extra-val').value) || 0;
      if (!name) return;
      let amount = (op === 'multiply') ? orderSubtotal * val / 100 : val;
      orderExtrasTotal += amount;
      const opStr = (op === 'multiply') ? ('×' + pctShort(val)) : ('＋' + fmt(val));
      orderExtrasNames.push(escapeHtml(name) + '（' + opStr + '）');
    });
  }

  let orderDiscountTotal = 0;
  const orderDiscountsNames = [];
  if (!placeholderOn) {
    document.querySelectorAll('#discountsContainer .oe-row').forEach(row => {
      const name = row.querySelector('.discount-name').value.trim();
      const op = row.querySelector('.discount-mode').value;
      const val = Number(row.querySelector('.discount-val').value) || 0;
      if (!name) return;
      let amount = (op === 'multiply') ? orderSubtotal * val / 100 : val;
      orderDiscountTotal += amount;
      const opStr = (op === 'multiply') ? ('×' + pctShort(val)) : ('−' + fmt(val));
      orderDiscountsNames.push(escapeHtml(name) + '（' + opStr + '）');
    });
  }

  $('outTotal').textContent = fmt(orderSubtotal);

  const extraRow = $('outOrderExtrasRow');
  if (extraRow) {
    if (orderExtrasTotal > 0) {
      extraRow.style.display = 'flex';
      const labelEl = $('outOrderExtrasLabel');
      if (labelEl) {
        labelEl.textContent = orderExtrasNames.length
          ? ('订单总附加费用（' + orderExtrasNames.join('；') + '）')
          : '订单总附加费用';
      }
      $('outOrderExtras').textContent = fmt(orderExtrasTotal);
    } else extraRow.style.display = 'none';
  }

  const discRow = $('outOrderDiscountRow');
  if (discRow) {
    if (orderDiscountTotal > 0) {
      discRow.style.display = 'flex';
      const labelEl = $('outOrderDiscountLabel');
      if (labelEl) {
        labelEl.textContent = orderDiscountsNames.length
          ? ('订单总优惠折扣（' + orderDiscountsNames.join('；') + '）')
          : '订单总优惠折扣';
      }
      $('outOrderDiscount').textContent = '-' + fmt(orderDiscountTotal);
    } else discRow.style.display = 'none';
  }

  const payable = Math.max(0, orderSubtotal + orderExtrasTotal - orderDiscountTotal);
  $('outPayable').textContent = fmt(payable);

  let prepaid = 0;
  let prepaidLabelText = '预付金额';

  if (placeholderOn) {
    prepaid = depositInput;
    prepaidLabelText = '预付金额（排单费：' + fmt(prepaid) + '）';
  } else {
    const isPureNodeOrder = (totalItemCount > 0) && (nodeItemCount === totalItemCount);
    if (isPureNodeOrder) {
      prepaid = 0;
      const details = [];
      nodeFirstDetail.forEach(d => {
        prepaid += d.subtotal;
        const parts = [`${escapeHtml(d.name)} ${fmt(d.unit)}`];
        if (d.qty !== 1) parts.push(`× ${d.qty}件`);
        if (d.multiplier !== 1) parts.push(`（权限 ×${num2(d.multiplier)}）`);
        details.push(parts.join(' '));
      });
      prepaidLabelText = '预付金额（节点首款：' + details.join('；') + '）';
    } else {
      if (depositMode === 'percent') {
        prepaid = payable * depositInput / 100;
        prepaidLabelText = '预付金额（定金：' + fmt(payable) + ' × ' + pctShort(depositInput) + ' = ' + fmt(prepaid) + '）';
      } else {
        prepaid = depositInput;
        prepaidLabelText = '预付金额（定金：' + fmt(prepaid) + '）';
      }
    }
  }

  if ($('outPrepaidLabel')) $('outPrepaidLabel').textContent = prepaidLabelText;
  $('outPrepaid').textContent = fmt(prepaid);

  const fromConvert = window.__convertFromPlaceholder;
  const useDeduct = window.__convertDeduct;
  const placeholderPrepaid = Number(window.__placeholderPrepaid) || 0;

  if (fromConvert && useDeduct && placeholderPrepaid > 0) {
    const realPrepaid = Math.max(0, prepaid - placeholderPrepaid);
    if ($('outRealPrepaidLabel')) {
      $('outRealPrepaidLabel').textContent =
        '实收预付（' + fmt(prepaid) + ' − 排单费抵扣 ' + fmt(placeholderPrepaid) + '）';
    }
    if ($('outRealPrepaid')) $('outRealPrepaid').textContent = fmt(realPrepaid);
    if ($('outRealPrepaidRow')) $('outRealPrepaidRow').style.display = 'flex';
  } else {
    if ($('outRealPrepaidRow')) $('outRealPrepaidRow').style.display = 'none';
  }

  const finalPay = Math.max(0, payable - prepaid);
  $('outFinal').textContent = fmt(finalPay);

  const outGifts = $('outGifts');
  outGifts.innerHTML = '';
  let hasGift = false;
  if (!placeholderOn) {
    const giftNames = document.querySelectorAll('.gift-name');
    const giftVals = document.querySelectorAll('.gift-val');
    giftNames.forEach((inp, i) => {
      const name = inp.value.trim();
      const val = giftVals[i].value;
      if (!name) return;
      hasGift = true;
      const row = document.createElement('div');
      row.className = 'info-row';
      row.innerHTML = `<span>${escapeHtml(name)}</span><span>${val ? fmt(Number(val) || 0) : "—"}</span>`;
      outGifts.appendChild(row);
    });
  }
  if ($('outGiftsBox')) $('outGiftsBox').style.display = hasGift ? 'block' : 'none';

  applyReceiptSettings();

  $('receiptPanel').classList.remove('hidden');
  const tb = $('receiptToolbar');
  if (tb) tb.classList.remove('hidden');

  window.__receiptGenerated = true;
  window.__receiptImported = false;
  window.__receiptWarnIgnore = false;

  const rp = $('receiptPanel');
  if (rp && typeof rp.scrollIntoView === 'function') {
    rp.scrollIntoView({ behavior: 'smooth' });
  }
}


/* ══════════ [JS-26] 小票页离开提醒 ══════════ */

function checkReceiptLeaveWarning() {
  if (!window.__receiptGenerated) return true;
  if (window.__receiptImported) return true;
  if (window.__receiptWarnIgnore) return true;

  const ok = confirm(
    '这张小票还没有导入订单，\n' +
    '相关信息不会被计入订单系统、排单和统计。\n\n' +
    '点「确定」继续离开（之后不再提醒），\n' +
    '点「取消」留在小票页。'
  );

  if (ok) {
    window.__receiptWarnIgnore = true;
    return true;
  }
  return false;
}

(function wrapShowPageForReceipt() {
  const __origShowPage = window.showPage;
  if (typeof __origShowPage !== 'function') return;
  window.__origShowPage = __origShowPage;
  window.showPage = function (id) {
    if (id !== 'pageReceipt') {
      if (!checkReceiptLeaveWarning()) return;
    }
    return __origShowPage(id);
  };
})();
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 7 部分 / 共 10 部分                               ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-27] saveImage                                   ║
   ║   [JS-28] 稿件预设编辑弹窗                            ║
   ║   [JS-29] 导出 / 导入 全部数据                        ║
   ║   [JS-30] 上传预览图 + 初始化                         ║
   ║   [JS-31] 订单数据存取                                ║
   ║   [JS-32] 订单列表页                                  ║
   ║   [JS-33] 订单详情页                                  ║
   ║   [JS-34] 素材 / 要求 上传                            ║
   ║   [JS-35] 图片查看器                                  ║
   ║   [JS-36] 小票快照：抓取 / 回填                       ║
   ║   [JS-37] changeTodoReceipt + 占位单转立项单          ║
   ║   [JS-38] 从小票页导入订单                            ║
   ║   [JS-39] 初始化                                      ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-27] saveImage ══════════ */

function hideAllReceiptHandles() {
  const handles = document.querySelectorAll('.receipt-img-handle');
  const resizeHandles = document.querySelectorAll('.img-resize-handle');
  const prev = [];
  handles.forEach(h => { prev.push({ el: h, v: h.style.visibility }); h.style.visibility = 'hidden'; });
  resizeHandles.forEach(h => { prev.push({ el: h, v: h.style.visibility }); h.style.visibility = 'hidden'; });
  return prev;
}
function restoreAllReceiptHandles(prev) {
  if (!Array.isArray(prev)) return;
  prev.forEach(x => { if (x && x.el) x.el.style.visibility = x.v || ''; });
}

function saveImage() {
  const draggingBlocks = document.querySelectorAll('.receipt-img-block.dragging');
  draggingBlocks.forEach(el => el.classList.remove('dragging'));

  const handleState = hideAllReceiptHandles();

  const photoImg = $('outPhotoImg');
  const photoReady = photoImg && photoImg.src && photoImg.complete && photoImg.naturalWidth > 0;

  const after = () => {
    html2canvas($('receipt'), {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    }).then(canvas => {
      const link = document.createElement('a');
      const orderDate = $('orderDate').value || 'list';
      link.download = '小票_' + orderDate.replace(/-/g, '') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      restoreAllReceiptHandles(handleState);
    }).catch(err => {
      restoreAllReceiptHandles(handleState);
      alert('生成图片失败：' + (err && err.message ? err.message : '未知错误'));
    });
  };

  if (photoReady) {
    after();
  } else if (photoImg && photoImg.src) {
    photoImg.addEventListener('load', after, { once: true });
    setTimeout(after, 1500);
  } else {
    after();
  }
}


/* ══════════ [JS-28] 稿件预设编辑弹窗 ══════════ */
function openPresetSetting() { showPage('pagePresetSetting'); renderPresetCards(); }

let editingPresetIndex = -1;

function deletePreset(i) {
  const presets = getPresets();
  const name = presets[i] ? presets[i].name : '';
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head"><h3>删除预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <p>确定删除「${escapeHtml(name)}」吗？此操作不可恢复。</p>
          <div class="actions" style="justify-content:flex-end;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeletePreset(${i})">删除</button>
          </div>
        </div>
      </div>
    </div>`;
}
function confirmDeletePreset(i) {
  const presets = getPresets();
  presets.splice(i, 1);
  setPresets(presets);
  closeModal();
  renderPresetCards();
}

function editPreset(i) {
  editingPresetIndex = i;
  openPresetAddModal(getPresets()[i]);
}

function openPresetAddModal(data) {
  if (arguments.length === 0) {
    editingPresetIndex = -1;
    data = { mode: 'fixed' };
  }
  data = data || { mode: 'fixed' };

  window.__editingPreset = data;
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>${data.name ? '编辑稿件预设' : '添加稿件预设'}</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div style="grid-column:1/-1;"><label>稿件名称</label><input id="f_name" value="${escapeHtml(data.name || '')}" /></div>
            <div style="grid-column:1/-1;"><label>所属分组（可留空）</label>
              <select id="f_group">${renderPresetGroupOptions(data.groupId || '')}</select>
            </div>
            <div style="grid-column:1/-1;"><label>计价方式</label>
              <select id="f_mode" onchange="renderModeFields()">
                <option value="fixed" ${data.mode==='fixed'?'selected':''}>固定价</option>
                <option value="sides" ${data.mode==='sides'?'selected':''}>单双面计价</option>
                <option value="base_addon" ${data.mode==='base_addon'?'selected':''}>基础+增项</option>
                <option value="nodes" ${data.mode==='nodes'?'selected':''}>按节点计价</option>
                <option value="base_addon_nodes" ${data.mode==='base_addon_nodes'?'selected':''}>基础+增项+节点</option>
              </select>
            </div>
          </div>
          <div id="f_fields" style="margin-top:10px;"></div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="savePreset()">保存</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => renderModeFields(data), 0);
}

function renderPresetGroupOptions(selectedId) {
  const groups = getPresetGroups();
  groups.sort((a, b) => (a.order || 0) - (b.order || 0));
  let html = `<option value="" ${!selectedId ? 'selected' : ''}>（未分组）</option>`;
  groups.forEach(g => {
    html += `<option value="${escapeAttr(g.id)}" ${selectedId === g.id ? 'selected' : ''}>${escapeHtml(g.name)}</option>`;
  });
  return html;
}

function renderModeFields(data) {
  data = data || window.__editingPreset || { mode: 'fixed' };
  const mode = $('f_mode').value;
  let html = '';
  if (mode === 'fixed') {
    html = `<div><label>固定价格</label><input type="number" step="0.01" id="f_fixedPrice" value="${data.fixedPrice !== undefined && data.fixedPrice !== '' ? num2(data.fixedPrice) : ''}" /></div>`;
  } else if (mode === 'sides') {
    html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div><label>单面价格</label><input type="number" step="0.01" id="f_singlePrice" value="${data.singlePrice !== undefined && data.singlePrice !== '' ? num2(data.singlePrice) : ''}" /></div>
      <div><label>双面价格</label><input type="number" step="0.01" id="f_doublePrice" value="${data.doublePrice !== undefined && data.doublePrice !== '' ? num2(data.doublePrice) : ''}" /></div>
    </div>`;
  } else if (mode === 'base_addon') {
    html = `<div><label>基础价格</label><input type="number" step="0.01" id="f_basePrice" value="${data.basePrice !== undefined && data.basePrice !== '' ? num2(data.basePrice) : ''}" /></div>
      <div style="margin-top:12px;"><label>增项（× 为按基础价的百分比，＋ 为固定金额）</label><div id="f_addons"></div>
      <button class="add-item-btn" onclick="addAddonRow()">+ 添加增项</button></div>`;
  } else if (mode === 'nodes') {
    html = `<div><label>总价（节点比例基于此计算）</label><input type="number" step="0.01" id="f_basePrice" value="${data.basePrice !== undefined && data.basePrice !== '' ? num2(data.basePrice) : '1000.00'}" /></div>
      <div style="margin-top:12px;"><label>节点与比例（合计须 = 100%，算法固定 ×）</label><div id="f_nodes"></div>
      <button class="add-item-btn" onclick="addNodeRow()">+ 添加节点</button>
      <div id="f_nodeWarn" style="color:var(--red);font-size:12px;margin-top:6px;"></div></div>`;
  } else if (mode === 'base_addon_nodes') {
    html = `<div><label>基础价格</label><input type="number" step="0.01" id="f_basePrice" value="${data.basePrice !== undefined && data.basePrice !== '' ? num2(data.basePrice) : ''}" /></div>
      <div style="margin-top:12px;"><label>增项（× 为按基础价的百分比，＋ 为固定金额）</label><div id="f_addons"></div>
      <button class="add-item-btn" onclick="addAddonRow()">+ 添加增项</button></div>
      <div style="margin-top:16px;"><label>节点与比例（合计须 = 100%，算法固定 ×）</label><div id="f_nodes"></div>
      <button class="add-item-btn" onclick="addNodeRow()">+ 添加节点</button>
      <div id="f_nodeWarn" style="color:var(--red);font-size:12px;margin-top:6px;"></div></div>`;
  }
  $('f_fields').innerHTML = html;

  if (mode === 'base_addon') {
    (data.addons || []).forEach(a => addAddonRow(a.name, a.op, a.value));
    if (!data.addons || !data.addons.length) addAddonRow();
  }
  if (mode === 'nodes') {
    (data.nodes || []).forEach(n => addNodeRow(n.name, n.ratio));
    if (!data.nodes || !data.nodes.length) addNodeRow('草稿', 30);
  }
  if (mode === 'base_addon_nodes') {
    (data.addons || []).forEach(a => addAddonRow(a.name, a.op, a.value));
    if (!data.addons || !data.addons.length) addAddonRow();
    (data.nodes || []).forEach(n => addNodeRow(n.name, n.ratio));
    if (!data.nodes || !data.nodes.length) addNodeRow('草稿', 30);
  }
}

function addAddonRow(name, op, value) {
  const c = $('f_addons');
  if (!c) return;
  const o = op || 'multiply';
  const v = (value === undefined || value === null || value === '') ? '' : num2(value);
  const d = document.createElement('div');
  d.className = 'kv-row';
  d.innerHTML = `
    <div><input placeholder="增项名称" class="addon-name" value="${escapeHtml(name || '')}" /></div>
    <div class="mode-select">
      <select class="addon-op">
        <option value="multiply" ${o === 'multiply' ? 'selected' : ''}>×</option>
        <option value="add" ${o === 'add' ? 'selected' : ''}>＋</option>
      </select>
    </div>
    <div><input placeholder="数值（× 为 %；＋ 为元）" type="number" step="0.01" class="addon-value" value="${v}" /></div>
    <div><button class="icon-btn" onclick="this.parentElement.parentElement.remove()" title="删除">×</button></div>`;
  c.appendChild(d);
}

function addNodeRow(name, ratio) {
  const c = $('f_nodes');
  if (!c) return;
  const r = (ratio === undefined || ratio === null || ratio === '') ? '' : num2(ratio);
  const d = document.createElement('div');
  d.className = 'kv-row';
  d.innerHTML = `<div><input placeholder="节点名称" class="node-name" value="${escapeHtml(name || '')}" /></div>
    <div style="flex:0 0 40px;text-align:center;padding-bottom:6px;color:var(--ink-soft);font-size:14px;">×</div>
    <div><input placeholder="比例 %" type="number" step="0.01" class="node-ratio" value="${r}" oninput="checkNodeSum()" /></div>
    <div><button class="icon-btn" onclick="this.parentElement.parentElement.remove();checkNodeSum();" title="删除">×</button></div>`;
  c.appendChild(d);
  checkNodeSum();
}
function checkNodeSum() {
  const warn = $('f_nodeWarn');
  if (!warn || !$('f_mode')) return;
  const mode = $('f_mode').value;
  if (mode !== 'nodes' && mode !== 'base_addon_nodes') return;
  let sum = 0;
  document.querySelectorAll('.node-ratio').forEach(i => sum += Number(i.value) || 0);
  if (Math.abs(sum - 100) < 0.01) {
    warn.textContent = '✓ 比例合计 = 100.00%';
    warn.style.color = 'green';
  } else {
    warn.textContent = '当前合计 = ' + num2(sum) + '%（须 = 100.00%）';
    warn.style.color = 'var(--red)';
  }
}

function savePreset() {
  const name = $('f_name').value.trim();
  const mode = $('f_mode').value;
  const groupId = $('f_group') ? ($('f_group').value || '') : '';
  if (!name) { $('f_name').focus(); return; }

  const obj = { name, mode, groupId };
  if (mode === 'fixed') {
    obj.fixedPrice = Number($('f_fixedPrice').value) || 0;
  } else if (mode === 'sides') {
    obj.singlePrice = Number($('f_singlePrice').value) || 0;
    obj.doublePrice = Number($('f_doublePrice').value) || 0;
  } else if (mode === 'base_addon') {
    obj.basePrice = Number($('f_basePrice').value) || 0;
    obj.addons = [];
    document.querySelectorAll('#f_addons .kv-row').forEach(r => {
      const n = r.querySelector('.addon-name').value.trim();
      const op = r.querySelector('.addon-op').value;
      const value = Number(r.querySelector('.addon-value').value) || 0;
      if (n) obj.addons.push({ name: n, op, value });
    });
  } else if (mode === 'nodes') {
    obj.basePrice = Number($('f_basePrice').value) || 0;
    obj.nodes = [];
    let sum = 0;
    document.querySelectorAll('#f_nodes .kv-row').forEach(r => {
      const n = r.querySelector('.node-name').value.trim();
      const ratio = Number(r.querySelector('.node-ratio').value) || 0;
      if (n) { obj.nodes.push({ name: n, ratio }); sum += ratio; }
    });
    if (Math.abs(sum - 100) > 0.01) {
      $('f_nodeWarn').textContent = '比例合计 = ' + num2(sum) + '%，必须等于 100.00%！';
      return;
    }
  } else if (mode === 'base_addon_nodes') {
    obj.basePrice = Number($('f_basePrice').value) || 0;
    obj.addons = [];
    document.querySelectorAll('#f_addons .kv-row').forEach(r => {
      const n = r.querySelector('.addon-name').value.trim();
      const op = r.querySelector('.addon-op').value;
      const value = Number(r.querySelector('.addon-value').value) || 0;
      if (n) obj.addons.push({ name: n, op, value });
    });
    obj.nodes = [];
    let sum = 0;
    document.querySelectorAll('#f_nodes .kv-row').forEach(r => {
      const n = r.querySelector('.node-name').value.trim();
      const ratio = Number(r.querySelector('.node-ratio').value) || 0;
      if (n) { obj.nodes.push({ name: n, ratio }); sum += ratio; }
    });
    if (Math.abs(sum - 100) > 0.01) {
      $('f_nodeWarn').textContent = '比例合计 = ' + num2(sum) + '%，必须等于 100.00%！';
      return;
    }
  }

  const presets = getPresets();
  if (editingPresetIndex >= 0 && presets[editingPresetIndex]) {
    presets[editingPresetIndex] = obj;
  } else {
    presets.push(obj);
  }
  setPresets(presets);
  editingPresetIndex = -1;
  closeModal();
  renderPresetCards();
}


/* ══════════ [JS-29] 导出/导入 全部数据 ══════════ */

const EXPORT_KEYS = [
  SCHEMA_VERSION_KEY,
  PLATFORM_PRESET_KEY, PLATFORM_DEFAULT_KEY,
  IDENTITY_PRESET_KEY, IDENTITY_DEFAULT_KEY,
  PERMISSION_PRESET_KEY, DEPOSIT_PRESET_KEY,
  PRESET_KEY, PRESET_GROUP_KEY,
  EXTRA_PRESET_KEY, DISCOUNT_PRESET_KEY,
  RECEIPT_SETTINGS_KEY, RECEIPT_PRESET_LIST_KEY,
  TODO_KEY, RECORD_KEY, FLOW_KEY,
  COMPLETED_KEY, CANCELLED_KEY, DISCARDED_KEY,
  MASTER_OVERRIDE_KEY, MASTER_MANUAL_KEY, MASTER_HIDDEN_KEY,
  MEMO_KEY, ANNOUNCEMENT_SEEN_KEY,

  /* 新增：价目表 + 主题 */
  'listReceiptPriceList',
  'listReceiptPriceListSettings',
  'listReceiptPriceListGlobal',
  'listReceiptPriceListPresets',
  'listReceiptTheme',
];

async function exportAllData() {
  try {
    const lsData = {};
    EXPORT_KEYS.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try { lsData[key] = JSON.parse(raw); }
        catch(e) { lsData[key] = raw; }
      }
    });

    let filesData = {};
    if (isIDBAvailable()) {
      try {
        const keys = await idbListFileKeys();
        for (const id of keys) {
          const rec = await idbGetFile(id);
          if (!rec || !rec.blob) continue;
          const dataUrl = await blobToDataURL(rec.blob);
          if (!dataUrl) continue;
          filesData[id] = {
            dataUrl: dataUrl,
            name: rec.name || '',
            type: rec.type || '',
            size: rec.size || 0,
          };
        }
      } catch (e) {
        console.warn('[export] 读取 IDB 文件失败', e);
      }
    }

    const data = {
      __meta: {
        app: '专属结单助手',
        version: 14,
        schemaVersion: getSchemaVersion(),
        appVersion: APP_VERSION,
        exportedAt: new Date().toISOString(),
        hasFiles: Object.keys(filesData).length > 0,
        fileCount: Object.keys(filesData).length,
      },
      localStorage: lsData,
      files: filesData,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const d = new Date();
    const stamp = d.getFullYear()
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0')
      + '_'
      + String(d.getHours()).padStart(2, '0')
      + String(d.getMinutes()).padStart(2, '0');

    const a = document.createElement('a');
    a.href = url;
    a.download = '专属结单助手_备份_' + stamp + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);

    showSimpleAlert(
      '导出完成',
      '已导出数据：<br>' +
      '· localStorage 键 ' + Object.keys(lsData).length + ' 项<br>' +
      '· 图片文件 ' + Object.keys(filesData).length + ' 张'
    );
  } catch (e) {
    alert('导出失败：' + (e && e.message ? e.message : '未知错误'));
  }
}

function importAllData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';

  input.onchange = function () {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      let data;
      try {
        data = JSON.parse(e.target.result);
      } catch(err) {
        alert('文件解析失败：不是有效的 JSON 文件。');
        return;
      }

      if (!data || typeof data !== 'object') {
        alert('文件内容为空或格式不对。');
        return;
      }

      const isNewFormat = !!data.__meta && (data.localStorage || data.files);
      const lsData = isNewFormat ? (data.localStorage || {}) : data;
      const filesData = isNewFormat ? (data.files || {}) : {};

      const fileCount = Object.keys(filesData).length;
      const lsCount = Object.keys(lsData).length;

      const ok = confirm(
        '即将导入备份数据。\n\n' +
        '· 将恢复 ' + lsCount + ' 项设置/订单数据\n' +
        '· 将恢复 ' + fileCount + ' 张图片\n' +
        '· 同名数据会被覆盖，但不会删除备份里没有的项\n\n' +
        '确定继续吗？'
      );
      if (!ok) return;

      let lsSuccess = 0;
      let fileSuccess = 0;
      let quotaHit = false;

      if (fileCount > 0 && isIDBAvailable()) {
        for (const id of Object.keys(filesData)) {
          const f = filesData[id];
          if (!f || !f.dataUrl) continue;
          try {
            const blob = dataURLToBlob(f.dataUrl);
            if (!blob) continue;
            await idbPutFile({
              id: id,
              blob: blob,
              name: f.name || '',
              type: f.type || blob.type || '',
              size: f.size || blob.size || 0,
              createdAt: Date.now(),
            });
            fileSuccess++;
          } catch (err) {
            const isQuota = err && (err.name === 'QuotaExceededError'
                                 || err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
                                 || err.code === 22);
            if (isQuota) quotaHit = true;
          }
        }
      }

      Object.keys(lsData).forEach(key => {
        const val = lsData[key];
        try {
          if (typeof val === 'string') {
            localStorage.setItem(key, val);
          } else {
            localStorage.setItem(key, JSON.stringify(val));
          }
          lsSuccess++;
        } catch(err) {
          const isQuota = err && (err.name === 'QuotaExceededError'
                               || err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
                               || err.code === 22);
          if (isQuota) quotaHit = true;
        }
      });

      if (quotaHit) {
        alert(
          '部分数据因存储空间不足未能导入。\n' +
          '页面将刷新，请手动清理后重试。'
        );
      } else {
        alert(
          '导入完成\n' +
          '· 设置/订单数据：' + lsSuccess + ' 项\n' +
          '· 图片：' + fileSuccess + ' 张\n' +
          '页面将刷新以应用。'
        );
      }
      location.reload();
    };
    reader.readAsText(file, 'utf-8');
  };

  input.click();
}
/* ---------- 恢复初始状态 ---------- */
function resetAllData() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>恢复初始状态</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.8;color:#c0392b;font-weight:700;">
            ⚠️ 危险操作，不可恢复
          </p>
          <p style="margin:10px 0;line-height:1.8;">
            此操作将<strong>清空本设备上全部数据</strong>，包括：
          </p>
          <ul style="margin:8px 0;padding-left:22px;font-size:13px;color:var(--ink-soft);line-height:1.85;">
            <li>所有订单、流水、结单 / 撤单 / 废稿记录</li>
            <li>单主档案、备忘录、票夹</li>
            <li>小票设置、小票预设、价目表及全部预设</li>
            <li>稿件预设、权限、平台、身份等基础设置</li>
            <li>IndexedDB 里的全部图片</li>
          </ul>
          <p style="margin:14px 0 0;font-size:13px;color:var(--ink);line-height:1.8;background:#fff8e6;border:1px solid #f0d58c;padding:10px 12px;border-radius:6px;">
            <strong>强烈建议先点「导出数据」做一份备份。</strong>
          </p>
          <div class="actions" style="justify-content:space-between;margin-top:18px;gap:10px;">
            <button class="action-btn ghost" onclick="exportAllDataFromReset()">先导出备份</button>
            <div style="display:flex;gap:10px;">
              <button class="action-btn ghost" onclick="closeModal()">取消</button>
              <button class="action-btn" style="background:#c0392b;border-color:#c0392b;" onclick="confirmResetAllData()">我已备份，继续</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
function exportAllDataFromReset() {
  /* 关闭当前弹窗，避免遮挡导出提示 */
  closeModal();
  exportAllData();
}
function confirmResetAllData() {
  if (!confirm('最后确认：确定要清空所有数据吗？此操作不可恢复！')) return;

  closeModal();

  /* 1. 清空 localStorage 里所有 listReceipt 开头的键 */
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('listReceipt') === 0) keys.push(k);
    }
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  } catch (e) {}

  /* 2. 清空 IndexedDB 里的图片 */
  idbClearFiles().catch(() => {}).finally(() => {
    alert('已恢复初始状态，页面将刷新。');
    location.reload();
  });
}

/* ══════════ [JS-30] 上传预览图 + 初始化 ══════════ */

let previewImageData = '';

function bindUpload() {
  const fileInput = $('previewFile');
  const clearBtn = $('clearPreviewBtn');

  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files && e.target.files[0];
      if (file) loadFile(file);
    });
  }

  document.addEventListener('paste', function(e) {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.indexOf('image') >= 0) {
        const file = items[i].getAsFile();
        if (file) loadFile(file);
        break;
      }
    }
  });

  if (clearBtn) clearBtn.addEventListener('click', clearPreview);
}

async function loadFile(file) {
  if (!file) return;
  try {
    const ref = await saveImageFromFile(file, file.name || 'preview');
    if (!ref) return;

    const oldRef = previewImageData;
    previewImageData = ref;

    if (oldRef && oldRef !== ref && isFileIdRef(oldRef)) {
      try { await deleteImageRef(oldRef); } catch(e) {}
    }

    const url = await resolveImageSrc(ref);
    if ($('previewImg')) $('previewImg').src = url;
    if ($('previewBox')) $('previewBox').classList.add('show');
  } catch (err) {
    alert('图片处理失败：' + (err && err.message ? err.message : '未知错误'));
  }
}

function clearPreview() {
  const oldRef = previewImageData;
  previewImageData = '';

  if (oldRef && isFileIdRef(oldRef)) {
    deleteImageRef(oldRef).catch(() => {});
  }

  const fileInput = $('previewFile');
  const previewImg = $('previewImg');
  const previewBox = $('previewBox');
  if (fileInput) fileInput.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.classList.remove('show');
}

function bindNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', function () {
      const target = this.dataset.page;
      if (target) showPage(target);
    });
  });
}


/* ========== 初始化（基础） ========== */

(function initToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const today = `${y}-${m}-${dd}`;
  if ($('orderDate'))    $('orderDate').value    = today;
  if ($('scheduleDate')) $('scheduleDate').value = today;
})();

(function initIdentity() {
  renderIdentitySelect();
  renderIdentityList();
  const def = getDefaultIdentity();
  if ($('setIdentity')) $('setIdentity').value = def;
  syncMainFromSettings();
})();

renderPermissionList();
syncPermissionsToMain();

renderSetPlatformSelect();
syncPlatformsToMain(getDefaultPlatform());

(function initDeposit() {
  const dp = getDepositPreset();
  if ($('setDepositMode')) $('setDepositMode').value = dp.mode;
  if ($('setDeposit')) $('setDeposit').value = dp.value;
  if ($('depositMode')) $('depositMode').value = dp.mode;
  if ($('deposit')) $('deposit').value = dp.value;
})();

bindWorkDaysLogic();
bindDepositUnitLogic();
bindNav();

setupReceiptImgInputs();
setupFontFileInput();
applyReceiptSettings();
renderCustomFontList();

initTodoModule();

if (typeof ResizeObserver !== 'undefined') {
  let __lastReceiptW = 0;
  const __receiptEl = $('receipt');
  if (__receiptEl) {
    const __receiptRO = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (Math.abs(w - __lastReceiptW) < 1) return;
      __lastReceiptW = w;

      const s = getReceiptSettings();
      applyBgImgRef(s.bgImg, s.bgImgState, s.bgOpacity);
      applyBlockImgRef('header', s.headerImg, s.headerImgState);
      applyBlockImgRef('footer', s.footerImg, s.footerImgState);
    });
    __receiptRO.observe(__receiptEl);
  }
}

window.addEventListener('resize', () => {
  ['header', 'footer'].forEach(kind => {
    const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
    const img = kind === 'header' ? $('outHeaderImg') : $('outFooterImg');
    if (!block || !img) return;
    if (!block.classList.contains('show')) return;
    const s = getReceiptSettings();
    const state = kind === 'header' ? s.headerImgState : s.footerImgState;
    if (!state || !state.w) {
      const blockW = block.offsetWidth || block.clientWidth || 0;
      img.style.width = blockW + 'px';
      img.style.height = 'auto';
      updateBlockHeight(block, img);
      positionHandle(kind);
    }
  });

  const bg = $('outBgImg');
  if (bg && bg.classList.contains('has-img')) {
    const s = getReceiptSettings();
    if (!s.bgImgState || !s.bgImgState.w) {
      resolveImageSrc(s.bgImg).then(url => {
        if (url) applyBgImg(url, { w: 0, h: 0, l: 0, t: 0, baseW: 0 }, s.bgOpacity);
      });
    }
  }

  updateFontSizeDot();
});

addGroup();
bindUpload();
refreshPresetDatalist();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    applyReceiptSettings();
  });
}


/* ══════════ [JS-31] 订单数据存取 ══════════ */

function getTodos() {
  try { return JSON.parse(localStorage.getItem(TODO_KEY)) || []; }
  catch(e) { return []; }
}
function setTodos(arr) {
  try {
    localStorage.setItem(TODO_KEY, JSON.stringify(arr));
    return true;
  } catch(e) {
    alert('保存失败：浏览器存储空间已满，请清理部分图片后重试。');
    return false;
  }
}

function getSortedTodos() {
  const todos = getTodos();
  todos.sort((a, b) => {
    if (!a.deadline && !b.deadline) return (a.createdAt || 0) - (b.createdAt || 0);
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    if (a.deadline === b.deadline) return (a.createdAt || 0) - (b.createdAt || 0);
    return a.deadline.localeCompare(b.deadline);
  });
  todos.forEach((t, i) => { t.number = i + 1; });
  return todos;
}

function formatTodoNumber(n) {
  return String(n).padStart(3, '0');
}

function formatTodoTitle(t) {
  const num = formatTodoNumber(t.number || 1);
  const name = (t.clientName || '未命名').trim();
  if (t.isPlaceholder) {
    return num + ' ' + name + ' 的占位单';
  }
  return num + ' ' + name + ' 的立项单';
}

function formatDaysLeftHtml(deadline, isPlaceholder) {
  if (!deadline) return '未设置';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(deadline); d.setHours(0, 0, 0, 0);
  if (isNaN(d.getTime())) return '未设置';
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  const prefix = isPlaceholder ? '距离开单还有' : '还有';

  if (diff > 0) {
    if (diff <= 3) {
      return prefix + ' <span class="days-num urgent">' + diff + '</span> 天';
    }
    return prefix + ' ' + diff + ' 天';
  }
  if (diff === 0) return isPlaceholder ? '今天开单' : '今天截稿';
  return '已超期 <span class="days-num urgent">' + Math.abs(diff) + '</span> 天';
}

function calcDaysLeftText(deadline) {
  if (!deadline) return '未设置';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(deadline); d.setHours(0, 0, 0, 0);
  if (isNaN(d.getTime())) return '未设置';
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (diff > 0) return '还有 ' + diff + ' 天';
  if (diff === 0) return '今天';
  return '已超期 ' + Math.abs(diff) + ' 天';
}
function makeTodoId() {
  return 'todo_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function makeItemId() {
  return 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
function makeFileId() {
  return 'file_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function isTodoCompleted(t) {
  if (!t) return false;
  if (t.isPlaceholder) return false;
  const items = t.items || [];
  if (!items.length) return false;
  return items.every(x => x.done === true);
}

function isTodoPending(t) {
  return t && t.status === 'pending';
}


/* ══════════ [JS-32] 订单列表页 ══════════ */

function renderTodoList() {
  const box = $('todoListContainer');
  if (!box) return;

  const todos = getSortedTodos();

  if (!todos.length) {
    box.innerHTML = `
      <div class="todo-empty">
        <div class="todo-empty-icon">📋</div>
        <div>暂无订单<br><span style="font-size:12px;opacity:0.7;">在小票页生成订单后，点工具栏第一个图标导入订单</span></div>
      </div>`;
    return;
  }

  box.innerHTML = todos.map(t => renderTodoCard(t)).join('');
}

function renderTodoCard(t) {
  const id = escapeAttr(t.id);
  const isPlaceholder = !!t.isPlaceholder;
  const isPending = isTodoPending(t);
  const titleHtml = escapeHtml(formatTodoTitle(t));

  const moreSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="7" x2="20" y2="7"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="17" x2="20" y2="17"/>
    </svg>`;

  if (isPending) {
    const pendingAmt = Number(t.pendingAmount) || 0;
    return `<div class="todo-card is-pending">
      <div class="todo-card-body" onclick="openTodoDetail('${id}')">
        <div class="todo-card-title">${titleHtml}</div>
        <div class="todo-card-pending-row">
          <span class="todo-card-pending-tag">待结</span>
          <span class="todo-card-pending-amount">${fmt(pendingAmt)}</span>
        </div>
      </div>
      <button class="todo-more-btn" onclick="openTodoMoreMenu(event, '${id}')" title="更多">${moreSvg}</button>
      <button class="todo-settle-btn" onclick="settleTodo('${id}')">结单</button>
    </div>`;
  }

  const total = (t.items || []).length;
  const done = (t.items || []).filter(x => x.done).length;

  let progressHtml;
  if (isPlaceholder) {
    progressHtml = `<span class="todo-card-progress placeholder">待开单</span>`;
  } else if (isTodoCompleted(t)) {
    progressHtml = `<span class="todo-card-progress">待结单 <span class="done">${done}</span><span class="slash">/</span><span class="total">${total}</span></span>`;
  } else {
    progressHtml = `<span class="todo-card-progress">完成进度 <span class="done">${done}</span><span class="slash">/</span><span class="total">${total}</span></span>`;
  }

  const daysHtml = formatDaysLeftHtml(t.deadline, isPlaceholder);

  return `<div class="todo-card">
    <div class="todo-card-body" onclick="openTodoDetail('${id}')">
      <div class="todo-card-title">${titleHtml}</div>
      <div class="todo-card-meta">
        ${progressHtml}
        <span class="todo-card-deadline">${daysHtml}</span>
      </div>
    </div>
    <button class="todo-more-btn" onclick="openTodoMoreMenu(event, '${id}')" title="更多">${moreSvg}</button>
    <button class="todo-card-delete" onclick="askDeleteTodo('${id}')" title="删除">×</button>
  </div>`;
}

function askDeleteTodo(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  const sorted = getSortedTodos();
  const withNum = sorted.find(x => x.id === id) || t;
  const title = formatTodoTitle(withNum);

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>删除订单</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;">确定删除以下订单吗？</p>
          <p style="font-weight:600;color:var(--ink);margin:0 0 6px;">${escapeHtml(title)}</p>
          <p style="font-size:12px;color:var(--ink-soft);margin:0;">
            此操作将同时删除该订单相关流水，且不可恢复。<br>
            如果你只是想标记撤单 / 废稿，请使用右侧三横线菜单。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeleteTodo('${escapeAttr(id)}')">确定删除</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmDeleteTodo(id) {
  const todos = getTodos().filter(t => t.id !== id);
  setTodos(todos);
  removeFlowsByTodoId(id);
  closeModal();
  renderTodoList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}


/* ══════════ [JS-33] 订单详情页 ══════════ */

var __currentTodoId = null;
var __todoEditMode = false;

function openTodoDetail(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) { alert('未找到该订单'); return; }

  __currentTodoId = id;
  __todoEditMode = false;

  const sorted = getSortedTodos();
  const withNum = sorted.find(x => x.id === id) || t;
  $('tdTitle').textContent = formatTodoTitle(withNum);

  if ($('tdDeadlineLabel')) $('tdDeadlineLabel').textContent = t.isPlaceholder ? '开单日期' : '截稿日期';
  if ($('tdDaysLeftLabel')) $('tdDaysLeftLabel').textContent = t.isPlaceholder ? '距离开单日' : '距离截稿日';

  $('tdClientId').value = t.clientId || '';
  $('tdPlatform').value = t.platform || '';

  if ($('tdContactType')) $('tdContactType').value = normalizeContactType(t.contactType);
  $('tdContact').value  = t.contact  || '';

  $('tdDeadline').value = t.deadline || '';
  $('tdDaysLeft').value = calcDaysLeftText(t.deadline);
  $('tdNote').value     = t.note     || '';

  const changeBtn = $('tdChangeReceiptBtn');
  if (changeBtn) {
    changeBtn.textContent = t.isPlaceholder ? '转立项单' : '更改';
  }

  renderTodoItems(t);
  renderTodoThumbs('material', t.materials || []);
  renderTodoThumbs('requirement', t.requirements || []);

  setTodoEditMode(false);
  showPage('pageTodoDetail');
}

function setTodoEditMode(on) {
  __todoEditMode = !!on;

  const editableIds = ['tdClientId', 'tdPlatform', 'tdContact', 'tdDeadline', 'tdNote'];
  editableIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.readOnly = !on;
    }
  });

  if ($('tdContactType')) $('tdContactType').disabled = !on;

  const addBtn = $('tdAddItemBtn');
  if (addBtn) addBtn.style.display = on ? '' : 'none';

  const editBtn = $('tdEditBtn');
  const saveBtn = $('tdSaveBtn');
  if (editBtn) editBtn.style.display = on ? 'none' : '';
  if (saveBtn) saveBtn.style.display = on ? '' : 'none';

  const t = getTodos().find(x => x.id === __currentTodoId);
  if (t) renderTodoItems(t);
}

function toggleTodoEdit() { setTodoEditMode(true); }

function saveTodoDetail() {
  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === __currentTodoId);
  if (idx < 0) return;

  todos[idx].clientId = $('tdClientId').value.trim();
  todos[idx].platform = $('tdPlatform').value.trim();
  todos[idx].contactType = $('tdContactType') ? normalizeContactType($('tdContactType').value) : 'QQ';
  todos[idx].contact  = $('tdContact').value.trim();
  todos[idx].deadline = $('tdDeadline').value;
  todos[idx].note     = $('tdNote').value;
  todos[idx].clientName = todos[idx].clientId || todos[idx].clientName || '未命名';
  todos[idx].updatedAt = Date.now();

  setTodos(todos);
  setTodoEditMode(false);

  const sorted = getSortedTodos();
  const withNum = sorted.find(x => x.id === __currentTodoId);
  if (withNum) $('tdTitle').textContent = formatTodoTitle(withNum);
  $('tdDaysLeft').value = calcDaysLeftText(todos[idx].deadline);

  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}

function backToTodoList() {
  __currentTodoId = null;
  __todoEditMode = false;
  renderTodoList();
  showPage('pageTodo');
}

function renderTodoItems(t) {
  const box = $('tdItems');
  if (!box) return;

  if (!t.items || !t.items.length) {
    if (t.isPlaceholder) {
      box.innerHTML = '<p style="color:#2b7fff;font-size:13px;margin:6px 0;font-weight:600;letter-spacing:0.06em;">待开单（占位单）</p>';
    } else {
      box.innerHTML = '<p style="color:var(--ink-soft);font-size:13px;margin:6px 0;">暂无事项。</p>';
    }
    return;
  }

  box.innerHTML = t.items.map(item => `
    <div class="td-item ${item.done ? 'done' : ''}">
      <button type="button" class="td-item-check" onclick="toggleTodoItem('${escapeAttr(item.id)}')" title="切换完成">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          ${item.done ? '<polyline points="8 12 11 15 16 9"/>' : ''}
        </svg>
      </button>
      <div class="td-item-text">${escapeHtml(item.text)}</div>
      ${__todoEditMode ? `<button type="button" class="td-item-del" onclick="deleteTodoItem('${escapeAttr(item.id)}')" title="删除">×</button>` : ''}
    </div>
  `).join('');
}

function toggleTodoItem(itemId) {
  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === __currentTodoId);
  if (idx < 0) return;
  const item = (todos[idx].items || []).find(x => x.id === itemId);
  if (!item) return;
  item.done = !item.done;
  setTodos(todos);
  renderTodoItems(todos[idx]);
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
}

function deleteTodoItem(itemId) {
  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === __currentTodoId);
  if (idx < 0) return;
  todos[idx].items = (todos[idx].items || []).filter(x => x.id !== itemId);
  setTodos(todos);
  renderTodoItems(todos[idx]);
}

function addTodoItem() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加事项</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <label>事项内容</label>
          <input id="newTodoItemText" placeholder="如：线稿" />
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmAddTodoItem()">确定</button>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('newTodoItemText'); if (el) el.focus(); }, 50);
}

function confirmAddTodoItem() {
  const text = ($('newTodoItemText').value || '').trim();
  if (!text) { $('newTodoItemText').focus(); return; }
  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === __currentTodoId);
  if (idx < 0) { closeModal(); return; }
  if (!todos[idx].items) todos[idx].items = [];
  todos[idx].items.push({ id: makeItemId(), text, done: false });
  todos[idx].isPlaceholder = false;
  setTodos(todos);
  closeModal();
  renderTodoItems(todos[idx]);
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
}

function copyTodoContact() {
  const v = $('tdContact') ? ($('tdContact').value || '') : '';
  if (!v) { alert('没有可复制的内容'); return; }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(v).then(() => {
      alert('已复制账号：' + v);
    }).catch(() => { fallbackCopy(v); });
  } else {
    fallbackCopy(v);
  }
}


/* ══════════ [JS-34] 素材 / 要求 上传 ══════════ */

function triggerTodoUpload(kind) {
  if (kind === 'material') {
    const el = $('tdMaterialInput'); if (el) el.click();
  } else if (kind === 'requirement') {
    const el = $('tdRequirementInput'); if (el) el.click();
  }
}

function setupTodoFileInputs() {
  ['material', 'requirement'].forEach(kind => {
    const inputId = kind === 'material' ? 'tdMaterialInput' : 'tdRequirementInput';
    const input = $(inputId);
    if (!input) return;

    input.addEventListener('change', async function (e) {
      const files = Array.from(e.target.files || []);
      e.target.value = '';
      if (!files.length) return;

      if (!__currentTodoId) {
        alert('请先打开一条订单再上传');
        return;
      }

      const todos = getTodos();
      const idx = todos.findIndex(x => x.id === __currentTodoId);
      if (idx < 0) { alert('订单不存在'); return; }

      const key = kind === 'material' ? 'materials' : 'requirements';
      if (!todos[idx][key]) todos[idx][key] = [];

      for (const file of files) {
        if (!/^image\//.test(file.type)) continue;
        try {
          const ref = await saveImageFromFile(file, file.name);
          if (!ref) continue;
          todos[idx][key].push({
            id: makeFileId(),
            name: file.name,
            fileRef: ref,
            dataUrl: '',
          });
        } catch(err) {
          console.error('读取失败', file.name, err);
        }
      }

      const ok = setTodos(todos);
      if (!ok) return;

      renderTodoThumbs(kind, todos[idx][key]);
    });
  });
}

async function renderTodoThumbs(kind, list) {
  const boxId = kind === 'material' ? 'tdMaterialsList' : 'tdRequirementsList';
  const box = $(boxId);
  if (!box) return;

  if (!list || !list.length) { box.innerHTML = ''; return; }

  const items = await Promise.all(list.map(async f => {
    const ref = f.fileRef || f.dataUrl || '';
    const src = await resolveImageSrc(ref);
    if (!src) return '';
    return `
    <div class="td-thumb">
      <img src="${escapeAttr(src)}" alt="${escapeAttr(f.name)}" onclick="openTodoImageViewer('${escapeAttr(f.id)}')" />
      <button type="button" class="td-thumb-del" onclick="deleteTodoThumb('${kind}','${escapeAttr(f.id)}')" title="删除">×</button>
    </div>`;
  }));

  box.innerHTML = items.filter(x => x).join('');
}

async function deleteTodoThumb(kind, fileId) {
  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === __currentTodoId);
  if (idx < 0) return;
  const key = kind === 'material' ? 'materials' : 'requirements';
  if (!todos[idx][key]) return;

  const target = todos[idx][key].find(f => f.id === fileId);
  todos[idx][key] = todos[idx][key].filter(f => f.id !== fileId);
  setTodos(todos);

  if (target) {
    const ref = target.fileRef || target.dataUrl;
    if (ref) {
      try { await deleteImageRef(ref); } catch(e) {}
    }
  }

  renderTodoThumbs(kind, todos[idx][key]);
}


/* ══════════ [JS-35] 图片查看器 ══════════ */

async function openTodoImageViewer(fileId) {
  const todos = getTodos();
  const t = todos.find(x => x.id === __currentTodoId);
  if (!t) return;

  const all = [].concat(t.materials || [], t.requirements || []);
  const f = all.find(x => x.id === fileId);
  if (!f) return;

  const ref = f.fileRef || f.dataUrl || '';
  const src = await resolveImageSrc(ref);
  if (!src) return;

  const old = document.querySelector('.td-viewer');
  if (old) old.remove();

  const viewer = document.createElement('div');
  viewer.className = 'td-viewer';
  viewer.innerHTML = `
    <button class="td-viewer-close" onclick="closeTodoImageViewer()">×</button>
    <img src="${escapeAttr(src)}" alt="" onclick="event.stopPropagation()" />
  `;
  viewer.addEventListener('click', closeTodoImageViewer);
  document.body.appendChild(viewer);
}

function closeTodoImageViewer() {
  const viewer = document.querySelector('.td-viewer');
  if (viewer) viewer.remove();
}

async function showTodoReceipt() {
  const todos = getTodos();
  const t = todos.find(x => x.id === __currentTodoId);
  if (!t || !t.receiptImage) {
    alert('这条订单还没有保存小票图片');
    return;
  }

  const src = await resolveImageSrc(t.receiptImage);
  if (!src) {
    alert('小票图片已丢失');
    return;
  }

  const old = document.querySelector('.td-viewer');
  if (old) old.remove();

  const viewer = document.createElement('div');
  viewer.className = 'td-viewer';
  viewer.innerHTML = `
    <button class="td-viewer-close" onclick="closeTodoImageViewer()">×</button>
    <img src="${escapeAttr(src)}" alt="小票" onclick="event.stopPropagation()" />
  `;
  viewer.addEventListener('click', closeTodoImageViewer);
  document.body.appendChild(viewer);
}


/* ══════════ [JS-36] 小票快照：抓取 / 回填 ══════════ */

function captureReceiptFormSnapshot() {
  const groups = [];
  document.querySelectorAll('#groupsContainer .group-block').forEach(gb => {
    const titleEl = gb.querySelector('.group-title');
    const items = [];
    gb.querySelectorAll('.item-block').forEach(ib => {
      const nameEl  = ib.querySelector('.item-name');
      const priceEl = ib.querySelector('.item-price');
      const qtyEl   = ib.querySelector('.item-qty');
      const licEl   = ib.querySelector('.item-license');
      const subItems = [];
      ib.querySelectorAll('.sub-item').forEach(si => {
        const sn  = si.querySelector('.sub-name');
        const sop = si.querySelector('.sub-op-select');
        const sv  = si.querySelector('.sub-value');
        subItems.push({
          name: sn ? sn.value : '',
          op: sop ? sop.value : 'add',
          value: sv ? sv.value : '',
          isNode: si.dataset.isNode === '1'
        });
      });
      items.push({
        name: nameEl ? nameEl.value : '',
        price: priceEl ? priceEl.value : '',
        qty: qtyEl ? qtyEl.value : '1',
        license: licEl ? licEl.value : '',
        subItems: subItems
      });
    });

    const extras = [];
    gb.querySelectorAll('.group-extras .ge-row').forEach(row => {
      extras.push({
        name: row.querySelector('.ge-name') ? row.querySelector('.ge-name').value : '',
        op: row.querySelector('.ge-op-select') ? row.querySelector('.ge-op-select').value : 'multiply',
        value: row.querySelector('.ge-value') ? row.querySelector('.ge-value').value : ''
      });
    });

    const discounts = [];
    gb.querySelectorAll('.group-discounts .ge-row').forEach(row => {
      discounts.push({
        name: row.querySelector('.gd-name') ? row.querySelector('.gd-name').value : '',
        op: row.querySelector('.gd-op-select') ? row.querySelector('.gd-op-select').value : 'multiply',
        value: row.querySelector('.gd-value') ? row.querySelector('.gd-value').value : ''
      });
    });

    groups.push({ title: titleEl ? titleEl.value : '', items, extras, discounts });
  });

  const extras = [];
  document.querySelectorAll('#extrasContainer .oe-row').forEach(row => {
    extras.push({
      name: row.querySelector('.extra-name') ? row.querySelector('.extra-name').value : '',
      op: row.querySelector('.extra-mode') ? row.querySelector('.extra-mode').value : 'multiply',
      value: row.querySelector('.extra-val') ? row.querySelector('.extra-val').value : ''
    });
  });

  const discounts = [];
  document.querySelectorAll('#discountsContainer .oe-row').forEach(row => {
    discounts.push({
      name: row.querySelector('.discount-name') ? row.querySelector('.discount-name').value : '',
      op: row.querySelector('.discount-mode') ? row.querySelector('.discount-mode').value : 'multiply',
      value: row.querySelector('.discount-val') ? row.querySelector('.discount-val').value : ''
    });
  });

  const gifts = [];
  const gn = document.querySelectorAll('.gift-name');
  const gv = document.querySelectorAll('.gift-val');
  gn.forEach((el, i) => {
    gifts.push({ name: el.value, value: gv[i] ? gv[i].value : '' });
  });

  return {
    orderDate:    $('orderDate')    ? $('orderDate').value    : '',
    scheduleDate: $('scheduleDate') ? $('scheduleDate').value : '',
    workDays:     $('workDays')     ? $('workDays').value     : '',
    project:      $('project')      ? $('project').value      : '',
    attribute:    $('attribute')    ? $('attribute').value    : '',
    character:    $('character')    ? $('character').value    : '',
    depositMode:  $('depositMode')  ? $('depositMode').value  : 'percent',
    deposit:      $('deposit')      ? $('deposit').value      : '20',
    placeholder:  $('placeholderToggle') ? $('placeholderToggle').checked : false,
    groups, extras, discounts, gifts,
    previewImage: previewImageData || ''
  };
}

function restoreReceiptFormSnapshot(snap) {
  if (!snap) return;

  if ($('orderDate'))    $('orderDate').value    = snap.orderDate    || '';
  if ($('scheduleDate')) $('scheduleDate').value = snap.scheduleDate || '';
  if ($('workDays'))     $('workDays').value     = snap.workDays     || '';
  if ($('project'))      $('project').value      = snap.project      || '';
  if ($('attribute'))    $('attribute').value    = snap.attribute    || '';
  if ($('character'))    $('character').value    = snap.character    || '';
  if ($('depositMode'))  $('depositMode').value  = snap.depositMode  || 'percent';
  if ($('deposit'))      $('deposit').value      = (snap.deposit !== undefined && snap.deposit !== '') ? snap.deposit : '20';
  if ($('placeholderToggle')) $('placeholderToggle').checked = !!snap.placeholder;
  updateDepositUnit();

  if (typeof setDepositModeLocked === 'function') {
    setDepositModeLocked(!!snap.placeholder);
  }

  if (typeof applyPlaceholderMode === 'function') {
    applyPlaceholderMode(!!snap.placeholder);
  }

  const gContainer = $('groupsContainer');
  if (gContainer) gContainer.innerHTML = '';

  const groupsArr = (snap.groups && snap.groups.length)
    ? snap.groups
    : [{ title: '', items: [{ name: '', price: '', qty: '1', license: '', subItems: [] }], extras: [], discounts: [] }];

  groupsArr.forEach(g => {
    const gb = addGroup(g.title || '');
    const itemsEl = gb.querySelector('.group-items');
    if (itemsEl) itemsEl.innerHTML = '';

    const itemsArr = (g.items && g.items.length)
      ? g.items
      : [{ name: '', price: '', qty: '1', license: '', subItems: [] }];

    itemsArr.forEach(it => {
      addItemToGroup(itemsEl, null);
      const ib = itemsEl.lastElementChild;
      if (!ib) return;
      const nameEl  = ib.querySelector('.item-name');
      const priceEl = ib.querySelector('.item-price');
      const qtyEl   = ib.querySelector('.item-qty');
      const licEl   = ib.querySelector('.item-license');
      if (nameEl)  nameEl.value  = it.name  || '';
      if (priceEl) priceEl.value = it.price || '';
      if (qtyEl)   qtyEl.value   = (it.qty !== undefined && it.qty !== '') ? it.qty : '1';
      if (licEl)   licEl.value   = it.license || '';

      (it.subItems || []).forEach(si => {
        const isNode = si.isNode === true;
        addSubItem(ib, si.name, si.op, si.value, isNode ? { isNode: true } : undefined);
      });
    });

    (g.extras || []).forEach(ex => addGroupExtra(gb, ex));
    (g.discounts || []).forEach(dc => addGroupDiscount(gb, dc));
  });

  const ec = $('extrasContainer');
  if (ec) ec.innerHTML = '';
  (snap.extras || []).forEach(ex => addExtra(ex));

  const dc = $('discountsContainer');
  if (dc) dc.innerHTML = '';
  (snap.discounts || []).forEach(d => addDiscount(d));

  const gc = $('giftsContainer');
  if (gc) gc.innerHTML = '';
  (snap.gifts || []).forEach(g => {
    addGift();
    const rows = gc.querySelectorAll('.kv-row');
    const last = rows[rows.length - 1];
    if (!last) return;
    const gnEl = last.querySelector('.gift-name');
    const gvEl = last.querySelector('.gift-val');
    if (gnEl) gnEl.value = g.name || '';
    if (gvEl) gvEl.value = g.value || '';
  });

  const ref = snap.previewImage || '';
  previewImageData = ref;

  if (ref) {
    if ($('previewBox')) $('previewBox').classList.add('show');
    resolveImageSrc(ref).then(url => {
      if (url && $('previewImg')) $('previewImg').src = url;
    }).catch(() => {
      if ($('previewImg')) $('previewImg').src = '';
    });
  } else {
    if ($('previewImg')) $('previewImg').src = '';
    if ($('previewBox')) $('previewBox').classList.remove('show');
  }

  renumberGroups();
}


/* ══════════ [JS-37] changeTodoReceipt + 占位单转立项单 ══════════ */

function changeTodoReceipt() {
  const todos = getTodos();
  const t = todos.find(x => x.id === __currentTodoId);
  if (!t) { alert('订单不存在'); return; }

  if (t.isPlaceholder) {
    const prepaid = Number(t.prepaid) || 0;

    if (prepaid > 0) {
      $('modalRoot').innerHTML = `
        <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
          <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-head">
              <h3>转立项单</h3>
              <button class="icon-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <p style="margin:6px 0 10px;font-size:13px;color:var(--ink-soft);">
                本条为占位单，已收排单费 <strong style="color:var(--ink);">${fmt(prepaid)}</strong>。
              </p>
              <div class="flow-switch-row" style="padding:6px 0 14px;">
                <div>
                  <div class="flow-switch-label">预付抵扣</div>
                  <div class="flow-switch-sub">
                    开启：排单费抵扣本次预付款，实收预付 = 预付款 − 排单费（不小于 0）<br>
                    关闭：排单费保留为独立实收，本次预付款按新订单正常计算
                  </div>
                </div>
                <label class="switch-wrap">
                  <span class="switch">
                    <input type="checkbox" id="convertDeductToggle" />
                    <span class="switch-slider"></span>
                  </span>
                </label>
              </div>
              <p style="font-size:11.5px;color:var(--ink-soft);margin:0;line-height:1.7;">
                转入后会自动关闭「占位」开关，可填写立项内容。
              </p>
              <div class="actions" style="justify-content:flex-end;margin-top:18px;">
                <button class="action-btn ghost" onclick="closeModal()">取消</button>
                <button class="action-btn" onclick="confirmConvertPlaceholder()">继续</button>
              </div>
            </div>
          </div>
        </div>`;
    } else {
      window.__convertDeduct = false;
      doConvertPlaceholder(false);
    }
  } else {
    editTodoReceipt();
  }
}

function confirmConvertPlaceholder() {
  const toggle = $('convertDeductToggle');
  const useDeduct = !!(toggle && toggle.checked);
  closeModal();
  doConvertPlaceholder(useDeduct);
}

function doConvertPlaceholder(useDeduct) {
  const todos = getTodos();
  const t = todos.find(x => x.id === __currentTodoId);
  if (!t) { alert('订单不存在'); return; }

  const placeholderPrepaid = Number(t.prepaid) || 0;

  window.__editingTodoId = t.id;
  window.__convertFromPlaceholder = true;
  window.__convertDeduct = !!useDeduct;
  window.__placeholderPrepaid = placeholderPrepaid;

  if ($('placeholderToggle')) $('placeholderToggle').checked = false;
  if (typeof setDepositModeLocked === 'function') setDepositModeLocked(false);
  if (typeof applyPlaceholderMode === 'function') applyPlaceholderMode(false);

  if ($('client'))       $('client').value       = t.clientId || '';
  if ($('orderDate'))    $('orderDate').value    = t.orderDate || '';
  if ($('scheduleDate')) $('scheduleDate').value = t.scheduleDate || '';
  if ($('deadline'))     $('deadline').value     = t.deadline || '';

  if ($('platform') && t.platform) {
    const opts = Array.from($('platform').options).map(o => o.value);
    if (opts.indexOf(t.platform) > -1) $('platform').value = t.platform;
  }

  if (t.receiptSnapshot) {
    restoreReceiptFormSnapshot(t.receiptSnapshot);
    if ($('placeholderToggle')) $('placeholderToggle').checked = false;
    if (typeof setDepositModeLocked === 'function') setDepositModeLocked(false);
    if (typeof applyPlaceholderMode === 'function') applyPlaceholderMode(false);
  } else {
    const gContainer = $('groupsContainer');
    if (gContainer) {
      gContainer.innerHTML = '';
      addGroup();
    }
    if ($('extrasContainer'))    $('extrasContainer').innerHTML = '';
    if ($('discountsContainer')) $('discountsContainer').innerHTML = '';
    if ($('giftsContainer'))     $('giftsContainer').innerHTML = '';
  }

  const rp = $('receiptPanel');
  if (rp) rp.classList.add('hidden');

  showSimpleAlert(
    '已转为立项单',
    useDeduct
      ? '已开启「预付抵扣」：本次预付款将扣除排单费。请填写立项内容后点「确定生成」，再点工具栏第一个图标导入订单。'
      : '已保留排单费为独立实收。请填写立项内容后点「确定生成」，再点工具栏第一个图标导入订单。'
  );

  showPage('pageReceipt');
}

function editTodoReceipt() {
  const todos = getTodos();
  const t = todos.find(x => x.id === __currentTodoId);
  if (!t) { alert('订单不存在'); return; }

  window.__editingTodoId = t.id;

  if ($('client'))   $('client').value   = t.clientId || '';
  if ($('orderDate')) $('orderDate').value = t.orderDate || '';
  if ($('scheduleDate')) $('scheduleDate').value = t.scheduleDate || '';

  if ($('deadline')) {
    if (t.isPlaceholder) $('deadline').value = '';
    else                 $('deadline').value = t.deadline || '';
  }

  if ($('placeholderToggle')) $('placeholderToggle').checked = !!t.isPlaceholder;
  if (typeof setDepositModeLocked === 'function') setDepositModeLocked(!!t.isPlaceholder);
  if (typeof applyPlaceholderMode === 'function') applyPlaceholderMode(!!t.isPlaceholder);

  if ($('platform') && t.platform) {
    const opts = Array.from($('platform').options).map(o => o.value);
    if (opts.indexOf(t.platform) > -1) {
      $('platform').value = t.platform;
    }
  }

  if (t.receiptSnapshot) {
    restoreReceiptFormSnapshot(t.receiptSnapshot);
  } else {
    const gContainer = $('groupsContainer');
    if (gContainer) gContainer.innerHTML = '';
    const gb = addGroup();
    const itemsEl = gb.querySelector('.group-items');
    if (itemsEl) itemsEl.innerHTML = '';
    const list = (t.items && t.items.length) ? t.items : [{ text: '' }];
    list.forEach(item => {
      addItemToGroup(itemsEl, { name: item.text || '' });
    });
    renumberGroups();
  }

  const rp = $('receiptPanel');
  if (rp) rp.classList.add('hidden');

  showSimpleAlert(
    '已加载到小票页',
    '请修改小票信息后点击「确定生成」，再点工具栏第一个图标（导入订单）。<br>新小票信息和图片会同步更新到原来的这条订单。'
  );

  showPage('pageReceipt');
}


/* ══════════ [JS-38] 从小票页导入订单 ══════════ */

async function importToTodo() {
  const receiptPanel = $('receiptPanel');
  if (!receiptPanel || receiptPanel.classList.contains('hidden')) {
    showSimpleAlert('提示', '请先点「确定生成」生成小票。');
    return;
  }

  const clientId     = ($('client').value || '').trim();
  const platform     = ($('platform').value || '').trim();
  const clientName   = clientId || '未命名';
  const placeholderOn = $('placeholderToggle') && $('placeholderToggle').checked;

  const orderDateVal    = ($('orderDate').value || '').trim();
  const scheduleDateVal = ($('scheduleDate').value || '').trim();
  const deadlineVal     = ($('deadline').value || '').trim();

  const effectiveDeadline = placeholderOn ? scheduleDateVal : deadlineVal;

  const items = [];
  if (!placeholderOn) {
    document.querySelectorAll('#groupsContainer .item-block').forEach(block => {
      const nameInput = block.querySelector('.item-name');
      const name = nameInput ? (nameInput.value || '').trim() : '';
      if (name) items.push({ id: makeItemId(), text: name, done: false });
    });
  }

  const snapshot = captureReceiptFormSnapshot();
  let amounts = { payable: 0, prepaid: 0, final: 0 };
  try {
    amounts = calcSnapshotAmounts(snapshot) || amounts;
  } catch (e) {
    console.warn('金额计算失败', e);
  }

  let receiptImageRef = '';
  try {
    const handleState = hideAllReceiptHandles();

    const canvas = await html2canvas($('receipt'), {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const dataUrl = canvas.toDataURL('image/png');
    restoreAllReceiptHandles(handleState);

    const blob = dataURLToBlob(dataUrl);
    if (blob) {
      const ref = await saveImageBlob(blob, 'receipt_' + (orderDateVal || '') + '.png');
      if (ref) receiptImageRef = ref;
    }
  } catch(e) {
    console.warn('小票截图失败', e);
    const ok = confirm('小票截图生成失败，仍然要导入订单吗？（将不包含小票图片）');
    if (!ok) return;
  }

  const editingId = window.__editingTodoId;
  const fromConvert = !!window.__convertFromPlaceholder;
  const useDeduct = !!window.__convertDeduct;
  const placeholderPrepaid = Number(window.__placeholderPrepaid) || 0;
  const todos = getTodos();
  const today = fmtDateStr(new Date());

  if (editingId) {
    const idx = todos.findIndex(x => x.id === editingId);
    if (idx >= 0) {
      const t = todos[idx];
      const oldPrepaid = Number(t.prepaid) || 0;
      const oldReceiptRef = t.receiptImage || '';

      t.clientId        = clientId;
      t.clientName      = clientName;
      t.platform        = platform;
      t.orderDate       = orderDateVal;
      t.scheduleDate    = scheduleDateVal;
      t.deadline        = effectiveDeadline;
      t.items           = items;
      t.receiptSnapshot = snapshot;
      t.isPlaceholder   = !!placeholderOn && items.length === 0;
      t.payable         = amounts.payable;
      t.prepaid         = amounts.prepaid;
      t.originalFinal   = amounts.final;
      t.updatedAt       = Date.now();

      if (receiptImageRef) {
        t.receiptImage = receiptImageRef;
      }

      if (t.status === 'pending') {
        t.pendingAmount = amounts.final;
      }

      if (!setTodos(todos)) return;

      if (receiptImageRef && oldReceiptRef && oldReceiptRef !== receiptImageRef) {
        try { await deleteImageRef(oldReceiptRef); } catch(e) {}
      }

      if (fromConvert) {
        removeFlowsByTodoIdAndType(editingId, 'prepaid');

        let prepaidToRecord = amounts.prepaid;
        if (useDeduct && oldPrepaid > 0) {
          prepaidToRecord = Math.max(0, amounts.prepaid - oldPrepaid);
        }

        if (prepaidToRecord > 0) {
          addFlow('prepaid', prepaidToRecord, '预付款 · ' + clientName, orderDateVal || today, { todoId: editingId });
        }
        if (useDeduct && oldPrepaid > 0) {
          const existDispatch = getFlows().find(f => f.todoId === editingId && f.type === 'dispatch');
          if (!existDispatch) {
            addFlow('dispatch', oldPrepaid, '排单费 · ' + clientName, orderDateVal || today, { todoId: editingId });
          }
        }
      } else {
        removeFlowsByTodoIdAndType(editingId, 'prepaid');
        if (amounts.prepaid > 0) {
          addFlow('prepaid', amounts.prepaid, '预付款 · ' + clientName, orderDateVal || today, { todoId: editingId });
        }
      }

      window.__editingTodoId = null;
      window.__convertFromPlaceholder = false;
      window.__convertDeduct = false;
      window.__placeholderPrepaid = 0;
      window.__receiptImported = true;

      showSimpleAlert(
        '导入成功',
        '已更新原订单：<strong>' + escapeHtml(clientName) + '</strong><br>共 ' + items.length + ' 条事项'
      );
      renderTodoList();
      if (typeof renderSchedule === 'function') renderSchedule();
      if (typeof renderStatsPage === 'function') renderStatsPage();
      if (typeof renderMasterList === 'function') renderMasterList();
      showPage('pageTodo');
      return;
    } else {
      window.__editingTodoId = null;
      window.__convertFromPlaceholder = false;
      window.__convertDeduct = false;
      window.__placeholderPrepaid = 0;
    }
  }

  const newId = makeTodoId();

  const t = {
    id: newId,
    clientId: clientId,
    clientName: clientName,
    platform: platform,
    contact: '',
    contactType: 'QQ',
    orderDate: orderDateVal,
    scheduleDate: scheduleDateVal,
    deadline: effectiveDeadline,
    note: '',
    items: items,
    materials: [],
    requirements: [],
    receiptImage: receiptImageRef,
    receiptSnapshot: snapshot,
    isPlaceholder: !!placeholderOn && items.length === 0,
    status: 'active',
    pendingAmount: 0,
    payable: amounts.payable,
    prepaid: amounts.prepaid,
    originalFinal: amounts.final,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    number: 0,
  };

  todos.push(t);
  if (!setTodos(todos)) return;

  if (amounts.prepaid > 0) {
    const flowType = t.isPlaceholder ? 'dispatch' : 'prepaid';
    const flowNote = (t.isPlaceholder ? '排单费 · ' : '预付款 · ') + clientName;
    addFlow(flowType, amounts.prepaid, flowNote, orderDateVal || today, { todoId: newId });
  }

  window.__receiptImported = true;

  showSimpleAlert(
    '导入成功',
    '已导入订单：<strong>' + escapeHtml(clientName) + '</strong><br>共 ' + items.length + ' 条事项'
  );

  renderTodoList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
  showPage('pageTodo');
}


/* ══════════ [JS-39] 初始化 ══════════ */

function initTodoModule() {
  setupTodoFileInputs();
  renderTodoList();
}


/* calcSnapshotAmounts 供 importToTodo 使用 */
function calcSnapshotAmounts(snap) {
  const result = { payable: 0, prepaid: 0, final: 0 };
  if (!snap) return result;

  const isPlaceholder = !!snap.placeholder;

  if (isPlaceholder) {
    const prepaid = Number(snap.deposit) || 0;
    return { payable: 0, prepaid: prepaid, final: 0 };
  }

  if (!snap.groups) return result;

  let orderSubtotal = 0;
  let totalItemCount = 0;
  let nodeItemCount = 0;
  let nodeFirstTotal = 0;

  (snap.groups || []).forEach(g => {
    let groupSubtotal = 0;

    (g.items || []).forEach(it => {
      const price = Number(it.price) || 0;
      const qty = Number(it.qty) || 1;
      const m = getLicenseMultiplier(it.license);

      totalItemCount++;

      /* 第一步：算增项合计 */
      let addonSum = 0;
      (it.subItems || []).forEach(si => {
        if (si.isNode) return;
        const sv = Number(si.value) || 0;
        if (si.op === 'multiply') addonSum += price * sv / 100;
        else addonSum += sv;
      });

      const baseUnit = price + addonSum;

      /* 第二步：算节点 */
      const nodeItems = (it.subItems || []).filter(si => si.isNode);
      const hasNodes = nodeItems.length > 0;
      if (hasNodes) nodeItemCount++;

      let nodeSum = 0;
      nodeItems.forEach(si => {
        const sv = Number(si.value) || 0;
        nodeSum += baseUnit * sv / 100;
      });

      const partsUnitSum = hasNodes ? nodeSum : baseUnit;
      const sub = partsUnitSum * qty * m;
      groupSubtotal += sub;

      if (hasNodes) {
        const firstNode = nodeItems[0];
        const firstUnit = baseUnit * (Number(firstNode.value) || 0) / 100;
        nodeFirstTotal += firstUnit * qty * m;
      }
    });

    let extras = 0;
    (g.extras || []).forEach(ex => {
      const v = Number(ex.value) || 0;
      extras += (ex.op === 'multiply') ? groupSubtotal * v / 100 : v;
    });

    let discounts = 0;
    const base = groupSubtotal + extras;
    (g.discounts || []).forEach(dc => {
      const v = Number(dc.value) || 0;
      discounts += (dc.op === 'multiply') ? base * v / 100 : v;
    });

    orderSubtotal += groupSubtotal + extras - discounts;
  });

  let orderExtras = 0;
  (snap.extras || []).forEach(ex => {
    const v = Number(ex.value) || 0;
    orderExtras += (ex.op === 'multiply') ? orderSubtotal * v / 100 : v;
  });

  let orderDiscounts = 0;
  (snap.discounts || []).forEach(dc => {
    const v = Number(dc.value) || 0;
    orderDiscounts += (dc.op === 'multiply') ? orderSubtotal * v / 100 : v;
  });

  const payable = Math.max(0, orderSubtotal + orderExtras - orderDiscounts);

  let prepaid = 0;
  const isPureNodeOrder = (totalItemCount > 0) && (nodeItemCount === totalItemCount);

  if (isPureNodeOrder) {
    prepaid = nodeFirstTotal;
  } else {
    const depVal = Number(snap.deposit) || 0;
    if (snap.depositMode === 'amount') {
      prepaid = depVal;
    } else {
      prepaid = payable * depVal / 100;
    }
  }

  const final = Math.max(0, payable - prepaid);

  return { payable, prepaid, final };
}
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 8 部分 / 共 10 部分                               ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-40] 三横线菜单                                  ║
   ║   [JS-41] 结单流程                                    ║
   ║   [JS-42] 废稿流程                                    ║
   ║   [JS-43] 撤单流程                                    ║
   ║   [JS-44] 四圆按钮 + 结 / 撤 / 废列表                 ║
   ║   [JS-45] 各类详情弹窗                                ║
   ║   [JS-46] 排单日历模块                                ║
   ║   [JS-47] 统计模块                                    ║
   ║   [JS-48] 记账模块                                    ║
   ║   [JS-49] 统计明细弹窗                                ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-40] 三横线菜单 ══════════ */

function closeTodoMoreMenu() {
  const menu = document.getElementById('todoMoreMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', todoMoreOutsideHandler);
  document.removeEventListener('scroll', closeTodoMoreMenu, true);
}

function todoMoreOutsideHandler(e) {
  const menu = document.getElementById('todoMoreMenu');
  if (!menu) return;
  if (menu.contains(e.target)) return;
  closeTodoMoreMenu();
}

function openTodoMoreMenu(event, id) {
  event.stopPropagation();

  const existingMenu = document.getElementById('todoMoreMenu');
  if (existingMenu) {
    const sameId = existingMenu.dataset.todoId === id;
    closeTodoMoreMenu();
    if (sameId) return;
  }

  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  const isPending = isTodoPending(t);
  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();

  const icoSettle = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="8 12.5 11 15.5 16.5 9"/>
  </svg>`;

  const icoDiscard = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6 H21"/>
    <path d="M8 6 V4 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V6"/>
    <path d="M6 6 L7 20 a2 2 0 0 0 2 2 h6 a2 2 0 0 0 2 -2 L17 6"/>
    <path d="M10 11 V17"/>
    <path d="M14 11 V17"/>
  </svg>`;

  const icoCancel = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
  </svg>`;

  let items = [];
  if (!isPending) {
    items.push({ key: 'settle', label: '结单', cls: 'is-settle', svg: icoSettle });
  }
  items.push({ key: 'discard', label: '废稿', cls: 'is-discard', svg: icoDiscard });
  items.push({ key: 'cancel',  label: '撤单', cls: 'is-cancel',  svg: icoCancel  });

  const menu = document.createElement('div');
  menu.className = 'todo-more-menu';
  menu.id = 'todoMoreMenu';
  menu.dataset.todoId = id;
  menu.innerHTML = items.map(it => `
    <button type="button" class="todo-more-item ${it.cls}" onclick="handleTodoMore('${escapeAttr(it.key)}', '${escapeAttr(id)}')">
      ${it.svg}
      <span>${it.label}</span>
    </button>
  `).join('');

  document.body.appendChild(menu);

  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;

  let left = rect.left;
  let top = rect.bottom + 6;

  if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
  if (left < 8) left = 8;

  if (top + mh > window.innerHeight - 8) {
    top = rect.top - mh - 6;
    if (top < 8) top = 8;
  }

  menu.style.left = left + 'px';
  menu.style.top  = top + 'px';

  setTimeout(() => {
    document.addEventListener('click', todoMoreOutsideHandler);
    document.addEventListener('scroll', closeTodoMoreMenu, true);
  }, 0);
}

function handleTodoMore(key, id) {
  closeTodoMoreMenu();
  if (key === 'settle')       settleTodo(id);
  else if (key === 'discard') discardTodo(id);
  else if (key === 'cancel')  cancelTodo(id);
}


/* ══════════ [JS-41] 结单流程 ══════════ */

function settleTodo(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  if (t.status === 'pending') {
    settlePendingConfirm(id);
    return;
  }

  if (t.isPlaceholder) {
    showSimpleAlert(
      '无法结单',
      '这是一条占位单，请先进入详情页点击「转立项单」，填写立项内容后再结单。'
    );
    return;
  }

  if (!isTodoCompleted(t)) {
    showSimpleAlert('无法结单', '订单细则还未全部完成，请先完成所有事项。');
    return;
  }

  openSettleDiscountModal(id);
}

function openSettleDiscountModal(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  const payable = Number(t.payable) || 0;
  const prepaid = Number(t.prepaid) || 0;
  const originalFinal = Number(t.originalFinal) || 0;

  window.__settleState = {
    id: id,
    payable: payable,
    prepaid: prepaid,
    originalFinal: originalFinal,
    hasDiscount: false,
    discountMode: 'percent-payable',
    discountValue: 0,
    discountAmount: 0,
    finalAmount: originalFinal,
  };

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>结单 · 尾款</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">

          <div class="flow-calc" style="margin-top:0;">
            <div class="flow-calc-title">订单概要</div>
            <div class="flow-calc-row"><span>应付金额</span><span class="v">${fmt(payable)}</span></div>
            <div class="flow-calc-row"><span>预付款（已收）</span><span class="v">${fmt(prepaid)}</span></div>
            <div class="flow-calc-row"><span>原尾款</span><span class="v">${fmt(originalFinal)}</span></div>
          </div>

          <div class="flow-section">
            <label>尾款是否有优惠？</label>
            <div class="flow-switch-row">
              <div>
                <div class="flow-switch-label">开启尾款优惠</div>
                <div class="flow-switch-sub">关闭时按原尾款收取</div>
              </div>
              <label class="switch-wrap">
                <span class="switch">
                  <input type="checkbox" id="settleDiscountToggle" onchange="onSettleDiscountToggle()" />
                  <span class="switch-slider"></span>
                </span>
              </label>
            </div>
          </div>

          <div class="flow-section" id="settleDiscountPanel" style="display:none;">
            <label>优惠方式</label>
            <div class="flow-options" id="settleDiscountOptions">
              <button type="button" class="flow-opt-btn active" data-mode="percent-payable" onclick="onSettleDiscountModeChange('percent-payable')">按总应收比例</button>
              <button type="button" class="flow-opt-btn" data-mode="percent-final" onclick="onSettleDiscountModeChange('percent-final')">按尾款比例</button>
              <button type="button" class="flow-opt-btn" data-mode="amount" onclick="onSettleDiscountModeChange('amount')">具体金额</button>
            </div>

            <label style="margin-top:14px;">数值</label>
            <div class="input-unit-wrap suffix" id="settleDiscountValueWrap">
              <input type="number" step="0.01" id="settleDiscountValue" value="0" oninput="onSettleDiscountValueChange()" />
              <span class="input-unit" id="settleDiscountValueUnit">%</span>
            </div>
          </div>

          <div class="flow-calc" id="settleCalcPanel">
            <div class="flow-calc-title">尾款计算</div>
            <div class="flow-calc-row"><span>原尾款</span><span class="v" id="settleOriginalFinal">${fmt(originalFinal)}</span></div>
            <div class="flow-calc-row" id="settleDiscountRow" style="display:none;"><span>优惠金额</span><span class="v" id="settleDiscountAmount">-¥0.00</span></div>
            <div class="flow-calc-row is-main"><span>实收尾款</span><span class="v" id="settleFinalAmount">${fmt(originalFinal)}</span></div>
          </div>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmSettleDiscount()">确认金额</button>
          </div>
        </div>
      </div>
    </div>`;
}

function onSettleDiscountToggle() {
  const state = window.__settleState;
  if (!state) return;
  const on = !!($('settleDiscountToggle') && $('settleDiscountToggle').checked);
  state.hasDiscount = on;
  const panel = $('settleDiscountPanel');
  if (panel) panel.style.display = on ? '' : 'none';
  onSettleDiscountValueChange();
}

function onSettleDiscountModeChange(mode) {
  const state = window.__settleState;
  if (!state) return;
  state.discountMode = mode;

  document.querySelectorAll('#settleDiscountOptions .flow-opt-btn').forEach(btn => {
    if (btn.dataset.mode === mode) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const input = $('settleDiscountValue');
  if (input) {
    if (mode === 'amount') setInputUnit(input, '¥', 'prefix');
    else                   setInputUnit(input, '%', 'suffix');
  }

  onSettleDiscountValueChange();
}

function onSettleDiscountValueChange() {
  const state = window.__settleState;
  if (!state) return;

  const input = $('settleDiscountValue');
  const value = Number(input ? input.value : 0) || 0;
  state.discountValue = value;

  let discountAmount = 0;
  if (state.hasDiscount) {
    if (state.discountMode === 'percent-payable') {
      discountAmount = state.payable * value / 100;
    } else if (state.discountMode === 'percent-final') {
      discountAmount = state.originalFinal * value / 100;
    } else {
      discountAmount = value;
    }
  }

  if (discountAmount > state.originalFinal) discountAmount = state.originalFinal;
  if (discountAmount < 0) discountAmount = 0;

  const finalAmount = Math.max(0, state.originalFinal - discountAmount);
  state.discountAmount = discountAmount;
  state.finalAmount = finalAmount;

  const dRow = $('settleDiscountRow');
  const dAmt = $('settleDiscountAmount');
  const fAmt = $('settleFinalAmount');

  if (state.hasDiscount && discountAmount > 0) {
    if (dRow) dRow.style.display = '';
    if (dAmt) dAmt.textContent = '-' + fmt(discountAmount);
  } else {
    if (dRow) dRow.style.display = 'none';
  }
  if (fAmt) fAmt.textContent = fmt(finalAmount);
}

function confirmSettleDiscount() {
  const state = window.__settleState;
  if (!state) return;
  onSettleDiscountValueChange();

  const finalAmount = state.finalAmount || 0;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>结单 · 确认收款</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="flow-amount-hero">
            <div class="hero-label">实收尾款</div>
            <div class="hero-value">${fmt(finalAmount)}</div>
            <div class="hero-sub">请确认是否已收到这笔尾款</div>
          </div>
          <div class="actions" style="justify-content:center;margin-top:6px;">
            <button class="action-btn ghost" onclick="settleNotReceived()">尚未收到</button>
            <button class="action-btn" onclick="settleReceived()">已收到</button>
          </div>
          <p class="flow-hint" style="text-align:center;">
            已收到：订单结单，进入「结」页面，计入实收统计<br>
            尚未收到：订单标记为待结，金额为 ${fmt(finalAmount)}
          </p>
        </div>
      </div>
    </div>`;
}

function settleReceived() {
  const state = window.__settleState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const totalReceived = state.prepaid + state.finalAmount;

  const completed = addCompleted({
    todoId: t.id,
    clientId: t.clientId || '',
    clientName: t.clientName || '未命名',
    platform: t.platform || '',
    contact: t.contact || '',
    contactType: normalizeContactType(t.contactType),
    orderDate: t.orderDate || '',
    scheduleDate: t.scheduleDate || '',
    deadline: t.deadline || '',
    completedDate: today,
    prepaid: state.prepaid,
    originalFinal: state.originalFinal,
    discount: state.discountAmount || 0,
    finalAmount: state.finalAmount,
    totalReceived: totalReceived,
    isPlaceholder: false,
    receiptImage: t.receiptImage || '',
    receiptSnapshot: t.receiptSnapshot || null,
  });

  if (!completed) { closeModal(); return; }

  if (state.finalAmount > 0) {
    addFlow('final', state.finalAmount, '尾款 · ' + (t.clientName || '未命名'), today, {
      todoId: t.id,
      completedId: completed.id,
    });
  }

  const newTodos = todos.filter(x => x.id !== state.id);
  setTodos(newTodos);

  window.__settleState = null;
  closeModal();

  showSimpleAlert('已结单', '订单已结单，可在「结」页面查看。');

  renderTodoList();
  if (typeof renderCompletedList === 'function') renderCompletedList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}

function settleNotReceived() {
  const state = window.__settleState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  todos[idx].status = 'pending';
  todos[idx].pendingAmount = state.finalAmount || 0;
  todos[idx].updatedAt = Date.now();

  if (!setTodos(todos)) { closeModal(); return; }

  const pendingAmt = state.finalAmount || 0;
  window.__settleState = null;
  closeModal();

  showSimpleAlert('已标记为待结', '订单状态已更新为待结，金额：' + fmt(pendingAmt));

  renderTodoList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}

function settlePendingConfirm(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  const pendingAmount = Number(t.pendingAmount) || 0;
  const originalFinal = Number(t.originalFinal) || 0;

  window.__settleState = {
    id: id,
    payable: Number(t.payable) || 0,
    prepaid: Number(t.prepaid) || 0,
    originalFinal: originalFinal,
    pendingMode: true,
    finalAmount: pendingAmount,
    discountAmount: Math.max(0, originalFinal - pendingAmount),
  };

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>结单 · 待结单</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="flow-amount-hero">
            <div class="hero-label">待结尾款</div>
            <div class="hero-value is-pending">${fmt(pendingAmount)}</div>
            <div class="hero-sub">这条订单仍处于待结状态，请确认是否已收到尾款</div>
          </div>
          <div class="actions" style="justify-content:center;margin-top:6px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="settlePendingReceived()">已收到</button>
          </div>
        </div>
      </div>
    </div>`;
}

function settlePendingReceived() {
  const state = window.__settleState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const totalReceived = state.prepaid + state.finalAmount;

  const completed = addCompleted({
    todoId: t.id,
    clientId: t.clientId || '',
    clientName: t.clientName || '未命名',
    platform: t.platform || '',
    contact: t.contact || '',
    contactType: normalizeContactType(t.contactType),
    orderDate: t.orderDate || '',
    scheduleDate: t.scheduleDate || '',
    deadline: t.deadline || '',
    completedDate: today,
    prepaid: state.prepaid,
    originalFinal: state.originalFinal,
    discount: state.discountAmount || 0,
    finalAmount: state.finalAmount,
    totalReceived: totalReceived,
    isPlaceholder: false,
    receiptImage: t.receiptImage || '',
    receiptSnapshot: t.receiptSnapshot || null,
  });

  if (!completed) { closeModal(); return; }

  if (state.finalAmount > 0) {
    addFlow('final', state.finalAmount, '尾款 · ' + (t.clientName || '未命名'), today, {
      todoId: t.id,
      completedId: completed.id,
    });
  }

  const newTodos = todos.filter(x => x.id !== state.id);
  setTodos(newTodos);

  window.__settleState = null;
  closeModal();

  showSimpleAlert('已结单', '订单已结单，可在「结」页面查看。');

  renderTodoList();
  if (typeof renderCompletedList === 'function') renderCompletedList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}


/* ══════════ [JS-42] 废稿流程 ══════════ */

function discardTodo(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  const payable = Number(t.payable) || 0;
  const prepaid = Number(t.prepaid) || 0;
  const originalFinal = Number(t.originalFinal) || 0;
  const isPlaceholder = !!t.isPlaceholder;

  window.__discardState = {
    id: id,
    payable: payable,
    prepaid: prepaid,
    originalFinal: originalFinal,
    isPlaceholder: isPlaceholder,
    mode: 'none',
    value: 0,
    calcAmount: 0,
    finalAmount: 0,
    manualEdited: false,
    usePrepaidDeduction: false,
  };

  if (isPlaceholder) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>废稿 · 占位单</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="flow-calc" style="margin-top:0;">
              <div class="flow-calc-title">订单概要</div>
              <div class="flow-calc-row"><span>排单费（已收）</span><span class="v">${fmt(prepaid)}</span></div>
            </div>
            <p class="flow-hint" style="margin-top:14px;">
              占位单废稿：可将排单费退还给单主，也可以不退。
            </p>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn ghost" onclick="closeModal()">取消</button>
              <button class="action-btn" onclick="confirmPlaceholderDiscard(false)">不退排单费</button>
              <button class="action-btn" onclick="confirmPlaceholderDiscard(true)">退还排单费</button>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>废稿</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">

          <div class="flow-calc" style="margin-top:0;">
            <div class="flow-calc-title">订单概要</div>
            <div class="flow-calc-row"><span>应付金额</span><span class="v">${fmt(payable)}</span></div>
            <div class="flow-calc-row"><span>预付款（已收）</span><span class="v">${fmt(prepaid)}</span></div>
            <div class="flow-calc-row"><span>尾款</span><span class="v">${fmt(originalFinal)}</span></div>
          </div>

          <div class="flow-section">
            <label>是否收取废稿费？</label>
            <div class="flow-options" id="discardOptions">
              <button type="button" class="flow-opt-btn active" data-mode="none" onclick="onDiscardModeChange('none')">不收</button>
              <button type="button" class="flow-opt-btn" data-mode="percent-payable" onclick="onDiscardModeChange('percent-payable')">按总应收比例</button>
              <button type="button" class="flow-opt-btn" data-mode="percent-final" onclick="onDiscardModeChange('percent-final')">按尾款比例</button>
              <button type="button" class="flow-opt-btn" data-mode="amount" onclick="onDiscardModeChange('amount')">具体金额</button>
            </div>
          </div>

          <div class="flow-section" id="discardValuePanel" style="display:none;">
            <label>数值</label>
            <div class="input-unit-wrap suffix" id="discardValueWrap">
              <input type="number" step="0.01" id="discardValue" value="0" oninput="onDiscardValueChange()" />
              <span class="input-unit" id="discardValueUnit">%</span>
            </div>
          </div>

          <div class="flow-section" id="discardDeductRow" style="display:none;">
            <div class="flow-switch-row">
              <div>
                <div class="flow-switch-label">预付抵扣</div>
                <div class="flow-switch-sub">开启后，应收废稿费 = 计算值 − 预付款</div>
              </div>
              <label class="switch-wrap">
                <span class="switch">
                  <input type="checkbox" id="discardPrepaidToggle" onchange="onDiscardPrepaidToggle()" />
                  <span class="switch-slider"></span>
                </span>
              </label>
            </div>
          </div>

          <div class="flow-section" id="discardCalcPanel" style="display:none;">
            <label>应收废稿费（可手动修改，可为负）</label>
            <div class="input-unit-wrap prefix">
              <input type="number" step="0.01" id="discardFinalAmount" value="0" oninput="onDiscardFinalAmountChange()" />
              <span class="input-unit">¥</span>
            </div>
            <div class="flow-calc" style="margin-top:12px;">
              <div class="flow-calc-title">计算过程</div>
              <div class="flow-calc-row"><span>计算值</span><span class="v" id="discardCalcValue">¥0.00</span></div>
              <div class="flow-calc-row" id="discardDeductRow2" style="display:none;"><span>预付抵扣</span><span class="v" id="discardDeductValue">-¥0.00</span></div>
              <div class="flow-calc-row is-main"><span>应收废稿费</span><span class="v" id="discardFinalDisplay">¥0.00</span></div>
            </div>
          </div>

          <p class="flow-hint">
            不收废稿费：订单直接删除，不计实收，待结统计中的该笔尾款一并移除。<br>
            应收废稿费为负时，会询问是否退款给单主。
          </p>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmDiscard()">确认废稿</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmPlaceholderDiscard(doRefund) {
  const state = window.__discardState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const clientName = t.clientName || '未命名';
  const prepaid = Number(t.prepaid) || 0;

  if (doRefund && prepaid > 0) {
    addFlow('refund', prepaid, '废稿退款 · ' + clientName, today, { todoId: t.id });
  }

  addDiscarded({
    todoId: t.id,
    clientId: t.clientId || '',
    clientName: clientName,
    platform: t.platform || '',
    contact: t.contact || '',
    contactType: normalizeContactType(t.contactType),
    orderDate: t.orderDate || '',
    scheduleDate: t.scheduleDate || '',
    deadline: t.deadline || '',
    discardedDate: today,
    feeAmount: 0,
    refundAmount: doRefund ? prepaid : 0,
    payable: 0,
    originalFinal: 0,
    prepaid: prepaid,
    isPlaceholder: true,
    receiptImage: t.receiptImage || '',
    receiptSnapshot: t.receiptSnapshot || null,
  });

  setTodos(todos.filter(x => x.id !== state.id));

  window.__discardState = null;
  closeModal();

  showSimpleAlert(
    '已废稿',
    doRefund
      ? ('已退还排单费 ' + fmt(prepaid) + '，计入退款统计。')
      : '未退还排单费。'
  );

  renderTodoList();
  if (typeof renderDiscardedList === 'function') renderDiscardedList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}

function onDiscardModeChange(mode) {
  const state = window.__discardState;
  if (!state) return;
  state.mode = mode;
  state.manualEdited = false;

  document.querySelectorAll('#discardOptions .flow-opt-btn').forEach(btn => {
    if (btn.dataset.mode === mode) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const valuePanel = $('discardValuePanel');
  const calcPanel  = $('discardCalcPanel');
  const deductRow  = $('discardDeductRow');

  if (mode === 'none') {
    if (valuePanel) valuePanel.style.display = 'none';
    if (calcPanel)  calcPanel.style.display  = 'none';
    if (deductRow)  deductRow.style.display  = 'none';
    state.calcAmount = 0;
    state.finalAmount = 0;
    return;
  }

  if (valuePanel) valuePanel.style.display = '';
  if (calcPanel)  calcPanel.style.display  = '';
  if (deductRow)  deductRow.style.display  = '';

  const input = $('discardValue');
  if (input) {
    if (mode === 'amount') setInputUnit(input, '¥', 'prefix');
    else                   setInputUnit(input, '%', 'suffix');
  }

  onDiscardValueChange();
}

function onDiscardValueChange() {
  const state = window.__discardState;
  if (!state) return;

  const input = $('discardValue');
  const value = Number(input ? input.value : 0) || 0;
  state.value = value;

  let calc = 0;
  if (state.mode === 'percent-payable') {
    calc = state.payable * value / 100;
  } else if (state.mode === 'percent-final') {
    calc = state.originalFinal * value / 100;
  } else if (state.mode === 'amount') {
    calc = value;
  }

  state.calcAmount = calc;

  let final = calc;
  if (state.usePrepaidDeduction) final = calc - state.prepaid;
  state.finalAmount = final;

  const cEl = $('discardCalcValue');
  if (cEl) cEl.textContent = fmt(calc);

  const deductRow2 = $('discardDeductRow2');
  const deductVal = $('discardDeductValue');
  if (state.usePrepaidDeduction) {
    if (deductRow2) deductRow2.style.display = '';
    if (deductVal) deductVal.textContent = '-' + fmt(state.prepaid);
  } else {
    if (deductRow2) deductRow2.style.display = 'none';
  }

  if (!state.manualEdited) {
    const fInput = $('discardFinalAmount');
    if (fInput) fInput.value = num2(final);
  }

  const fEl = $('discardFinalDisplay');
  if (fEl) {
    fEl.textContent = fmt(state.finalAmount || 0);
    fEl.style.color = (state.finalAmount < 0) ? '#c0392b' : '#2e7d32';
  }
}

function onDiscardPrepaidToggle() {
  const state = window.__discardState;
  if (!state) return;
  state.usePrepaidDeduction = !!($('discardPrepaidToggle') && $('discardPrepaidToggle').checked);
  state.manualEdited = false;
  onDiscardValueChange();
}

function onDiscardFinalAmountChange() {
  const state = window.__discardState;
  if (!state) return;

  const input = $('discardFinalAmount');
  let v = Number(input ? input.value : 0) || 0;

  state.finalAmount = v;
  state.manualEdited = true;

  const fEl = $('discardFinalDisplay');
  if (fEl) {
    fEl.textContent = fmt(v);
    fEl.style.color = (v < 0) ? '#c0392b' : '#2e7d32';
  }
}

function confirmDiscard() {
  const state = window.__discardState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const clientName = t.clientName || '未命名';

  if (state.mode === 'none') {
    addDiscarded({
      todoId: t.id,
      clientId: t.clientId || '',
      clientName: clientName,
      platform: t.platform || '',
      contact: t.contact || '',
      contactType: normalizeContactType(t.contactType),
      orderDate: t.orderDate || '',
      scheduleDate: t.scheduleDate || '',
      deadline: t.deadline || '',
      discardedDate: today,
      feeAmount: 0,
      refundAmount: 0,
      payable: state.payable,
      originalFinal: state.originalFinal,
      prepaid: state.prepaid,
      isPlaceholder: false,
      receiptImage: t.receiptImage || '',
      receiptSnapshot: t.receiptSnapshot || null,
    });
    setTodos(todos.filter(x => x.id !== state.id));
    window.__discardState = null;
    closeModal();
    showSimpleAlert('已废稿', '订单已删除，未收取废稿费。');
    renderTodoList();
    if (typeof renderDiscardedList === 'function') renderDiscardedList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();
    return;
  }

  const finalAmt = state.finalAmount || 0;

  if (finalAmt > 0) {
    addDiscarded({
      todoId: t.id,
      clientId: t.clientId || '',
      clientName: clientName,
      platform: t.platform || '',
      contact: t.contact || '',
      contactType: normalizeContactType(t.contactType),
      orderDate: t.orderDate || '',
      scheduleDate: t.scheduleDate || '',
      deadline: t.deadline || '',
      discardedDate: today,
      feeAmount: finalAmt,
      refundAmount: 0,
      payable: state.payable,
      originalFinal: state.originalFinal,
      prepaid: state.prepaid,
      isPlaceholder: false,
      receiptImage: t.receiptImage || '',
      receiptSnapshot: t.receiptSnapshot || null,
    });
    addFlow('discard', finalAmt, '废稿费 · ' + clientName, today, { todoId: t.id });
    setTodos(todos.filter(x => x.id !== state.id));
    window.__discardState = null;
    closeModal();
    showSimpleAlert('已废稿', '废稿费 ' + fmt(finalAmt) + ' 已计入实收。');
    renderTodoList();
    if (typeof renderDiscardedList === 'function') renderDiscardedList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();

  } else if (finalAmt < 0) {
    const refundAmt = Math.abs(finalAmt);
    $('modalRoot').innerHTML = `
      <div class="modal-overlay">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>是否退还费用？</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <p style="margin:8px 0;">废稿费计算为负数，实际需退还单主：</p>
            <p style="font-size:22px;font-weight:800;color:#c0392b;margin:6px 0 12px;">${fmt(refundAmt)}</p>
            <p style="font-size:12px;color:var(--ink-soft);margin:0;">
              选择「退还」：退款统计 +${fmt(refundAmt)}，删除待结<br>
              选择「不退」：退款统计不变，仅删除待结
            </p>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn ghost" onclick="confirmDiscardNegative(false)">不退</button>
              <button class="action-btn" onclick="confirmDiscardNegative(true)">退还</button>
            </div>
          </div>
        </div>
      </div>`;

  } else {
    addDiscarded({
      todoId: t.id,
      clientId: t.clientId || '',
      clientName: clientName,
      platform: t.platform || '',
      contact: t.contact || '',
      contactType: normalizeContactType(t.contactType),
      orderDate: t.orderDate || '',
      scheduleDate: t.scheduleDate || '',
      deadline: t.deadline || '',
      discardedDate: today,
      feeAmount: 0,
      refundAmount: 0,
      payable: state.payable,
      originalFinal: state.originalFinal,
      prepaid: state.prepaid,
      isPlaceholder: false,
      receiptImage: t.receiptImage || '',
      receiptSnapshot: t.receiptSnapshot || null,
    });
    setTodos(todos.filter(x => x.id !== state.id));
    window.__discardState = null;
    closeModal();
    showSimpleAlert('已废稿', '订单已删除，应收废稿费为 0。');
    renderTodoList();
    if (typeof renderDiscardedList === 'function') renderDiscardedList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();
  }
}

function confirmDiscardNegative(doRefund) {
  const state = window.__discardState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const clientName = t.clientName || '未命名';
  const refundAmt = Math.abs(state.finalAmount || 0);

  addDiscarded({
    todoId: t.id,
    clientId: t.clientId || '',
    clientName: clientName,
    platform: t.platform || '',
    contact: t.contact || '',
    contactType: normalizeContactType(t.contactType),
    orderDate: t.orderDate || '',
    scheduleDate: t.scheduleDate || '',
    deadline: t.deadline || '',
    discardedDate: today,
    feeAmount: state.finalAmount || 0,
    refundAmount: doRefund ? refundAmt : 0,
    payable: state.payable,
    originalFinal: state.originalFinal,
    prepaid: state.prepaid,
    isPlaceholder: false,
    receiptImage: t.receiptImage || '',
    receiptSnapshot: t.receiptSnapshot || null,
  });

  if (doRefund && refundAmt > 0) {
    addFlow('refund', refundAmt, '废稿退款 · ' + clientName, today, { todoId: t.id });
  }

  setTodos(todos.filter(x => x.id !== state.id));
  window.__discardState = null;
  closeModal();

  showSimpleAlert(
    '已废稿',
    doRefund ? ('退款 ' + fmt(refundAmt) + ' 已计入退款统计。') : '未产生退款。'
  );

  renderTodoList();
  if (typeof renderDiscardedList === 'function') renderDiscardedList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}


/* ══════════ [JS-43] 撤单流程 ══════════ */

function cancelTodo(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  const payable = Number(t.payable) || 0;
  const prepaid = Number(t.prepaid) || 0;
  const originalFinal = Number(t.originalFinal) || 0;
  const isPlaceholder = !!t.isPlaceholder;

  window.__cancelState = {
    id: id,
    payable: payable,
    prepaid: prepaid,
    originalFinal: originalFinal,
    isPlaceholder: isPlaceholder,
    top: 'refund',
    refundMode: 'refund-full',
    refundAmount: prepaid,
    feeMode: 'fee-payable',
    feeValue: 0,
    feeCalc: 0,
    finalFee: 0,
    usePrepaidDeduction: false,
  };

  if (isPlaceholder) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>撤单 · 占位单</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="flow-calc" style="margin-top:0;">
              <div class="flow-calc-title">订单概要</div>
              <div class="flow-calc-row"><span>排单费（已收）</span><span class="v">${fmt(prepaid)}</span></div>
            </div>
            <p class="flow-hint" style="margin-top:14px;">
              占位单撤单：可将排单费退还给单主，也可以不退。
            </p>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn ghost" onclick="closeModal()">取消</button>
              <button class="action-btn" onclick="confirmPlaceholderCancel(false)">不退排单费</button>
              <button class="action-btn" onclick="confirmPlaceholderCancel(true)">退还排单费</button>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>撤单</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">

          <div class="flow-calc" style="margin-top:0;">
            <div class="flow-calc-title">订单概要</div>
            <div class="flow-calc-row"><span>应付金额</span><span class="v">${fmt(payable)}</span></div>
            <div class="flow-calc-row"><span>预付款（已收）</span><span class="v">${fmt(prepaid)}</span></div>
            <div class="flow-calc-row"><span>待结尾款</span><span class="v">${fmt(originalFinal)}</span></div>
          </div>

          <div class="flow-section">
            <label>撤单类型</label>
            <div class="flow-options" id="cancelTopOptions">
              <button type="button" class="flow-opt-btn active" data-top="refund" onclick="onCancelTopChange('refund')">退款</button>
              <button type="button" class="flow-opt-btn" data-top="fee" onclick="onCancelTopChange('fee')">收跑单费</button>
            </div>
          </div>

          <div class="flow-section" id="cancelRefundPanel">
            <label>退款方式</label>
            <div class="flow-options" id="cancelRefundOptions">
              <button type="button" class="flow-opt-btn active" data-mode="refund-full" onclick="onCancelRefundModeChange('refund-full')">退全款</button>
              <button type="button" class="flow-opt-btn" data-mode="refund-final" onclick="onCancelRefundModeChange('refund-final')">退尾款</button>
            </div>
            <div class="flow-calc" style="margin-top:12px;">
              <div class="flow-calc-title">退款金额</div>
              <div class="flow-calc-row is-main"><span>退款</span><span class="v" id="cancelRefundAmount" style="color:#c0392b;">${fmt(prepaid)}</span></div>
              <div class="flow-calc-row" id="cancelRefundHintRow"><span id="cancelRefundHint">退全款 = 退还已收到的预付款；尾款未收，不产生退款</span><span class="v"></span></div>
            </div>
          </div>

          <div class="flow-section" id="cancelFeePanel" style="display:none;">
            <label>跑单费方式</label>
            <div class="flow-options" id="cancelFeeOptions">
              <button type="button" class="flow-opt-btn active" data-mode="fee-payable" onclick="onCancelFeeModeChange('fee-payable')">按全款比例</button>
              <button type="button" class="flow-opt-btn" data-mode="fee-final" onclick="onCancelFeeModeChange('fee-final')">按尾款比例</button>
              <button type="button" class="flow-opt-btn" data-mode="fee-amount" onclick="onCancelFeeModeChange('fee-amount')">具体金额</button>
            </div>

            <label style="margin-top:14px;">数值</label>
            <div class="input-unit-wrap suffix" id="cancelFeeValueWrap">
              <input type="number" step="0.01" id="cancelFeeValue" value="0" oninput="onCancelFeeValueChange()" />
              <span class="input-unit" id="cancelFeeValueUnit">%</span>
            </div>

            <div class="flow-switch-row">
              <div>
                <div class="flow-switch-label">预付抵扣</div>
                <div class="flow-switch-sub">开启后，最终跑单费 = 计算值 − 预付款</div>
              </div>
              <label class="switch-wrap">
                <span class="switch">
                  <input type="checkbox" id="cancelFeePrepaidToggle" onchange="onCancelFeePrepaidToggle()" />
                  <span class="switch-slider"></span>
                </span>
              </label>
            </div>

            <div class="flow-calc">
              <div class="flow-calc-title">跑单费计算</div>
              <div class="flow-calc-row"><span>计算值</span><span class="v" id="cancelFeeCalc">¥0.00</span></div>
              <div class="flow-calc-row" id="cancelFeeDeductRow" style="display:none;"><span>预付抵扣</span><span class="v" id="cancelFeeDeductValue">-¥0.00</span></div>
              <div class="flow-calc-row is-main"><span>应收跑单费</span><span class="v" id="cancelFeeFinal">¥0.00</span></div>
            </div>
          </div>

          <p class="flow-hint">
            退款：只退实际已收到的钱。尾款未收，不产生退款。<br>
            跑单费为负时，会询问是否退款给单主。
          </p>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmCancel()">确认撤单</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmPlaceholderCancel(doRefund) {
  const state = window.__cancelState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const clientName = t.clientName || '未命名';
  const prepaid = Number(t.prepaid) || 0;

  if (doRefund && prepaid > 0) {
    addFlow('refund', prepaid, '撤单退款 · ' + clientName, today, { todoId: t.id });
  }

  addCancelled({
    todoId: t.id,
    clientId: t.clientId || '',
    clientName: clientName,
    platform: t.platform || '',
    contact: t.contact || '',
    contactType: normalizeContactType(t.contactType),
    orderDate: t.orderDate || '',
    scheduleDate: t.scheduleDate || '',
    deadline: t.deadline || '',
    cancelledDate: today,
    cancelType: doRefund ? 'dispatch-refund' : 'dispatch-no-refund',
    refundAmount: doRefund ? prepaid : 0,
    feeAmount: 0,
    payable: 0,
    originalFinal: 0,
    prepaid: prepaid,
    isPlaceholder: true,
    receiptImage: t.receiptImage || '',
    receiptSnapshot: t.receiptSnapshot || null,
  });

  setTodos(todos.filter(x => x.id !== state.id));

  window.__cancelState = null;
  closeModal();

  showSimpleAlert(
    '已撤单',
    doRefund
      ? ('已退还排单费 ' + fmt(prepaid) + '，计入退款统计。')
      : '未退还排单费。'
  );

  renderTodoList();
  if (typeof renderCancelledList === 'function') renderCancelledList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}

function onCancelTopChange(top) {
  const state = window.__cancelState;
  if (!state) return;
  state.top = top;

  document.querySelectorAll('#cancelTopOptions .flow-opt-btn').forEach(btn => {
    if (btn.dataset.top === top) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const refundPanel = $('cancelRefundPanel');
  const feePanel    = $('cancelFeePanel');

  if (top === 'refund') {
    if (refundPanel) refundPanel.style.display = '';
    if (feePanel)    feePanel.style.display    = 'none';
    onCancelRefundModeChange(state.refundMode || 'refund-full');
  } else {
    if (refundPanel) refundPanel.style.display = 'none';
    if (feePanel)    feePanel.style.display    = '';
    onCancelFeeModeChange(state.feeMode || 'fee-payable');
  }
}

function onCancelRefundModeChange(mode) {
  const state = window.__cancelState;
  if (!state) return;
  state.refundMode = mode;

  document.querySelectorAll('#cancelRefundOptions .flow-opt-btn').forEach(btn => {
    if (btn.dataset.mode === mode) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  let amount = 0;
  let hint = '';
  if (mode === 'refund-full') {
    amount = state.prepaid;
    hint = '退全款 = 退还已收到的预付款（尾款未收，不产生退款）';
  } else if (mode === 'refund-final') {
    amount = 0;
    hint = '退尾款：尾款尚未收到，实际不产生退款，仅删除待结统计';
  }

  state.refundAmount = amount;

  const el = $('cancelRefundAmount');
  if (el) {
    el.textContent = fmt(amount);
    el.style.color = amount > 0 ? '#c0392b' : 'var(--ink-soft)';
  }
  const hintEl = $('cancelRefundHint');
  if (hintEl) hintEl.textContent = hint;
}

function onCancelFeeModeChange(mode) {
  const state = window.__cancelState;
  if (!state) return;
  state.feeMode = mode;

  document.querySelectorAll('#cancelFeeOptions .flow-opt-btn').forEach(btn => {
    if (btn.dataset.mode === mode) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const input = $('cancelFeeValue');
  if (input) {
    if (mode === 'fee-amount') setInputUnit(input, '¥', 'prefix');
    else                       setInputUnit(input, '%', 'suffix');
  }

  onCancelFeeValueChange();
}

function onCancelFeeValueChange() {
  const state = window.__cancelState;
  if (!state) return;

  const input = $('cancelFeeValue');
  const value = Number(input ? input.value : 0) || 0;
  state.feeValue = value;

  let calc = 0;
  if (state.feeMode === 'fee-payable') calc = state.payable * value / 100;
  else if (state.feeMode === 'fee-final') calc = state.originalFinal * value / 100;
  else if (state.feeMode === 'fee-amount') calc = value;

  state.feeCalc = calc;

  let final = calc;
  if (state.usePrepaidDeduction) final = calc - state.prepaid;
  state.finalFee = final;

  const cEl = $('cancelFeeCalc');
  const fEl = $('cancelFeeFinal');
  if (cEl) cEl.textContent = fmt(calc);

  const dedRow = $('cancelFeeDeductRow');
  const dedVal = $('cancelFeeDeductValue');
  if (state.usePrepaidDeduction) {
    if (dedRow) dedRow.style.display = '';
    if (dedVal) dedVal.textContent = '-' + fmt(state.prepaid);
  } else {
    if (dedRow) dedRow.style.display = 'none';
  }

  if (fEl) {
    fEl.textContent = fmt(final);
    fEl.style.color = (final < 0) ? '#c0392b' : '#2e7d32';
  }
}

function onCancelFeePrepaidToggle() {
  const state = window.__cancelState;
  if (!state) return;
  state.usePrepaidDeduction = !!($('cancelFeePrepaidToggle') && $('cancelFeePrepaidToggle').checked);
  onCancelFeeValueChange();
}

function confirmCancel() {
  const state = window.__cancelState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const clientName = t.clientName || '未命名';

  if (state.top === 'refund') {
    const refundAmt = state.refundAmount || 0;

    if (refundAmt > 0) {
      addFlow('refund', refundAmt, '撤单退款 · ' + clientName, today, { todoId: t.id });
    }

    addCancelled({
      todoId: t.id,
      clientId: t.clientId || '',
      clientName: clientName,
      platform: t.platform || '',
      contact: t.contact || '',
      contactType: normalizeContactType(t.contactType),
      orderDate: t.orderDate || '',
      scheduleDate: t.scheduleDate || '',
      deadline: t.deadline || '',
      cancelledDate: today,
      cancelType: state.refundMode,
      refundAmount: refundAmt,
      feeAmount: 0,
      payable: state.payable,
      originalFinal: state.originalFinal,
      prepaid: state.prepaid,
      isPlaceholder: false,
      receiptImage: t.receiptImage || '',
      receiptSnapshot: t.receiptSnapshot || null,
    });

    setTodos(todos.filter(x => x.id !== state.id));
    window.__cancelState = null;
    closeModal();

    showSimpleAlert(
      '已撤单',
      refundAmt > 0
        ? ('退款 ' + fmt(refundAmt) + ' 已计入退款统计。')
        : '未产生退款。'
    );

    renderTodoList();
    if (typeof renderCancelledList === 'function') renderCancelledList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();
    return;
  }

  const finalFee = state.finalFee || 0;

  if (finalFee > 0) {
    addFlow('cancel', finalFee, '跑单费 · ' + clientName, today, { todoId: t.id });
    addCancelled({
      todoId: t.id,
      clientId: t.clientId || '',
      clientName: clientName,
      platform: t.platform || '',
      contact: t.contact || '',
      contactType: normalizeContactType(t.contactType),
      orderDate: t.orderDate || '',
      scheduleDate: t.scheduleDate || '',
      deadline: t.deadline || '',
      cancelledDate: today,
      cancelType: 'fee',
      refundAmount: 0,
      feeAmount: finalFee,
      payable: state.payable,
      originalFinal: state.originalFinal,
      prepaid: state.prepaid,
      isPlaceholder: false,
      receiptImage: t.receiptImage || '',
      receiptSnapshot: t.receiptSnapshot || null,
    });
    setTodos(todos.filter(x => x.id !== state.id));
    window.__cancelState = null;
    closeModal();
    showSimpleAlert('已撤单', '跑单费 ' + fmt(finalFee) + ' 已计入实收。');
    renderTodoList();
    if (typeof renderCancelledList === 'function') renderCancelledList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();

  } else if (finalFee < 0) {
    const refundAmt = Math.abs(finalFee);
    $('modalRoot').innerHTML = `
      <div class="modal-overlay">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>是否退还费用？</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <p style="margin:8px 0;">跑单费计算为负数，实际需退还单主：</p>
            <p style="font-size:22px;font-weight:800;color:#c0392b;margin:6px 0 12px;">${fmt(refundAmt)}</p>
            <p style="font-size:12px;color:var(--ink-soft);margin:0;">
              选择「退还」：退款统计 +${fmt(refundAmt)}，删除待结<br>
              选择「不退」：退款统计不变，仅删除待结
            </p>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn ghost" onclick="confirmCancelNegative(false)">不退</button>
              <button class="action-btn" onclick="confirmCancelNegative(true)">退还</button>
            </div>
          </div>
        </div>
      </div>`;

  } else {
    addCancelled({
      todoId: t.id,
      clientId: t.clientId || '',
      clientName: clientName,
      platform: t.platform || '',
      contact: t.contact || '',
      contactType: normalizeContactType(t.contactType),
      orderDate: t.orderDate || '',
      scheduleDate: t.scheduleDate || '',
      deadline: t.deadline || '',
      cancelledDate: today,
      cancelType: 'fee',
      refundAmount: 0,
      feeAmount: 0,
      payable: state.payable,
      originalFinal: state.originalFinal,
      prepaid: state.prepaid,
      isPlaceholder: false,
      receiptImage: t.receiptImage || '',
      receiptSnapshot: t.receiptSnapshot || null,
    });
    setTodos(todos.filter(x => x.id !== state.id));
    window.__cancelState = null;
    closeModal();
    showSimpleAlert('已撤单', '应收跑单费为 0，未产生实收。');
    renderTodoList();
    if (typeof renderCancelledList === 'function') renderCancelledList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();
  }
}

function confirmCancelNegative(doRefund) {
  const state = window.__cancelState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const clientName = t.clientName || '未命名';
  const refundAmt = Math.abs(state.finalFee || 0);

  if (doRefund && refundAmt > 0) {
    addFlow('refund', refundAmt, '撤单退款 · ' + clientName, today, { todoId: t.id });
  }

  addCancelled({
    todoId: t.id,
    clientId: t.clientId || '',
    clientName: clientName,
    platform: t.platform || '',
    contact: t.contact || '',
    contactType: normalizeContactType(t.contactType),
    orderDate: t.orderDate || '',
    scheduleDate: t.scheduleDate || '',
    deadline: t.deadline || '',
    cancelledDate: today,
    cancelType: 'fee',
    refundAmount: doRefund ? refundAmt : 0,
    feeAmount: state.finalFee || 0,
    payable: state.payable,
    originalFinal: state.originalFinal,
    prepaid: state.prepaid,
    isPlaceholder: false,
    receiptImage: t.receiptImage || '',
    receiptSnapshot: t.receiptSnapshot || null,
  });

  setTodos(todos.filter(x => x.id !== state.id));
  window.__cancelState = null;
  closeModal();

  showSimpleAlert(
    '已撤单',
    doRefund ? ('退款 ' + fmt(refundAmt) + ' 已计入退款统计。') : '未产生退款。'
  );

  renderTodoList();
  if (typeof renderCancelledList === 'function') renderCancelledList();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}


/* ══════════ [JS-44] 四圆按钮 + 结 / 撤 / 废列表 ══════════ */

function switchOrderTab(tab) {
  if (tab === 'todo')           showPage('pageTodo');
  else if (tab === 'completed') showPage('pageCompleted');
  else if (tab === 'cancelled') showPage('pageCancelled');
  else if (tab === 'discarded') showPage('pageDiscarded');
}

const ORDER_LIST_STATE = {
  completed: {
    range: 'month',
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    customStart: '',
    customEnd: '',
    sort: 'desc',
  },
  cancelled: {
    range: 'month',
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    customStart: '',
    customEnd: '',
    sort: 'desc',
  },
  discarded: {
    range: 'month',
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    customStart: '',
    customEnd: '',
    sort: 'desc',
  },
};

function initOrderFilterBars() {
  ['completed', 'cancelled', 'discarded'].forEach(prefix => {
    const ySel = $(prefix + 'Year');
    if (ySel) {
      const nowY = new Date().getFullYear();
      let html = '';
      for (let y = nowY - 3; y <= nowY + 3; y++) {
        html += '<option value="' + y + '">' + y + '</option>';
      }
      ySel.innerHTML = html;
      ySel.value = ORDER_LIST_STATE[prefix].year;
    }

    const mSel = $(prefix + 'Month');
    if (mSel) {
      let html = '';
      for (let m = 1; m <= 12; m++) {
        html += '<option value="' + m + '">' + m + '</option>';
      }
      mSel.innerHTML = html;
      mSel.value = ORDER_LIST_STATE[prefix].month + 1;
    }

    const today = fmtDateStr(new Date());
    if ($(prefix + 'StartDate')) $(prefix + 'StartDate').value = today;
    if ($(prefix + 'EndDate'))   $(prefix + 'EndDate').value   = today;
    ORDER_LIST_STATE[prefix].customStart = today;
    ORDER_LIST_STATE[prefix].customEnd = today;

    updateOrderSortBtn(prefix);
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toggleOrderSort(prefix) {
  const st = ORDER_LIST_STATE[prefix];
  if (!st) return;
  st.sort = (st.sort === 'desc') ? 'asc' : 'desc';
  updateOrderSortBtn(prefix);
  renderOrderList(prefix);
}

function updateOrderSortBtn(prefix) {
  const btn = $(prefix + 'SortBtn');
  if (!btn) return;
  if (ORDER_LIST_STATE[prefix].sort === 'desc') {
    btn.classList.add('is-desc');
    btn.title = '当前：最近在上（点击切换为最近在下）';
  } else {
    btn.classList.remove('is-desc');
    btn.title = '当前：最近在下（点击切换为最近在上）';
  }
}

function switchOrderRange(prefix, range) {
  const st = ORDER_LIST_STATE[prefix];
  if (!st) return;
  st.range = range;

  const pageId = 'page' + capitalize(prefix);
  const pageEl = $(pageId);
  if (pageEl) {
    pageEl.querySelectorAll('.order-range-btn').forEach(btn => {
      if (btn.dataset.range === range) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  const ymRow = $(prefix + 'YmRow');
  const customRow = $(prefix + 'CustomRow');
  const monthSel = $(prefix + 'Month');
  const monthLabel = $(prefix + 'MonthLabel');

  if (range === 'custom') {
    if (ymRow) ymRow.style.display = 'none';
    if (customRow) customRow.style.display = 'flex';
  } else if (range === 'year') {
    if (ymRow) ymRow.style.display = 'flex';
    if (customRow) customRow.style.display = 'none';
    if (monthSel) monthSel.style.display = 'none';
    if (monthLabel) monthLabel.style.display = 'none';
  } else {
    if (ymRow) ymRow.style.display = 'flex';
    if (customRow) customRow.style.display = 'none';
    if (monthSel) monthSel.style.display = '';
    if (monthLabel) monthLabel.style.display = '';
  }

  renderOrderList(prefix);
}

function onOrderYearChange(prefix) {
  const st = ORDER_LIST_STATE[prefix];
  if (!st) return;
  const sel = $(prefix + 'Year');
  if (!sel) return;
  st.year = parseInt(sel.value, 10) || new Date().getFullYear();
  renderOrderList(prefix);
}

function onOrderMonthChange(prefix) {
  const st = ORDER_LIST_STATE[prefix];
  if (!st) return;
  const sel = $(prefix + 'Month');
  if (!sel) return;
  st.month = (parseInt(sel.value, 10) || 1) - 1;
  renderOrderList(prefix);
}

function applyOrderCustomRange(prefix) {
  const st = ORDER_LIST_STATE[prefix];
  if (!st) return;
  const s = $(prefix + 'StartDate') ? $(prefix + 'StartDate').value : '';
  const e = $(prefix + 'EndDate') ? $(prefix + 'EndDate').value : '';
  if (!s || !e) { showSimpleAlert('提示', '请选择开始与结束日期。'); return; }
  if (s > e)   { showSimpleAlert('提示', '开始日期不能晚于结束日期。'); return; }
  st.customStart = s;
  st.customEnd = e;
  renderOrderList(prefix);
}

function getOrderRange(prefix) {
  const st = ORDER_LIST_STATE[prefix];
  if (!st) return { start: '', end: '', label: '' };

  if (st.range === 'month') {
    const y = st.year;
    const m = st.month;
    const start = y + '-' + String(m + 1).padStart(2, '0') + '-01';
    const lastDay = new Date(y, m + 1, 0).getDate();
    const end = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
    return { start, end, label: y + '年' + (m + 1) + '月' };
  }
  if (st.range === 'year') {
    const y = st.year;
    return { start: y + '-01-01', end: y + '-12-31', label: y + '年' };
  }
  const s = st.customStart;
  const e = st.customEnd;
  return { start: s, end: e, label: s + ' 至 ' + e };
}

function isInOrderRange(dateStr, start, end) {
  if (!dateStr) return false;
  return dateStr >= start && dateStr <= end;
}

function renderOrderList(prefix) {
  if (prefix === 'completed') return renderCompletedList();
  if (prefix === 'cancelled') return renderCancelledList();
  if (prefix === 'discarded') return renderDiscardedList();
}

/* ---- 结 页面 ---- */
function renderCompletedList() {
  const box = $('completedListContainer');
  if (!box) return;

  const st = ORDER_LIST_STATE.completed;
  const range = getOrderRange('completed');
  const list = getCompleted().filter(c => isInOrderRange(c.completedDate, range.start, range.end));

  const hint = $('completedRangeHint');
  if (hint) hint.textContent = '统计范围：' + range.label + '（' + range.start + ' 至 ' + range.end + '）';

  if (!list.length) {
    box.innerHTML = `
      <div class="completed-empty">
        <div class="completed-empty-icon">✓</div>
        <div>该范围内暂无已结单</div>
      </div>`;
    return;
  }

  const sorted = list.slice().sort((a, b) => {
    const da = a.completedDate || '';
    const db = b.completedDate || '';
    if (da !== db) return st.sort === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
    return st.sort === 'asc'
      ? (a.createdAt || 0) - (b.createdAt || 0)
      : (b.createdAt || 0) - (a.createdAt || 0);
  });

  box.innerHTML = `<div class="completed-list">` + sorted.map(c => {
    const contactFull = formatContactFull(c.contactType, c.contact);
    return `
    <div class="completed-card" onclick="openCompletedDetail('${escapeAttr(c.id)}')">
      <div class="completed-card-body">
        <div class="completed-card-title">${escapeHtml(c.clientName || '未命名')}</div>
        <div class="completed-card-meta">
          <span class="meta-item">ID：<strong>${escapeHtml(c.clientId || '—')}</strong></span>
          <span class="meta-item">联系：<strong>${escapeHtml(contactFull || '—')}</strong></span>
          <span class="meta-item">完成：<strong>${escapeHtml(c.completedDate || '—')}</strong></span>
        </div>
      </div>
      <div class="completed-card-amount">${fmt(c.totalReceived || 0)}</div>
      <button class="completed-card-del"
              onclick="event.stopPropagation();askDeleteCompleted('${escapeAttr(c.id)}')"
              title="删除">×</button>
    </div>`;
  }).join('') + `</div>`;
}

/* ---- 撤 页面 ---- */
function renderCancelledList() {
  const box = $('cancelledListContainer');
  if (!box) return;

  const st = ORDER_LIST_STATE.cancelled;
  const range = getOrderRange('cancelled');
  const list = getCancelled().filter(c => isInOrderRange(c.cancelledDate, range.start, range.end));

  const hint = $('cancelledRangeHint');
  if (hint) hint.textContent = '统计范围：' + range.label + '（' + range.start + ' 至 ' + range.end + '）';

  if (!list.length) {
    box.innerHTML = `
      <div class="completed-empty">
        <div class="completed-empty-icon">✕</div>
        <div>该范围内暂无撤单记录</div>
      </div>`;
    return;
  }

  const sorted = list.slice().sort((a, b) => {
    const da = a.cancelledDate || '';
    const db = b.cancelledDate || '';
    if (da !== db) return st.sort === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
    return st.sort === 'asc'
      ? (a.createdAt || 0) - (b.createdAt || 0)
      : (b.createdAt || 0) - (a.createdAt || 0);
  });

  box.innerHTML = `<div class="cancelled-list">` + sorted.map(c => {
    let sideText = '';
    let sideClass = '';
    if (Number(c.refundAmount) > 0) { sideText = '退还 ' + fmt(c.refundAmount); }
    else if (Number(c.feeAmount) > 0) { sideText = '跑单费 ' + fmt(c.feeAmount); }
    else { sideText = '无'; sideClass = ' is-empty'; }

    const contactFull = formatContactFull(c.contactType, c.contact);

    return `
    <div class="cancelled-card" onclick="openCancelledDetail('${escapeAttr(c.id)}')">
      <div class="cancelled-card-body">
        <div class="cancelled-card-title">${escapeHtml(c.clientName || '未命名')}</div>
        <div class="cancelled-card-meta">
          <span class="meta-item">ID：<strong>${escapeHtml(c.clientId || '—')}</strong></span>
          <span class="meta-item">联系：<strong>${escapeHtml(contactFull || '—')}</strong></span>
          <span class="meta-item">撤单：<strong>${escapeHtml(c.cancelledDate || '—')}</strong></span>
        </div>
      </div>
      <div class="cancelled-card-side${sideClass}">${escapeHtml(sideText)}</div>
    </div>`;
  }).join('') + `</div>`;
}

/* ---- 废 页面 ---- */
function renderDiscardedList() {
  const box = $('discardedListContainer');
  if (!box) return;

  const st = ORDER_LIST_STATE.discarded;
  const range = getOrderRange('discarded');
  const list = getDiscarded().filter(c => isInOrderRange(c.discardedDate, range.start, range.end));

  const hint = $('discardedRangeHint');
  if (hint) hint.textContent = '统计范围：' + range.label + '（' + range.start + ' 至 ' + range.end + '）';

  if (!list.length) {
    box.innerHTML = `
      <div class="completed-empty">
        <div class="completed-empty-icon">⌫</div>
        <div>该范围内暂无废稿记录</div>
      </div>`;
    return;
  }

  const sorted = list.slice().sort((a, b) => {
    const da = a.discardedDate || '';
    const db = b.discardedDate || '';
    if (da !== db) return st.sort === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
    return st.sort === 'asc'
      ? (a.createdAt || 0) - (b.createdAt || 0)
      : (b.createdAt || 0) - (a.createdAt || 0);
  });

  box.innerHTML = `<div class="discarded-list">` + sorted.map(c => {
    let sideText = '';
    let sideClass = '';
    if (Number(c.refundAmount) > 0) { sideText = '退还 ' + fmt(c.refundAmount); }
    else if (Number(c.feeAmount) > 0) { sideText = '废稿费 ' + fmt(c.feeAmount); }
    else { sideText = '未收取'; sideClass = ' is-empty'; }

    const contactFull = formatContactFull(c.contactType, c.contact);

    return `
    <div class="discarded-card" onclick="openDiscardedDetail('${escapeAttr(c.id)}')">
      <div class="discarded-card-body">
        <div class="discarded-card-title">${escapeHtml(c.clientName || '未命名')}</div>
        <div class="discarded-card-meta">
          <span class="meta-item">ID：<strong>${escapeHtml(c.clientId || '—')}</strong></span>
          <span class="meta-item">联系：<strong>${escapeHtml(contactFull || '—')}</strong></span>
          <span class="meta-item">作废：<strong>${escapeHtml(c.discardedDate || '—')}</strong></span>
        </div>
      </div>
      <div class="discarded-card-side${sideClass}">${escapeHtml(sideText)}</div>
    </div>`;
  }).join('') + `</div>`;
}


/* ══════════ [JS-45] 各类详情弹窗 ══════════ */

function openCompletedDetail(id) {
  const c = getCompletedById(id);
  if (!c) return;

  const contactFull = formatContactFull(c.contactType, c.contact);

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>结单详情</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="completed-detail-list">
            <div class="completed-detail-row">
              <span class="k">单主ID</span>
              <span class="v">${escapeHtml(c.clientId || '—')}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">联系方式</span>
              <span class="v">${escapeHtml(contactFull || '—')}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">完成日期</span>
              <span class="v">${escapeHtml(c.completedDate || '—')}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">预付款</span>
              <span class="v">${fmt(c.prepaid || 0)}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">原尾款</span>
              <span class="v">${fmt(c.originalFinal || 0)}</span>
            </div>
            ${(c.discount || 0) > 0 ? `
            <div class="completed-detail-row">
              <span class="k">尾款优惠</span>
              <span class="v">-${fmt(c.discount)}</span>
            </div>` : ''}
            <div class="completed-detail-row">
              <span class="k">实收尾款</span>
              <span class="v">${fmt(c.finalAmount || 0)}</span>
            </div>
            <div class="completed-detail-row is-amount">
              <span class="k">实收合计</span>
              <span class="v">${fmt(c.totalReceived || 0)}</span>
            </div>
          </div>

          <div id="completedDetailPhotoWrap" style="margin-top:14px;text-align:center;display:none;">
            <img id="completedDetailPhoto" alt="小票"
                 style="max-width:100%; max-height:360px; object-fit:contain;
                        border:1px solid var(--line-soft); cursor:zoom-in;" />
          </div>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;

  if (c.receiptImage) {
    resolveImageSrc(c.receiptImage).then(url => {
      if (!url) return;
      const wrap = $('completedDetailPhotoWrap');
      const img = $('completedDetailPhoto');
      if (!wrap || !img) return;
      img.src = url;
      img.onclick = () => openImageFullscreen(url);
      wrap.style.display = 'block';
    }).catch(() => {});
  }
}

function openCancelledDetail(id) {
  const c = getCancelledById(id);
  if (!c) return;

  let opLabel = '';
  if (Number(c.refundAmount) > 0) opLabel = '退还 ' + fmt(c.refundAmount);
  else if (Number(c.feeAmount) > 0) opLabel = '跑单费 ' + fmt(c.feeAmount);
  else opLabel = '无费用变动';

  const contactFull = formatContactFull(c.contactType, c.contact);

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>撤单详情</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="completed-detail-list">
            <div class="completed-detail-row">
              <span class="k">单主ID</span>
              <span class="v">${escapeHtml(c.clientId || '—')}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">联系方式</span>
              <span class="v">${escapeHtml(contactFull || '—')}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">撤单时间</span>
              <span class="v">${escapeHtml(c.cancelledDate || '—')}</span>
            </div>
            ${c.isPlaceholder ? `
            <div class="completed-detail-row">
              <span class="k">排单费</span>
              <span class="v">${fmt(c.prepaid || 0)}</span>
            </div>` : `
            <div class="completed-detail-row">
              <span class="k">应付金额</span>
              <span class="v">${fmt(c.payable || 0)}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">预付款</span>
              <span class="v">${fmt(c.prepaid || 0)}</span>
            </div>`}
            <div class="completed-detail-row is-amount">
              <span class="k">操作</span>
              <span class="v">${escapeHtml(opLabel)}</span>
            </div>
          </div>

          <div id="cancelledDetailPhotoWrap" style="margin-top:14px;text-align:center;display:none;">
            <img id="cancelledDetailPhoto" alt="小票"
                 style="max-width:100%; max-height:360px; object-fit:contain;
                        border:1px solid var(--line-soft); cursor:zoom-in;" />
          </div>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;

  if (c.receiptImage) {
    resolveImageSrc(c.receiptImage).then(url => {
      if (!url) return;
      const wrap = $('cancelledDetailPhotoWrap');
      const img = $('cancelledDetailPhoto');
      if (!wrap || !img) return;
      img.src = url;
      img.onclick = () => openImageFullscreen(url);
      wrap.style.display = 'block';
    }).catch(() => {});
  }
}

function openDiscardedDetail(id) {
  const c = getDiscardedById(id);
  if (!c) return;

  let opLabel = '';
  if (Number(c.refundAmount) > 0) opLabel = '退还 ' + fmt(c.refundAmount);
  else if (Number(c.feeAmount) > 0) opLabel = '废稿费 ' + fmt(c.feeAmount);
  else opLabel = '未收取废稿费';

  const contactFull = formatContactFull(c.contactType, c.contact);

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>废稿详情</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="completed-detail-list">
            <div class="completed-detail-row">
              <span class="k">单主ID</span>
              <span class="v">${escapeHtml(c.clientId || '—')}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">联系方式</span>
              <span class="v">${escapeHtml(contactFull || '—')}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">作废时间</span>
              <span class="v">${escapeHtml(c.discardedDate || '—')}</span>
            </div>
            ${c.isPlaceholder ? `
            <div class="completed-detail-row">
              <span class="k">排单费</span>
              <span class="v">${fmt(c.prepaid || 0)}</span>
            </div>` : `
            <div class="completed-detail-row">
              <span class="k">应付金额</span>
              <span class="v">${fmt(c.payable || 0)}</span>
            </div>
            <div class="completed-detail-row">
              <span class="k">预付款</span>
              <span class="v">${fmt(c.prepaid || 0)}</span>
            </div>`}
            <div class="completed-detail-row is-amount">
              <span class="k">操作</span>
              <span class="v">${escapeHtml(opLabel)}</span>
            </div>
          </div>

          <div id="discardedDetailPhotoWrap" style="margin-top:14px;text-align:center;display:none;">
            <img id="discardedDetailPhoto" alt="小票"
                 style="max-width:100%; max-height:360px; object-fit:contain;
                        border:1px solid var(--line-soft); cursor:zoom-in;" />
          </div>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;

  if (c.receiptImage) {
    resolveImageSrc(c.receiptImage).then(url => {
      if (!url) return;
      const wrap = $('discardedDetailPhotoWrap');
      const img = $('discardedDetailPhoto');
      if (!wrap || !img) return;
      img.src = url;
      img.onclick = () => openImageFullscreen(url);
      wrap.style.display = 'block';
    }).catch(() => {});
  }
}

function openImageFullscreen(src) {
  const old = document.querySelector('.td-viewer');
  if (old) old.remove();

  const viewer = document.createElement('div');
  viewer.className = 'td-viewer';
  viewer.innerHTML = `
    <button class="td-viewer-close" onclick="closeTodoImageViewer()">×</button>
    <img src="${escapeAttr(src)}" alt="小票" onclick="event.stopPropagation()" />
  `;
  viewer.addEventListener('click', closeTodoImageViewer);
  document.body.appendChild(viewer);
}

function askDeleteCompleted(id) {
  const c = getCompletedById(id);
  if (!c) return;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>删除结单记录</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;">确定删除以下结单记录吗？</p>
          <p style="font-weight:600;color:var(--ink);margin:0 0 6px;">${escapeHtml(c.clientName || '未命名')}</p>
          <p style="font-size:12px;color:var(--ink-soft);margin:0;">只删除结单记录，流水不会被删除。</p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeleteCompleted('${escapeAttr(id)}')">确定删除</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmDeleteCompleted(id) {
  const list = getCompleted().filter(c => c.id !== id);
  setCompleted(list);
  closeModal();
  renderCompletedList();
  if (typeof renderMasterList === 'function') renderMasterList();
}


/* ══════════ 初始化筛选栏 ══════════ */
initOrderFilterBars();


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-46] 排单日历模块                                 ║
   ╚══════════════════════════════════════════════════════╝ */

var __schedYear = 0;
var __schedMonth = 0;
var __schedSelectedDate = '';
var __schedSort = 'asc';


function initScheduleModule() {
  const ySel = $('schedYear');
  if (ySel) {
    const nowY = new Date().getFullYear();
    let html = '';
    for (let y = nowY - 3; y <= nowY + 3; y++) {
      html += '<option value="' + y + '">' + y + '</option>';
    }
    ySel.innerHTML = html;
  }

  const mSel = $('schedMonth');
  if (mSel) {
    let html = '';
    for (let m = 1; m <= 12; m++) {
      html += '<option value="' + m + '">' + m + '</option>';
    }
    mSel.innerHTML = html;
  }

  const now = new Date();
  __schedYear = now.getFullYear();
  __schedMonth = now.getMonth();
  __schedSelectedDate = '';
  __schedSort = 'asc';

  syncSchedSelectors();
  renderSchedule();
}


function syncSchedSelectors() {
  if ($('schedYear'))  $('schedYear').value  = __schedYear;
  if ($('schedMonth')) $('schedMonth').value = __schedMonth + 1;
}


function schedShiftMonth(delta) {
  let y = __schedYear;
  let m = __schedMonth + delta;

  while (m < 0)  { m += 12; y--; }
  while (m > 11) { m -= 12; y++; }

  __schedYear = y;
  __schedMonth = m;
  __schedSelectedDate = '';

  const panel = $('schedDayPanel');
  if (panel) panel.style.display = 'none';

  syncSchedSelectors();
  renderSchedule();
}


function onSchedYearChange() {
  const el = $('schedYear');
  if (!el) return;
  const y = parseInt(el.value, 10);
  if (isNaN(y)) return;

  __schedYear = y;
  __schedSelectedDate = '';

  const panel = $('schedDayPanel');
  if (panel) panel.style.display = 'none';

  renderSchedule();
}

function onSchedMonthChange() {
  const el = $('schedMonth');
  if (!el) return;
  const m = parseInt(el.value, 10);
  if (isNaN(m) || m < 1 || m > 12) return;

  __schedMonth = m - 1;
  __schedSelectedDate = '';

  const panel = $('schedDayPanel');
  if (panel) panel.style.display = 'none';

  renderSchedule();
}


function schedGoToday() {
  const now = new Date();
  __schedYear = now.getFullYear();
  __schedMonth = now.getMonth();
  __schedSelectedDate = '';

  const panel = $('schedDayPanel');
  if (panel) panel.style.display = 'none';

  syncSchedSelectors();
  renderSchedule();
}


function buildSchedDateMap() {
  const map = {};
  const todos = getSortedTodos();

  todos.forEach(function (t) {
    const date = t.deadline;
    if (!date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

    if (!map[date]) map[date] = { deadlines: [], starts: [] };

    if (t.isPlaceholder) {
      map[date].starts.push(t);
    } else {
      map[date].deadlines.push(t);
    }
  });

  return map;
}


function renderSchedule() {
  const grid = $('schedGrid');
  if (!grid) return;

  const year = __schedYear;
  const month = __schedMonth;

  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay();
  startWeekday = (startWeekday === 0) ? 6 : startWeekday - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateMap = buildSchedDateMap();

  const todayStr = fmtDateStr(new Date());

  let html = '';

  for (let i = 0; i < startWeekday; i++) {
    html += '<div class="sched-cell is-empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = year + '-'
      + String(month + 1).padStart(2, '0') + '-'
      + String(d).padStart(2, '0');

    const info = dateMap[dateStr] || { deadlines: [], starts: [] };
    const dlCount = info.deadlines.length;
    const stCount = info.starts.length;
    const total = dlCount + stCount;
    const hasMark = total > 0;

    const wd = new Date(year, month, d).getDay();
    const isWeekend = (wd === 0 || wd === 6);

    const classes = ['sched-cell'];
    if (isWeekend) classes.push('is-weekend');
    if (hasMark)   classes.push('has-mark');
    if (dateStr === todayStr) classes.push('is-today');
    if (dateStr === __schedSelectedDate) classes.push('is-selected');

    let marksHtml = '';
    if (dlCount && stCount) {
      marksHtml = '<span class="sched-mark is-both"></span>';
    } else if (dlCount) {
      marksHtml = '<span class="sched-mark is-deadline"></span>';
    } else if (stCount) {
      marksHtml = '<span class="sched-mark is-placeholder"></span>';
    }

    const countHtml = total > 1
      ? '<span class="sched-count">' + total + '</span>'
      : '';

    const clickAttr = hasMark
      ? ' onclick="openSchedDayPanel(\'' + dateStr + '\')"'
      : '';

    html += '<div class="' + classes.join(' ') + '" data-date="' + dateStr + '"' + clickAttr + '>'
      + countHtml
      + '<div class="sched-date-num">' + d + '</div>'
      + '<div class="sched-marks">' + marksHtml + '</div>'
      + '</div>';
  }

  const totalCells = startWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    html += '<div class="sched-cell is-empty"></div>';
  }

  grid.innerHTML = html;

  renderSchedMonthSummary(dateMap);
}


function countMonthOrders() {
  const prefix = __schedYear + '-'
    + String(__schedMonth + 1).padStart(2, '0') + '-';

  const seen = {};
  let count = 0;

  getTodos().forEach(t => {
    if (!t.orderDate) return;
    if (t.orderDate.indexOf(prefix) !== 0) return;
    if (seen[t.id]) return;
    seen[t.id] = true;
    count++;
  });

  getCompleted().forEach(c => {
    if (!c.orderDate) return;
    if (c.orderDate.indexOf(prefix) !== 0) return;
    const key = c.todoId || c.id;
    if (seen[key]) return;
    seen[key] = true;
    count++;
  });

  getCancelled().forEach(c => {
    if (!c.orderDate) return;
    if (c.orderDate.indexOf(prefix) !== 0) return;
    const key = c.todoId || c.id;
    if (seen[key]) return;
    seen[key] = true;
    count++;
  });

  getDiscarded().forEach(c => {
    if (!c.orderDate) return;
    if (c.orderDate.indexOf(prefix) !== 0) return;
    const key = c.todoId || c.id;
    if (seen[key]) return;
    seen[key] = true;
    count++;
  });

  return count;
}


function renderSchedMonthSummary(dateMap) {
  const box = $('schedMonthSummary');
  if (!box) return;

  const prefix = __schedYear + '-'
    + String(__schedMonth + 1).padStart(2, '0') + '-';

  let stCount = 0;
  Object.keys(dateMap).forEach(function (dateStr) {
    if (dateStr.indexOf(prefix) !== 0) return;
    stCount += dateMap[dateStr].starts.length;
  });

  const monthOrderCount = countMonthOrders();
  const monthUndone = getUndoneTodosInMonth().length;
  const totalUndone = getTotalUndoneTodosCount();

  box.innerHTML =
    '<span class="sched-sum-item">本月订单 <strong>' + monthOrderCount + '</strong> 项</span>' +
    '<span class="sched-sum-item">占位单 <strong>' + stCount + '</strong> 项</span>' +
    '<span class="sched-sum-item">本月待完成 <strong>' + monthUndone + '</strong> 项</span>' +
    '<span class="sched-sum-item">总计待完成订单 <strong>' + totalUndone + '</strong> 项</span>';
}


function getUndoneTodosInMonth() {
  const prefix = __schedYear + '-'
    + String(__schedMonth + 1).padStart(2, '0') + '-';

  const todos = getSortedTodos();
  const result = [];

  todos.forEach(function (t) {
    if (t.isPlaceholder) return;
    if (!t.deadline) return;
    if (t.deadline.indexOf(prefix) !== 0) return;
    if (isTodoCompleted(t)) return;
    result.push(t);
  });

  return result;
}


function getTotalUndoneTodosCount() {
  const todos = getTodos();
  let count = 0;
  todos.forEach(t => {
    if (t.isPlaceholder) return;
    if (t.status === 'pending') return;
    if (isTodoCompleted(t)) return;
    count++;
  });
  return count;
}


function openSchedDayPanel(dateStr) {
  __schedSelectedDate = dateStr;

  document.querySelectorAll('.sched-grid .sched-cell').forEach(function (cell) {
    if (cell.dataset.date === dateStr) cell.classList.add('is-selected');
    else cell.classList.remove('is-selected');
  });

  var parts = dateStr.split('-');
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10) - 1;
  var d = parseInt(parts[2], 10);
  var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var wd = weekdays[new Date(y, m, d).getDay()];

  var dateMap = buildSchedDateMap();
  var info = dateMap[dateStr] || { deadlines: [], starts: [] };

  var bodyHtml = '';
  if (!info.deadlines.length && !info.starts.length) {
    bodyHtml = '<div class="sched-day-empty">这一天没有截稿或开单安排</div>';
  } else {
    var all = [];
    info.deadlines.forEach(function (t) { all.push({ todo: t, kind: 'deadline' }); });
    info.starts.forEach(function (t)    { all.push({ todo: t, kind: 'start' }); });

    bodyHtml = all.map(function (entry) {
      var t = entry.todo;
      var isPlaceholder = !!t.isPlaceholder;
      var total = (t.items || []).length;
      var done  = (t.items || []).filter(function (x) { return x.done; }).length;

      var progressHtml = isPlaceholder
        ? '<span class="todo-card-progress placeholder">待开单</span>'
        : '<span class="todo-card-progress">完成进度 '
          + '<span class="done">' + done + '</span>'
          + '<span class="slash">/</span>'
          + '<span class="total">' + total + '</span></span>';

      var tagHtml = isPlaceholder
        ? '<span class="sched-day-card-tag is-placeholder">开单</span>'
        : '<span class="sched-day-card-tag is-deadline">截稿</span>';

      var titleText = formatTodoTitle(t);

      return '<div class="todo-card' + (isPlaceholder ? ' is-placeholder' : '') + '"'
        + ' style="cursor:pointer;margin-bottom:10px;"'
        + ' onclick="gotoTodoFromSched(\'' + escapeAttr(t.id) + '\')">'
        + '<div class="todo-card-body">'
        +   '<div class="todo-card-title">' + escapeHtml(titleText) + '</div>'
        +   '<div class="todo-card-meta">'
        +     progressHtml
        +     '<span class="todo-card-deadline">' + tagHtml + '</span>'
        +   '</div>'
        + '</div>'
        + '</div>';
    }).join('');
  }

  $('modalRoot').innerHTML =
    '<div class="modal-overlay" onclick="if(event.target===this)closeModal()">'
    + '<div class="modal sched-day-modal" onclick="event.stopPropagation()">'
    +   '<div class="modal-head">'
    +     '<h3>' + y + '年' + (m + 1) + '月' + d + '日 · ' + wd + '</h3>'
    +     '<button class="icon-btn" onclick="closeModal()">×</button>'
    +   '</div>'
    +   '<div class="modal-body">' + bodyHtml + '</div>'
    + '</div>'
    + '</div>';
}


function gotoTodoFromSched(id) {
  closeModal();
  openTodoDetail(id);
}

function closeSchedDayPanel() {
  __schedSelectedDate = '';

  const panel = $('schedDayPanel');
  if (panel) panel.style.display = 'none';

  document.querySelectorAll('.sched-grid .sched-cell.is-selected').forEach(function (c) {
    c.classList.remove('is-selected');
  });
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-47] 统计模块                                     ║
   ╚══════════════════════════════════════════════════════╝ */

var __statsRangeMode = 'month';
var __statsYear  = new Date().getFullYear();
var __statsMonth = new Date().getMonth();
var __statsCustomStart = '';
var __statsCustomEnd = '';


function initStatsModule() {
  const now = new Date();
  __statsYear = now.getFullYear();
  __statsMonth = now.getMonth();

  renderStatsYearSelect();
  renderStatsMonthSelect();

  const today = fmtDateStr(now);
  if ($('statsStartDate')) $('statsStartDate').value = today;
  if ($('statsEndDate'))   $('statsEndDate').value   = today;
  __statsCustomStart = today;
  __statsCustomEnd = today;

  switchStatsRange('month');
}


function renderStatsYearSelect() {
  const sel = $('statsYear');
  if (!sel) return;
  const nowY = new Date().getFullYear();
  let html = '';
  for (let y = nowY - 3; y <= nowY + 3; y++) {
    html += '<option value="' + y + '">' + y + '</option>';
  }
  sel.innerHTML = html;
  sel.value = __statsYear;
}


function renderStatsMonthSelect() {
  const sel = $('statsMonth');
  if (!sel) return;
  let html = '';
  for (let m = 1; m <= 12; m++) {
    html += '<option value="' + m + '">' + m + '</option>';
  }
  sel.innerHTML = html;
  sel.value = __statsMonth + 1;
}


function switchStatsRange(mode) {
  __statsRangeMode = mode;

  document.querySelectorAll('.stats-range-btn').forEach(btn => {
    if (btn.dataset.range === mode) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const ymRow = $('statsYmRow');
  const customRow = $('statsCustomRow');
  const monthSel = $('statsMonth');
  const monthLabel = $('statsMonthLabel');

  if (mode === 'custom') {
    if (ymRow) ymRow.style.display = 'none';
    if (customRow) customRow.style.display = 'flex';
  } else if (mode === 'week' || mode === 'last7') {
    if (ymRow) ymRow.style.display = 'none';
    if (customRow) customRow.style.display = 'none';
  } else {
    if (ymRow) ymRow.style.display = 'flex';
    if (customRow) customRow.style.display = 'none';
  }

  if (mode === 'year') {
    if (monthSel) monthSel.style.display = 'none';
    if (monthLabel) monthLabel.style.display = 'none';
  } else {
    if (monthSel) monthSel.style.display = '';
    if (monthLabel) monthLabel.style.display = '';
  }

  renderStatsPage();
}


function onStatsYearChange() {
  const sel = $('statsYear');
  if (!sel) return;
  __statsYear = parseInt(sel.value, 10) || new Date().getFullYear();
  renderStatsPage();
}


function onStatsMonthChange() {
  const sel = $('statsMonth');
  if (!sel) return;
  __statsMonth = (parseInt(sel.value, 10) || 1) - 1;
  renderStatsPage();
}


function applyStatsCustomRange() {
  const s = $('statsStartDate') ? $('statsStartDate').value : '';
  const e = $('statsEndDate') ? $('statsEndDate').value : '';
  if (!s || !e) { showSimpleAlert('提示', '请选择开始与结束日期。'); return; }
  if (s > e)   { showSimpleAlert('提示', '开始日期不能晚于结束日期。'); return; }
  __statsCustomStart = s;
  __statsCustomEnd = e;
  renderStatsPage();
}


function getStatsRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (__statsRangeMode === 'month') {
    const y = __statsYear;
    const m = __statsMonth;
    const start = y + '-' + String(m + 1).padStart(2, '0') + '-01';
    const lastDay = new Date(y, m + 1, 0).getDate();
    const end = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
    return { start, end, label: y + '年' + (m + 1) + '月' };
  }

  if (__statsRangeMode === 'year') {
    const y = __statsYear;
    return { start: y + '-01-01', end: y + '-12-31', label: y + '年' };
  }

  if (__statsRangeMode === 'week') {
    const wd = today.getDay();
    const delta = (wd === 0) ? 6 : wd - 1;
    const mon = new Date(today);
    mon.setDate(today.getDate() - delta);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { start: fmtDateStr(mon), end: fmtDateStr(sun), label: '本周' };
  }

  if (__statsRangeMode === 'last7') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start: fmtDateStr(start), end: fmtDateStr(today), label: '最近七天' };
  }

  let s = __statsCustomStart;
  let e = __statsCustomEnd;
  if (!s || !e) { s = e = fmtDateStr(today); }
  return { start: s, end: e, label: s + ' 至 ' + e };
}


function isInRange(dateStr, start, end) {
  if (!dateStr) return false;
  return dateStr >= start && dateStr <= end;
}

function getFilteredFlows(range) {
  const list = getFlows().filter(f => isInRange(f.date, range.start, range.end));

  list.sort((a, b) => {
    const da = a.date || '';
    const db = b.date || '';
    if (da !== db) return db.localeCompare(da);
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return list;
}

function isFlowFromCancelRefund(f) {
  return f.type === 'refund' && String(f.note || '').indexOf('撤单退款') === 0;
}
function isFlowFromDiscardRefund(f) {
  return f.type === 'refund' && String(f.note || '').indexOf('废稿退款') === 0;
}


function renderStatsPage() {
  const range = getStatsRange();
  const flows = getFilteredFlows(range);
  const todos = getTodos();
  const completedList = getCompleted();
  const cancelledList = getCancelled();
  const discardedList = getDiscarded();

  let income = 0;
  let refund = 0;
  let expense = 0;

  flows.forEach(f => {
    const amt = Number(f.amount) || 0;
    if (f.type === 'refund') refund += amt;
    else if (f.type === 'expense') expense += amt;
    else income += amt;
  });

  let pending = 0;
  todos.forEach(t => {
    if (t.isPlaceholder) return;
    if (t.status === 'pending') {
      pending += Number(t.pendingAmount) || 0;
    } else {
      pending += Number(t.originalFinal) || 0;
    }
  });

  const balance = income - refund - expense;

  const clientSet = {};
  todos.forEach(t => { const id = (t.clientId || '').trim(); if (id) clientSet[id] = true; });
  completedList.forEach(c => { const id = (c.clientId || '').trim(); if (id) clientSet[id] = true; });
  cancelledList.forEach(c => { const id = (c.clientId || '').trim(); if (id) clientSet[id] = true; });
  discardedList.forEach(c => { const id = (c.clientId || '').trim(); if (id) clientSet[id] = true; });
  const clientCount = Object.keys(clientSet).length;

  const orderCount = todos.length + completedList.length + cancelledList.length + discardedList.length;

  const cancelCount = cancelledList.length;
  const discardCount = discardedList.length;

  if ($('statsBalance')) $('statsBalance').textContent = fmt(balance);
  if ($('statsIncome'))  $('statsIncome').textContent  = fmt(income);
  if ($('statsPending')) $('statsPending').textContent = fmt(pending);
  if ($('statsRefund'))  $('statsRefund').textContent  = fmt(refund);
  if ($('statsExpense')) $('statsExpense').textContent = fmt(expense);
  if ($('statsClient'))  $('statsClient').textContent  = clientCount + ' 位';
  if ($('statsOrder'))   $('statsOrder').textContent   = orderCount + ' 份';
  if ($('statsCancel'))  $('statsCancel').textContent  = cancelCount + ' 份';
  if ($('statsDiscard')) $('statsDiscard').textContent = discardCount + ' 份';

  const hint = $('statsRangeHint');
  if (hint) hint.textContent = '统计范围：' + range.label + '（' + range.start + ' 至 ' + range.end + '）';
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-48] 记账模块                                     ║
   ╚══════════════════════════════════════════════════════╝ */

function openRecordModal() {
  const today = fmtDateStr(new Date());

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>记账</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <label style="margin-top:8px;">类型 <span class="required-mark">*</span></label>
          <div class="record-type-group" id="recordTypeGroup">
            <button type="button" class="record-type-btn" data-type="income"  onclick="selectRecordType('income')">收入</button>
            <button type="button" class="record-type-btn" data-type="expense" onclick="selectRecordType('expense')">支出</button>
            <button type="button" class="record-type-btn" data-type="refund"  onclick="selectRecordType('refund')">退款</button>
          </div>

          <label>金额 <span class="required-mark">*</span></label>
          <div class="input-unit-wrap prefix">
            <input id="recordAmount" type="number" step="0.01" placeholder="0.00" />
            <span class="input-unit">¥</span>
          </div>

          <label>备注 <span class="required-mark">*</span></label>
          <input id="recordNote" placeholder="如：XX 尾款 / 材料费 / 客户退款" maxlength="80" />

          <label>日期</label>
          <input id="recordDate" type="date" value="${today}" />

          <p class="record-hint">
            收入：客户补款、尾款、稿费等进账。<br>
            支出：外包、软件、材料等支出（不含退款）。<br>
            退款：退给客户的款项。
          </p>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmRecord()">保存</button>
          </div>
        </div>
      </div>
    </div>`;

  window.__recordType = '';
  setTimeout(() => {
    const amount = $('recordAmount');
    if (amount) amount.focus();
  }, 50);
}


function selectRecordType(type) {
  window.__recordType = type;
  document.querySelectorAll('.record-type-btn').forEach(btn => {
    if (btn.dataset.type === type) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}


function confirmRecord() {
  const type = window.__recordType;
  const amountEl = $('recordAmount');
  const noteEl = $('recordNote');
  const dateEl = $('recordDate');

  const amount = Number(amountEl ? amountEl.value : 0);
  const note = (noteEl ? noteEl.value : '').trim();
  const date = (dateEl && dateEl.value) ? dateEl.value : fmtDateStr(new Date());

  if (!type) { showSimpleAlert('提示', '请选择「类型」。'); return; }
  if (!isFinite(amount) || amount <= 0) {
    showSimpleAlert('提示', '请填写有效金额（大于 0）。');
    if (amountEl) amountEl.focus();
    return;
  }
  if (!note) {
    showSimpleAlert('提示', '请填写「备注」。');
    if (noteEl) noteEl.focus();
    return;
  }

  const flow = addFlow(type, amount, note, date, {});
  if (!flow) {
    showSimpleAlert('提示', '保存失败，请重试。');
    return;
  }

  closeModal();
  showSimpleAlert('已保存', '记账已保存：' + fmt(amount));
  renderStatsPage();
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-49] 统计明细弹窗                                 ║
   ╚══════════════════════════════════════════════════════╝ */

function getFlowOrderStatus(flow) {
  if (!flow) return '—';

  if (flow.type === 'income')  return '记账·收入';
  if (flow.type === 'expense') return '记账·支出';

  if (flow.type === 'final') return '已结单';

  if (flow.type === 'discard') return '废稿';
  if (flow.type === 'cancel')  return '已撤单';
  if (flow.type === 'refund') {
    if (String(flow.note || '').indexOf('撤单退款') === 0) return '已撤单';
    if (String(flow.note || '').indexOf('废稿退款') === 0) return '废稿';
    return '记账·退款';
  }

  if ((flow.type === 'prepaid' || flow.type === 'dispatch') && flow.todoId) {
    const completed = getCompleted().find(c => c.todoId === flow.todoId);
    if (completed) return '已结单';

    const t = getTodos().find(x => x.id === flow.todoId);
    if (t) {
      if (t.isPlaceholder) return '待开单';
      if (t.status === 'pending') return '待结单';
      if (isTodoCompleted(t)) return '待结单';
      return '待完成';
    }

    const cancelled = getCancelled().find(c => c.todoId === flow.todoId);
    if (cancelled) return '已撤单';
    const discarded = getDiscarded().find(c => c.todoId === flow.todoId);
    if (discarded) return '废稿';

    return '已结单';
  }

  return '—';
}


function getFlowTypeLabel(flow) {
  if (!flow) return '';
  return {
    prepaid: '预付款',
    dispatch: '排单费',
    final: '尾款',
    discard: '废稿费',
    cancel: '跑单费',
    refund: '退款',
    income: '记账·收入',
    expense: '记账·支出',
  }[flow.type] || flow.type;
}


function openStatsDetail(type) {
  const range = getStatsRange();
  const flows = getFilteredFlows(range);

  let title = '';
  let rowsHtml = '';
  let emptyText = '该范围内没有记录。';
  let totalValue = 0;

  if (type === 'income') {
    title = '统计实收明细';
    emptyText = '该范围内没有实收记录。';

    const items = flows.filter(f => f.type !== 'refund' && f.type !== 'expense');
    items.forEach(f => { totalValue += Number(f.amount) || 0; });

    rowsHtml = items.map(f => {
      const amt = Number(f.amount) || 0;
      const status = getFlowOrderStatus(f);
      return '<div class="info-row">'
        + '<span>' + escapeHtml(f.note || '—')
        + ' <span style="color:var(--ink-soft);font-size:11px;">（' + escapeHtml(status) + ' · ' + escapeHtml(f.date) + '）</span></span>'
        + '<span>' + fmt(amt) + '</span>'
        + '</div>';
    }).join('');

    if (rowsHtml) {
      rowsHtml += '<div class="info-row" style="border-top:1px dashed var(--line-soft);margin-top:6px;padding-top:10px;font-weight:700;">'
        + '<span>合计</span><span>' + fmt(totalValue) + '</span></div>';
    }
  }
  else if (type === 'pending') {
    title = '统计待结明细';
    emptyText = '该范围内没有待结订单。';

    const sortedTodos = getSortedTodos();
    const items = [];
    sortedTodos.forEach(t => {
      if (t.isPlaceholder) return;

      if (t.status === 'pending') {
        const amt = Number(t.pendingAmount) || 0;
        if (amt <= 0) return;
        totalValue += amt;
        items.push({ name: formatTodoTitle(t) + '（待结）', amount: amt });
      } else {
        const amt = Number(t.originalFinal) || 0;
        if (amt <= 0) return;
        totalValue += amt;
        const st = isTodoCompleted(t) ? '待结单' : '待完成';
        items.push({ name: formatTodoTitle(t) + '（' + st + '）', amount: amt });
      }
    });

    rowsHtml = items.map(it =>
      '<div class="info-row"><span>' + escapeHtml(it.name) + '</span><span>' + fmt(it.amount) + '</span></div>'
    ).join('');

    if (rowsHtml) {
      rowsHtml += '<div class="info-row" style="border-top:1px dashed var(--line-soft);margin-top:6px;padding-top:10px;font-weight:700;">'
        + '<span>合计</span><span>' + fmt(totalValue) + '</span></div>';
    }
  }
  else if (type === 'refund') {
    title = '统计退款明细';
    emptyText = '该范围内没有退款记录。';

    const items = flows.filter(f => f.type === 'refund');
    items.forEach(f => { totalValue += Number(f.amount) || 0; });

    rowsHtml = items.map(f => {
      const status = getFlowOrderStatus(f);
      return '<div class="info-row">'
        + '<span>' + escapeHtml(f.note || '退款')
        + ' <span style="color:var(--ink-soft);font-size:11px;">（' + escapeHtml(status) + ' · ' + escapeHtml(f.date) + '）</span></span>'
        + '<span>' + fmt(f.amount) + '</span>'
        + '</div>';
    }).join('');

    if (rowsHtml) {
      rowsHtml += '<div class="info-row" style="border-top:1px dashed var(--line-soft);margin-top:6px;padding-top:10px;font-weight:700;">'
        + '<span>合计</span><span>' + fmt(totalValue) + '</span></div>';
    }
  }
  else if (type === 'expense') {
    title = '统计支出明细';
    emptyText = '该范围内没有支出记录。';

    const items = flows.filter(f => f.type === 'expense');
    items.forEach(f => { totalValue += Number(f.amount) || 0; });

    rowsHtml = items.map(f =>
      '<div class="info-row">'
      + '<span>' + escapeHtml(f.note || '支出')
      + ' <span style="color:var(--ink-soft);font-size:11px;">（记账·支出 · ' + escapeHtml(f.date) + '）</span></span>'
      + '<span>' + fmt(f.amount) + '</span>'
      + '</div>'
    ).join('');

    if (rowsHtml) {
      rowsHtml += '<div class="info-row" style="border-top:1px dashed var(--line-soft);margin-top:6px;padding-top:10px;font-weight:700;">'
        + '<span>合计</span><span>' + fmt(totalValue) + '</span></div>';
    }
  }

  if (!rowsHtml) {
    rowsHtml = '<p style="color:var(--ink-soft);font-size:13px;margin:10px 0;">' + escapeHtml(emptyText) + '</p>';
  }

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>${escapeHtml(title)}</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:12px;color:var(--ink-soft);margin:4px 0 12px;">
            ${escapeHtml(range.label)}（${escapeHtml(range.start)} 至 ${escapeHtml(range.end)}）
          </p>
          <div>${rowsHtml}</div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 9 部分 · 9.1 / 共 10 部分                         ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-50] 数据修复 + 图片迁移                        ║
   ║   [JS-51] 单主模块（★含缓存索引）                    ║
   ║   [JS-52] 票夹渲染                                   ║
   ║   [JS-53] 更新公告                                   ║
   ║   [JS-54] 启动初始化                                 ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [JS-50] 数据修复 + 图片迁移 ══════════ */

function repairMissingFlows() {
  const todos = getTodos();
  const completedList = getCompleted();
  const records = getRecords();
  const flows = getFlows();

  const prepaidByTodoId = {};
  const dispatchByTodoId = {};
  const finalByCompletedId = {};
  const recordIdsMigrated = {};

  flows.forEach(f => {
    if (f.type === 'prepaid' && f.todoId) {
      prepaidByTodoId[f.todoId] = (prepaidByTodoId[f.todoId] || 0) + (Number(f.amount) || 0);
    }
    if (f.type === 'dispatch' && f.todoId) {
      dispatchByTodoId[f.todoId] = (dispatchByTodoId[f.todoId] || 0) + (Number(f.amount) || 0);
    }
    if (f.type === 'final' && f.completedId) {
      finalByCompletedId[f.completedId] = (finalByCompletedId[f.completedId] || 0) + (Number(f.amount) || 0);
    }
    if (f.note && f.note.indexOf('[rec:') > -1) {
      const m = f.note.match(/\[rec:([^\]]+)\]/);
      if (m) recordIdsMigrated[m[1]] = true;
    }
  });

  let addedCount = 0;
  let addedAmount = 0;

  todos.forEach(t => {
    const prepaid = Number(t.prepaid) || 0;
    if (prepaid <= 0) return;

    if (t.isPlaceholder) {
      const existing = dispatchByTodoId[t.id] || 0;
      const diff = prepaid - existing;
      if (diff <= 0.005) return;

      const date = t.orderDate || (t.createdAt ? fmtDateStr(new Date(t.createdAt)) : fmtDateStr(new Date()));
      const ok = addFlow('dispatch', diff, '排单费（补录）· ' + (t.clientName || '未命名'), date, { todoId: t.id });
      if (ok) { addedCount++; addedAmount += diff; }
    } else {
      const existing = prepaidByTodoId[t.id] || 0;
      const diff = prepaid - existing;
      if (diff <= 0.005) return;

      const date = t.orderDate || (t.createdAt ? fmtDateStr(new Date(t.createdAt)) : fmtDateStr(new Date()));
      const ok = addFlow('prepaid', diff, '预付款（补录）· ' + (t.clientName || '未命名'), date, { todoId: t.id });
      if (ok) { addedCount++; addedAmount += diff; }
    }
  });

  completedList.forEach(c => {
    const finalAmount = Number(c.finalAmount) || 0;
    if (finalAmount <= 0) return;

    const existing = finalByCompletedId[c.id] || 0;
    const diff = finalAmount - existing;
    if (diff <= 0.005) return;

    const date = c.completedDate || fmtDateStr(new Date(c.createdAt || Date.now()));
    const ok = addFlow('final', diff, '尾款（补录）· ' + (c.clientName || '未命名'), date, {
      completedId: c.id,
      todoId: c.todoId || '',
    });
    if (ok) { addedCount++; addedAmount += diff; }
  });

  records.forEach(r => {
    if (recordIdsMigrated[r.id]) return;

    const amt = Number(r.amount) || 0;
    if (amt <= 0) return;

    let type = r.type;
    if (type !== 'income' && type !== 'expense' && type !== 'refund') {
      type = 'income';
    }

    const note = (r.note || '旧记账') + ' [rec:' + r.id + ']';
    const date = r.date || fmtDateStr(new Date(r.createdAt || Date.now()));

    const ok = addFlow(type, amt, note, date, {});
    if (ok) { addedCount++; addedAmount += amt; }
  });

  return { count: addedCount, amount: addedAmount };
}


function repairData() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>数据修复</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:6px 0 10px;line-height:1.7;font-size:13px;">
            数据修复将：
          </p>
          <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;color:var(--ink-soft);line-height:1.85;">
            <li>把当前存档升级到最新规则（补字段、图片搬入 IndexedDB 等）</li>
            <li>自动补录历史订单缺失的预付款 / 排单费 / 尾款流水</li>
            <li>建立单主档案索引，让「单主」页面能自动读取历史订单</li>
          </ul>
          <p style="font-size:12px;color:var(--ink-soft);margin:0 0 10px;">
            修复前会自动备份，可重复点击不会重复累加。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="doRepairData()">开始修复</button>
          </div>
        </div>
      </div>
    </div>`;
}

async function doRepairData() {
  const ctx = createMigrationContext();

  const backupJson = backupAllDataBeforeRepair();
  try {
    localStorage.setItem('listReceiptRepairBackup', backupJson);
  } catch (e) {}

  const fromV = getSchemaVersion();
  const toV = SCHEMA_VERSION;

  if (fromV > toV) {
    showSimpleAlert(
      '数据版本高于当前代码',
      '当前存档版本为 v' + fromV + '，本代码只支持到 v' + toV + '。<br>' +
      '请更新代码后再试，或不要覆盖当前存档。'
    );
    return;
  }

  let migratedSteps = 0;
  if (fromV < toV) {
    for (let v = fromV + 1; v <= toV; v++) {
      const fn = MIGRATIONS[v];
      if (typeof fn === 'function') {
        try {
          fn(ctx);
          migratedSteps++;
        } catch (e) {
          ctx.report.push('迁移到 v' + v + ' 出错：' + (e && e.message ? e.message : '未知'));
        }
      }
    }
    setSchemaVersion(toV);
  }

  try {
    const migratedImages = await migrateImagesToIndexedDB(ctx);
    if (migratedImages > 0) {
      ctx.report.push('图片搬迁：' + migratedImages + ' 张已迁入 IndexedDB');
    }
  } catch (e) {
    ctx.report.push('图片搬迁失败：' + (e && e.message ? e.message : '未知'));
  }

  let flowStats = { count: 0, amount: 0 };
  try {
    flowStats = repairMissingFlows() || flowStats;
  } catch (e) {
    ctx.report.push('补流水出错：' + (e && e.message ? e.message : '未知'));
  }

  let masters = [];
  try {
    masters = getMasterList();
  } catch (e) {
    ctx.report.push('单主索引出错：' + (e && e.message ? e.message : '未知'));
  }

  appendMigrationLog({
    from: fromV,
    to: toV,
    flowAdded: flowStats.count,
    flowAmount: flowStats.amount,
    masterCount: masters.length,
  });

  let bodyHtml = '<p style="margin:6px 0 10px;font-weight:600;">数据修复完成</p>';
  bodyHtml += '<ul style="margin:0;padding-left:20px;font-size:13px;color:var(--ink-soft);line-height:1.85;">';
  bodyHtml += '<li>数据版本：v' + fromV + ' → v' + toV + '（迁移步骤 ' + migratedSteps + ' 个）</li>';
  if (flowStats.count > 0) {
    bodyHtml += '<li>补录流水：' + flowStats.count + ' 条，合计 ' + fmt(flowStats.amount) + '</li>';
  } else {
    bodyHtml += '<li>流水无需补录</li>';
  }
  bodyHtml += '<li>单主档案：共 ' + masters.length + ' 位</li>';
  ctx.report.forEach(line => {
    bodyHtml += '<li>' + escapeHtml(line) + '</li>';
  });
  bodyHtml += '</ul>';
  bodyHtml += '<p style="font-size:12px;color:var(--ink-soft);margin:10px 0 0;">' +
              '可到「统计」页和「单主」页查看最新数据。</p>';

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>数据修复结果</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">完成</button>
          </div>
        </div>
      </div>
    </div>`;

  try {
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();
    if (typeof renderTodoList === 'function') renderTodoList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof applyReceiptSettings === 'function') applyReceiptSettings();
  } catch (e) {}
}


/* ---------- 老 base64 图片批量搬进 IndexedDB ---------- */
var pendingImageMigrations = [];

async function migrateImagesToIndexedDB(ctx) {
  if (!isIDBAvailable()) {
    ctx.report.push('IndexedDB 不可用，跳过图片搬迁');
    return 0;
  }

  let migrated = 0;

  async function tryMigrateField(obj, field) {
    if (!obj || typeof obj !== 'object') return false;
    const v = obj[field];
    if (!v || typeof v !== 'string') return false;
    if (v.indexOf('data:image') !== 0) return false;
    const ref = await saveBase64Image(v, field);
    if (!ref || ref.indexOf('file_') !== 0) return false;
    obj[field] = ref;
    migrated++;
    return true;
  }

  /* 1. 小票设置 */
  try {
    const s = getReceiptSettings();
    let changed = false;
    if (await tryMigrateField(s, 'headerImg')) changed = true;
    if (await tryMigrateField(s, 'footerImg')) changed = true;
    if (await tryMigrateField(s, 'bgImg'))     changed = true;
    if (changed) setReceiptSettings(s);
  } catch (e) {}

  /* 2. 小票预设列表 */
  try {
    const list = getReceiptPresetList();
    let changed = false;
    for (const p of list) {
      if (!p || !p.settings) continue;
      if (await tryMigrateField(p.settings, 'headerImg')) changed = true;
      if (await tryMigrateField(p.settings, 'footerImg')) changed = true;
      if (await tryMigrateField(p.settings, 'bgImg'))     changed = true;
    }
    if (changed) setReceiptPresetList(list);
  } catch (e) {}

  /* 3. 待办订单 */
  try {
    const todos = getTodos();
    let changed = false;

    for (const t of todos) {
      if (!t) continue;

      if (t.receiptImage && typeof t.receiptImage === 'string'
          && t.receiptImage.indexOf('data:image') === 0) {
        const ref = await saveBase64Image(t.receiptImage, 'receipt.png');
        if (ref) { t.receiptImage = ref; changed = true; migrated++; }
      }

      if (t.receiptSnapshot && typeof t.receiptSnapshot === 'object') {
        const ps = t.receiptSnapshot.previewImage;
        if (ps && typeof ps === 'string' && ps.indexOf('data:image') === 0) {
          const ref = await saveBase64Image(ps, 'preview.png');
          if (ref) { t.receiptSnapshot.previewImage = ref; changed = true; migrated++; }
        }
      }

      ['materials', 'requirements'].forEach(key => {
        const arr = t[key];
        if (!Array.isArray(arr)) return;
        arr.forEach(f => {
          if (!f) return;
          if (f.fileRef) return;
          if (f.dataUrl && typeof f.dataUrl === 'string'
              && f.dataUrl.indexOf('data:image') === 0) {
            pendingImageMigrations.push({ f: f });
          }
        });
      });
    }

    for (const job of pendingImageMigrations) {
      const ref = await saveBase64Image(job.f.dataUrl, job.f.name || 'image.png');
      if (ref) {
        job.f.fileRef = ref;
        job.f.dataUrl = '';
        changed = true;
        migrated++;
      }
    }
    pendingImageMigrations.length = 0;

    if (changed) setTodos(todos);
  } catch (e) {}

  /* 4. 已结单 */
  try {
    const list = getCompleted();
    let changed = false;
    for (const c of list) {
      if (!c) continue;
      if (c.receiptImage && typeof c.receiptImage === 'string'
          && c.receiptImage.indexOf('data:image') === 0) {
        const ref = await saveBase64Image(c.receiptImage, 'receipt.png');
        if (ref) { c.receiptImage = ref; changed = true; migrated++; }
      }
      if (c.receiptSnapshot && typeof c.receiptSnapshot === 'object') {
        const ps = c.receiptSnapshot.previewImage;
        if (ps && typeof ps === 'string' && ps.indexOf('data:image') === 0) {
          const ref = await saveBase64Image(ps, 'preview.png');
          if (ref) { c.receiptSnapshot.previewImage = ref; changed = true; migrated++; }
        }
      }
    }
    if (changed) setCompleted(list);
  } catch (e) {}

  /* 5. 撤单 */
  try {
    const list = getCancelled();
    let changed = false;
    for (const c of list) {
      if (!c) continue;
      if (c.receiptImage && typeof c.receiptImage === 'string'
          && c.receiptImage.indexOf('data:image') === 0) {
        const ref = await saveBase64Image(c.receiptImage, 'receipt.png');
        if (ref) { c.receiptImage = ref; changed = true; migrated++; }
      }
      if (c.receiptSnapshot && typeof c.receiptSnapshot === 'object') {
        const ps = c.receiptSnapshot.previewImage;
        if (ps && typeof ps === 'string' && ps.indexOf('data:image') === 0) {
          const ref = await saveBase64Image(ps, 'preview.png');
          if (ref) { c.receiptSnapshot.previewImage = ref; changed = true; migrated++; }
        }
      }
    }
    if (changed) setCancelled(list);
  } catch (e) {}

  /* 6. 废稿 */
  try {
    const list = getDiscarded();
    let changed = false;
    for (const c of list) {
      if (!c) continue;
      if (c.receiptImage && typeof c.receiptImage === 'string'
          && c.receiptImage.indexOf('data:image') === 0) {
        const ref = await saveBase64Image(c.receiptImage, 'receipt.png');
        if (ref) { c.receiptImage = ref; changed = true; migrated++; }
      }
      if (c.receiptSnapshot && typeof c.receiptSnapshot === 'object') {
        const ps = c.receiptSnapshot.previewImage;
        if (ps && typeof ps === 'string' && ps.indexOf('data:image') === 0) {
          const ref = await saveBase64Image(ps, 'preview.png');
          if (ref) { c.receiptSnapshot.previewImage = ref; changed = true; migrated++; }
        }
      }
    }
    if (changed) setDiscarded(list);
  } catch (e) {}

  /* 7. 当前预览图 */
  try {
    if (typeof previewImageData === 'string'
        && previewImageData.indexOf('data:image') === 0) {
      const ref = await saveBase64Image(previewImageData, 'preview.png');
      if (ref) { previewImageData = ref; migrated++; }
    }
  } catch (e) {}

  return migrated;
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-51] 单主模块（★含缓存索引）                     ║
   ╚══════════════════════════════════════════════════════╝ */

const MASTER_UNKNOWN_KEY = '__UNKNOWN__';

var __masterSort = 'recent';
var __currentMasterKey = null;
var __masterEditMode = false;
var __masterFilter = null;
var __masterManageMode = false;
var __masterSelectedKeys = {};

/* ---------- 单主列表缓存（★新增）----------
   背景：renderMasterList 每次调用（包括搜索框每输入一个字符）都会重建
   整个单主列表。数据量大时是 O(订单数 × 流水数)。
   方案：加一层指纹缓存——数据源未变直接返回上次结果，变了才重建。 */

var __masterListCache = null;
var __masterListCacheKey = '';

/* 用「各数据源条数 + 最新时间戳」组成指纹。
   任一数据被增 / 删 / 改，指纹都会变化，从而触发重建。 */
function computeMasterListCacheKey() {
  const latest = (arr, fields) => {
    let max = 0;
    for (let i = 0; i < arr.length; i++) {
      const x = arr[i];
      if (!x) continue;
      for (let j = 0; j < fields.length; j++) {
        const v = x[fields[j]];
        if (typeof v === 'number' && v > max) max = v;
      }
    }
    return max;
  };

  const todos     = getTodos();
  const completed = getCompleted();
  const cancelled = getCancelled();
  const discarded = getDiscarded();
  const flows     = getFlows();
  const manual    = getManualMasters();
  const overrides = getMasterOverrides();

  return [
    todos.length,     latest(todos,     ['updatedAt', 'createdAt']),
    completed.length, latest(completed, ['createdAt']),
    cancelled.length, latest(cancelled, ['createdAt']),
    discarded.length, latest(discarded, ['createdAt']),
    flows.length,     latest(flows,     ['createdAt']),
    manual.length,    latest(manual,    ['updatedAt', 'createdAt']),
    Object.keys(overrides).length,
  ].join('|');
}

/* 对外入口：加缓存 */
function getMasterList() {
  const key = computeMasterListCacheKey();
  if (__masterListCache && __masterListCacheKey === key) {
    return __masterListCache;
  }
  const result = buildMasterList();
  __masterListCache    = result;
  __masterListCacheKey = key;
  return result;
}

/* 真正的构建逻辑（原 getMasterList 主体，改名为 buildMasterList） */
function buildMasterList() {
  const todos = getTodos();
  const completedList = getCompleted();
  const cancelledList = getCancelled();
  const discardedList = getDiscarded();
  const overrides = getMasterOverrides();
  const manualList = getManualMasters();
  const flows = getFlows();

  const map = {};

  function ensure(clientId, fallbackName) {
    const id = String(clientId || '').trim();
    const key = id || MASTER_UNKNOWN_KEY;
    if (!map[key]) {
      map[key] = {
        key: key,
        clientId: id,
        clientName: fallbackName || id || '未知单主',
        platform: '',
        contact: '',
        contactType: 'QQ',
        note: '',
        tags: '',
        orderCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        discardedCount: 0,
        activeCount: 0,
        pendingCount: 0,
        totalIncome: 0,
        pendingAmount: 0,
        firstOrderDate: '',
        lastOrderDate: '',
        orders: [],
        receipts: [],
      };
    }
    if (fallbackName && !map[key].clientName) {
      map[key].clientName = fallbackName;
    }
    return map[key];
  }

  function pushOrder(m, record) {
    m.orders.push(record);
    if (record.date) {
      if (!m.firstOrderDate || record.date < m.firstOrderDate) m.firstOrderDate = record.date;
      if (!m.lastOrderDate || record.date > m.lastOrderDate) m.lastOrderDate = record.date;
    }
  }

  todos.forEach(t => {
    const m = ensure(t.clientId, t.clientName);
    if (t.platform && !m.platform) m.platform = t.platform;
    if (t.contact && !m.contact) {
      m.contact = t.contact;
      m.contactType = normalizeContactType(t.contactType);
    }
    m.orderCount++;

    if (t.isPlaceholder) {
      m.activeCount++;
    } else if (t.status === 'pending') {
      m.pendingCount++;
      m.pendingAmount += Number(t.pendingAmount) || 0;
    } else {
      m.activeCount++;
      m.pendingAmount += Number(t.originalFinal) || 0;
    }

    pushOrder(m, {
      id: t.id,
      type: 'todo',
      status: t.isPlaceholder ? 'placeholder' : (t.status === 'pending' ? 'pending' : 'active'),
      title: t.isPlaceholder
        ? '占位单 · ' + (t.clientName || '')
        : '立项单 · ' + (t.clientName || ''),
      date: t.orderDate || '',
      deadline: t.deadline || '',
      amount: Number(t.payable) || 0,
      todoId: t.id,
    });

    if (t.receiptImage) {
      m.receipts.push({ src: t.receiptImage, date: t.orderDate || '', type: '待办' });
    }
  });

  completedList.forEach(c => {
    const m = ensure(c.clientId, c.clientName);
    if (c.platform && !m.platform) m.platform = c.platform;
    if (c.contact && !m.contact) {
      m.contact = c.contact;
      m.contactType = normalizeContactType(c.contactType);
    }
    m.orderCount++;
    m.completedCount++;

    pushOrder(m, {
      id: c.id,
      type: 'completed',
      status: 'completed',
      title: '已结单 · ' + (c.clientName || ''),
      date: c.orderDate || '',
      deadline: c.completedDate || '',
      amount: Number(c.totalReceived) || 0,
      todoId: c.todoId || '',
    });

    if (c.receiptImage) {
      m.receipts.push({ src: c.receiptImage, date: c.completedDate || '', type: '已结' });
    }
  });

  cancelledList.forEach(c => {
    const m = ensure(c.clientId, c.clientName);
    if (c.platform && !m.platform) m.platform = c.platform;
    if (c.contact && !m.contact) {
      m.contact = c.contact;
      m.contactType = normalizeContactType(c.contactType);
    }
    m.orderCount++;
    m.cancelledCount++;

    pushOrder(m, {
      id: c.id,
      type: 'cancelled',
      status: 'cancelled',
      title: '撤单 · ' + (c.clientName || ''),
      date: c.orderDate || '',
      deadline: c.cancelledDate || '',
      amount: Number(c.refundAmount) > 0 ? -Number(c.refundAmount) : (Number(c.feeAmount) || 0),
      todoId: c.todoId || '',
    });

    if (c.receiptImage) {
      m.receipts.push({ src: c.receiptImage, date: c.cancelledDate || '', type: '撤单' });
    }
  });

  discardedList.forEach(c => {
    const m = ensure(c.clientId, c.clientName);
    if (c.platform && !m.platform) m.platform = c.platform;
    if (c.contact && !m.contact) {
      m.contact = c.contact;
      m.contactType = normalizeContactType(c.contactType);
    }
    m.orderCount++;
    m.discardedCount++;

    pushOrder(m, {
      id: c.id,
      type: 'discarded',
      status: 'discarded',
      title: '废稿 · ' + (c.clientName || ''),
      date: c.orderDate || '',
      deadline: c.discardedDate || '',
      amount: Number(c.refundAmount) > 0 ? -Number(c.refundAmount) : (Number(c.feeAmount) || 0),
      todoId: c.todoId || '',
    });

    if (c.receiptImage) {
      m.receipts.push({ src: c.receiptImage, date: c.discardedDate || '', type: '废稿' });
    }
  });

  manualList.forEach(mm => {
    if (!mm || !mm.clientId) return;
    const m = ensure(mm.clientId, mm.clientId);
    if (mm.platform) m.platform = mm.platform;
    if (mm.contact) {
      m.contact = mm.contact;
      m.contactType = normalizeContactType(mm.contactType);
    }
    if (mm.note !== undefined) m.note = mm.note;
    if (mm.tags !== undefined) m.tags = mm.tags;
  });

  /* ★ 索引表：避免循环中做 O(n) 的 find
     原来每个 flow 都要在 todos / completed / cancelled / discarded 里
     各 find 一遍，最坏 O(流水数 × 订单数)。改为一次性建索引，
     之后每条 flow 只做 O(1) 查表。 */

  const todoClientById = Object.create(null);
  todos.forEach(t => { todoClientById[t.id] = t.clientId || ''; });

  const recordClientByTodoId = Object.create(null);
  const recordClientById     = Object.create(null);

  completedList.forEach(c => {
    recordClientById[c.id] = c.clientId || '';
    if (c.todoId) recordClientByTodoId[c.todoId] = c.clientId || '';
  });
  cancelledList.forEach(c => {
    recordClientById[c.id] = c.clientId || '';
    if (c.todoId && !recordClientByTodoId[c.todoId]) {
      recordClientByTodoId[c.todoId] = c.clientId || '';
    }
  });
  discardedList.forEach(c => {
    recordClientById[c.id] = c.clientId || '';
    if (c.todoId && !recordClientByTodoId[c.todoId]) {
      recordClientByTodoId[c.todoId] = c.clientId || '';
    }
  });

  flows.forEach(f => {
    let cid = '';
    if (f.todoId) {
      cid = todoClientById[f.todoId] || recordClientByTodoId[f.todoId] || '';
    }
    if (!cid && f.completedId) {
      cid = recordClientById[f.completedId] || '';
    }

    const key = String(cid || '').trim() || MASTER_UNKNOWN_KEY;
    if (!map[key]) return;

    const m   = map[key];
    const amt = Number(f.amount) || 0;
    if (f.type === 'refund') {
      m.totalIncome -= amt;
    } else if (f.type !== 'expense') {
      m.totalIncome += amt;
    }
  });

  Object.keys(overrides).forEach(id => {
    const ov = overrides[id];
    if (!ov) return;
    const key = String(id || '').trim() || MASTER_UNKNOWN_KEY;
    if (!map[key]) {
      map[key] = {
        key: key,
        clientId: id,
        clientName: id || '未知单主',
        platform: '',
        contact: '',
        contactType: 'QQ',
        note: '',
        tags: '',
        orderCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        discardedCount: 0,
        activeCount: 0,
        pendingCount: 0,
        totalIncome: 0,
        pendingAmount: 0,
        firstOrderDate: '',
        lastOrderDate: '',
        orders: [],
        receipts: [],
      };
    }
    const m = map[key];
    if (ov.note !== undefined)  m.note = ov.note;
    if (ov.tags !== undefined)  m.tags = ov.tags;
    if (ov.contact)             m.contact = ov.contact;
    if (ov.contactType)         m.contactType = normalizeContactType(ov.contactType);
    if (ov.platform)            m.platform = ov.platform;
  });

  return Object.values(map);
}


/* ---------- 列表页 ---------- */

function setMasterSort(sort) {
  __masterSort = sort;
  document.querySelectorAll('.master-sort-btn').forEach(btn => {
    if (btn.dataset.sort === sort) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderMasterList();
}


function renderMasterList() {
  const box = $('masterListContainer');
  if (!box) return;

  const all = getMasterList().filter(m => !isMasterHidden(m.key));
  const q = ($('masterSearch') ? $('masterSearch').value : '').trim().toLowerCase();

  let filtered = all.filter(m => {
    if (q) {
      const s = (m.clientId + ' ' + m.clientName + ' ' + (m.contact || '') + ' ' + (m.note || '') + ' ' + (m.tags || '')).toLowerCase();
      if (s.indexOf(q) === -1) return false;
    }
    if (__masterFilter) {
      if (__masterFilter.type === 'orders') {
        if ((m.orderCount || 0) < __masterFilter.value) return false;
      } else if (__masterFilter.type === 'amount') {
        if ((m.totalIncome || 0) < __masterFilter.value) return false;
      }
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (__masterSort === 'amount') return (b.totalIncome || 0) - (a.totalIncome || 0);
    if (__masterSort === 'orders') return (b.orderCount || 0) - (a.orderCount || 0);
    if (__masterSort === 'id')     return (a.clientId || '').localeCompare(b.clientId || '');
    const da = a.lastOrderDate || '';
    const db = b.lastOrderDate || '';
    if (da !== db) return db.localeCompare(da);
    return (b.orderCount || 0) - (a.orderCount || 0);
  });

  const cnt = $('masterCount');
  if (cnt) cnt.textContent = '（' + filtered.length + ' 位）';

  const hint = $('masterListHint');
  if (hint) {
    let ht = '共 ' + filtered.length + ' 位单主（点卡片查看详情）';
    if (__masterFilter) {
      const f = __masterFilter;
      if (f.type === 'orders') {
        ht = '已筛选：订单数 ≥ ' + f.value + ' · 共 ' + filtered.length + ' 位';
      } else {
        ht = '已筛选：消费 ≥ ¥' + Number(f.value || 0).toFixed(2) + ' · 共 ' + filtered.length + ' 位';
      }
    }
    hint.textContent = ht;
  }

  if (!filtered.length) {
    box.innerHTML = `
      <div class="master-empty">
        <div class="master-empty-icon">👤</div>
        <div>${q || __masterFilter ? '没有匹配的单主' : '暂无单主记录<br>导入订单后会自动建立单主档案'}</div>
      </div>`;
    updateMasterManageBar();
    return;
  }

  box.innerHTML = '<div class="master-list">' + filtered.map(m => {
    const key = escapeAttr(m.key);
    const tagsArr = String(m.tags || '').split(',').map(t => t.trim()).filter(x => x);
    const tagsHtml = tagsArr.slice(0, 3).map(t =>
      `<span class="master-card-tag">${escapeHtml(t)}</span>`
    ).join('');

    const contactFull = m.contact ? formatContactFull(m.contactType, m.contact) : '—';
    const isSelected = !!__masterSelectedKeys[m.key];

    const circleHtml = __masterManageMode
      ? `<div class="master-select-circle" onclick="event.stopPropagation();toggleMasterSelect('${key}')" title="选择">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/>
             ${isSelected ? '<polyline points="8 12 11 15 16 9"/>' : ''}
           </svg>
         </div>`
      : '';

    const delHtml = __masterManageMode
      ? ''
      : `<button type="button" class="master-card-del"
                 onclick="event.stopPropagation();askDeleteMaster('${key}')"
                 title="删除此单主">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
             <path d="M3 6 H21"/>
             <path d="M8 6 V4 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V6"/>
             <path d="M6 6 L7 20 a2 2 0 0 0 2 2 h6 a2 2 0 0 0 2 -2 L17 6"/>
             <path d="M10 11 V17"/>
             <path d="M14 11 V17"/>
           </svg>
         </button>`;

    const cardOnclick = __masterManageMode
      ? `onclick="toggleMasterSelect('${key}')"`
      : `onclick="openMasterDetail('${key}')"`;

    return `
      <div class="master-card ${isSelected ? 'is-selected' : ''}" ${cardOnclick}>
        ${circleHtml}
        <div class="master-card-body">
          <div class="master-card-title">
            ${escapeHtml(m.clientName || m.clientId || '未知单主')}
            ${tagsHtml}
          </div>
          <div class="master-card-meta">
            <span class="meta-item">ID：<strong>${escapeHtml(m.clientId || '—')}</strong></span>
            <span class="meta-item">联系方式：<strong>${escapeHtml(contactFull)}</strong></span>
            <span class="meta-item">累计订单：<strong>${m.orderCount}</strong></span>
          </div>
        </div>
        <div class="master-card-side">
          <div class="side-label">累计消费</div>
          <div>${fmt(m.totalIncome)}</div>
        </div>
        ${delHtml}
      </div>`;
  }).join('') + '</div>';

  updateMasterManageBar();
}


/* ---------- 管理模式 ---------- */

function toggleMasterManageMode() {
  __masterManageMode = !__masterManageMode;
  __masterSelectedKeys = {};

  const bar = $('masterManageBar');
  if (bar) bar.style.display = __masterManageMode ? 'flex' : 'none';

  const btn = $('masterManageBtn');
  if (btn) btn.textContent = __masterManageMode ? '退出' : '管理';

  updateMasterManageBar();
  renderMasterList();
}

function exitMasterManageMode() {
  __masterManageMode = false;
  __masterSelectedKeys = {};

  const bar = $('masterManageBar');
  if (bar) bar.style.display = 'none';

  const btn = $('masterManageBtn');
  if (btn) btn.textContent = '管理';

  renderMasterList();
}

function toggleMasterSelect(key) {
  if (!__masterManageMode) return;
  if (__masterSelectedKeys[key]) {
    delete __masterSelectedKeys[key];
  } else {
    __masterSelectedKeys[key] = true;
  }
  renderMasterList();
}

function toggleAllMasterSelect() {
  const list = getMasterList().filter(m => !isMasterHidden(m.key));
  const q = ($('masterSearch') ? $('masterSearch').value : '').trim().toLowerCase();

  let filtered = list.filter(m => {
    if (q) {
      const s = (m.clientId + ' ' + m.clientName + ' ' + (m.contact || '') + ' ' + (m.note || '') + ' ' + (m.tags || '')).toLowerCase();
      if (s.indexOf(q) === -1) return false;
    }
    if (__masterFilter) {
      if (__masterFilter.type === 'orders') {
        if ((m.orderCount || 0) < __masterFilter.value) return false;
      } else if (__masterFilter.type === 'amount') {
        if ((m.totalIncome || 0) < __masterFilter.value) return false;
      }
    }
    return true;
  });

  const keys = filtered.map(m => m.key);
  const allSelected = keys.length > 0 && keys.every(k => __masterSelectedKeys[k]);

  if (allSelected) {
    keys.forEach(k => { delete __masterSelectedKeys[k]; });
  } else {
    keys.forEach(k => { __masterSelectedKeys[k] = true; });
  }
  renderMasterList();
}

function updateMasterManageBar() {
  const countEl = $('masterSelectedCount');
  const delBtn = $('masterBatchDeleteBtn');
  const selAllBtn = $('masterSelectAllBtn');

  const selCount = Object.keys(__masterSelectedKeys).length;
  if (countEl) countEl.textContent = '已选择 ' + selCount + ' 位';
  if (delBtn) delBtn.disabled = selCount === 0;

  if (selAllBtn) {
    const list = getMasterList().filter(m => !isMasterHidden(m.key));
    if (list.length === 0) {
      selAllBtn.textContent = '全选';
    } else {
      const allSelected = list.every(m => __masterSelectedKeys[m.key]);
      selAllBtn.textContent = allSelected ? '取消全选' : '全选';
    }
  }
}

function confirmMasterBatchDelete() {
  const keys = Object.keys(__masterSelectedKeys);
  if (!keys.length) {
    showSimpleAlert('提示', '请先勾选要删除的单主。');
    return;
  }

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>删除单主</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;">确定删除选中的 <strong>${keys.length}</strong> 位单主吗？</p>
          <p style="font-size:12px;color:var(--ink-soft);margin:0 0 10px;line-height:1.7;">
            仅从单主列表移除，<strong>不会</strong>删除其关联订单、流水或统计数据。<br>
            若想恢复显示，可在「添加」里重新填写同名 ID。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="doMasterBatchDelete()">确定删除</button>
          </div>
        </div>
      </div>
    </div>`;
}

function doMasterBatchDelete() {
  const keys = Object.keys(__masterSelectedKeys);
  const list = getMasterList();

  keys.forEach(key => {
    const m = list.find(x => x.key === key);
    if (!m) return;
    if (m.clientId) {
      deleteManualMaster(m.clientId);
      deleteMasterOverride(m.clientId);
    }
    hideMaster(key);
  });

  __masterSelectedKeys = {};
  closeModal();

  showSimpleAlert('已删除', '已从列表移除选中的单主。订单和统计不受影响。');
  renderMasterList();
  updateMasterManageBar();
}


/* ---------- 删除单主（单个） ---------- */

function askDeleteMaster(key) {
  const list = getMasterList();
  const m = list.find(x => x.key === key);
  if (!m) return;

  const name = m.clientName || m.clientId || '未知单主';

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>删除单主</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;">确定删除单主「<strong>${escapeHtml(name)}</strong>」吗？</p>
          <p style="font-size:12px;color:var(--ink-soft);margin:0 0 10px;line-height:1.7;">
            仅从单主列表移除，<strong>不会</strong>删除其关联订单、流水或统计数据。<br>
            若想恢复显示，可在「添加」里重新填写同名 ID。
          </p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" style="background:var(--red);border-color:var(--red);" onclick="confirmDeleteMaster('${escapeAttr(key)}')">确定删除</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmDeleteMaster(key) {
  const list = getMasterList();
  const m = list.find(x => x.key === key);
  if (!m) { closeModal(); return; }

  if (m.clientId) {
    deleteManualMaster(m.clientId);
    deleteMasterOverride(m.clientId);
  }
  hideMaster(key);

  closeModal();
  renderMasterList();
  showSimpleAlert('已删除', '单主已从列表移除，订单和统计不受影响。');
}


/* ---------- 添加单主 ---------- */

function openMasterAddModal() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>添加单主</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="master-add-grid">
            <div>
              <label>单主 ID <span class="required-mark">*</span></label>
              <input id="ma_clientId" placeholder="如：点点" maxlength="60" />
            </div>
            <div>
              <label>平台</label>
              <select id="ma_platform"></select>
            </div>
            <div class="is-full">
              <label>联系方式 <span class="required-mark">*</span></label>
              <div class="contact-type-row">
                <select id="ma_contactType" class="contact-type-select">
                  <option value="QQ">QQ</option>
                  <option value="VX">VX</option>
                </select>
                <input id="ma_contact" class="contact-account-input" placeholder="账号" maxlength="80" />
              </div>
            </div>
            <div class="is-full">
              <label>备注</label>
              <textarea id="ma_note" rows="3" placeholder="可选"></textarea>
            </div>
          </div>
          <p class="master-filter-hint">ID 与联系方式必填，其他可稍后编辑。</p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn" onclick="confirmMasterAdd()">确定</button>
          </div>
        </div>
      </div>
    </div>`;

  renderMasterAddPlatformSelect();

  setTimeout(() => { const el = $('ma_clientId'); if (el) el.focus(); }, 50);
}

function renderMasterAddPlatformSelect() {
  const sel = $('ma_platform');
  if (!sel) return;
  const list = getPlatformsClean();
  sel.innerHTML = `<option value="">（不填）</option>` +
    list.map(p => `<option value="${escapeAttr(p)}">${escapeHtml(p)}</option>`).join('');
}

function confirmMasterAdd() {
  const clientId = ($('ma_clientId') ? $('ma_clientId').value : '').trim();
  const platform = ($('ma_platform') ? $('ma_platform').value : '').trim();
  const contactType = $('ma_contactType') ? normalizeContactType($('ma_contactType').value) : 'QQ';
  const contact  = ($('ma_contact') ? $('ma_contact').value : '').trim();
  const note     = ($('ma_note') ? $('ma_note').value : '').trim();

  if (!clientId) {
    showSimpleAlert('提示', '请填写「单主 ID」。');
    if ($('ma_clientId')) $('ma_clientId').focus();
    return;
  }
  if (!contact) {
    showSimpleAlert('提示', '请填写「联系方式」。');
    if ($('ma_contact')) $('ma_contact').focus();
    return;
  }

  const existing = getMasterList().find(m => m.clientId === clientId && m.key !== MASTER_UNKNOWN_KEY);

  const doSave = () => {
    const cur = getMasterOverride(clientId) || {};
    addManualMaster({ clientId, platform, contact, contactType, note });
    setMasterOverride(clientId, {
      platform: platform || cur.platform || '',
      contact: contact || cur.contact || '',
      contactType: contactType,
      note: note !== undefined ? note : (cur.note || ''),
      tags: cur.tags || '',
    });
    unhideMaster(clientId);
    closeModal();
    showSimpleAlert('已添加', '单主「' + escapeHtml(clientId) + '」已保存。');
    renderMasterList();
  };

  if (existing) {
    const ok = confirm('单主「' + clientId + '」已存在，是否覆盖其信息？');
    if (!ok) return;
    doSave();
  } else {
    doSave();
  }
}


/* ---------- 筛选单主 ---------- */

function openMasterFilterModal() {
  const f = __masterFilter || { type: 'orders', value: 1 };

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>筛选单主</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="master-filter-tabs">
            <button type="button" class="master-filter-tab ${f.type === 'orders' ? 'active' : ''}" data-filter="orders" onclick="onMasterFilterTabChange('orders')">按订单数</button>
            <button type="button" class="master-filter-tab ${f.type === 'amount' ? 'active' : ''}" data-filter="amount" onclick="onMasterFilterTabChange('amount')">按金额</button>
          </div>

          <div class="master-filter-row">
            <div class="master-filter-op-wrap">
              <span class="master-filter-op">≥</span>
            </div>
            <div class="master-filter-value">
              <input type="number" step="1" min="0" id="masterFilterValue" value="${f.value}" />
            </div>
          </div>

          <p class="master-filter-hint">
            按订单数：只显示累计订单数 ≥ 输入值的单主（输入整数）。<br>
            按金额：只显示累计消费（实收 − 退款）≥ 输入值的单主。
          </p>

          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn ghost" onclick="clearMasterFilter()">清除筛选</button>
            <button class="action-btn" onclick="applyMasterFilter()">确定</button>
          </div>
        </div>
      </div>
    </div>`;

  window.__masterFilterModal = { type: f.type, value: f.value };
}


function onMasterFilterTabChange(type) {
  window.__masterFilterModal = window.__masterFilterModal || {};
  window.__masterFilterModal.type = type;
  document.querySelectorAll('.master-filter-tab').forEach(btn => {
    if (btn.dataset.filter === type) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}


function applyMasterFilter() {
  const type = window.__masterFilterModal ? window.__masterFilterModal.type : 'orders';
  const raw = $('masterFilterValue') ? $('masterFilterValue').value : '0';
  let value = Number(raw);
  if (!isFinite(value) || value < 0) value = 0;
  if (type === 'orders') value = Math.round(value);

  __masterFilter = { type, value };
  closeModal();
  renderMasterList();
}


function clearMasterFilter() {
  __masterFilter = null;
  closeModal();
  renderMasterList();
}


/* ---------- 详情页 ---------- */

function openMasterDetail(key) {
  const list = getMasterList();
  const m = list.find(x => x.key === key);
  if (!m) { alert('未找到单主'); return; }

  __currentMasterKey = key;
  __masterEditMode = false;

  $('mdTitle').textContent = m.clientName || m.clientId || '单主详情';
  $('mdClientId').value = m.clientId || '—';

  renderMasterPlatformSelect();
  const sel = $('mdPlatform');
  if (sel) {
    const opts = Array.from(sel.options).map(o => o.value);
    if (m.platform && opts.indexOf(m.platform) === -1) {
      const opt = document.createElement('option');
      opt.value = m.platform;
      opt.textContent = m.platform;
      sel.appendChild(opt);
    }
    sel.value = m.platform || '';
  }

  if ($('mdContactType')) $('mdContactType').value = normalizeContactType(m.contactType);
  $('mdContact').value  = m.contact  || '';

  $('mdFirstOrder').value = m.firstOrderDate || '—';
  $('mdLastOrder').value  = m.lastOrderDate  || '—';
  $('mdOrderCount').value = m.orderCount + ' 份';
  $('mdNote').value = m.note || '';
  $('mdTags').value = m.tags || '';

  $('mdIncome').textContent = fmt(m.totalIncome);
  $('mdPending').textContent = fmt(m.pendingAmount);
  $('mdCompletedCount').textContent = m.completedCount + ' 份';
  $('mdCancelledDiscarded').textContent = m.cancelledCount + ' / ' + m.discardedCount;

  renderMasterOrders(m);
  renderMasterReceiptFolder(m);

  setMasterEditMode(false);
  showPage('pageMasterDetail');
}


function renderMasterPlatformSelect() {
  const sel = $('mdPlatform');
  if (!sel) return;
  const list = getPlatformsClean();
  const cur = sel.value || '';
  sel.innerHTML = `<option value="">（不填）</option>` +
    list.map(p => `<option value="${escapeAttr(p)}">${escapeHtml(p)}</option>`).join('');
  if (cur) sel.value = cur;
}


function setMasterEditMode(on) {
  __masterEditMode = !!on;

  const editableInputIds = ['mdClientId', 'mdContact', 'mdNote', 'mdTags'];
  editableInputIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.readOnly = !on;
  });

  if ($('mdPlatform')) $('mdPlatform').disabled = !on;
  if ($('mdContactType')) $('mdContactType').disabled = !on;

  const editBtn = $('mdEditBtn');
  const saveBtn = $('mdSaveBtn');
  if (editBtn) editBtn.style.display = on ? 'none' : '';
  if (saveBtn) saveBtn.style.display = on ? '' : 'none';
}


function toggleMasterEdit() { setMasterEditMode(true); }


function saveMasterDetail() {
  if (!__currentMasterKey) return;

  const list = getMasterList();
  const m = list.find(x => x.key === __currentMasterKey);
  if (!m) return;

  if (__currentMasterKey === MASTER_UNKNOWN_KEY) {
    showSimpleAlert('提示', '未知单主是自动聚合的，无法写入备注。<br>请给订单填写完整的单主 ID。');
    return;
  }

  const newClientId = ($('mdClientId').value || '').trim();
  const platform = ($('mdPlatform').value || '').trim();
  const contactType = $('mdContactType') ? normalizeContactType($('mdContactType').value) : 'QQ';
  const contact  = ($('mdContact').value  || '').trim();
  const note     = ($('mdNote').value     || '').trim();
  const tags     = ($('mdTags').value     || '').trim();

  if (!newClientId) {
    showSimpleAlert('提示', '单主 ID 不能为空。');
    return;
  }

  const oldClientId = m.clientId || '';

  if (newClientId !== oldClientId) {
    const conflict = getMasterList().find(x => x.clientId === newClientId && x.key !== __currentMasterKey);
    if (conflict) {
      showSimpleAlert('提示', '已存在 ID 为「' + escapeHtml(newClientId) + '」的单主，无法修改。');
      return;
    }

    if ((m.orderCount || 0) > 0) {
      const ok = confirm(
        '该单主有关联订单。修改 ID 只会修改单主信息，订单中的原 ID「' + oldClientId + '」不会改变。\n\n' +
        '确定继续吗？'
      );
      if (!ok) return;
    }

    if (oldClientId) {
      deleteManualMaster(oldClientId);
      deleteMasterOverride(oldClientId);
      hideMaster(oldClientId);
    }

    addManualMaster({ clientId: newClientId, platform, contact, contactType, note });
    setMasterOverride(newClientId, { platform, contact, contactType, note, tags });
    unhideMaster(newClientId);

    __currentMasterKey = newClientId;
  } else {
    const cur = getMasterOverride(oldClientId) || {};
    addManualMaster({ clientId: oldClientId, platform, contact, contactType, note });
    setMasterOverride(oldClientId, {
      platform: platform || cur.platform || '',
      contact: contact || cur.contact || '',
      contactType: contactType,
      note: note !== undefined ? note : (cur.note || ''),
      tags: tags !== undefined ? tags : (cur.tags || ''),
    });
    unhideMaster(oldClientId);
  }

  setMasterEditMode(false);
  showSimpleAlert('已保存', '单主信息已更新。');

  openMasterDetail(__currentMasterKey);
  renderMasterList();
}


function backToMasterList() {
  __currentMasterKey = null;
  __masterEditMode = false;
  renderMasterList();
  showPage('pageMaster');
}


function copyMasterContact() {
  const v = $('mdContact') ? ($('mdContact').value || '') : '';
  if (!v || v === '—') { alert('没有可复制的内容'); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(v).then(() => {
      alert('已复制账号：' + v);
    }).catch(() => fallbackCopy(v));
  } else {
    fallbackCopy(v);
  }
}


function renderMasterOrders(m) {
  const box = $('mdOrdersList');
  if (!box) return;

  if (!m.orders || !m.orders.length) {
    box.innerHTML = '<div class="master-orders-empty">暂无订单记录</div>';
    return;
  }

  const sorted = m.orders.slice().sort((a, b) => {
    const da = a.date || a.deadline || '';
    const db = b.date || b.deadline || '';
    return db.localeCompare(da);
  });

  box.innerHTML = '<div class="master-orders-list">' + sorted.map(o => {
    let statusText = '';
    let statusCls = '';
    if (o.status === 'active')      { statusText = '待完成'; statusCls = 'is-active'; }
    else if (o.status === 'pending'){ statusText = '待结'; statusCls = 'is-pending'; }
    else if (o.status === 'placeholder') { statusText = '待开单'; statusCls = 'is-active'; }
    else if (o.status === 'completed') { statusText = '已结'; statusCls = 'is-completed'; }
    else if (o.status === 'cancelled') { statusText = '已撤'; statusCls = 'is-cancelled'; }
    else if (o.status === 'discarded') { statusText = '废稿'; statusCls = 'is-discarded'; }

    const clickAttr = o.todoId
      ? ` onclick="openTodoDetailFromMaster('${escapeAttr(o.todoId)}')"`
      : '';

    return `
      <div class="master-order-row"${clickAttr}>
        <div class="master-order-row-body">
          <div class="master-order-row-title">${escapeHtml(o.title)}</div>
          <div class="master-order-row-meta">
            <span>接单：${escapeHtml(o.date || '—')}</span>
            ${o.deadline ? `<span>${o.status === 'completed' ? '完成' : (o.status === 'cancelled' ? '撤单' : (o.status === 'discarded' ? '作废' : '截稿'))}：${escapeHtml(o.deadline)}</span>` : ''}
            <span>金额：${fmt(o.amount || 0)}</span>
          </div>
        </div>
        <div class="master-order-row-status ${statusCls}">${statusText}</div>
      </div>`;
  }).join('') + '</div>';
}


function openTodoDetailFromMaster(todoId) {
  const t = getTodos().find(x => x.id === todoId);
  if (t) {
    openTodoDetail(todoId);
    return;
  }
  showSimpleAlert('提示', '该订单已结单 / 撤单 / 废稿，可在对应页面查看详情。');
}


async function renderMasterReceiptFolder(m) {
  const box = $('mdReceiptFolder');
  if (!box) return;

  if (!m.receipts || !m.receipts.length) {
    box.innerHTML = '<div class="master-receipt-folder-empty">暂无小票图片</div>';
    return;
  }

  box.innerHTML = m.receipts.map((r, i) => `
    <div class="master-receipt-thumb" id="mrThumb_${i}" data-idx="${i}">
      <img id="mrThumbImg_${i}" alt="${escapeAttr(r.type)}" />
    </div>
  `).join('');

  for (let i = 0; i < m.receipts.length; i++) {
    const r = m.receipts[i];
    if (!r || !r.src) continue;
    try {
      const url = await resolveImageSrc(r.src);
      if (!url) continue;
      const thumb = $('mrThumb_' + i);
      const img = $('mrThumbImg_' + i);
      if (!thumb || !img) continue;
      img.src = url;
      thumb.onclick = () => openImageFullscreen(url);
    } catch (e) {}
  }
}


/* ---------- 小票页：单主选择弹窗 ---------- */

function openClientPickerForReceipt() {
  const list = getMasterList()
    .filter(m => !isMasterHidden(m.key) && m.clientId && m.key !== MASTER_UNKNOWN_KEY);

  list.sort((a, b) => {
    const da = a.lastOrderDate || '';
    const db = b.lastOrderDate || '';
    if (da !== db) return db.localeCompare(da);
    return (b.totalIncome || 0) - (a.totalIncome || 0);
  });

  if (!list.length) {
    $('modalRoot').innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3>选择单主</h3>
            <button class="icon-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="client-picker-empty">
              还没有单主档案。<br>
              你可以到「单主」页面点「添加」创建，或在下方直接手工填写。
            </div>
            <div class="actions" style="justify-content:flex-end;margin-top:18px;">
              <button class="action-btn" onclick="closeModal()">关闭</button>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  const rows = list.map(m => {
    const key = escapeAttr(m.key);
    const contactFull = m.contact ? formatContactFull(m.contactType, m.contact) : '';

    const rawName = String(m.clientName || '').trim();
    const rawId   = String(m.clientId   || '').trim();
    const titleText = (rawName && rawName !== rawId) ? rawName : (rawId || '未知单主');
    const showIdInSub = !!(rawName && rawName !== rawId);

    return `
      <div class="client-picker-row" onclick="pickClientFromPicker('${key}')">
        <div class="cp-text">
          <div class="cp-name">${escapeHtml(titleText)}</div>
          <div class="cp-sub">
            ${showIdInSub ? `<span>ID：<strong>${escapeHtml(rawId || '—')}</strong></span>` : ''}
            ${m.platform ? `<span>平台：<strong>${escapeHtml(m.platform)}</strong></span>` : ''}
            ${contactFull ? `<span>联系：<strong>${escapeHtml(contactFull)}</strong></span>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>选择单主</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 12px;">
            点击一位单主，自动填入 ID 与平台。
          </p>
          <div class="client-picker-list">${rows}</div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}


function pickClientFromPicker(key) {
  const list = getMasterList();
  const m = list.find(x => x.key === key);
  if (!m) { closeModal(); return; }

  if ($('client')) $('client').value = m.clientId || '';

  if (m.platform && $('platform')) {
    const sel = $('platform');
    const opts = Array.from(sel.options).map(o => o.value);
    if (opts.indexOf(m.platform) === -1) {
      const opt = document.createElement('option');
      opt.value = m.platform;
      opt.textContent = m.platform;
      sel.appendChild(opt);
    }
    sel.value = m.platform;
  }

  closeModal();
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-52] 票夹渲染                                     ║
   ╚══════════════════════════════════════════════════════╝ */

var __ticketFolderSort = 'desc';
var __ticketFolderItems = [];
var __ticketFolderRendered = 0;
var TICKET_FOLDER_PAGE_SIZE = 30;

function toggleTicketFolderSort() {
  __ticketFolderSort = (__ticketFolderSort === 'desc') ? 'asc' : 'desc';
  const btn = $('ticketFolderSortBtn');
  if (btn) btn.textContent = (__ticketFolderSort === 'desc') ? '最新优先' : '最早优先';
  renderTicketFolder();
}

function backFromTicketFolder() {
  showPage('pageMain');
}

function collectTicketItems() {
  const items = [];

  getCompleted().forEach(c => {
    if (!c.receiptImage) return;
    items.push({
      ref: c.receiptImage,
      clientId: c.clientId || '',
      clientName: c.clientName || '未命名',
      date: c.completedDate || c.orderDate || '',
      createdAt: c.createdAt || 0,
    });
  });

  getTodos().forEach(t => {
    if (!t.receiptImage) return;
    if (t.status !== 'pending') return;
    items.push({
      ref: t.receiptImage,
      clientId: t.clientId || '',
      clientName: t.clientName || '未命名',
      date: t.deadline || t.orderDate || '',
      createdAt: t.createdAt || 0,
    });
  });

  return items;
}

function renderTicketFolder() {
  const grid = $('ticketFolderGrid');
  const empty = $('ticketFolderEmpty');
  const noMatch = $('ticketFolderNoMatch');
  const countEl = $('ticketFolderCount');

  if (!grid) return;

  const all = collectTicketItems();

  const q = ($('ticketFolderSearch') ? $('ticketFolderSearch').value : '').trim().toLowerCase();
  let items = all;
  if (q) {
    items = items.filter(it => {
      const hay = (it.clientId + ' ' + it.clientName + ' ' + (it.date || '')).toLowerCase();
      return hay.indexOf(q) > -1;
    });
  }

  items.sort((a, b) => {
    const ca = a.createdAt || 0;
    const cb = b.createdAt || 0;
    if (ca !== cb) {
      return __ticketFolderSort === 'asc' ? ca - cb : cb - ca;
    }
    const da = a.date || '';
    const db = b.date || '';
    if (da !== db) {
      return __ticketFolderSort === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
    }
    return 0;
  });

  __ticketFolderItems = items;
  __ticketFolderRendered = 0;

  if (countEl) {
    countEl.textContent = items.length > 0 ? ('（' + items.length + ' 张）') : '';
  }

  if (all.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = '';
    if (noMatch) noMatch.style.display = 'none';
    updateTicketFolderMoreBtn();
    return;
  }

  if (items.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'none';
    if (noMatch) noMatch.style.display = '';
    updateTicketFolderMoreBtn();
    return;
  }

  if (empty) empty.style.display = 'none';
  if (noMatch) noMatch.style.display = 'none';

  grid.innerHTML = '';
  appendTicketItemsBatch();
}

function appendTicketItemsBatch() {
  const grid = $('ticketFolderGrid');
  if (!grid) return;

  const start = __ticketFolderRendered;
  const end = Math.min(start + TICKET_FOLDER_PAGE_SIZE, __ticketFolderItems.length);
  if (start >= end) {
    updateTicketFolderMoreBtn();
    return;
  }

  const slice = __ticketFolderItems.slice(start, end);

  const wrap = document.createElement('div');
  wrap.style.display = 'contents';
  wrap.innerHTML = slice.map((it, i) => {
    const idx = start + i;
    return `
      <div class="ticket-folder-thumb" id="tfThumb_${idx}">
        <img id="tfImg_${idx}" alt="${escapeAttr(it.clientName)}" loading="lazy" />
        <div class="ticket-folder-thumb-meta">
          <span class="tf-meta-name">${escapeHtml(it.clientName || it.clientId || '—')}</span>
          <span class="tf-meta-date">${escapeHtml(it.date || '')}</span>
        </div>
      </div>`;
  }).join('');
  grid.appendChild(wrap);

  slice.forEach((it, i) => {
    fillTicketThumb(start + i, it);
  });

  __ticketFolderRendered = end;
  updateTicketFolderMoreBtn();
}

function loadMoreTicketFolder() {
  appendTicketItemsBatch();
}

function updateTicketFolderMoreBtn() {
  const wrap = $('ticketFolderMoreWrap');
  if (!wrap) return;
  if (__ticketFolderRendered < __ticketFolderItems.length) {
    wrap.style.display = '';
  } else {
    wrap.style.display = 'none';
  }
}

async function fillTicketThumb(idx, item) {
  const img = $('tfImg_' + idx);
  const thumb = $('tfThumb_' + idx);
  if (!img || !thumb || !item) return;

  try {
    const url = await resolveImageSrc(item.ref);
    if (!url) {
      thumb.style.background = '#eef1f4';
      return;
    }
    img.src = url;
    thumb.onclick = () => openImageFullscreen(url);
  } catch (e) {
    thumb.style.background = '#eef1f4';
  }
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-53] 更新公告                                     ║
   ╚══════════════════════════════════════════════════════╝ */

/* 公告内容表：key = 版本号，value = { title, html }
   新增版本时在这里加一条即可。 */
const ANNOUNCEMENTS = {
  '1.0.0': {
    title: '票夹功能上线',
    html: `
      <p>本次更新内容：</p>
      <ul style="padding-left:20px;line-height:1.85;">
        <li><strong>票夹上线</strong>：首页右上角进入票夹，可集中查看所有小票。</li>
        <li><strong>备忘录上线</strong>：首页右上角可记录待办，完成后自动移除。</li>
        <li><strong>图片存储升级</strong>：素材 / 要求 / 小票改为原图存储，不再压缩。</li>
        <li><strong>预设分组</strong>：稿件预设支持分组管理，可拖动排序。</li>
      </ul>
      <p style="margin-top:12px;">已有订单数据会自动升级，无需手动处理。</p>
    `,
  },
  '1.0.1': {
    title: '体验全面升级',
    html: `
      <p>本次更新内容：</p>
      <ul style="padding-left:20px;line-height:1.85;">
                <li><strong>用户手册上线</strong>：设置 → 工具箱 → 用户手册。分模块浏览，含常见问题与全部算法说明。</li>
        <li><strong>预设拖动重做</strong>：稿件预设支持整卡拖动排序，动画更平滑柔和。</li>
        <li><strong>分组「＋」按钮</strong>：每个预设分组标题栏新增「＋」，可一键把未分组预设加入该组。</li>
        <li><strong>备忘录支持执行日期</strong>：可为待办指定执行日期，过期未完成会红色提醒。</li>
        <li><strong>单主列表性能提升</strong>：数据量大时打开、搜索、筛选不再卡顿。</li>
        <li><strong>更新公告换新样式</strong>：卡片式弹窗，层级更清晰。</li>
      </ul>
      <p style="margin-top:12px;">已有订单数据会自动升级，无需手动处理。</p>
    `,
  },
  '1.0.2': {
    title: '价目表上线',
    html: `
      <p>本次更新内容：</p>
      <ul style="padding-left:20px;line-height:1.85;">
        <li><strong>价目表上线</strong>：支持模板、分类、附加模块，可导出图片。</li>
        <li><strong>实时预览</strong>：设置页右侧（手机在顶部）边改边看。</li>
        <li><strong>增项与节点共存</strong>：同一稿件可同时加增项和按节点计费。</li>
        <li><strong>生成前校验</strong>：未填写身份 / ID 时会提醒。</li>
      </ul>
      <p style="margin-top:12px;">已有数据会自动升级，无需手动处理。</p>
    `,
  },
};
/* 拿到当前用户应该看到的公告版本
   - 只展示最新的那一条（按版本号比较）
   - 若已读版本 = 当前版本，返回 null */
function getPendingAnnouncement() {
  const seen = localStorage.getItem(ANNOUNCEMENT_SEEN_KEY) || '';
  const current = APP_VERSION;
  if (seen === current) return null;

  const item = ANNOUNCEMENTS[current];
  if (!item) return null;

  return { version: current, title: item.title, html: item.html };
}

function markAnnouncementSeen(version) {
  try {
    localStorage.setItem(ANNOUNCEMENT_SEEN_KEY, String(version || ''));
  } catch (e) {}
}

function showAnnouncementModal(ann) {
  if (!ann) return;

  const version = ann.version || APP_VERSION;

  $('modalRoot').innerHTML = `
    <div class="ann-overlay">
      <div class="ann-card">
        <div class="ann-card-head">
          <div class="ann-card-badge">📢 更新公告</div>
          <div class="ann-card-title">${escapeHtml(ann.title || '版本更新')}</div>
          <div class="ann-card-version">v${escapeHtml(version)}</div>
        </div>
        <div class="ann-card-body">
          ${ann.html || '<p>本次更新暂无说明。</p>'}
        </div>
        <div class="ann-card-foot">
          <button type="button" class="ann-card-btn" onclick="closeAnnouncement()">我知道了</button>
        </div>
      </div>
    </div>`;

  window.__pendingAnnouncement = ann;
}

function closeAnnouncement() {
  const ann = window.__pendingAnnouncement;
  if (!ann) return;
  if (ann.version) markAnnouncementSeen(ann.version);
  window.__pendingAnnouncement = null;
  closeModal();
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-54] 启动初始化                                   ║
   ╚══════════════════════════════════════════════════════╝ */

async function autoMigrateOnStartup() {
  const fromV = getSchemaVersion();
  const toV = SCHEMA_VERSION;

  if (fromV === 0) {
    setSchemaVersion(toV);
    return;
  }

  if (fromV > toV) {
    console.warn('[迁移] 本地版本高于代码版本，跳过');
    return;
  }

  if (fromV === toV) return;

  const ctx = createMigrationContext();
  for (let v = fromV + 1; v <= toV; v++) {
    const fn = MIGRATIONS[v];
    if (typeof fn === 'function') {
      try { fn(ctx); }
      catch (e) {
        ctx.report.push('迁移到 v' + v + ' 出错：' + (e && e.message ? e.message : '未知'));
      }
    }
  }
  setSchemaVersion(toV);

  try {
    const migrated = await migrateImagesToIndexedDB(ctx);
    if (migrated > 0) {
      ctx.report.push('图片搬迁：' + migrated + ' 张已迁入 IndexedDB');
    }
  } catch (e) {}

  appendMigrationLog({ from: fromV, to: toV, auto: true });

  if (ctx.report.length) {
    console.log('[迁移报告]', ctx.report);
  }
}

async function initStorageOnStartup() {
  try {
    await openIDB();
  } catch (e) {
    console.warn('[IDB] 初始化失败，将降级为 base64 存储', e);
  }

  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      const already = await navigator.storage.persisted();
      if (!already) {
        await navigator.storage.persist();
      }
    }
  } catch (e) {}
}

function finalizeFontDot() {
  setTimeout(() => { try { updateFontSizeDot(); } catch (e) {} }, 80);
}

/* ---------- 启动流程 ---------- */
(async function initApp() {
  /* 1. 打开 IDB */
  await initStorageOnStartup();

  /* 2. 自动迁移老数据 */
  await autoMigrateOnStartup();

  /* 3. 初始化各模块 */
  initScheduleModule();
  initStatsModule();

  (function initMasterSortDefault() {
    document.querySelectorAll('.master-sort-btn').forEach(btn => {
      if (btn.dataset.sort === __masterSort) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  })();

  (function initSchemaVersionFallback() {
    const v = localStorage.getItem(SCHEMA_VERSION_KEY);
    if (v === null) setSchemaVersion(SCHEMA_VERSION);
  })();

  finalizeFontDot();

  /* 4. 更新公告（迁移完成后再弹） */
  const pending = getPendingAnnouncement();
  if (pending) {
    setTimeout(() => showAnnouncementModal(pending), 400);
  }
})();
/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-18-PATCH v3.3-Soft] 预设拖动（柔和过渡版）       ║
   ║                                                      ║
   ║  相比 v3.3：动画时长拉长约 55%，缓动曲线更舒缓。      ║
   ║   · 其他卡片让位：0.28s + cubic-bezier(0.25, 0.8, 0.35, 1)
   ║   · 松手归位：0.34s + 同款曲线                        ║
   ╚══════════════════════════════════════════════════════╝ */

(function patchPresetDragV33Soft() {

  /* ===== 0. 拖动日志 ===== */
  window.__presetDragLog = {
    down: null, move: null, up: null, cancel: null,
    activated: false, finalOrder: null,
  };

  /* ===== 1. 拆除旧监听器 ===== */
  const box = document.getElementById('presetCards');

  const oldDown   = window.onPresetCardPointerDown;
  const oldMove   = window.onPresetCardPointerMove;
  const oldUp     = window.onPresetCardPointerUp;
  const oldCancel = window.onPresetCardPointerCancel;

  if (box) {
    if (typeof oldDown === 'function')   box.removeEventListener('pointerdown', oldDown);
    if (typeof oldMove === 'function')   window.removeEventListener('pointermove', oldMove);
    if (typeof oldUp === 'function')     window.removeEventListener('pointerup', oldUp);
    if (typeof oldCancel === 'function') window.removeEventListener('pointercancel', oldCancel);
    box.__presetDragBound = false;
  }

  /* ===== 2. 覆盖新版函数 ===== */

  window.__presetDrag = null;

  window.bindPresetCardDrag = function () {
    const b = document.getElementById('presetCards');
    if (!b || b.__presetDragBound) return;
    b.__presetDragBound = true;

    b.addEventListener('pointerdown', window.onPresetCardPointerDown);
    window.addEventListener('pointermove', window.onPresetCardPointerMove, { passive: false });
    window.addEventListener('pointerup', window.onPresetCardPointerUp);
    window.addEventListener('pointercancel', window.onPresetCardPointerCancel);
  };

  window.onPresetCardPointerDown = function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    if (e.target.closest('.preset-card-btn')) return;
    if (e.target.closest('input, textarea, select, button')) return;

    const card = e.target.closest('.preset-card');
    if (!card) return;

    const presetName = card.dataset.presetName;
    const groupId = card.dataset.groupId;
    if (!presetName || !groupId) return;

    if (window.__presetDrag) {
      const old = window.__presetDrag;
      if (old.card) {
        old.card.classList.remove('is-dragging');
        old.card.style.transform = '';
        old.card.style.zIndex = '';
        old.card.style.transition = '';
      }
      window.__presetDrag = null;
    }

    const rect = card.getBoundingClientRect();

    window.__presetDrag = {
      card: card,
      presetName: presetName,
      groupId: groupId,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      active: false,
      moveThreshold: 4,
      cardRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      lastTargetKey: '',
    };

    window.__presetDragLog.down = {
      target: (e.target.className || e.target.tagName || '').toString(),
      cardName: presetName,
      x: e.clientX, y: e.clientY,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
    };
    window.__presetDragLog.move = null;
    window.__presetDragLog.up = null;
    window.__presetDragLog.cancel = null;
    window.__presetDragLog.activated = false;
    window.__presetDragLog.finalOrder = null;
  };

  window.onPresetCardPointerMove = function (e) {
    const s = window.__presetDrag;
    if (!s) return;
    if (e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

    if (!window.__presetDragLog.move) {
      window.__presetDragLog.move = {
        x: e.clientX, y: e.clientY,
        pointerId: e.pointerId,
      };
    }

    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;

    /* 未激活：检查是否超过阈值 */
    if (!s.active) {
      if (Math.abs(dx) > s.moveThreshold || Math.abs(dy) > s.moveThreshold) {
        s.active = true;
        s.card.classList.add('is-dragging');
        document.body.classList.add('is-preset-dragging');
        s.card.style.zIndex = '9999';
        s.card.style.position = 'relative';
        /* 关掉这个卡片自身的 transition，避免跟随手指时有延迟 */
        s.card.style.transition = 'none';
        window.__presetDragLog.activated = true;
        if (navigator.vibrate) {
          try { navigator.vibrate(12); } catch (err) {}
        }
      }
      return;
    }

    e.preventDefault();

    /* ★ 被拖卡片跟随手指（同时应用一个轻微放大） */
    s.card.style.transform = 'translateY(' + dy + 'px) scale(1.02)';

    const groupBody = s.card.closest('.preset-group-body');
    if (!groupBody) return;

    /* 用「卡片初始中心 + 位移」作为判定点 */
    const draggedCenterY = s.cardRect.top + s.cardRect.height / 2 + dy;

    const siblings = Array.from(groupBody.querySelectorAll('.preset-card'))
      .filter(el => el !== s.card);

    let targetCard = null;
    let insertBefore = false;

    for (const sib of siblings) {
      const r = sib.getBoundingClientRect();
      const cy = r.top + r.height / 2;
      if (draggedCenterY < cy) {
        targetCard = sib;
        insertBefore = true;
        break;
      }
    }

    /* ★ 目标位置没变 → 不折腾 DOM */
    const targetName = targetCard ? targetCard.dataset.presetName : '__END__';
    const targetKey = targetName + '|' + (insertBefore ? 'before' : 'after');

    if (s.lastTargetKey === targetKey) return;
    s.lastTargetKey = targetKey;

    siblings.forEach(el => el.classList.remove('is-drop-target'));

    /* ★ FLIP 步骤 1：记录重排前，所有其他卡片的 top 位置 */
    const beforeTops = new Map();
    groupBody.querySelectorAll('.preset-card').forEach(el => {
      if (el === s.card) return;
      beforeTops.set(el, el.getBoundingClientRect().top);
    });

    /* 执行 DOM 重排 */
    if (targetCard) {
      targetCard.classList.add('is-drop-target');
      if (insertBefore) groupBody.insertBefore(s.card, targetCard);
      else              groupBody.insertBefore(s.card, targetCard.nextSibling);
    } else if (siblings.length) {
      groupBody.appendChild(s.card);
    }

    /* ★ FLIP 步骤 2：让其他卡片平滑"滑"到新位置（柔和版：0.28s） */
    groupBody.querySelectorAll('.preset-card').forEach(el => {
      if (el === s.card) return;

      const beforeTop = beforeTops.get(el);
      if (beforeTop === undefined) return;

      const afterTop = el.getBoundingClientRect().top;
      const deltaY = beforeTop - afterTop;
      if (Math.abs(deltaY) < 0.5) return;

      el.style.transition = 'none';
      el.style.transform = 'translateY(' + deltaY + 'px)';

      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.28s cubic-bezier(0.25, 0.8, 0.35, 1)';
        el.style.transform = '';
      });
    });
  };

  window.onPresetCardPointerUp = function (e) {
    const s = window.__presetDrag;
    if (!s) return;
    if (e && e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

    window.__presetDragLog.up = {
      x: e.clientX, y: e.clientY,
      pointerId: e.pointerId,
    };

    if (!s.active) {
      window.__presetDrag = null;
      return;
    }

    window.finishPresetDrag(s);
  };

  window.onPresetCardPointerCancel = function (e) {
    const s = window.__presetDrag;
    if (!s) return;
    if (e && e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

    window.__presetDragLog.cancel = {
      x: e.clientX, y: e.clientY,
      pointerId: e.pointerId,
    };

    if (!s.active) {
      window.__presetDrag = null;
      return;
    }

    window.finishPresetDrag(s);
  };

  window.finishPresetDrag = function (s) {
    const card = s.card;
    const groupBody = card.closest('.preset-group-body');

    document.body.classList.remove('is-preset-dragging');

    if (groupBody) {
      groupBody.querySelectorAll('.preset-card.is-drop-target')
        .forEach(el => el.classList.remove('is-drop-target'));
    }

    /* 读取当前 DOM 顺序 */
    let newOrder = [];
    if (groupBody) {
      newOrder = Array.from(groupBody.querySelectorAll('.preset-card'))
        .map(el => el.dataset.presetName);
    }
    window.__presetDragLog.finalOrder = newOrder.slice();

    /* ★ 松手：被拖卡片平滑归位（柔和版：0.34s） */
    card.style.transition = 'transform 0.34s cubic-bezier(0.25, 0.8, 0.35, 1)';
    card.style.transform = 'translateY(0) scale(1)';

    setTimeout(function () {
      card.style.transition = '';
      card.style.transform = '';
      card.style.zIndex = '';
      card.style.position = '';
      card.classList.remove('is-dragging');
    }, 360);

    /* 保存数据 */
    if (!groupBody) {
      window.__presetDrag = null;
      return;
    }

    const groupId = s.groupId;
    const allPresets = getPresets();

    const groupPresets = newOrder
      .map(name => allPresets.find(p => p.name === name))
      .filter(Boolean);

    if (groupPresets.length !== newOrder.length) {
      window.__presetDrag = null;
      return;
    }

    const groupIdForCheck = (groupId === '__UNGROUPED__') ? '' : groupId;
    const others = allPresets.filter(p => {
      const pg = p.groupId || '';
      return pg !== groupIdForCheck;
    });

    const groups = getPresetGroups().slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const ordered = [];

    groups.forEach(g => {
      if (g.id === groupIdForCheck) {
        groupPresets.forEach(p => ordered.push(p));
      } else {
        others.filter(p => (p.groupId || '') === g.id).forEach(p => ordered.push(p));
      }
    });

    if (groupIdForCheck === '') {
      groupPresets.forEach(p => ordered.push(p));
    } else {
      others.filter(p => !p.groupId).forEach(p => ordered.push(p));
    }

    others.forEach(p => {
      if (ordered.indexOf(p) === -1) ordered.push(p);
    });

    setPresets(ordered);
    window.__presetDrag = null;
  };

  /* ===== 3. 重新绑定 ===== */
  window.bindPresetCardDrag();

  /* ===== 4. 诊断 ===== */
  window.diagnosePresetDragV33Soft = function () {
    const log = window.__presetDragLog || {};
    const lines = [];

    if (!log.down) {
      lines.push('❌ 未捕捉到"按下"操作。');
      lines.push('   → 请先在本页按住卡片拖动一下，再双击标题看报告。');
    } else {
      lines.push('✅ pointerdown → ' + log.down.target + '（' + log.down.cardName + '）');
      lines.push('✅ pointermove → ' + (log.move ? '(' + log.move.x + ', ' + log.move.y + ')' : '未捕捉'));
      lines.push('✅ 已激活拖动 → ' + (log.activated ? '是' : '否'));
      lines.push('✅ pointerup → ' + (log.up ? '(' + log.up.x + ', ' + log.up.y + ')' : '无'));
      if (log.cancel) lines.push('⚠️ pointercancel（浏览器抢走了手势）');
      if (log.finalOrder && log.finalOrder.length) {
        lines.push('');
        lines.push('松手时最终顺序：');
        log.finalOrder.forEach(function (n, i) {
          lines.push('   ' + (i + 1) + '. ' + n);
        });
      }
    }

    $('modalRoot').innerHTML =
      '<div class="modal-overlay" onclick="if(event.target===this)closeModal()">' +
        '<div class="modal" onclick="event.stopPropagation()">' +
          '<div class="modal-head"><h3>拖动诊断 · v3.3-Soft</h3>' +
            '<button class="icon-btn" onclick="closeModal()">×</button></div>' +
          '<div class="modal-body">' +
            '<pre style="background:#f7f8fa;padding:12px 14px;border-radius:6px;' +
                       'font-size:12.5px;line-height:1.75;white-space:pre-wrap;' +
                       'word-break:break-word;margin:0;">' +
              escapeHtml(lines.join('\n')) +
            '</pre>' +
            '<div style="margin-top:14px;font-size:12px;color:#555;">' +
              'v3.3-Soft 特点：让位动画 0.28s，归位 0.34s，丝绸感阻尼曲线。' +
            '</div>' +
            '<div class="actions" style="justify-content:flex-end;margin-top:18px;">' +
              '<button class="action-btn" onclick="closeModal()">关闭</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  };

  function bindDiagTriggerV33Soft() {
    const head = document.querySelector('#pagePresetSetting .page-head h1');
    if (!head || head.__diagV33Soft) return;
    head.__diagV33Soft = true;
    head.style.cursor = 'pointer';
    head.title = '双击运行拖动诊断';
    head.addEventListener('dblclick', function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.diagnosePresetDragV33Soft();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindDiagTriggerV33Soft);
  } else {
    setTimeout(bindDiagTriggerV33Soft, 120);
  }

})();
/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-55] 主题系统                                     ║
   ╚══════════════════════════════════════════════════════╝ */

const THEME_KEY = 'listReceiptTheme';

const THEMES = [
  {
    id: 'default',
    name: '经典黑白',
    desc: '极简 · 高对比 · 原生风格',
  },
  {
    id: 'cute-ins',
    name: '云朵芝士',
    desc: '天蓝 · 灰蓝 · 冰蓝 · 奶油白',
  },
  {
    id: 'guava',
    name: '芭乐本乐',
    desc: '番石榴绿 · 奶油底 · 清新可爱',
  },
];

function getCurrentTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY) || 'default';
    return THEMES.find(t => t.id === v) ? v : 'default';
  } catch (e) {
    return 'default';
  }
}

function applyTheme(id) {
  const valid = THEMES.find(t => t.id === id);
  if (!valid) id = 'default';
  document.documentElement.setAttribute('data-theme', id);
  try { localStorage.setItem(THEME_KEY, id); } catch (e) {}
}

function openThemeModal() {
  const current = getCurrentTheme();

  const items = THEMES.map(t => `
    <div class="theme-item ${t.id === current ? 'active' : ''}"
         data-theme-id="${escapeAttr(t.id)}"
         onclick="pickTheme('${escapeAttr(t.id)}')">
      <div class="theme-preview theme-preview-${escapeAttr(t.id)}"></div>
      <div class="theme-info">
        <div class="theme-name">${escapeHtml(t.name)}</div>
        <div class="theme-desc">${escapeHtml(t.desc)}</div>
      </div>
      <div class="theme-check">${t.id === current ? '✓' : ''}</div>
    </div>
  `).join('');

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>主题风格</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 16px;line-height:1.7;">
            切换主题只改变配色与细节风格，不会影响功能与布局。
          </p>
          <div class="theme-modal-list">
            ${items}
          </div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">完成</button>
          </div>
        </div>
      </div>
    </div>`;
}

function pickTheme(id) {
  applyTheme(id);
  /* 只更新选中态，不重渲染整个弹窗，避免跳动 */
  document.querySelectorAll('.theme-item').forEach(el => {
    const isActive = el.dataset.themeId === id;
    el.classList.toggle('active', isActive);
    const check = el.querySelector('.theme-check');
    if (check) check.textContent = isActive ? '✓' : '';
  });
}

/* 启动时应用已保存的主题 */
(function initThemeOnStartup() {
  applyTheme(getCurrentTheme());
})();
/* ╔══════════════════════════════════════════════════════╗
   ║  script.js · 专属结单助手                             ║
   ║  第 9 部分 · 9.2 / 共 10 部分                         ║
   ║                                                      ║
   ║  内容：                                              ║
   ║   [JS-56] 价目表模块（★重写分页引擎）                 ║
   ║   [JS-57] 价目表位置调整工具（开发用）                ║
   ║   [JS-101] 价目表数据 & 渲染诊断                      ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [JS-56] 价目表模块（v8 · 三组标题独立样式 + 六色）
   ═══════════════════════════════════════════════════════ */

/* ---------- 存储 key ---------- */
const PRICE_LIST_KEY          = 'listReceiptPriceList';
const PRICE_LIST_SETTINGS_KEY = 'listReceiptPriceListSettings';
const PRICE_LIST_GLOBAL_KEY   = 'listReceiptPriceListGlobal';
const PRICE_LIST_PRESET_KEY   = 'listReceiptPriceListPresets';
const PRICE_LIST_MAX_PRESETS  = 5;
const PL_DEFAULT_FONT_SIZE    = 13.5;

/* 三个附加模块：固定顺序 用途 → 附加 → 优惠 */
const PL_MODULE_KEYS = ['usage', 'extra', 'discount'];
const PL_MODULE_DEFAULT_TITLES = {
  usage:    '用途',
  extra:    '附加',
  discount: '优惠',
};

/* ══════════ 模板定义 ══════════ */

const PL_TEMPLATES = [
  {
    id: 'jm1-blue',
    name: '经典蓝',
    bgUrl: 'templates/JM1-blue.png',
    layout: {
      content: { left: 5.67,  top: 16.09, width: 88.55, height: 72.2 },
      sign:    { left: 37.03, top: 9.24,  width: 30,    height: 4    },
      footer:  { left: 0,     top: 90.16, width: 100,   height: 3.13 }
    }
  },
  {
    id: 'tpl-2',
    name: '模板 2（待做）',
    bgUrl: '',
    layout: {
      content: { left: 5,    top: 25, width: 90,  height: 62 },
      sign:    { left: 37.5, top: 11, width: 30,  height: 4  },
      footer:  { left: 0,    top: 87, width: 100, height: 4  }
    }
  },
  {
    id: 'tpl-3',
    name: '模板 3（待做）',
    bgUrl: '',
    layout: {
      content: { left: 5,    top: 25, width: 90,  height: 62 },
      sign:    { left: 37.5, top: 11, width: 30,  height: 4  },
      footer:  { left: 0,    top: 87, width: 100, height: 4  }
    }
  },
  {
    id: 'tpl-4',
    name: '模板 4（待做）',
    bgUrl: '',
    layout: {
      content: { left: 5,    top: 25, width: 90,  height: 62 },
      sign:    { left: 37.5, top: 11, width: 30,  height: 4  },
      footer:  { left: 0,    top: 87, width: 100, height: 4  }
    }
  }
];

function getPlTemplate(id) {
  return PL_TEMPLATES.find(t => t.id === id) || PL_TEMPLATES[0];
}

/* ══════════ 默认值 ══════════ */

function makeDefaultPriceList() {
  return {
    signature: {
      enabled: true,
      content: '',
      prefix: 'none',
      prefixCustom: ''
    },
    categories: [],
    extra:    { title: '附加', enabled: true, lines: [], pageIndex: 1 },
    discount: { title: '优惠', enabled: true, lines: [], pageIndex: 1 },
    usage:    { title: '用途', enabled: true, lines: [], pageIndex: 1 },
    processNewPage: false,
    footer: {
      enabled: true,
      text: ''
    }
  };
}

function makeDefaultPriceListSettings() {
  return {
    templateId: 'jm1-blue',
    followTheme: false,
    layout: 'double',
    paginationMode: 'auto',

    /* 三种标题样式 */
    categoryStyle: 'block',
    moduleStyle: 'block',
    noticeStyle: 'block',

    showDottedLine: true,
    moduleHorizontal: false,

    /* 颜色（6 个语义色 + 装饰色统一开关） */
    colorTitle:   '#111111',   /* 三种标题文字共用 */
    colorContent: '#111111',   /* 内容色 */
    colorSmall:   '#555555',   /* 小字色 */
    decoUnified:  true,        /* 装饰色统一开关 */
    decoColor:    '#111111',   /* 统一装饰色 */
    decoCategory: '#111111',   /* 分类标题装饰色 */
    decoModule:   '#111111',   /* 附加模块标题装饰色 */
    decoNotice:   '#111111',   /* 流程须知标题装饰色 */

    font: 'system',
    fontSize: 13.5,

    bgCoverImg: '',
    bgCoverOpacity: 1
  };
}

function makeDefaultPriceListGlobal() {
  return { process: [], notice: [] };
}

/* ══════════ 存取 + 迁移 ══════════ */

function migratePriceList(data) {
  let changed = false;

  /* 分类补 order */
  (data.categories || []).forEach((cat, idx) => {
    if (typeof cat.order !== 'number' || !isFinite(cat.order)) {
      cat.order = idx;
      changed = true;
    }
  });

  /* 老标题改名 */
  if (data.extra && data.extra.title === '加价项') {
    data.extra.title = '附加';
    changed = true;
  }
  if (data.discount && data.discount.title === '优惠折扣') {
    data.discount.title = '优惠';
    changed = true;
  }

  return changed;
}

function migratePriceListSettings(settings) {
  let changed = false;

  /* 老 colorPrimary/colorSecondary → 新的六色 */
  const raw = (() => {
    try { return JSON.parse(localStorage.getItem(PRICE_LIST_SETTINGS_KEY)); }
    catch (e) { return null; }
  })() || {};

  if (raw.colorPrimary && settings.colorTitle === '#111111') {
    settings.colorTitle = raw.colorPrimary;
    settings.colorContent = raw.colorPrimary;
    settings.decoColor = raw.colorPrimary;
    settings.decoCategory = raw.colorPrimary;
    settings.decoModule = raw.colorPrimary;
    settings.decoNotice = raw.colorPrimary;
    changed = true;
  }
  if (raw.colorSecondary && settings.colorSmall === '#555555') {
    settings.colorSmall = raw.colorSecondary;
    changed = true;
  }

  /* 老的 bgColor 不再使用，删掉防止污染 */
  if (settings.bgColor !== undefined) {
    delete settings.bgColor;
    changed = true;
  }

  if (settings.decoUnified === undefined) {
    settings.decoUnified = true;
    changed = true;
  }
  if (!settings.moduleStyle) { settings.moduleStyle = 'block'; changed = true; }
  if (!settings.noticeStyle) { settings.noticeStyle = 'block'; changed = true; }

  if (changed) {
    try { localStorage.setItem(PRICE_LIST_SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
  }
  return settings;
}

function getPriceList() {
  try {
    const s = JSON.parse(localStorage.getItem(PRICE_LIST_KEY));
    if (s && typeof s === 'object') {
      const def = makeDefaultPriceList();
      const out = Object.assign({}, def, s);
      out.signature = Object.assign({}, def.signature, s.signature || {});
      out.extra     = Object.assign({}, def.extra, s.extra || {});
      out.discount  = Object.assign({}, def.discount, s.discount || {});
      out.usage     = Object.assign({}, def.usage, s.usage || {});
      out.footer    = Object.assign({}, def.footer, s.footer || {});

      if (s.bottom && s.bottom.text && !out.footer.text) out.footer.text = s.bottom.text;
      if (s.bottom && typeof s.bottom.enabled === 'boolean') out.footer.enabled = s.bottom.enabled;
      if (s.title && s.title.signature && !out.signature.content) out.signature.content = s.title.signature;
      if (s.title && s.title.signPrefix) out.signature.prefix = s.title.signPrefix;
      if (s.title && typeof s.title.enabled === 'boolean') out.signature.enabled = s.title.enabled;

      if (!Array.isArray(out.categories)) out.categories = [];

      const changed = migratePriceList(out);
      if (changed) {
        try { localStorage.setItem(PRICE_LIST_KEY, JSON.stringify(out)); } catch (e) {}
      }

      return out;
    }
  } catch (e) {}
  return makeDefaultPriceList();
}
function setPriceList(d) {
  try { localStorage.setItem(PRICE_LIST_KEY, JSON.stringify(d)); return true; }
  catch (e) { alert('保存失败：浏览器存储空间已满。'); return false; }
}

function getPriceListSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(PRICE_LIST_SETTINGS_KEY));
    if (s && typeof s === 'object') {
      const merged = Object.assign(makeDefaultPriceListSettings(), s);
      return migratePriceListSettings(merged);
    }
  } catch (e) {}
  return makeDefaultPriceListSettings();
}
function setPriceListSettings(s) {
  try { localStorage.setItem(PRICE_LIST_SETTINGS_KEY, JSON.stringify(s)); return true; }
  catch (e) { alert('保存失败：浏览器存储空间已满。'); return false; }
}

function getPriceListGlobal() {
  try {
    const g = JSON.parse(localStorage.getItem(PRICE_LIST_GLOBAL_KEY));
    if (g && typeof g === 'object') return Object.assign(makeDefaultPriceListGlobal(), g);
  } catch (e) {}
  return makeDefaultPriceListGlobal();
}
function setPriceListGlobal(g) {
  try { localStorage.setItem(PRICE_LIST_GLOBAL_KEY, JSON.stringify(g)); return true; }
  catch (e) { alert('保存失败：浏览器存储空间已满。'); return false; }
}

function getPriceListPresets() {
  try {
    const a = JSON.parse(localStorage.getItem(PRICE_LIST_PRESET_KEY));
    if (Array.isArray(a)) return a;
  } catch (e) {}
  return [];
}
function setPriceListPresets(a) {
  try { localStorage.setItem(PRICE_LIST_PRESET_KEY, JSON.stringify(a)); return true; }
  catch (e) { alert('保存失败：浏览器存储空间已满。'); return false; }
}
function makePriceListPresetId() {
  return 'plp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/* ══════════ 入口 ══════════ */

function openPriceList() {
  showPage('pagePriceList');
  renderPriceListPreview();
}
function backFromPriceList() { showPage('pageMain'); }

function openPriceListSettings() {
  renderPriceListSettingsForm();
  showPage('pagePriceListSettings');
  restorePlMobilePreviewState();
  renderPriceListPreview();
}
function backFromPriceListSettings() {
  showPage('pagePriceList');
  renderPriceListPreview();
}

function switchPlTab(tab) {
  document.querySelectorAll('.pl-tabs .rs-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.pl-pane').forEach(p => p.classList.remove('active'));
  if (tab === 'content' && $('plPaneContent')) $('plPaneContent').classList.add('active');
  if (tab === 'style'   && $('plPaneStyle'))   $('plPaneStyle').classList.add('active');
}

/* ---------- 移动端预览折叠状态 ---------- */
const PL_MOBILE_PREVIEW_KEY = 'listReceiptPlMobilePreviewOpen';

function togglePlMobilePreview() {
  const body = $('plMobilePreviewBody');
  const toggle = $('plMobilePreviewToggle');
  if (!body) return;

  const isOpen = body.classList.toggle('is-open');
  if (toggle) toggle.classList.toggle('is-open', isOpen);

  try { localStorage.setItem(PL_MOBILE_PREVIEW_KEY, isOpen ? '1' : '0'); } catch (e) {}
}

function restorePlMobilePreviewState() {
  let open = false;
  try { open = localStorage.getItem(PL_MOBILE_PREVIEW_KEY) === '1'; } catch (e) {}

  const body = $('plMobilePreviewBody');
  const toggle = $('plMobilePreviewToggle');
  if (!body) return;

  if (open) {
    body.classList.add('is-open');
    if (toggle) toggle.classList.add('is-open');
  } else {
    body.classList.remove('is-open');
    if (toggle) toggle.classList.remove('is-open');
  }
}

/* ---------- 预览渲染 debounce ---------- */
var __plRenderDebounceTimer = null;

function schedulePlPreviewRender() {
  clearTimeout(__plRenderDebounceTimer);
  __plRenderDebounceTimer = setTimeout(() => {
    renderPriceListPreview();
  }, 100);
}

/* ══════════ 渲染入口 ══════════ */

var __plRenderToken = 0;

async function renderPriceListPreview() {
  const token = ++__plRenderToken;

  const mainContainer = $('priceListPages');
  if (!mainContainer) return;

  const data     = getPriceList();
  const settings = getPriceListSettings();
  const global   = getPriceListGlobal();

  const hasContent = checkPlHasContent(data, global);

  /* 三个预览容器：主预览页 / 桌面设置页 / 移动设置页 */
  const containers = [
    $('priceListPages'),
    $('plDesktopPreviewPages'),
    $('plMobilePreviewPages'),
  ].filter(Boolean);

  containers.forEach(c => { c.innerHTML = ''; });

  const empty = $('priceListEmpty');
  if (!hasContent) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) {}
  }

  if (token !== __plRenderToken) return;

  /* 每个容器都渲染一份 */
  containers.forEach(c => {
    buildPriceListPages(c, data, settings, global);
  });

  /* ★ 渲染完成后重算预览缩放 */
  requestAnimationFrame(() => {
    updatePlPreviewScale();
  });
}

/* ---------- 预览区自适应缩放 ---------- */
function updatePlPreviewScale() {
  const containers = [
    $('plDesktopPreviewPages'),
    $('plMobilePreviewPages'),
  ].filter(Boolean);

  containers.forEach(container => {
    const style = window.getComputedStyle(container);
    const padL = parseFloat(style.paddingLeft) || 0;
    const padR = parseFloat(style.paddingRight) || 0;
    const innerW = container.clientWidth - padL - padR;
    if (innerW <= 0) return;

    /* 缩放系数 = 可用宽度 / 640，上限 1（不放大） */
    const zoom = Math.min(1, innerW / 640);
    container.style.setProperty('--pl-preview-zoom', zoom);
  });
}

/* 窗口尺寸变化时重算 */
window.addEventListener('resize', () => {
  if ($('pagePriceListSettings') && $('pagePriceListSettings').classList.contains('active')) {
    updatePlPreviewScale();
  }
});

function checkPlHasContent(data, global) {
  if ((data.categories || []).some(c => (c.items || []).length > 0)) return true;
  if (data.extra.enabled    && (data.extra.lines || []).length)    return true;
  if (data.discount.enabled && (data.discount.lines || []).length) return true;
  if (data.usage.enabled    && (data.usage.lines || []).length)    return true;
  if ((global.process || []).length || (global.notice || []).length) return true;
  if (data.footer.enabled && (data.footer.text || '').trim()) return true;
  if (data.signature.enabled && (data.signature.content || '').trim()) return true;
  return false;
}

/* ══════════ 分类排序（只对分类） ══════════ */

function getPlOrderedCategories(data) {
  const items = (data.categories || []).map((cat, ci) => ({
    type: 'category',
    id: cat.id || ('catidx_' + ci),
    order: (typeof cat.order === 'number' && isFinite(cat.order)) ? cat.order : ci,
    cat: cat,
    ci: ci,
  }));

  items.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.ci - b.ci;
  });

  return items;
}

/* ══════════ 附加模块固定顺序 ══════════ */

function getPlModulesInOrder(data) {
  return PL_MODULE_KEYS.map((key, idx) => ({
    key: key,
    mod: data[key],
    title: (data[key] && data[key].title) || PL_MODULE_DEFAULT_TITLES[key] || '',
    num: String(idx + 1).padStart(2, '0'),
  }));
}

/* ══════════ 条目化 ══════════ */

function buildPlEntries(data, settings, horizontalModules) {
  const entries = [];

  /* ---- 分类 ---- */
  const orderedCats = getPlOrderedCategories(data);
  orderedCats.forEach(item => {
    const cat = item.cat;
    if (!cat.items || !cat.items.length) return;

    const ownerId    = item.id;
    const ownerTitle = cat.name || '';
    const ownerTags  = cat.tags || [];
    const ownerNum   = String(item.ci + 1).padStart(2, '0');

    cat.items.forEach((plItem, ii) => {
      entries.push({
        ownerId, ownerTitle, ownerTags, ownerNum,
        ownerStyle: settings.categoryStyle || 'block',
        ownerKind: 'category',
        isStart: ii === 0,
        el: makePlCategoryItemEl(plItem, settings)
      });
    });
  });

  /* ---- 附加模块 ---- */
  const mods = getPlModulesInOrder(data);
  mods.forEach(m => {
    const mod = m.mod;
    if (!mod || !mod.enabled) return;
    if (!mod.lines || !mod.lines.length) return;

    const ownerId    = m.key;
    const ownerTitle = m.title;
    const ownerNum   = m.num;
    const ownerStyle = settings.moduleStyle || 'block';

    if (horizontalModules) {
      entries.push({
        ownerId, ownerTitle, ownerNum, ownerStyle,
        ownerKind: 'block',
        isStart: true,
        isHorizontal: true,
        el: makePlBlockLineHorizontalEl(mod.lines)
      });
    } else {
      mod.lines.forEach((line, i) => {
        entries.push({
          ownerId, ownerTitle, ownerNum, ownerStyle,
          ownerKind: 'block',
          isStart: i === 0,
          el: makePlBlockLineEl(line, false, 0)
        });
      });
    }
  });

  return entries;
}

function makePlCategoryItemEl(item, settings) {
  const el = document.createElement('div');
  el.className = 'pl-category-item';
  const pricesHtml = (item.prices || []).map(p => {
    const label = p.label ? `<span class="pl-item-price-label">${escapeHtml(p.label)}</span>` : '';
    return `<span class="pl-item-price">${label}<span class="pl-item-price-value">${escapeHtml(p.value || '')}</span></span>`;
  }).join('');
  const dots = settings.showDottedLine !== false
    ? '<span class="pl-item-dots"></span>'
    : '<span style="flex:1;min-width:12px;"></span>';
  let html = `<div class="pl-item">` +
    `<span class="pl-item-name">${escapeHtml(item.name || '')}</span>` +
    dots +
    `<span class="pl-item-prices">${pricesHtml}</span>` +
    `</div>`;
  if (item.note && item.note.trim()) {
    html += `<div class="pl-item-note">${escapeHtml(item.note)}</div>`;
  }
  el.innerHTML = html;
  return el;
}

function makePlBlockLineEl(line, numbered, num) {
  const el = document.createElement('div');
  el.className = 'pl-block-line' + (numbered ? '' : ' is-plain');
  if (numbered) {
    el.innerHTML = `<span class="idx">${num}.</span><span class="txt">${escapeHtml(line)}</span>`;
  } else {
    el.innerHTML = `<span class="txt">${escapeHtml(line)}</span>`;
  }
  return el;
}

function makePlBlockLineHorizontalEl(lines) {
  const el = document.createElement('div');
  el.className = 'pl-block-line is-horizontal';
  el.innerHTML = (lines || []).map(line =>
    `<span class="txt">${escapeHtml(line)}</span>`
  ).join('');
  return el;
}

/*
  标题元素工厂。
  - entry.ownerKind === 'category' → 分类标题（.pl-category-title）
  - entry.ownerKind === 'block'    → 模块标题（.pl-block-title.is-module）
  两种都支持 data-style 属性（block / number / pill / bar）。
*/
function makePlOwnerTitleEl(entry, isContinue) {
  if (!entry.ownerTitle) return null;

  const style = entry.ownerStyle || 'block';
  const num   = entry.ownerNum || '01';

  if (entry.ownerKind === 'category') {
    const wrap = document.createElement('div');
    wrap.className = 'pl-category-title-wrap';

    const el = document.createElement('div');
    el.className = 'pl-category-title is-' + style;
    el.dataset.style = style;
    el.dataset.num = num;

    const nameSpan = document.createElement('span');
    nameSpan.textContent = entry.ownerTitle;
    el.appendChild(nameSpan);

    if (isContinue) {
      const cont = document.createElement('span');
      cont.className = 'pl-category-continue';
      cont.textContent = '·续';
      el.appendChild(cont);
    }
    wrap.appendChild(el);

    if (!isContinue && entry.ownerTags && entry.ownerTags.length) {
      const tags = document.createElement('div');
      tags.className = 'pl-category-tags';
      tags.innerHTML = entry.ownerTags.map(t =>
        `<span class="pl-category-tag">${escapeHtml(t)}</span>`).join('');
      wrap.appendChild(tags);
    }
    return wrap;
  }

  /* 模块标题 */
  const el = document.createElement('div');
  el.className = 'pl-block-title is-module';
  el.dataset.style = style;
  el.dataset.num = num;
  el.textContent = entry.ownerTitle;
  return el;
}

/*
  块状结构（流程 / 须知）。
  styleType：'is-notice'（目前流程和须知共用同一装饰色）
  style：block / number / pill / bar
*/
function makePlBlock(title, lines, numbered, styleType, style, startNum) {
  const block = document.createElement('div');
  block.className = 'pl-block';

  const titleEl = document.createElement('div');
  titleEl.className = 'pl-block-title ' + (styleType || 'is-notice');
  titleEl.dataset.style = style || 'block';
  titleEl.dataset.num = String(startNum || 1).padStart(2, '0');
  titleEl.textContent = title;
  block.appendChild(titleEl);

  (lines || []).forEach((line, i) => {
    const lineEl = document.createElement('div');
    if (numbered) {
      lineEl.className = 'pl-block-line';
      lineEl.innerHTML = `<span class="idx">${i + 1}.</span><span class="txt">${escapeHtml(line)}</span>`;
    } else {
      lineEl.className = 'pl-block-line is-plain';
      lineEl.innerHTML = `<span class="txt">${escapeHtml(line)}</span>`;
    }
    block.appendChild(lineEl);
  });

  return block;
}

/* ══════════ 页面骨架 ══════════ */

function createPlPage(container, settings, data, isFirst) {
  const template = getPlTemplate(settings.templateId);

  const page = document.createElement('div');
  page.className = 'pl-page';
  page.style.background = '#ffffff';

  /* 字体 */
  page.style.setProperty('--pl-font', resolveFontFamily(settings.font));
  page.style.setProperty('--pl-font-size', (settings.fontSize || PL_DEFAULT_FONT_SIZE) + 'px');

  /* 六色 */
  const deco = (name) => settings.decoUnified ? settings.decoColor : settings[name];
  page.style.setProperty('--pl-color-title',   settings.colorTitle   || '#111111');
  page.style.setProperty('--pl-color-content', settings.colorContent || '#111111');
  page.style.setProperty('--pl-color-small',   settings.colorSmall   || '#555555');
  page.style.setProperty('--pl-deco-category', deco('decoCategory'));
  page.style.setProperty('--pl-deco-module',   deco('decoModule'));
  page.style.setProperty('--pl-deco-notice',   deco('decoNotice'));

  /* 模板布局变量 */
  const L = template.layout;
  page.style.setProperty('--pl-content-left',   L.content.left   + '%');
  page.style.setProperty('--pl-content-top',    L.content.top    + '%');
  page.style.setProperty('--pl-content-width',  L.content.width  + '%');
  page.style.setProperty('--pl-content-height', L.content.height + '%');
  page.style.setProperty('--pl-sign-left',      L.sign.left       + '%');
  page.style.setProperty('--pl-sign-top',       L.sign.top        + '%');
  page.style.setProperty('--pl-sign-width',     L.sign.width      + '%');
  page.style.setProperty('--pl-sign-height',    L.sign.height     + '%');
  page.style.setProperty('--pl-footer-left',    L.footer.left     + '%');
  page.style.setProperty('--pl-footer-top',     L.footer.top      + '%');
  page.style.setProperty('--pl-footer-width',   L.footer.width    + '%');
  page.style.setProperty('--pl-footer-height',  L.footer.height   + '%');

  /* 模板底图 */
  if (template.bgUrl) {
    const bgImg = document.createElement('img');
    bgImg.className = 'pl-template-bg';
    bgImg.src = template.bgUrl;
    bgImg.draggable = false;
    bgImg.alt = '';
    page.appendChild(bgImg);
  }

  /* 用户背景图（覆盖模板底图） */
  const cover = document.createElement('img');
  cover.className = 'pl-bg-cover';
  cover.dataset.empty = '1';
  cover.style.opacity = settings.bgCoverOpacity;
  cover.draggable = false;
  cover.alt = '';
  page.appendChild(cover);
  if (settings.bgCoverImg) {
    resolveImageSrc(settings.bgCoverImg).then(url => {
      if (url) { cover.src = url; cover.dataset.empty = '0'; }
    });
  }

  /* 正文区 */
  const contentArea = document.createElement('div');
  contentArea.className = 'pl-content-area';
  const inner = document.createElement('div');
  inner.className = 'pl-content-inner';
  contentArea.appendChild(inner);
  page.appendChild(contentArea);

  /* 署名区 */
  const signArea = document.createElement('div');
  signArea.className = 'pl-sign-area';
  const signText = (data.signature.content || '').trim();
  if (data.signature.enabled && signText) {
    signArea.textContent = signText;
    signArea.dataset.empty = '0';
  } else {
    signArea.dataset.empty = '1';
  }
  page.appendChild(signArea);

  /* 底部说明区 */
  const footerArea = document.createElement('div');
  footerArea.className = 'pl-footer-area';
  if (data.footer.enabled && (data.footer.text || '').trim()) {
    footerArea.textContent = data.footer.text;
    footerArea.dataset.empty = '0';
  } else {
    footerArea.dataset.empty = '1';
  }
  page.appendChild(footerArea);

  container.appendChild(page);
  return page;
}

/* ══════════ 溢出检测 ══════════ */

function isPlPageOverflow(page) {
  const area  = page.querySelector('.pl-content-area');
  if (!area) return false;
  const inner = area.querySelector('.pl-content-inner');
  if (!inner) return false;

  const innerH = inner.getBoundingClientRect().height;
  const areaH  = area.getBoundingClientRect().height;
  if (areaH <= 0) return false;
  return innerH > areaH + 1;
}

function isPlColOverflow(page, col) {
  if (!col) return false;
  const area = page.querySelector('.pl-content-area');
  if (!area) return false;

  const colH  = col.getBoundingClientRect().height;
  const areaH = area.getBoundingClientRect().height;
  if (areaH <= 0) return false;
  return colH > areaH + 1;
}

/* ══════════ 塞入（回滚完整） ══════════ */

function tryPlaceEntry(page, col, entry, colTrackers, usedOwners) {
  const needsTitle = !colTrackers.has(entry.ownerId) && !!entry.ownerTitle;
  const wasInUsed  = usedOwners.has(entry.ownerId);

  const nodes = [];
  if (needsTitle) {
    const titleEl = makePlOwnerTitleEl(entry, wasInUsed);
    if (titleEl) nodes.push(titleEl);
  }
  nodes.push(entry.el);

  const wasEmpty = col.children.length === 0;

  nodes.forEach(n => col.appendChild(n));
  if (needsTitle) colTrackers.add(entry.ownerId);
  if (!wasInUsed) usedOwners.add(entry.ownerId);

  if (wasEmpty) return true;

  if (isPlColOverflow(page, col)) {
    nodes.forEach(n => { if (n.parentNode === col) col.removeChild(n); });
    if (needsTitle) colTrackers.delete(entry.ownerId);
    if (!wasInUsed) usedOwners.delete(entry.ownerId);
    return false;
  }

  return true;
}

function ensurePlColumns(page, isSingle) {
  const inner = page.querySelector('.pl-content-inner');
  let columns = inner.querySelector('.pl-columns');
  if (columns) return columns;

  columns = document.createElement('div');
  columns.className = 'pl-columns' + (isSingle ? ' is-single' : '');
  const leftCol = document.createElement('div');
  leftCol.className = 'pl-col pl-col-left';
  columns.appendChild(leftCol);
  if (!isSingle) {
    const rightCol = document.createElement('div');
    rightCol.className = 'pl-col pl-col-right';
    columns.appendChild(rightCol);
  }
  inner.appendChild(columns);
  return columns;
}

/* ══════════ 分页引擎 ══════════ */

function buildPriceListPages(container, data, settings, global) {
  const isSingle = (settings.layout || 'double') === 'single';
  const horizontalModules = isSingle ? true : !!settings.moduleHorizontal;
  const newPageMode = !!data.processNewPage;

  const entries = buildPlEntries(data, settings, horizontalModules);
  const isManual = settings.paginationMode === 'manual';

  if (isManual) {
    buildPlManualPages(container, data, settings, global, entries, isSingle, newPageMode);
  } else {
    buildPlAutoPages(container, data, settings, global, entries, isSingle, newPageMode);
  }
}

function buildPlAutoPages(container, data, settings, global, entries, isSingle, newPageMode) {
  const queue = entries.slice();
  const usedOwners = new Set();

  let pageIdx = 0;
  let safety = 0;
  const MAX_PAGES = 60;

  while (queue.length > 0 && safety < MAX_PAGES) {
    safety++;

    const isFirst = (pageIdx === 0);
    const page = createPlPage(container, settings, data, isFirst);
    const columns = ensurePlColumns(page, isSingle);
    const leftCol  = columns.querySelector('.pl-col-left');
    const rightCol = columns.querySelector('.pl-col-right');

    const leftTrackers  = new Set();
    const rightTrackers = new Set();

    let placedSomething = false;

    if (isSingle) {
      while (queue.length > 0) {
        const e = queue[0];
        if (!tryPlaceEntry(page, leftCol, e, leftTrackers, usedOwners)) break;
        queue.shift();
        placedSomething = true;
      }
    } else {
      while (queue.length > 0) {
        const e = queue[0];
        if (!tryPlaceEntry(page, leftCol, e, leftTrackers, usedOwners)) break;
        queue.shift();
        placedSomething = true;
      }
      while (queue.length > 0) {
        const e = queue[0];
        if (!tryPlaceEntry(page, rightCol, e, rightTrackers, usedOwners)) break;
        queue.shift();
        placedSomething = true;
      }
    }

    if (!placedSomething && queue.length > 0) {
      const e = queue.shift();
      const isContinue = usedOwners.has(e.ownerId);
      if (e.ownerTitle) {
        const titleEl = makePlOwnerTitleEl(e, isContinue);
        if (titleEl) leftCol.appendChild(titleEl);
      }
      leftCol.appendChild(e.el);
      usedOwners.add(e.ownerId);
      leftTrackers.add(e.ownerId);
      placedSomething = true;
    }

    if (!placedSomething) break;
    pageIdx++;
  }

  appendPlProcessNotice(container, data, settings, global, newPageMode);

  const pages = container.querySelectorAll('.pl-page');
  pages.forEach((p, i) => appendPlPageNum(p, i + 1, pages.length));
}

function buildPlManualPages(container, data, settings, global, entries, isSingle, newPageMode) {
  function entryPage(entry) {
    if (entry.ownerKind === 'category') {
      const cat = (data.categories || []).find(c => c.id === entry.ownerId);
      return cat ? Math.max(1, parseInt(cat.pageIndex, 10) || 1) : 1;
    }
    if (PL_MODULE_KEYS.indexOf(entry.ownerId) > -1) {
      const mod = data[entry.ownerId];
      return mod ? Math.max(1, parseInt(mod.pageIndex, 10) || 1) : 1;
    }
    return 1;
  }

  const groups = {};
  let maxPage = 1;
  entries.forEach(e => {
    const p = entryPage(e);
    if (p > maxPage) maxPage = p;
    if (!groups[p]) groups[p] = [];
    groups[p].push(e);
  });

  const usedOwners = new Set();
  entries.forEach(e => { if (e.el.parentNode) e.el.parentNode.removeChild(e.el); });

  for (let i = 1; i <= maxPage; i++) {
    const isFirst = (i === 1);
    const page = createPlPage(container, settings, data, isFirst);
    const leftTrackers  = new Set();
    const rightTrackers = new Set();

    const list = groups[i] || [];
    if (list.length > 0) {
      const columns = ensurePlColumns(page, isSingle);
      const leftCol = columns.querySelector('.pl-col-left');
      const rightCol = columns.querySelector('.pl-col-right');

      list.forEach(e => {
        if (leftCol.contains(e.el) || (rightCol && rightCol.contains(e.el))) return;

        if (isSingle || !rightCol) {
          tryPlaceEntry(page, leftCol, e, leftTrackers, usedOwners);
          return;
        }

        if (!tryPlaceEntry(page, leftCol, e, leftTrackers, usedOwners)) {
          tryPlaceEntry(page, rightCol, e, rightTrackers, usedOwners);
        }
      });
    }
  }

  appendPlProcessNotice(container, data, settings, global, newPageMode);

  const pages = container.querySelectorAll('.pl-page');
  pages.forEach((p, i) => appendPlPageNum(p, i + 1, pages.length));
}

/* ---------- 流程 / 须知：统一追加 ---------- */

function appendPlProcessNotice(container, data, settings, global, newPageMode) {
  const blockEl = buildPlProcessNoticeBlock(global, settings);
  if (!blockEl) return;

  if (newPageMode) {
    const page = createPlPage(container, settings, data, false);
    const inner = page.querySelector('.pl-content-inner');
    inner.appendChild(blockEl);
    return;
  }

  const pages = container.querySelectorAll('.pl-page');

  if (!pages.length) {
    const page = createPlPage(container, settings, data, false);
    const inner = page.querySelector('.pl-content-inner');
    inner.appendChild(blockEl);
    return;
  }

  const lastPage = pages[pages.length - 1];
  const inner = lastPage.querySelector('.pl-content-inner');
  if (!inner) {
    const page = createPlPage(container, settings, data, false);
    const newInner = page.querySelector('.pl-content-inner');
    newInner.appendChild(blockEl);
    return;
  }

  inner.appendChild(blockEl);

  if (isPlPageOverflow(lastPage)) {
    inner.removeChild(blockEl);
    const page = createPlPage(container, settings, data, false);
    const newInner = page.querySelector('.pl-content-inner');
    newInner.appendChild(blockEl);
  }
}

function buildPlProcessNoticeBlock(global, settings) {
  const hasProcess = global.process && global.process.length;
  const hasNotice  = global.notice  && global.notice.length;
  if (!hasProcess && !hasNotice) return null;

  const wrap = document.createElement('div');
  wrap.className = 'pl-process-notice-block';

  const leftCol = document.createElement('div');
  leftCol.className = 'pl-col';
  const rightCol = document.createElement('div');
  rightCol.className = 'pl-col';

  const style = settings.noticeStyle || 'block';

  if (hasProcess) {
    leftCol.appendChild(
      makePlBlock('约稿流程', global.process, true, 'is-notice', style, 1)
    );
  }
  if (hasNotice) {
    const noticeBlock = makePlBlock('约稿须知', global.notice, false, 'is-notice', style, 1);
    if (hasProcess) {
      rightCol.appendChild(noticeBlock);
    } else {
      leftCol.appendChild(noticeBlock);
    }
  }

  wrap.appendChild(leftCol);
  wrap.appendChild(rightCol);
  return wrap;
}

function appendPlPageNum(page, idx, total) {
  const existing = page.querySelector('.pl-page-num');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'pl-page-num';
  el.textContent = idx + '/' + total;
  page.appendChild(el);
}

/* ══════════ 设置页表单 ══════════ */

var __plFoldOpenMap = {};

function renderPriceListSettingsForm() {
  const data = getPriceList();
  const settings = getPriceListSettings();

  if ($('plTitleEnabled')) $('plTitleEnabled').checked = !!data.signature.enabled;
  if ($('plTitleSign'))    $('plTitleSign').value = data.signature.content || '';

  if ($('plBottomEnabled')) $('plBottomEnabled').checked = !!data.footer.enabled;
  if ($('plBottomText'))    $('plBottomText').value = data.footer.text || '';

  if ($('plProcessNewPage')) $('plProcessNewPage').checked = !!data.processNewPage;
  if ($('plHorizontalModules')) $('plHorizontalModules').checked = !!settings.moduleHorizontal;

  renderPriceListItems();
  renderPlModulesList();
  renderPriceListStyleForm(settings);
  renderPriceListFontOptions();
  renderPlTemplateGrid();
  updatePlFoldStates();
}

function updatePlFoldStates() {
  document.querySelectorAll('.pl-fold-block[data-fold-key]').forEach(el => {
    const k = el.dataset.foldKey;
    el.classList.toggle('is-open', !!__plFoldOpenMap[k]);
  });
}

function togglePlFold(key, e) {
  if (e && e.target.closest && e.target.closest('input, select, button, textarea, label.switch-wrap')) return;
  __plFoldOpenMap[key] = !__plFoldOpenMap[key];
  const el = document.querySelector('.pl-fold-block[data-fold-key="' + CSS.escape(key) + '"]');
  if (el) el.classList.toggle('is-open', !!__plFoldOpenMap[key]);
}

function togglePlModuleFold(key, e) {
  togglePlFold(key, e);
}

function renderPriceListStyleForm(s) {
  if ($('plFollowTheme')) $('plFollowTheme').checked = !!s.followTheme;
  if ($('plShowDotted'))  $('plShowDotted').checked = s.showDottedLine !== false;
  if ($('plFont'))        $('plFont').value = s.font || 'system';
  if ($('plFontSize'))    $('plFontSize').value = s.fontSize || PL_DEFAULT_FONT_SIZE;
  if ($('plFontSizeVal')) $('plFontSizeVal').textContent = (s.fontSize || PL_DEFAULT_FONT_SIZE).toFixed(1) + 'px';

  /* 六色 + 统一开关 */
  if ($('plColorTitle'))   $('plColorTitle').value   = s.colorTitle   || '#111111';
  if ($('plColorContent')) $('plColorContent').value = s.colorContent || '#111111';
  if ($('plColorSmall'))   $('plColorSmall').value   = s.colorSmall   || '#555555';
  if ($('plDecoUnified'))  $('plDecoUnified').checked = !!s.decoUnified;
  if ($('plDecoColor'))    $('plDecoColor').value    = s.decoColor    || '#111111';
  if ($('plDecoCategory')) $('plDecoCategory').value = s.decoCategory || '#111111';
  if ($('plDecoModule'))   $('plDecoModule').value   = s.decoModule   || '#111111';
  if ($('plDecoNotice'))   $('plDecoNotice').value   = s.decoNotice   || '#111111';

  if ($('plBgOpacity'))   $('plBgOpacity').value = (s.bgCoverOpacity === undefined ? 1 : s.bgCoverOpacity);
  if ($('plBgOpacityVal')) $('plBgOpacityVal').textContent = Math.round((s.bgCoverOpacity === undefined ? 1 : s.bgCoverOpacity) * 100) + '%';

  updateDecoBlocks();
  updatePlStyleBtns();
}

function renderPriceListFontOptions() {
  const sel = $('plFont');
  const src = $('rsFont');
  if (!sel || !src) return;
  sel.innerHTML = src.innerHTML;
  const s = getPriceListSettings();
  const opts = Array.from(sel.options).map(o => o.value);
  sel.value = opts.indexOf(s.font) > -1 ? s.font : 'system';
}

/* ══════════ 三组样式选择器的高亮 & 装饰色块显隐 ══════════ */

function updatePlStyleBtns() {
  const s = getPriceListSettings();
  const set = (id, mode) => {
    document.querySelectorAll('#' + id + ' .flow-opt-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  };
  set('plCategoryStyleOptions', s.categoryStyle || 'block');
  set('plModuleStyleOptions',   s.moduleStyle   || 'block');
  set('plNoticeStyleOptions',   s.noticeStyle   || 'block');
}

function updateDecoBlocks() {
  const unified = !!($('plDecoUnified') && $('plDecoUnified').checked);
  const u = $('plDecoUnifiedBlock');
  const sp = $('plDecoSplitBlock');
  if (u) u.style.display = unified ? '' : 'none';
  if (sp) sp.style.display = unified ? 'none' : '';
}

/* ══════════ 模板网格 ══════════ */

function renderPlTemplateGrid() {
  const box = $('plTemplateGrid');
  if (!box) return;
  const s = getPriceListSettings();
  const cur = s.templateId || 'jm1-blue';

  box.innerHTML = PL_TEMPLATES.map(t => {
    const isActive = t.id === cur;
    const thumb = t.bgUrl || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" preserveAspectRatio="none">' +
      '<rect width="1200" height="1600" fill="#f4f5f7"/>' +
      '<text x="600" y="800" text-anchor="middle" font-family="sans-serif" font-size="90" fill="#b8c2cc">待定</text>' +
      '</svg>'
    );
    return `<div class="pl-template-item ${isActive ? 'active' : ''}" onclick="selectPlTemplate('${escapeAttr(t.id)}')">
      <img class="pl-template-item-thumb" src="${escapeAttr(thumb)}" alt="" />
      <div class="pl-template-check">✓</div>
      <div class="pl-template-item-name">${escapeHtml(t.name)}</div>
    </div>`;
  }).join('');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pl-adjust-trigger';
  btn.style.gridColumn = '1 / -1';
  btn.style.justifySelf = 'start';
  btn.textContent = '🔧 调整当前模板的内容位置';
  btn.addEventListener('click', openPlAdjustTool);
  box.appendChild(btn);
}

function selectPlTemplate(id) {
  const s = getPriceListSettings();
  s.templateId = id;
  setPriceListSettings(s);
  renderPlTemplateGrid();
  renderPriceListPreview();
}

/* ══════════ 分类列表渲染 ══════════ */

function renderPriceListItems() {
  const box = $('plCategoriesContainer');
  if (!box) return;

  const data = getPriceList();
  const ordered = getPlOrderedCategories(data);
  const maxPage = calcPlMaxPage(data);

  if (!ordered.length) {
    box.innerHTML = '<p style="font-size:12px;color:var(--ink-soft);margin:4px 0 8px;">暂无分类，点击下方按钮添加。</p>';
    return;
  }

  box.innerHTML = ordered.map((item, idx) => {
    const isFirst = idx === 0;
    const isLast  = idx === ordered.length - 1;
    return renderPlCategoryFold(item, isFirst, isLast, maxPage);
  }).join('');
}

function renderPlCategoryFold(item, isFirst, isLast, maxPage) {
  const cat = item.cat;
  const key = item.id;
  const isOpen = !!__plFoldOpenMap[key];
  const pageIndex = cat.pageIndex || 1;

  const head =
    '<div class="pl-fold-arrow">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="9 6 15 12 9 18"/>' +
      '</svg>' +
    '</div>' +
    '<div class="pl-fold-title">' +
      '<input value="' + escapeAttr(cat.name || '') + '" placeholder="分类名" ' +
             'onclick="event.stopPropagation()" ' +
             'oninput="onPlCategoryNameChange(' + item.ci + ', this.value)" />' +
    '</div>' +
    plPageSelectHtml(pageIndex, maxPage, 'onPlCategoryPageChange(' + item.ci + ', this.value)') +
    '<div class="pl-fold-actions">' +
      '<button class="icon-btn" onclick="event.stopPropagation();movePlCategoryUp(\'' + escapeAttr(key) + '\')" title="上移"' + (isFirst ? ' disabled' : '') + '>↑</button>' +
      '<button class="icon-btn" onclick="event.stopPropagation();movePlCategoryDown(\'' + escapeAttr(key) + '\')" title="下移"' + (isLast ? ' disabled' : '') + '>↓</button>' +
      '<button class="icon-btn" onclick="event.stopPropagation();deletePriceCategory(' + item.ci + ')" title="删除">×</button>' +
    '</div>';

  const body =
    '<label style="margin-top:0;">分类标签（逗号分隔，可留空）</label>' +
    '<input value="' + escapeAttr((cat.tags || []).join(', ')) + '" oninput="onPlCategoryTagsChange(' + item.ci + ', this.value)" />' +
    '<div style="margin-top:6px;padding-top:8px;border-top:1px dashed var(--line-soft);">' +
      '<label style="margin-top:0;">条目</label>' +
      (cat.items || []).map((plItem, ii) => renderPriceItemEdit(item.ci, ii, plItem)).join('') +
      '<button class="add-item-btn" onclick="addPriceItem(' + item.ci + ')">+ 添加条目</button>' +
    '</div>';

  return '<div class="pl-fold-block' + (isOpen ? ' is-open' : '') + '" data-fold-key="' + escapeAttr(key) + '">' +
    '<div class="pl-fold-head" onclick="togglePlFold(\'' + escapeAttr(key) + '\', event)">' + head + '</div>' +
    '<div class="pl-fold-body">' + body + '</div>' +
  '</div>';
}

/* ══════════ 附加模块列表渲染 ══════════ */

function renderPlModulesList() {
  const box = $('plModulesContainer');
  if (!box) return;

  const data = getPriceList();
  const mods = getPlModulesInOrder(data);
  const maxPage = calcPlMaxPage(data);

  box.innerHTML = mods.map(m => renderPlModuleFold(m, maxPage)).join('');
}

function renderPlModuleFold(item, maxPage) {
  const mod = item.mod;
  const key = item.key;
  const isOpen = !!__plFoldOpenMap[key];
  const pageIndex = mod.pageIndex || 1;
  const title = item.title;

  const head =
    '<div class="pl-fold-arrow">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="9 6 15 12 9 18"/>' +
      '</svg>' +
    '</div>' +
    '<div class="pl-fold-title">' +
      '<input value="' + escapeAttr(title) + '" placeholder="模块名" ' +
             'onclick="event.stopPropagation()" ' +
             'oninput="onPlModuleTitleChange(\'' + escapeAttr(key) + '\', this.value)" />' +
    '</div>' +
    plPageSelectHtml(pageIndex, maxPage, 'onPlModulePageChange(\'' + escapeAttr(key) + '\', this.value)') +
    '<div class="pl-fold-actions">' +
      '<label class="switch-wrap" onclick="event.stopPropagation();" title="启用 / 停用">' +
        '<span class="switch-label-text">启用</span>' +
        '<span class="switch">' +
          '<input type="checkbox" ' + (mod.enabled ? 'checked' : '') + ' ' +
                 'onchange="onPlModuleEnabledToggle(\'' + escapeAttr(key) + '\', this.checked)" />' +
          '<span class="switch-slider"></span>' +
        '</span>' +
      '</label>' +
    '</div>';

  const body =
    '<label style="margin-top:0;">内容（每行一条；横排模式下会排成一行）</label>' +
    renderPlModuleLines(key, mod.lines || []) +
    '<button class="add-item-btn" onclick="addPlModuleLine(\'' + escapeAttr(key) + '\')">+ 添加一行</button>';

  return '<div class="pl-fold-block' + (isOpen ? ' is-open' : '') + '" data-fold-key="' + escapeAttr(key) + '">' +
    '<div class="pl-fold-head" onclick="togglePlFold(\'' + escapeAttr(key) + '\', event)">' + head + '</div>' +
    '<div class="pl-fold-body">' + body + '</div>' +
  '</div>';
}

function renderPlModuleLines(key, lines) {
  if (!lines.length) {
    return '<p style="font-size:12px;color:var(--ink-soft);margin:4px 0 8px;">暂无内容。</p>';
  }
  return lines.map((line, i) =>
    '<div class="pl-line-row">' +
      '<div class="pl-line-idx">' + (i + 1) + '</div>' +
      '<div><input value="' + escapeAttr(line) + '" oninput="onPlModuleLineChange(\'' + escapeAttr(key) + '\', ' + i + ', this.value)" /></div>' +
      '<div><button class="icon-btn" onclick="deletePlModuleLine(\'' + escapeAttr(key) + '\', ' + i + ')">×</button></div>' +
    '</div>'
  ).join('');
}

/* ══════════ 页码下拉 ══════════ */

function calcPlMaxPage(data) {
  let m = 1;
  (data.categories || []).forEach(c => {
    const p = parseInt(c.pageIndex, 10) || 1;
    if (p > m) m = p;
  });
  PL_MODULE_KEYS.forEach(k => {
    const p = parseInt((data[k] && data[k].pageIndex) || 1, 10);
    if (p > m) m = p;
  });
  return Math.max(m + 1, 6);
}

function plPageSelectHtml(currentPage, maxPage, onchangeStr) {
  let opts = '';
  for (let p = 1; p <= maxPage; p++) {
    opts += '<option value="' + p + '"' + (p === currentPage ? ' selected' : '') + '>' + p + '</option>';
  }
  return '<div class="pl-page-select-wrap" onclick="event.stopPropagation()">' +
    '<span class="pl-page-select-label">第</span>' +
    '<select class="pl-page-select" onchange="' + onchangeStr + '">' + opts + '</select>' +
    '<span class="pl-page-select-label">页</span>' +
  '</div>';
}

/* ══════════ 分类条目编辑 ══════════ */

function renderPriceItemEdit(ci, ii, item) {
  const pricesHtml = (item.prices || []).map((p, pi) =>
    '<div class="pl-item-price-item">' +
      '<input class="pl-item-price-label" placeholder="单/双" value="' + escapeAttr(p.label || '') + '" ' +
             'oninput="onPlItemPriceChange(' + ci + ', ' + ii + ', ' + pi + ', \'label\', this.value)" />' +
      '<input class="pl-item-price-value" placeholder="价格" value="' + escapeAttr(p.value || '') + '" ' +
             'oninput="onPlItemPriceChange(' + ci + ', ' + ii + ', ' + pi + ', \'value\', this.value)" />' +
      '<button class="pl-item-price-del" onclick="deletePlItemPrice(' + ci + ', ' + ii + ', ' + pi + ')" title="删除此价格"' +
             ((item.prices || []).length <= 1 ? ' disabled' : '') + '>×</button>' +
    '</div>'
  ).join('');

  return '<div class="pl-item-edit">' +
    '<div class="pl-item-name-wrap">' +
      '<label style="margin-top:0;">条目名</label>' +
      '<input value="' + escapeAttr(item.name || '') + '" oninput="onPlItemNameChange(' + ci + ', ' + ii + ', this.value)" />' +
    '</div>' +
    '<div class="pl-item-price-row">' +
      pricesHtml +
      '<button class="icon-btn" style="align-self:flex-end;margin-bottom:4px;" onclick="addPlItemPrice(' + ci + ', ' + ii + ')" title="添加价格字段">+</button>' +
    '</div>' +
    '<div class="pl-item-actions">' +
      '<button class="icon-btn" onclick="deletePriceItem(' + ci + ', ' + ii + ')" title="删除条目">×</button>' +
    '</div>' +
    '<div class="pl-item-note-wrap">' +
      '<label style="margin-top:0;">备注（可选）</label>' +
      '<input value="' + escapeAttr(item.note || '') + '" placeholder="如：工艺+5/层 · 双面+10" ' +
             'oninput="onPlItemNoteChange(' + ci + ', ' + ii + ', this.value)" />' +
    '</div>' +
  '</div>';
}

/* ══════════ 分类操作 ══════════ */

function addPriceCategory() {
  const data = getPriceList();
  const id = makeUniqueId('plcat');

  const ordered = getPlOrderedCategories(data);
  const maxOrder = ordered.length > 0
    ? ordered.reduce((mx, x) => Math.max(mx, x.order), -1)
    : -1;

  data.categories.push({
    id,
    name: '',
    tags: [],
    items: [{ id: makeUniqueId('plitem'), name: '', prices: [{ label: '', value: '' }], note: '' }],
    pageIndex: 1,
    order: maxOrder + 1
  });
  setPriceList(data);
  renderPriceListItems();
}

function deletePriceCategory(ci) {
  const data = getPriceList();
  if (!data.categories[ci]) return;
  if (!confirm('确定删除这个分类吗？分类下的所有条目也会一起删除。')) return;
  data.categories.splice(ci, 1);
  setPriceList(data);
  renderPriceListItems();
}

/* ══════════ 分类上下移动 ══════════ */

function movePlCategoryUp(id) {
  const data = getPriceList();
  const ordered = getPlOrderedCategories(data);
  const idx = ordered.findIndex(x => x.id === id);
  if (idx <= 0) return;

  const tmp = ordered[idx - 1];
  ordered[idx - 1] = ordered[idx];
  ordered[idx] = tmp;

  ordered.forEach((item, i) => {
    data.categories[item.ci].order = i;
  });

  setPriceList(data);
  renderPriceListItems();
}

function movePlCategoryDown(id) {
  const data = getPriceList();
  const ordered = getPlOrderedCategories(data);
  const idx = ordered.findIndex(x => x.id === id);
  if (idx < 0 || idx >= ordered.length - 1) return;

  const tmp = ordered[idx + 1];
  ordered[idx + 1] = ordered[idx];
  ordered[idx] = tmp;

  ordered.forEach((item, i) => {
    data.categories[item.ci].order = i;
  });

  setPriceList(data);
  renderPriceListItems();
}

/* 兼容旧接口名 */
function movePlItemUp(id)   { movePlCategoryUp(id); }
function movePlItemDown(id) { movePlCategoryDown(id); }

/* ══════════ 分类字段编辑 ══════════ */

function onPlCategoryNameChange(ci, v) {
  const data = getPriceList();
  if (!data.categories[ci]) return;
  data.categories[ci].name = v;
  setPriceList(data);
}

function onPlCategoryTagsChange(ci, v) {
  const data = getPriceList();
  if (!data.categories[ci]) return;
  data.categories[ci].tags = String(v || '').split(',').map(x => x.trim()).filter(x => x);
  setPriceList(data);
}

function onPlCategoryPageChange(ci, v) {
  const data = getPriceList();
  if (!data.categories[ci]) return;
  data.categories[ci].pageIndex = Math.max(1, parseInt(v, 10) || 1);
  setPriceList(data);
}

/* ══════════ 附加模块字段编辑 ══════════ */

function onPlModuleTitleChange(key, v) {
  const data = getPriceList();
  if (!data[key]) return;
  data[key].title = v;
  setPriceList(data);
}

function onPlModuleEnabledToggle(key, checked) {
  const data = getPriceList();
  if (!data[key]) return;
  data[key].enabled = !!checked;
  setPriceList(data);
}

function onPlModulePageChange(key, v) {
  const data = getPriceList();
  if (!data[key]) return;
  data[key].pageIndex = Math.max(1, parseInt(v, 10) || 1);
  setPriceList(data);
}

function onPlModuleLineChange(key, i, v) {
  const data = getPriceList();
  if (!data[key] || !data[key].lines || data[key].lines[i] === undefined) return;
  data[key].lines[i] = v;
  setPriceList(data);
}

function deletePlModuleLine(key, i) {
  const data = getPriceList();
  if (!data[key] || !data[key].lines) return;
  data[key].lines.splice(i, 1);
  setPriceList(data);
  __plFoldOpenMap[key] = true;
  renderPlModulesList();
}

function addPlModuleLine(key) {
  const data = getPriceList();
  if (!data[key]) return;
  if (!data[key].lines) data[key].lines = [];
  data[key].lines.push('');
  setPriceList(data);
  __plFoldOpenMap[key] = true;
  renderPlModulesList();

  setTimeout(() => {
    const box = document.querySelector('.pl-fold-block[data-fold-key="' + CSS.escape(key) + '"]');
    if (!box) return;
    const inputs = box.querySelectorAll('.pl-line-row input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 30);
}

/* ══════════ 分类条目字段编辑 ══════════ */

function addPriceItem(ci) {
  const data = getPriceList();
  if (!data.categories[ci]) return;
  data.categories[ci].items.push({
    id: makeUniqueId('plitem'),
    name: '',
    prices: [{ label: '', value: '' }],
    note: ''
  });
  const key = data.categories[ci].id || ('catidx_' + ci);
  __plFoldOpenMap[key] = true;
  setPriceList(data);
  renderPriceListItems();
}

function deletePriceItem(ci, ii) {
  const data = getPriceList();
  if (!data.categories[ci] || !data.categories[ci].items[ii]) return;
  data.categories[ci].items.splice(ii, 1);
  setPriceList(data);
  renderPriceListItems();
}

function onPlItemNameChange(ci, ii, v) {
  const data = getPriceList();
  if (!data.categories[ci] || !data.categories[ci].items[ii]) return;
  data.categories[ci].items[ii].name = v;
  setPriceList(data);
}

function onPlItemNoteChange(ci, ii, v) {
  const data = getPriceList();
  if (!data.categories[ci] || !data.categories[ci].items[ii]) return;
  data.categories[ci].items[ii].note = v;
  setPriceList(data);
}

function addPlItemPrice(ci, ii) {
  const data = getPriceList();
  if (!data.categories[ci] || !data.categories[ci].items[ii]) return;
  data.categories[ci].items[ii].prices.push({ label: '', value: '' });
  setPriceList(data);
  renderPriceListItems();
}

function deletePlItemPrice(ci, ii, pi) {
  const data = getPriceList();
  const item = data.categories[ci] && data.categories[ci].items[ii];
  if (!item || !item.prices[pi]) return;
  if (item.prices.length <= 1) return;
  item.prices.splice(pi, 1);
  setPriceList(data);
  renderPriceListItems();
}

function onPlItemPriceChange(ci, ii, pi, field, v) {
  const data = getPriceList();
  const item = data.categories[ci] && data.categories[ci].items[ii];
  if (!item || !item.prices[pi]) return;
  item.prices[pi][field] = v;
  setPriceList(data);
}

/* ══════════ 横排开关 ══════════ */

function onPlHorizontalToggle() {
  const s = getPriceListSettings();
  s.moduleHorizontal = !!($('plHorizontalModules') && $('plHorizontalModules').checked);
  setPriceListSettings(s);
  renderPriceListPreview();
}

/* ══════════ 标题 / 底部 / 流程开关 ══════════ */

function onPlTitleEnabledChange() {
  const data = getPriceList();
  data.signature.enabled = $('plTitleEnabled').checked;
  setPriceList(data);
}

function onPlBottomEnabledChange() {
  const data = getPriceList();
  data.footer.enabled = $('plBottomEnabled').checked;
  setPriceList(data);
}

function onPlProcessNewPageChange() {
  const data = getPriceList();
  data.processNewPage = !!($('plProcessNewPage') && $('plProcessNewPage').checked);
  setPriceList(data);
}

function onPlContentChange() {
  const data = getPriceList();
  if ($('plTitleSign')) data.signature.content = $('plTitleSign').value;
  if ($('plBottomText')) data.footer.text = $('plBottomText').value;
  setPriceList(data);
}

/* ══════════ 弹窗：约稿流程 / 须知 ══════════ */

function openPlProcessModal() {
  const g = getPriceListGlobal();
  openPlLinesEditor('编辑约稿流程', g.process || [], function (lines) {
    const gg = getPriceListGlobal();
    gg.process = lines;
    setPriceListGlobal(gg);
  });
}

function openPlNoticeModal() {
  const g = getPriceListGlobal();
  openPlLinesEditor('编辑约稿须知', g.notice || [], function (lines) {
    const gg = getPriceListGlobal();
    gg.notice = lines;
    setPriceListGlobal(gg);
  });
}

function openPlLinesEditor(title, lines, onSave) {
  let copy = (lines || []).slice();
  if (!copy.length) copy.push('');

  function collect() {
    document.querySelectorAll('#plLinesList .pl-line-input').forEach((inp, i) => {
      copy[i] = inp.value;
    });
  }

  function render() {
    const listHtml = copy.map((line, i) =>
      '<div class="pl-line-row">' +
        '<div class="pl-line-idx">' + (i + 1) + '</div>' +
        '<div><input class="pl-line-input" value="' + escapeAttr(line) + '" /></div>' +
        '<div><button class="icon-btn" data-i="' + i + '" data-act="del">×</button></div>' +
      '</div>'
    ).join('');

    $('modalRoot').innerHTML =
      '<div class="modal-overlay" onclick="if(event.target===this)closeModal()">' +
        '<div class="modal" onclick="event.stopPropagation()">' +
          '<div class="modal-head">' +
            '<h3>' + escapeHtml(title) + '</h3>' +
            '<button class="icon-btn" onclick="closeModal()">×</button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<label class="pl-lines-paste-label">整段粘贴（每行一条，点下方按钮拆分成条目）</label>' +
            '<textarea class="pl-lines-paste" id="plLinesPaste" placeholder="粘贴一整段文字，会自动按换行拆分成条目…"></textarea>' +
            '<div class="pl-lines-paste-actions">' +
              '<button class="action-btn" id="plLinesPasteApply">拆分并覆盖下方列表</button>' +
            '</div>' +
            '<label class="pl-lines-paste-label">条目列表（可逐行编辑）</label>' +
            '<div id="plLinesList">' + listHtml + '</div>' +
            '<button class="add-item-btn" id="plLinesAddBtn">+ 添加一行</button>' +
            '<div class="actions" style="justify-content:flex-end;margin-top:18px;">' +
              '<button class="action-btn ghost" onclick="closeModal()">取消</button>' +
              '<button class="action-btn" id="plLinesSaveBtn">保存</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    $('plLinesPasteApply').addEventListener('click', function () {
      const raw = ($('plLinesPaste').value || '');
      const arr = raw.split(/\r?\n/).map(s => s.trim()).filter(s => s);
      if (!arr.length) { alert('粘贴框里没有内容。'); return; }
      copy = arr.slice();
      render();
    });

    $('plLinesList').addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-act="del"]');
      if (!btn) return;
      collect();
      copy.splice(parseInt(btn.dataset.i, 10), 1);
      if (!copy.length) copy.push('');
      render();
    });

    $('plLinesAddBtn').addEventListener('click', function () {
      collect();
      copy.push('');
      render();
      setTimeout(() => {
        const inputs = document.querySelectorAll('#plLinesList .pl-line-input');
        if (inputs.length) inputs[inputs.length - 1].focus();
      }, 20);
    });

    $('plLinesSaveBtn').addEventListener('click', function () {
      collect();
      onSave(copy.filter(x => x.trim()));
      closeModal();
    });
  }

  render();
}

/* ══════════ 样式修改 ══════════ */

function onPlStyleChange() {
  const s = getPriceListSettings();

  if ($('plFollowTheme')) s.followTheme = $('plFollowTheme').checked;
  if ($('plShowDotted'))  s.showDottedLine = $('plShowDotted').checked;
  if ($('plFont'))        s.font = $('plFont').value;
  if ($('plFontSize'))    s.fontSize = parseFloat($('plFontSize').value) || PL_DEFAULT_FONT_SIZE;

  /* 六色 */
  if ($('plColorTitle'))   s.colorTitle   = $('plColorTitle').value;
  if ($('plColorContent')) s.colorContent = $('plColorContent').value;
  if ($('plColorSmall'))   s.colorSmall   = $('plColorSmall').value;
  if ($('plDecoColor'))    s.decoColor    = $('plDecoColor').value;
  if ($('plDecoCategory')) s.decoCategory = $('plDecoCategory').value;
  if ($('plDecoModule'))   s.decoModule   = $('plDecoModule').value;
  if ($('plDecoNotice'))   s.decoNotice   = $('plDecoNotice').value;

  if ($('plBgOpacity'))   s.bgCoverOpacity = parseFloat($('plBgOpacity').value);

  if ($('plFontSizeVal')) $('plFontSizeVal').textContent = s.fontSize.toFixed(1) + 'px';
  if ($('plBgOpacityVal')) $('plBgOpacityVal').textContent = Math.round(s.bgCoverOpacity * 100) + '%';

  setPriceListSettings(s);
  schedulePlPreviewRender();
}

/* ══════════ 三组标题样式切换 ══════════ */

function setPlCategoryStyle(mode) {
  const s = getPriceListSettings();
  s.categoryStyle = mode;
  setPriceListSettings(s);
  updatePlStyleBtns();
  renderPriceListPreview();
}

function setPlModuleStyle(mode) {
  const s = getPriceListSettings();
  s.moduleStyle = mode;
  setPriceListSettings(s);
  updatePlStyleBtns();
  renderPriceListPreview();
}

function setPlNoticeStyle(mode) {
  const s = getPriceListSettings();
  s.noticeStyle = mode;
  setPriceListSettings(s);
  updatePlStyleBtns();
  renderPriceListPreview();
}

/* ══════════ 装饰色统一开关 ══════════ */

function onPlDecoUnifiedToggle() {
  const s = getPriceListSettings();
  s.decoUnified = !!($('plDecoUnified') && $('plDecoUnified').checked);
  setPriceListSettings(s);
  updateDecoBlocks();
  renderPriceListPreview();
}
/* 恢复默认颜色 */
function resetPlColors() {
  if (!confirm('确定把颜色恢复为初始默认吗？')) return;

  const s = getPriceListSettings();
  s.colorTitle   = '#111111';
  s.colorContent = '#111111';
  s.colorSmall   = '#555555';
  s.decoUnified  = true;
  s.decoColor    = '#111111';
  s.decoCategory = '#111111';
  s.decoModule   = '#111111';
  s.decoNotice   = '#111111';
  setPriceListSettings(s);

  renderPriceListStyleForm(s);
  renderPriceListPreview();
}

/* ══════════ 字体大小复位 ══════════ */

function resetPlFontSize() {
  if ($('plFontSize')) $('plFontSize').value = PL_DEFAULT_FONT_SIZE;
  if ($('plFontSizeVal')) $('plFontSizeVal').textContent = PL_DEFAULT_FONT_SIZE.toFixed(1) + 'px';
  const s = getPriceListSettings();
  s.fontSize = PL_DEFAULT_FONT_SIZE;
  setPriceListSettings(s);
}

/* ══════════ 布局 / 分页 ══════════ */

function setPlLayout(mode) {
  const s = getPriceListSettings();
  const wasSingle = s.layout === 'single';
  s.layout = mode;

  /* 切到单栏自动开横排（用户之后仍可手动改回） */
  if (mode === 'single' && !wasSingle) {
    s.moduleHorizontal = true;
    if ($('plHorizontalModules')) $('plHorizontalModules').checked = true;
  }

  setPriceListSettings(s);
  document.querySelectorAll('#plLayoutOptions .flow-opt-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  renderPriceListPreview();
}

function setPlPagination(mode) {
  const s = getPriceListSettings();
  s.paginationMode = mode;
  setPriceListSettings(s);
  document.querySelectorAll('#plPaginationOptions .flow-opt-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  renderPriceListPreview();
}

/* ══════════ 图片（背景图） ══════════ */

function setupPriceListImgInputs() {
  const input = $('plBgImgInput');
  if (!input || input.__plBound) return;
  input.__plBound = true;
  input.addEventListener('change', async function (e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const file = files[0];
    if (!/^image\//.test(file.type)) { alert('请选择图片文件。'); return; }
    try {
      const ref = await saveImageFromFile(file, file.name || 'pl_bg');
      if (!ref) { alert('保存失败，请重试。'); return; }
      const s = getPriceListSettings();
      const oldRef = s.bgCoverImg;
      s.bgCoverImg = ref;
      if (oldRef && oldRef !== ref) { try { await deleteImageRef(oldRef); } catch (err) {} }
      setPriceListSettings(s);
      renderPriceListPreview();
    } catch (err) {
      alert('图片处理出错：' + (err && err.message ? err.message : '未知'));
    }
  });
}

async function clearPriceListImg(kind) {
  const s = getPriceListSettings();
  const oldRef = s.bgCoverImg;
  s.bgCoverImg = '';
  setPriceListSettings(s);
  if (oldRef) { try { await deleteImageRef(oldRef); } catch (e) {} }
  renderPriceListPreview();
}

/* ══════════ 一键导入 ══════════ */

function importPriceListFromSettings() {
  const data = getPriceList();

  const hasSomething =
    (data.categories || []).some(c => (c.items || []).length) ||
    (data.extra.lines || []).length ||
    (data.discount.lines || []).length ||
    (data.usage.lines || []).length;

  if (hasSomething) {
    if (!confirm('导入会覆盖当前价目表内容（外观不受影响），确定继续吗？')) return;
  }

  const groups = getPresetGroups().slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const presets = getPresets();
  const ungrouped = presets.filter(p => !p.groupId);
  const newCats = [];

  groups.forEach(g => {
    const items = presets.filter(p => p.groupId === g.id);
    if (!items.length) return;
    newCats.push({
      id: makeUniqueId('plcat'),
      name: g.name,
      tags: [],
      items: items.map(presetToPriceItem),
      pageIndex: 1,
      order: newCats.length
    });
  });

  if (ungrouped.length) {
    newCats.push({
      id: makeUniqueId('plcat'),
      name: '其他',
      tags: [],
      items: ungrouped.map(presetToPriceItem),
      pageIndex: 1,
      order: newCats.length
    });
  }

  data.categories = newCats;

  const perms = getPermissions();
  data.usage.lines = perms.map(p => p.name + ' ×' + trimNum(p.rate));

  const extras = getExtraPresets();
  data.extra.lines = extras.map(p => {
    const v = p.op === 'multiply' ? pctShort(p.value) : ('¥' + trimNum(p.value));
    return p.name + ' +' + v;
  });

  const discounts = getDiscountPresets();
  data.discount.lines = discounts.map(p => {
    const v = p.op === 'multiply' ? pctShort(p.value) : ('¥' + trimNum(p.value));
    return p.name + ' ' + (p.op === 'multiply' ? '×' : '−') + v;
  });

  const name = $('setName') ? $('setName').value.trim() : '';
  if (name) data.signature.content = name;

  if (!setPriceList(data)) return;

  renderPriceListSettingsForm();

  showSimpleAlert('导入完成',
    '已导入：<br>' +
    '· 稿件分类 ' + newCats.length + ' 个<br>' +
    '· 用途 ' + data.usage.lines.length + ' 项<br>' +
    '· 附加 ' + data.extra.lines.length + ' 项<br>' +
    '· 优惠 ' + data.discount.lines.length + ' 项<br>' +
    '导入后可以自由修改。'
  );
}

function presetToPriceItem(p) {
  const item = { id: makeUniqueId('plitem'), name: p.name || '', prices: [], note: '' };

  if (p.mode === 'fixed') {
    item.prices = [{ label: '', value: fmtPriceNum(p.fixedPrice) }];
  } else if (p.mode === 'sides') {
    item.prices = [
      { label: '单', value: fmtPriceNum(p.singlePrice) },
      { label: '双', value: fmtPriceNum(p.doublePrice) }
    ];
  } else if (p.mode === 'base_addon') {
    item.prices = [{ label: '', value: fmtPriceNum(p.basePrice) }];
    if (p.addons && p.addons.length) {
      item.note = p.addons.map(a => {
        const v = a.op === 'multiply' ? pctShort(a.value) : ('¥' + trimNum(a.value));
        return a.name + ' ' + (a.op === 'multiply' ? '×' : '+') + v;
      }).join(' · ');
    }
  } else if (p.mode === 'nodes') {
    item.prices = [{ label: '', value: fmtPriceNum(p.basePrice) }];
    if (p.nodes && p.nodes.length) {
      item.note = p.nodes.map(n => n.name + ' ' + pctShort(n.ratio)).join(' · ');
    }
  } else if (p.mode === 'base_addon_nodes') {
    item.prices = [{ label: '', value: fmtPriceNum(p.basePrice) }];
    const notes = [];
    if (p.addons && p.addons.length) {
      notes.push(p.addons.map(a => {
        const v = a.op === 'multiply' ? pctShort(a.value) : ('¥' + trimNum(a.value));
        return a.name + ' ' + (a.op === 'multiply' ? '×' : '+') + v;
      }).join(' · '));
    }
    if (p.nodes && p.nodes.length) {
      notes.push(p.nodes.map(n => n.name + ' ' + pctShort(n.ratio)).join(' · '));
    }
    if (notes.length) item.note = notes.join(' · ');
  }
  return item;
}

function fmtPriceNum(n) {
  const v = Number(n) || 0;
  return v % 1 === 0 ? String(v) : v.toFixed(2);
}

/* ══════════ 预设 ══════════ */

function savePriceListPreset() {
  const list = getPriceListPresets();
  if (list.length >= PRICE_LIST_MAX_PRESETS) {
    showSimpleAlert('无法新增', '最多保存 ' + PRICE_LIST_MAX_PRESETS + ' 个价目表预设。<br>请先在「加载」里删除一个。');
    return;
  }

  const defaultName = '模板' + (list.length + 1);
  $('modalRoot').innerHTML =
    '<div class="modal-overlay" onclick="if(event.target===this)closeModal()">' +
      '<div class="modal" onclick="event.stopPropagation()">' +
        '<div class="modal-head">' +
          '<h3>保存价目表预设</h3>' +
          '<button class="icon-btn" onclick="closeModal()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<label>预设名称</label>' +
          '<input id="plPresetName" placeholder="' + escapeAttr(defaultName) + '" maxlength="30" />' +
          '<p style="font-size:11.5px;color:var(--ink-soft);margin-top:12px;">' +
            '保存内容：价目表内容 + 模板 + 外观 + 约稿流程 / 须知。' +
          '</p>' +
          '<div class="actions" style="justify-content:flex-end;margin-top:18px;">' +
            '<button class="action-btn ghost" onclick="closeModal()">取消</button>' +
            '<button class="action-btn" onclick="confirmSavePriceListPreset(\'' + escapeAttr(defaultName) + '\')">保存</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  setTimeout(() => { const el = $('plPresetName'); if (el) el.focus(); }, 50);
}

function confirmSavePriceListPreset(defaultName) {
  const name = ($('plPresetName') && $('plPresetName').value.trim()) || defaultName;
  const list = getPriceListPresets();
  if (list.length >= PRICE_LIST_MAX_PRESETS) { closeModal(); return; }

  list.push({
    id: makePriceListPresetId(),
    name: name,
    createdAt: Date.now(),
    data: JSON.parse(JSON.stringify(getPriceList())),
    settings: JSON.parse(JSON.stringify(getPriceListSettings())),
    global: JSON.parse(JSON.stringify(getPriceListGlobal()))
  });

  if (!setPriceListPresets(list)) return;
  closeModal();
  showSimpleAlert('已保存', '预设「' + escapeHtml(name) + '」已保存。');
}

function openPriceListPresetPicker() {
  const list = getPriceListPresets();

  if (!list.length) {
    $('modalRoot').innerHTML =
      '<div class="modal-overlay" onclick="if(this===event.target)closeModal()">' +
        '<div class="modal" onclick="event.stopPropagation()">' +
          '<div class="modal-head"><h3>加载价目表预设</h3><button class="icon-btn" onclick="closeModal()">×</button></div>' +
          '<div class="modal-body">' +
            '<div class="rp-empty">还没有保存任何预设。<br>先点「存储」创建一个吧。</div>' +
            '<div class="actions" style="justify-content:flex-end;margin-top:18px;">' +
              '<button class="action-btn" onclick="closeModal()">关闭</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  const itemsHtml = list.map((p, i) => {
    const dt = p.createdAt ? new Date(p.createdAt) : null;
    const dateStr = dt
      ? (dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'))
      : '';
    return '<div class="rp-item" onclick="applyPriceListPresetByIndex(' + i + ')">' +
      '<div class="rp-item-name">' +
        escapeHtml(p.name || '未命名') +
        '<div class="rp-item-sub">保存于 ' + escapeHtml(dateStr) + '</div>' +
      '</div>' +
      '<button type="button" class="rp-item-del" onclick="event.stopPropagation();deletePriceListPreset(' + i + ')" title="删除">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M3 6 H21"/>' +
          '<path d="M8 6 V4 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V6"/>' +
          '<path d="M6 6 L7 20 a2 2 0 0 0 2 2 h6 a2 2 0 0 0 2 -2 L17 6"/>' +
        '</svg>' +
      '</button>' +
    '</div>';
  }).join('');

  $('modalRoot').innerHTML =
    '<div class="modal-overlay" onclick="if(event.target===this)closeModal()">' +
      '<div class="modal" onclick="event.stopPropagation()">' +
        '<div class="modal-head">' +
          '<h3>加载价目表预设</h3>' +
          '<button class="icon-btn" onclick="closeModal()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="rp-count">共 ' + list.length + ' / ' + PRICE_LIST_MAX_PRESETS + ' 个预设 · 点击套用</div>' +
          '<div class="rp-list">' + itemsHtml + '</div>' +
          '<div class="actions" style="justify-content:flex-end;margin-top:18px;">' +
            '<button class="action-btn" onclick="closeModal()">关闭</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function applyPriceListPresetByIndex(i) {
  const list = getPriceListPresets();
  const preset = list[i];
  if (!preset) return;

  if (preset.data)   setPriceList(JSON.parse(JSON.stringify(preset.data)));
  if (preset.global) setPriceListGlobal(JSON.parse(JSON.stringify(preset.global)));

  const s = Object.assign(makeDefaultPriceListSettings(), preset.settings || {});
  s.followTheme = false;
  setPriceListSettings(s);

  closeModal();
  showSimpleAlert('已加载', '预设「' + escapeHtml(preset.name || '') + '」已套用。');

  if ($('pagePriceListSettings') && $('pagePriceListSettings').classList.contains('active')) {
    renderPriceListSettingsForm();
  } else {
    renderPriceListPreview();
  }
}

function deletePriceListPreset(i) {
  const list = getPriceListPresets();
  const p = list[i];
  if (!p) return;
  if (!confirm('确定删除预设「' + (p.name || '未命名') + '」吗？')) return;
  list.splice(i, 1);
  setPriceListPresets(list);
  closeModal();
  openPriceListPresetPicker();
}

function resetPriceListSettings() {
  if (!confirm('确定把价目表外观恢复为默认吗？（内容不受影响）')) return;
  setPriceListSettings(makeDefaultPriceListSettings());
  renderPriceListSettingsForm();
  showSimpleAlert('已恢复', '价目表外观已恢复默认。');
}

/* ══════════ 保存图片 ══════════ */

async function savePriceListImage() {
  const pages = document.querySelectorAll('#priceListPages .pl-page');
  if (!pages.length) {
    showSimpleAlert('提示', '价目表还没有内容。');
    return;
  }

  const nums = document.querySelectorAll('.pl-page-num');
  nums.forEach(el => { el.dataset.oldDisplay = el.style.display; el.style.display = 'none'; });

  try {
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      const link = document.createElement('a');
      const suffix = pages.length > 1 ? ('_' + (i + 1)) : '';
      link.download = '价目表' + suffix + '.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(r => setTimeout(r, 250));
    }
  } catch (err) {
    alert('生成图片失败：' + (err && err.message ? err.message : '未知'));
  } finally {
    nums.forEach(el => { el.style.display = el.dataset.oldDisplay || ''; });
  }
}

/* ══════════ 初始化 ══════════ */

(function initPriceListModule() {
  function bind() {
    setupPriceListImgInputs();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    setTimeout(bind, 200);
  }
})();


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-57] 价目表位置调整工具（开发用）                 ║
   ╚══════════════════════════════════════════════════════╝ */

var __plAdjustState = null;

function openPlAdjustTool() {
  const s = getPriceListSettings();
  const tpl = getPlTemplate(s.templateId);

  if (!tpl || !tpl.bgUrl) {
    showSimpleAlert('提示', '当前模板没有底图，无法调整。<br>请先在「模板」里选一个带底图的模板。');
    return;
  }

  // 复制当前 layout，避免直接改模板
  const layout = JSON.parse(JSON.stringify(tpl.layout));

  const overlay = document.createElement('div');
  overlay.className = 'pl-adjust-overlay';
  overlay.id = 'plAdjustOverlay';
  overlay.innerHTML =
    '<div class="pl-adjust-stage" id="plAdjustStage">' +
      '<img class="pl-adjust-bg" src="' + escapeAttr(tpl.bgUrl) + '" alt="" />' +
      '<div class="pl-adjust-frame" data-key="content">' +
        '<div class="pl-adjust-frame-label">正文区</div>' +
        makeAdjustHandles() +
      '</div>' +
      '<div class="pl-adjust-frame" data-key="sign">' +
        '<div class="pl-adjust-frame-label">署名</div>' +
        makeAdjustHandles() +
      '</div>' +
      '<div class="pl-adjust-frame" data-key="footer">' +
        '<div class="pl-adjust-frame-label">底部说明</div>' +
        makeAdjustHandles() +
      '</div>' +
    '</div>' +
    '<div class="pl-adjust-bar">' +
      '<h3>拖动框移动 · 拉边角调整大小</h3>' +
      '<div class="pl-adjust-info" id="plAdjustInfo"></div>' +
      '<div class="pl-adjust-actions">' +
        '<button type="button" class="pl-adjust-btn" id="plAdjustCopy">复制参数</button>' +
        '<button type="button" class="pl-adjust-btn ghost" id="plAdjustReset">重置</button>' +
        '<button type="button" class="pl-adjust-btn ghost" id="plAdjustClose">关闭</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  __plAdjustState = {
    overlay: overlay,
    stage: document.getElementById('plAdjustStage'),
    frames: {},
    layout: layout,
    originalLayout: JSON.parse(JSON.stringify(tpl.layout))
  };

  ['content', 'sign', 'footer'].forEach(function (key) {
    const el = overlay.querySelector('.pl-adjust-frame[data-key="' + key + '"]');
    __plAdjustState.frames[key] = el;
    applyFrameFromLayout(key);
    bindFrameInteractions(key, el);
  });

  updatePlAdjustInfo();

  document.getElementById('plAdjustCopy').addEventListener('click', copyPlAdjustResult);
  document.getElementById('plAdjustReset').addEventListener('click', resetPlAdjustAll);
  document.getElementById('plAdjustClose').addEventListener('click', closePlAdjustTool);
}

function makeAdjustHandles() {
  return ['nw','n','ne','w','e','sw','s','se'].map(function (d) {
    return '<div class="pl-adjust-handle" data-dir="' + d + '"></div>';
  }).join('');
}

function applyFrameFromLayout(key) {
  const st = __plAdjustState;
  if (!st) return;
  const L = st.layout[key];
  const el = st.frames[key];
  if (!el || !L) return;
  el.style.left   = L.left + '%';
  el.style.top    = L.top + '%';
  el.style.width  = L.width + '%';
  el.style.height = L.height + '%';
}

function syncLayoutFromFrame(key) {
  const st = __plAdjustState;
  if (!st) return;
  const el = st.frames[key];
  if (!el) return;
  const stageRect = st.stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const L = st.layout[key];
  if (!L) return;
  L.left   = roundPl2((r.left - stageRect.left) / stageRect.width  * 100);
  L.top    = roundPl2((r.top  - stageRect.top)  / stageRect.height * 100);
  L.width  = roundPl2(r.width  / stageRect.width  * 100);
  L.height = roundPl2(r.height / stageRect.height * 100);
}

function roundPl2(n) {
  return Math.round(n * 100) / 100;
}

function bindFrameInteractions(key, frame) {
  const st = __plAdjustState;
  if (!st) return;

  frame.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const handle = e.target.closest('.pl-adjust-handle');
    const dir = handle ? handle.dataset.dir : 'move';

    e.preventDefault();
    e.stopPropagation();

    const stageRect = st.stage.getBoundingClientRect();
    const startRect = frame.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;

    const L0 = startRect.left;
    const T0 = startRect.top;
    const R0 = startRect.right;
    const B0 = startRect.bottom;

    function move(ev) {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;

      let L = L0, T = T0, R = R0, B = B0;

      if (dir === 'move') {
        L += dx; T += dy; R += dx; B += dy;
      } else {
        if (dir.indexOf('w') > -1) L += dx;
        if (dir.indexOf('e') > -1) R += dx;
        if (dir.indexOf('n') > -1) T += dy;
        if (dir.indexOf('s') > -1) B += dy;
      }

      // 最小 10px
      if (R - L < 10) { if (dir.indexOf('w') > -1) L = R - 10; else R = L + 10; }
      if (B - T < 10) { if (dir.indexOf('n') > -1) T = B - 10; else B = T + 10; }

      const pL = (L - stageRect.left) / stageRect.width  * 100;
      const pT = (T - stageRect.top)  / stageRect.height * 100;
      const pW = (R - L) / stageRect.width  * 100;
      const pH = (B - T) / stageRect.height * 100;

      frame.style.left   = pL + '%';
      frame.style.top    = pT + '%';
      frame.style.width  = pW + '%';
      frame.style.height = pH + '%';

      syncLayoutFromFrame(key);
      updatePlAdjustInfo();
    }

    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      syncLayoutFromFrame(key);
      updatePlAdjustInfo();
    }

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
}

function updatePlAdjustInfo() {
  const st = __plAdjustState;
  if (!st) return;
  const el = document.getElementById('plAdjustInfo');
  if (!el) return;

  ['content', 'sign', 'footer'].forEach(syncLayoutFromFrame);

  const L = st.layout;
  function fmt(o) {
    return '{ left: ' + o.left + ', top: ' + o.top + ', width: ' + o.width + ', height: ' + o.height + ' }';
  }
  el.textContent =
    'content: ' + fmt(L.content) + '\n' +
    'sign:    ' + fmt(L.sign)    + '\n' +
    'footer:  ' + fmt(L.footer);
}

function copyPlAdjustResult() {
  const st = __plAdjustState;
  if (!st) return;
  const info = document.getElementById('plAdjustInfo');
  if (!info) return;

  const tpl = getPlTemplate(getPriceListSettings().templateId);
  const text =
    "id: '" + (tpl ? tpl.id : '') + "',\n" +
    info.textContent;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      alert('已复制到剪贴板，粘贴给我即可。');
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function resetPlAdjustAll() {
  const st = __plAdjustState;
  if (!st) return;
  if (!confirm('确定把所有框重置到初始位置吗？')) return;
  st.layout = JSON.parse(JSON.stringify(st.originalLayout));
  ['content', 'sign', 'footer'].forEach(function (key) {
    applyFrameFromLayout(key);
  });
  updatePlAdjustInfo();
}

function closePlAdjustTool() {
  const st = __plAdjustState;
  if (!st) return;
  if (st.overlay && st.overlay.parentNode) {
    st.overlay.parentNode.removeChild(st.overlay);
  }
  __plAdjustState = null;
}


/* ╔══════════════════════════════════════════════════════╗
   ║  [JS-101] 价目表数据 & 渲染诊断（临时）               ║
   ║                                                      ║
   ║  用法：双击首页标题「专属结单助手」运行。              ║
   ╚══════════════════════════════════════════════════════╝ */

function quickPlDiag() {
  const data     = getPriceList();
  const global   = getPriceListGlobal();
  const settings = getPriceListSettings();

  const lines = [];
  lines.push('【数据】');
  lines.push('分类数：' + (data.categories || []).length +
             '，条目总数：' + (data.categories || []).reduce((s, c) => s + ((c.items || []).length), 0));
  lines.push('加价项：开关=' + data.extra.enabled + '，内容=' + (data.extra.lines || []).length + ' 条');
  lines.push('优惠折扣：开关=' + data.discount.enabled + '，内容=' + (data.discount.lines || []).length + ' 条');
  lines.push('用途：开关=' + data.usage.enabled + '，内容=' + (data.usage.lines || []).length + ' 条');
  lines.push('约稿流程：' + (global.process || []).length + ' 条');
  lines.push('约稿须知：' + (global.notice  || []).length + ' 条');
  lines.push('');
  lines.push('【设置】');
  lines.push('当前模板：' + settings.templateId);
  lines.push('单/双栏：' + settings.layout);
  lines.push('分页模式：' + settings.paginationMode);
  lines.push('流程另起一页：' + data.processNewPage);
  lines.push('');

  // ★ 关键信息：检测点是否生效
  lines.push('【渲染结果】');
  const pages = document.querySelectorAll('#priceListPages .pl-page');
  lines.push('总页数：' + pages.length);
  pages.forEach(function (p, i) {
    const area  = p.querySelector('.pl-content-area');
    const inner = area ? area.querySelector('.pl-content-inner') : null;
    const areaH  = area  ? Math.round(area.getBoundingClientRect().height)  : 0;
    const innerH = inner ? Math.round(inner.getBoundingClientRect().height) : 0;
    const overflow = innerH > areaH + 1 ? ' ⚠️ 溢出 ' + (innerH - areaH) + 'px' : '';

    const cols = p.querySelectorAll('.pl-col');
    let count = 0;
    const names = [];
    cols.forEach(function (c) {
      Array.from(c.children).forEach(function (child) {
        count++;
        const t = (child.textContent || '').trim().slice(0, 10);
        names.push(t);
      });
    });
    const tail = p.querySelector('.pl-parallel-section');
    lines.push('第 ' + (i + 1) + ' 页：' + count + ' 项' +
               '  高度 ' + innerH + '/' + areaH + overflow +
               (tail ? ' + 尾部块' : '') +
               '  内容：' + (names.slice(0, 6).join(' / ') || '(空)'));
  });

  lines.push('');
  lines.push('【当前条目流（前 10 项）】');
  try {
    const entries = buildPlEntries(data, global, settings, settings.layout === 'single');
    entries.slice(0, 10).forEach(function (e, i) {
      lines.push((i + 1) + '. [' + e.ownerId + '] ' + (e.ownerTitle || '(无标题)') +
                 ' - ' + (e.el.textContent || '').trim().slice(0, 20));
    });
    lines.push('总共 ' + entries.length + ' 项');
  } catch (err) {
    lines.push('生成条目失败：' + (err && err.message ? err.message : err));
  }

  const text = lines.join('\n');

  document.getElementById('modalRoot').innerHTML =
    '<div class="modal-overlay" onclick="if(event.target===this)closeModal()">' +
      '<div class="modal" onclick="event.stopPropagation()" style="max-width:680px;">' +
        '<div class="modal-head">' +
          '<h3>价目表数据诊断</h3>' +
          '<button class="icon-btn" onclick="closeModal()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<pre style="background:#f7f8fa;padding:14px;font-size:12px;line-height:1.7;' +
                       'white-space:pre-wrap;word-break:break-word;margin:0;max-height:60vh;overflow:auto;">' +
            escapeHtml(text) +
          '</pre>' +
          '<div class="actions" style="justify-content:flex-end;margin-top:14px;">' +
            '<button class="action-btn" onclick="closeModal()">关闭</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

(function bindQuickPlDiag() {
  function bind() {
    const t = document.querySelector('#pageMain .home-title');
    if (!t || t.__quickPlDiag) return;
    t.__quickPlDiag = true;
    t.style.cursor = 'pointer';
    t.title = '双击运行数据诊断';
    t.addEventListener('dblclick', function (e) {
      e.preventDefault();
      e.stopPropagation();
      quickPlDiag();
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else setTimeout(bind, 600);
})();