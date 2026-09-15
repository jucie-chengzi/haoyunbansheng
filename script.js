/* ╔══════════════════════════════════════════════════════╗
   ║  00-utils.js · 专属结单助手                           ║
   ║                                                      ║
   ║  职责：全局常量、格式化、DOM 工具、通用弹窗、页面切换  ║
   ║                                                      ║
   ║  ⚠️ 本文件必须最先加载                                ║
   ║     所有跨模块共享的 const 都放这里，避免 TDZ 报错     ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [U-01] 全局常量 / 存储 key                          ║
   ║   [U-02] 数字与日期格式化                             ║
   ║   [U-03] DOM 工具                                     ║
   ║   [U-04] HTML 转义                                    ║
   ║   [U-05] 订单号 / 唯一 ID                             ║
   ║   [U-06] 联系方式格式                                 ║
   ║   [U-07] 表单错误标记                                 ║
   ║   [U-08] 通用弹窗                                     ║
   ║   [U-09] 页面切换                                     ║
   ║   [U-10] 权限倍率                                     ║
   ║   [U-11] 单位系统                                     ║
   ║   [U-12] 全局事件                                     ║
   ╚══════════════════════════════════════════════════════╝ */


/* ══════════ [U-01] 全局常量 / 存储 key ══════════ */

/* ---- 应用版本（用于更新公告） ---- */
const APP_VERSION = '1.1.0';
const ANNOUNCEMENT_SEEN_KEY = 'listReceiptAnnouncementSeen';

/* ---- 数据版本 + 迁移 ---- */
const SCHEMA_VERSION = 3;
const SCHEMA_VERSION_KEY = 'listReceiptSchemaVersion';
const MIGRATION_LOG_KEY = 'listReceiptMigrationLog';
const MIGRATION_LOG_MAX = 20;

/* ---- IndexedDB ---- */
const IDB_NAME = 'listReceiptFiles';
const IDB_VERSION = 1;
const IDB_STORE_FILES = 'files';

/* ---- 平台预设 ---- */
const PLATFORM_PRESET_KEY  = 'listReceiptPlatforms';
const PLATFORM_DEFAULT_KEY = 'listReceiptDefaultPlatform';
const DEFAULT_PLATFORMS = ['小红书', 'QQ', '微信', '微博', '抖音', '画加', '米画师'];
const PLATFORM_ADD_VALUE = '__ADD__';

/* ---- 身份预设 ---- */
const IDENTITY_PRESET_KEY  = 'listReceiptIdentityPresets';
const IDENTITY_DEFAULT_KEY = 'listReceiptDefaultIdentity';
const DEFAULT_IDENTITIES = ['画师', '美工'];

/* ---- 署名 ID（新增，修复 bug #1） ---- */
const ARTIST_NAME_KEY = 'listReceiptArtistName';

/* ---- 权限预设 ---- */
const PERMISSION_PRESET_KEY = 'listReceiptPermissionPresets';
const DEFAULT_PERMISSIONS = [
  { id: 'personal',   name: '自用', rate: 1 },
  { id: 'commercial', name: '商用', rate: 2 },
  { id: 'buyout',     name: '买断', rate: 3 },
];

/* ---- 定金预设 ---- */
const DEPOSIT_PRESET_KEY = 'listReceiptDepositPreset';

/* ---- 订单 / 单主 ---- */
const TODO_KEY = 'listReceiptTodoList';
const MASTER_OVERRIDE_KEY = 'listReceiptMasterOverrides';
const MASTER_MANUAL_KEY   = 'listReceiptMasterManual';
const MASTER_HIDDEN_KEY   = 'listReceiptMasterHidden';
const MASTER_UNKNOWN_KEY  = '__UNKNOWN__';

/* ---- 小票设置 / 预设 ---- */
const RECEIPT_SETTINGS_KEY    = 'listReceiptReceiptSettings';
const RECEIPT_PRESET_LIST_KEY = 'listReceiptPresetList';
const MAX_RECEIPT_PRESETS     = 5;

/* ---- 稿件预设 ---- */
const PRESET_KEY       = 'listReceiptPresets';
const PRESET_GROUP_KEY = 'listReceiptPresetGroups';

/* ---- 附加费用 / 优惠 ---- */
const EXTRA_PRESET_KEY    = 'listReceiptExtraPresets';
const DISCOUNT_PRESET_KEY = 'listReceiptDiscountPresets';

/* ---- 记账 / 流水 ---- */
const RECORD_KEY = 'listReceiptRecords';
const FLOW_KEY   = 'listReceiptFlows';

/* ---- 结单 / 撤单 / 废稿 ---- */
const COMPLETED_KEY = 'listReceiptCompleted';
const CANCELLED_KEY = 'listReceiptCancelled';
const DISCARDED_KEY = 'listReceiptDiscarded';

/* ---- 备忘录 ---- */
const MEMO_KEY = 'listReceiptMemos';

/* ---- 标签系统（★ 修复 TDZ bug：提前到这里声明） ---- */
const TAG_LIBRARY_KEY = 'listReceiptTags';
const TAG_COLORS      = ['red', 'yellow', 'blue', 'black', 'gray'];
const TAG_MAX_COUNT   = 5;

/* ---- 主题 ---- */
const THEME_KEY = 'listReceiptTheme';

/* ---- 价目表 ---- */
const PRICE_LIST_KEY          = 'listReceiptPriceList';
const PRICE_LIST_SETTINGS_KEY = 'listReceiptPriceListSettings';
const PRICE_LIST_GLOBAL_KEY   = 'listReceiptPriceListGlobal';
const PRICE_LIST_PRESET_KEY   = 'listReceiptPriceListPresets';
const PRICE_LIST_MAX_PRESETS  = 5;
const PL_DEFAULT_FONT_SIZE    = 13.5;
const PL_MOBILE_PREVIEW_KEY   = 'listReceiptPlMobilePreviewOpen';

/* ---- 初始值（小票页重置用） ---- */
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


/* ══════════ [U-02] 数字与日期格式化 ══════════ */

function fmt(n) { return "¥" + Number(n || 0).toFixed(2); }
function num2(n) { return Number(n || 0).toFixed(2); }
function pct(n) { return num2(n) + '%'; }

function trimNum(n) {
  const s = Number(n || 0).toFixed(2);
  return s.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}
function pctShort(n) { return trimNum(n) + '%'; }

function opLabel(op) { return op === 'multiply' ? '×' : '＋'; }
function opSymbol(op) { return op === 'multiply' ? '×' : '＋'; }
function discOpLabel(op) { return op === 'multiply' ? '×' : '−'; }
function discOpSymbol(op) { return op === 'multiply' ? '×' : '−'; }

/* 日期 → "YYYY-MM-DD" */
function fmtDateStr(d) {
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}

/* 在日期字符串上加天数（用于工期推截稿） */
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


/* ══════════ [U-03] DOM 工具 ══════════ */

function $(id) { return document.getElementById(id); }


/* ══════════ [U-04] HTML 转义 ══════════ */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s) { return escapeHtml(s); }


/* ══════════ [U-05] 订单号 / 唯一 ID ══════════ */

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

function makeTodoId()   { return 'todo_'   + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makeItemId()   { return 'item_'   + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makeFileId()   { return 'file_'   + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makeRecordId() { return 'rec_'    + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makeFlowId()   { return 'flow_'   + Date.now() + '_' + Math.floor(Math.random() * 1000); }

function makeCompletedId() { return 'done_'    + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makeCancelledId() { return 'cancel_'  + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makeDiscardedId() { return 'discard_' + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makeMemoId()      { return 'memo_'    + Date.now() + '_' + Math.floor(Math.random() * 1000); }

function makeReceiptPresetId() { return 'rp_' + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makePresetGroupId()   { return 'pg_' + Date.now() + '_' + Math.floor(Math.random() * 1000); }
function makePriceListPresetId() { return 'plp_' + Date.now() + '_' + Math.floor(Math.random() * 1000); }


/* ══════════ [U-06] 联系方式格式 ══════════ */

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


/* ══════════ [U-07] 表单错误标记 ══════════ */

function setFieldError(id, hasError) {
  const el = $(id);
  if (!el) return;
  if (hasError) el.classList.add('field-error');
  else el.classList.remove('field-error');
}

function clearAllFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
}


/* ══════════ [U-08] 通用弹窗 ══════════ */

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


/* ══════════ [U-09] 页面切换 ══════════ */

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.dataset.page === id) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const orderPages = ['pageTodo', 'pageCompleted', 'pageCancelled', 'pageDiscarded', 'pageOrderFilterResult'];
  if (orderPages.indexOf(id) > -1) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.page === 'pageTodo') btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  /* 无导航项的页面：保持首页高亮 */
  if (id === 'pageTicketFolder' || id === 'pagePriceList' || id === 'pageMemo'
      || id === 'pageUserManual' || id === 'pageAnnouncementHistory'
      || id === 'pagePriceListSettings') {
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.page === 'pageMain') btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  const rp = $('receiptPanel');
  if (rp) rp.classList.add('hidden');

  const layout = $('receiptLayout');
  if (layout) layout.classList.remove('settings-open');

  /* 各模块的按需渲染（用 typeof 检查，避免加载顺序问题） */
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
  if (id === 'pageOrderFilterResult' && typeof renderOrderFilterResult === 'function') renderOrderFilterResult();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ══════════ [U-10] 权限倍率 ══════════ */

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


/* ══════════ [U-11] 单位系统 ══════════ */

function unitDirectionByOp(op) {
  return (op === 'multiply') ? 'suffix' : 'prefix';
}
function unitTextByOp(op) {
  return (op === 'multiply') ? '%' : '¥';
}
function unitByOp(op) { return unitTextByOp(op); }

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


/* ══════════ [U-12] 全局事件 ══════════ */

/* 数字输入框失焦时统一保留两位小数（数量类除外） */
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

/* ═══════════════════════════════════════════════════════
   [S-01] localStorage 存储层 · 通用
   ═══════════════════════════════════════════════════════ */

/* 安全的 localStorage 读取
   ★ 修复 bug #9：解析失败不再静默返回空数组，
     而是：
       1. 把原始坏数据备份到 <key>__corrupt
       2. 弹窗提示用户
       3. 返回默认值
*/
function safeLSGet(key, fallback, validator) {
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch (e) {
    return fallback;
  }
  if (raw === null || raw === '') return fallback;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    /* 解析失败：备份 + 提示 */
    try {
      localStorage.setItem(key + '__corrupt_' + Date.now(), raw);
    } catch (err) {}
    console.error('[LS] 解析失败：' + key, e);
    try {
      if (!$('modalRoot').innerHTML) {
        setTimeout(() => {
          showSimpleAlert(
            '数据读取出错',
            '键 <code>' + escapeHtml(key) + '</code> 的内容已损坏，无法解析。<br>' +
            '原始数据已备份到浏览器本地（键名加了 <code>__corrupt_</code> 后缀），' +
            '请联系开发者或从备份 JSON 恢复。<br><br>' +
            '当前将使用空数据继续运行。'
          );
        }, 300);
      }
    } catch (err) {}
    return fallback;
  }

  if (typeof validator === 'function' && !validator(parsed)) {
    return fallback;
  }
  return parsed;
}

/* 安全写入：返回 true/false 表示成功 */
function safeLSSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    const isQuota = e && (e.name === 'QuotaExceededError'
                       || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
                       || e.code === 22);
    if (isQuota) {
      alert('保存失败：浏览器存储空间已满，请清理部分图片或数据后重试。');
    } else {
      alert('保存失败：' + (e && e.message ? e.message : '未知错误'));
    }
    return false;
  }
}


/* ═══════════════════════════════════════════════════════
   [S-02] 平台预设
   ═══════════════════════════════════════════════════════ */

function getPlatforms() {
  const stored = safeLSGet(PLATFORM_PRESET_KEY, null, Array.isArray);
  if (stored && stored.length) return stored;
  return DEFAULT_PLATFORMS.slice();
}
function setPlatforms(arr) {
  safeLSSet(PLATFORM_PRESET_KEY, arr);
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
  try { localStorage.setItem(PLATFORM_DEFAULT_KEY, String(name || '')); } catch (e) {}
}


/* ═══════════════════════════════════════════════════════
   [S-03] 身份预设
   ═══════════════════════════════════════════════════════ */

function getIdentities() {
  const stored = safeLSGet(IDENTITY_PRESET_KEY, null, Array.isArray);
  if (stored && stored.length) {
    return stored.map(x => String(x || '').trim()).filter(x => x);
  }
  return DEFAULT_IDENTITIES.slice();
}
function setIdentities(arr) {
  const clean = (arr || []).map(x => String(x || '').trim()).filter(x => x);
  safeLSSet(IDENTITY_PRESET_KEY, clean);
}
function getDefaultIdentity() {
  const list = getIdentities();
  const def = localStorage.getItem(IDENTITY_DEFAULT_KEY) || '';
  if (list.indexOf(def) > -1) return def;
  return list[0] || '画师';
}
function setDefaultIdentity(name) {
  try { localStorage.setItem(IDENTITY_DEFAULT_KEY, String(name || '')); } catch (e) {}
}


/* ═══════════════════════════════════════════════════════
   [S-04] 署名 ID（★ 新增 · 修复 bug #1）
   ═══════════════════════════════════════════════════════ */

function getSavedArtistName() {
  try { return localStorage.getItem(ARTIST_NAME_KEY) || ''; } catch (e) { return ''; }
}
function setSavedArtistName(name) {
  try { localStorage.setItem(ARTIST_NAME_KEY, String(name || '')); } catch (e) {}
}


/* ═══════════════════════════════════════════════════════
   [S-05] 权限预设
   ═══════════════════════════════════════════════════════ */

function getPermissions() {
  const stored = safeLSGet(PERMISSION_PRESET_KEY, null, Array.isArray);
  if (stored && stored.length) return stored;
  return DEFAULT_PERMISSIONS.map(p => ({ ...p }));
}
function setPermissions(arr) {
  safeLSSet(PERMISSION_PRESET_KEY, arr);
}


/* ═══════════════════════════════════════════════════════
   [S-06] 定金预设
   ═══════════════════════════════════════════════════════ */

function getDepositPreset() {
  const stored = safeLSGet(DEPOSIT_PRESET_KEY, null,
    v => v && typeof v === 'object' && v.mode);
  if (stored) return stored;
  return { mode: 'percent', value: 20 };
}
function setDepositPreset(obj) {
  safeLSSet(DEPOSIT_PRESET_KEY, obj);
}


/* ═══════════════════════════════════════════════════════
   [S-07] 单主覆盖 / 手动 / 隐藏
   ═══════════════════════════════════════════════════════ */

function getMasterOverrides() {
  const stored = safeLSGet(MASTER_OVERRIDE_KEY, null,
    v => v && typeof v === 'object');
  return stored || {};
}
function setMasterOverrides(obj) {
  return safeLSSet(MASTER_OVERRIDE_KEY, obj);
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

function getManualMasters() {
  const stored = safeLSGet(MASTER_MANUAL_KEY, null, Array.isArray);
  return stored || [];
}
function setManualMasters(arr) {
  return safeLSSet(MASTER_MANUAL_KEY, arr);
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

function getMasterHidden() {
  const arr = safeLSGet(MASTER_HIDDEN_KEY, null, Array.isArray);
  return arr || [];
}
function setMasterHidden(arr) {
  return safeLSSet(MASTER_HIDDEN_KEY, arr || []);
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


/* ═══════════════════════════════════════════════════════
   [S-08] 稿件预设 + 分组
   ═══════════════════════════════════════════════════════ */

function getPresetGroups() {
  const stored = safeLSGet(PRESET_GROUP_KEY, null, Array.isArray);
  return stored || [];
}
function setPresetGroups(arr) {
  return safeLSSet(PRESET_GROUP_KEY, arr || []);
}
function getPresetGroupById(id) {
  if (!id) return null;
  return getPresetGroups().find(g => g.id === id) || null;
}

function getPresets() {
  const stored = safeLSGet(PRESET_KEY, null, Array.isArray);
  return stored || [];
}
function setPresets(arr) {
  safeLSSet(PRESET_KEY, arr);
  if (typeof refreshPresetDatalist === 'function') refreshPresetDatalist();
}
function getPresetsByGroup(groupId) {
  const all = getPresets();
  if (groupId === '__UNGROUPED__') {
    return all.filter(p => !p.groupId);
  }
  return all.filter(p => p.groupId === groupId);
}
function movePresetToGroup(presetName, targetGroupId) {
  const presets = getPresets();
  const idx = presets.findIndex(p => p.name === presetName);
  if (idx < 0) return false;
  presets[idx].groupId = targetGroupId || '';
  setPresets(presets);
  return true;
}


/* ═══════════════════════════════════════════════════════
   [S-09] 附加费用 / 优惠折扣预设
   ═══════════════════════════════════════════════════════ */

function getExtraPresets() {
  const stored = safeLSGet(EXTRA_PRESET_KEY, null, Array.isArray);
  return stored || [];
}
function setExtraPresets(arr) {
  safeLSSet(EXTRA_PRESET_KEY, arr);
}

function getDiscountPresets() {
  const stored = safeLSGet(DISCOUNT_PRESET_KEY, null, Array.isArray);
  return stored || [];
}
function setDiscountPresets(arr) {
  safeLSSet(DISCOUNT_PRESET_KEY, arr);
}


/* ═══════════════════════════════════════════════════════
   [S-10] 小票设置 + 小票预设列表
   ═══════════════════════════════════════════════════════ */

function getReceiptPresetList() {
  const stored = safeLSGet(RECEIPT_PRESET_LIST_KEY, null, Array.isArray);
  return stored || [];
}
function setReceiptPresetList(arr) {
  return safeLSSet(RECEIPT_PRESET_LIST_KEY, arr);
}
function nextReceiptPresetName() {
  const list = getReceiptPresetList();
  const used = {};
  list.forEach(p => { used[p.name] = true; });
  let i = 1;
  while (used['模板' + i]) i++;
  return '模板' + i;
}


/* ═══════════════════════════════════════════════════════
   [S-11] 订单（待办）
   ═══════════════════════════════════════════════════════ */

function getTodos() {
  const stored = safeLSGet(TODO_KEY, null, Array.isArray);
  return stored || [];
}
function setTodos(arr) {
  return safeLSSet(TODO_KEY, arr);
}


/* ═══════════════════════════════════════════════════════
   [S-12] 记账 / 流水
   ═══════════════════════════════════════════════════════ */

function getRecords() {
  const stored = safeLSGet(RECORD_KEY, null, Array.isArray);
  return stored || [];
}
function setRecords(arr) {
  return safeLSSet(RECORD_KEY, arr);
}

function getFlows() {
  const stored = safeLSGet(FLOW_KEY, null, Array.isArray);
  return stored || [];
}
function setFlows(arr) {
  return safeLSSet(FLOW_KEY, arr);
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


/* ═══════════════════════════════════════════════════════
   [S-13] 结单 / 撤单 / 废稿
   ═══════════════════════════════════════════════════════ */

function getCompleted() {
  const stored = safeLSGet(COMPLETED_KEY, null, Array.isArray);
  return stored || [];
}
function setCompleted(arr) {
  return safeLSSet(COMPLETED_KEY, arr);
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

function getCancelled() {
  const stored = safeLSGet(CANCELLED_KEY, null, Array.isArray);
  return stored || [];
}
function setCancelled(arr) {
  return safeLSSet(CANCELLED_KEY, arr);
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

function getDiscarded() {
  const stored = safeLSGet(DISCARDED_KEY, null, Array.isArray);
  return stored || [];
}
function setDiscarded(arr) {
  return safeLSSet(DISCARDED_KEY, arr);
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


/* ═══════════════════════════════════════════════════════
   [S-14] 备忘录
   ═══════════════════════════════════════════════════════ */

function getMemos() {
  const stored = safeLSGet(MEMO_KEY, null, Array.isArray);
  return stored || [];
}
function setMemos(arr) {
  return safeLSSet(MEMO_KEY, arr);
}


/* ═══════════════════════════════════════════════════════
   [S-15] 标签库
   ═══════════════════════════════════════════════════════ */

function getTagLibrary() {
  const arr = safeLSGet(TAG_LIBRARY_KEY, null, Array.isArray);
  return arr || [];
}
function setTagLibrary(arr) {
  return safeLSSet(TAG_LIBRARY_KEY, arr || []);
}
function addTagToLibrary(name, color) {
  if (!name) return;
  const n = String(name).trim();
  if (!n) return;
  const lib = getTagLibrary();
  if (lib.some(t => t.name === n)) return;
  lib.push({ name: n, color: color || 'red' });
  setTagLibrary(lib);
}

/* ═══════════════════════════════════════════════════════
   [I-01] IndexedDB 封装
   ═══════════════════════════════════════════════════════ */

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

    /* ★ 修复：onblocked 时设超时兜底
       原来只 console.warn，Promise 永远挂着，导致启动流程卡死（首页空白）。
       现在最多等 3 秒，超时后降级为"IDB 不可用"，让页面能继续初始化。 */
    let settled = false;
    const settleOnce = (fn, arg) => {
      if (settled) return;
      settled = true;
      fn(arg);
    };

    const blockedTimer = setTimeout(() => {
      __idbAvailable = false;
      __idbDegradedReason = 'IndexedDB 被其它标签页占用（超时）';
      console.warn('[IDB] open 超时：可能有其它标签页在使用，已降级为 base64 存储');
      settleOnce(reject, new Error(__idbDegradedReason));
    }, 3000);

    req.onupgradeneeded = function (ev) {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_FILES)) {
        db.createObjectStore(IDB_STORE_FILES, { keyPath: 'id' });
      }
    };

    req.onsuccess = function (ev) {
      clearTimeout(blockedTimer);
      const db = ev.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_FILES)) {
        try { db.close(); } catch (e) {}
        __idbAvailable = false;
        __idbDegradedReason = '数据库结构异常';
        settleOnce(reject, new Error(__idbDegradedReason));
        return;
      }
      settleOnce(resolve, db);
    };

    req.onerror = function (ev) {
      clearTimeout(blockedTimer);
      __idbAvailable = false;
      __idbDegradedReason = (ev.target.error && ev.target.error.message) || 'IndexedDB 打开失败';
      settleOnce(reject, ev.target.error || new Error(__idbDegradedReason));
    };

    req.onblocked = function () {
      /* 不立即处理，交给 blockedTimer 兜底
         如果有其它标签页，用户可能会关掉它，然后 onsuccess 会触发 */
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


/* ═══════════════════════════════════════════════════════
   [I-02] Blob ↔ dataURL 基础转换
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [I-03] objectURL 缓存
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [I-04] 统一图片入口
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [I-05] 存储配额查询 + 持久化申请
   ═══════════════════════════════════════════════════════ */

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

/* ╔══════════════════════════════════════════════════════╗
   ║  第 4 段 · 数据版本 + 迁移中心 + 数据修复 + 图片搬迁  ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [M-01] 数据版本 / 迁移日志读写                      ║
   ║   [M-02] 迁移函数表（从旧版本升级到新版本）           ║
   ║   [M-03] 修复前的全量备份                             ║
   ║   [M-04] 补录历史订单缺失的流水                       ║
   ║   [M-05] 把 base64 老图片搬进 IndexedDB               ║
   ║   [M-06] 数据修复主入口（弹窗 + 执行）                ║
   ║   [M-07] 启动时自动迁移                               ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [M-01] 数据版本 / 迁移日志读写
   ═══════════════════════════════════════════════════════ */

/* 读当前存档的数据版本号。
   0 表示"从没迁移过"，是全新用户。 */
function getSchemaVersion() {
  const raw = localStorage.getItem(SCHEMA_VERSION_KEY);
  const v = parseInt(raw, 10);
  if (isNaN(v) || v < 0) return 0;
  return v;
}

/* 写回数据版本号 */
function setSchemaVersion(v) {
  try { localStorage.setItem(SCHEMA_VERSION_KEY, String(v)); } catch (e) {}
}

/* 追加一条迁移日志（保留最近 20 条） */
function appendMigrationLog(entry) {
  try {
    const list = JSON.parse(localStorage.getItem(MIGRATION_LOG_KEY)) || [];
    list.push(Object.assign({ at: Date.now() }, entry));
    while (list.length > MIGRATION_LOG_MAX) list.shift();
    localStorage.setItem(MIGRATION_LOG_KEY, JSON.stringify(list));
  } catch (e) {}
}

/* 读取全部迁移日志 */
function getMigrationLog() {
  try { return JSON.parse(localStorage.getItem(MIGRATION_LOG_KEY)) || []; }
  catch (e) { return []; }
}


/* ═══════════════════════════════════════════════════════
   [M-02] 迁移函数表

   每个 key 是"目标版本号"，value 是"从上一版升到这一版要做什么"。
   例如 MIGRATIONS[1] 表示"从 0 升到 1 时做什么"。
   执行迁移时，会按顺序从当前版本逐级升到 SCHEMA_VERSION。
   ═══════════════════════════════════════════════════════ */

const MIGRATIONS = {

  /* v0 → v1：把老的订单字段补全、规范格式 */
  1: function migrateToV1(ctx) {
    const todos = getTodos();
    let touched = 0;

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

      if (!Array.isArray(t.items))        { t.items = [];        changed = true; }
      if (!Array.isArray(t.materials))    { t.materials = [];    changed = true; }
      if (!Array.isArray(t.requirements)) { t.requirements = []; changed = true; }
      if (!Array.isArray(t.tags))         { t.tags = [];         changed = true; }

      if (changed) touched++;
    });

    if (touched > 0) setTodos(todos);
    ctx.report.push('订单字段规范化：' + touched + ' 条被更新');
  },

  /* v1 → v2：小票设置的贴纸结构从"单张"改成"数组" */
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

  /* v2 → v3：图片搬迁交给 ImageStore 异步做，这里只记一笔 */
  3: function migrateToV3(ctx) {
    ctx.report.push('v3：图片迁移由 ImageStore 异步执行');
  },
};

/* 创建一个"迁移上下文"，用来记录本次迁移过程 */
function createMigrationContext() {
  return { report: [], counts: {}, startedAt: Date.now() };
}


/* ═══════════════════════════════════════════════════════
   [M-03] 修复前的全量备份

   ★ 修复 bug #10：把价目表、主题等后来新增的 key 也纳入备份，
     否则一旦要恢复，这些数据会缺失。
   ═══════════════════════════════════════════════════════ */

/* 所有需要纳入"修复前备份"的 key（和导出的 key 保持一致） */
const BACKUP_KEYS = [
  SCHEMA_VERSION_KEY,
  PLATFORM_PRESET_KEY, PLATFORM_DEFAULT_KEY,
  IDENTITY_PRESET_KEY, IDENTITY_DEFAULT_KEY,
  ARTIST_NAME_KEY,                 /* ★ 新增 */
  PERMISSION_PRESET_KEY, DEPOSIT_PRESET_KEY,
  PRESET_KEY, PRESET_GROUP_KEY,
  EXTRA_PRESET_KEY, DISCOUNT_PRESET_KEY,
  RECEIPT_SETTINGS_KEY, RECEIPT_PRESET_LIST_KEY,
  TODO_KEY, RECORD_KEY, FLOW_KEY,
  COMPLETED_KEY, CANCELLED_KEY, DISCARDED_KEY,
  MASTER_OVERRIDE_KEY, MASTER_MANUAL_KEY, MASTER_HIDDEN_KEY,
  MEMO_KEY, ANNOUNCEMENT_SEEN_KEY,
  TAG_LIBRARY_KEY,                 /* ★ 新增 */
  /* ★ 新增：价目表 + 主题 */
  PRICE_LIST_KEY, PRICE_LIST_SETTINGS_KEY, PRICE_LIST_GLOBAL_KEY, PRICE_LIST_PRESET_KEY,
  THEME_KEY,
    'listReceiptPriceListCustomLayouts',   /* ★ 新增：自定义位置 */
];

/* 生成一份"修复前备份"的 JSON 字符串 */
function backupAllDataBeforeRepair() {
  const data = {
    __meta: {
      app: '专属结单助手',
      kind: 'pre-repair-backup',
      schemaVersion: getSchemaVersion(),
      exportedAt: new Date().toISOString(),
    },
  };
  BACKUP_KEYS.forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try { data[key] = JSON.parse(raw); }
      catch (e) { data[key] = raw; }
    }
  });
  return JSON.stringify(data, null, 2);
}


/* ═══════════════════════════════════════════════════════
   [M-04] 补录历史订单缺失的流水

   场景：早期版本导入订单时没写流水，或者中途手动改过金额。
   做法：以"订单里记的 prepaid / finalAmount"为准，
        算出差额，把缺的部分补成一条新流水。
   幂等：重复调用不会重复累加（每次先算已存在的总额）。
   ═══════════════════════════════════════════════════════ */

function repairMissingFlows() {
  const todos = getTodos();
  const completedList = getCompleted();
  const records = getRecords();
  const flows = getFlows();

  /* 先把已有流水按 todoId / completedId 汇总一遍 */
  const prepaidByTodoId    = {};
  const dispatchByTodoId   = {};
  const finalByCompletedId = {};
  const recordIdsMigrated  = {};

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

  /* 待办订单：预付款 / 排单费 */
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

  /* 已结单：尾款 */
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

  /* 旧版记账数据：搬到流水里 */
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


/* ═══════════════════════════════════════════════════════
   [M-05] 把 base64 老图片搬进 IndexedDB

   ★ 修复：原来用全局 pendingImageMigrations 数组，
     如果被并发调用会串数据。现在改成函数内局部变量。
   ═══════════════════════════════════════════════════════ */

async function migrateImagesToIndexedDB(ctx) {
  if (!isIDBAvailable()) {
    ctx.report.push('IndexedDB 不可用，跳过图片搬迁');
    return 0;
  }

  let migrated = 0;

  /* 辅助：把对象的某个字段从 dataURL 换成 file_id */
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

  /* --- 1. 小票设置 --- */
  try {
    const s = getReceiptSettings();
    let changed = false;
    if (await tryMigrateField(s, 'headerImg')) changed = true;
    if (await tryMigrateField(s, 'footerImg')) changed = true;
    if (await tryMigrateField(s, 'bgImg'))     changed = true;
    if (changed) setReceiptSettings(s);
  } catch (e) {}

  /* --- 2. 小票预设列表 --- */
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

  /* --- 3. 待办订单 --- */
  try {
    const todos = getTodos();
    let changed = false;
    /* ★ 关键修复：把待迁移的图片收集到"局部数组"，不再用全局 */
    const pendingImages = [];

    for (const t of todos) {
      if (!t) continue;

      /* 小票图片 */
      if (t.receiptImage && typeof t.receiptImage === 'string'
          && t.receiptImage.indexOf('data:image') === 0) {
        const ref = await saveBase64Image(t.receiptImage, 'receipt.png');
        if (ref) { t.receiptImage = ref; changed = true; migrated++; }
      }

      /* 快照里的预览图 */
      if (t.receiptSnapshot && typeof t.receiptSnapshot === 'object') {
        const ps = t.receiptSnapshot.previewImage;
        if (ps && typeof ps === 'string' && ps.indexOf('data:image') === 0) {
          const ref = await saveBase64Image(ps, 'preview.png');
          if (ref) { t.receiptSnapshot.previewImage = ref; changed = true; migrated++; }
        }
      }

      /* 素材 / 要求 */
      ['materials', 'requirements'].forEach(key => {
        const arr = t[key];
        if (!Array.isArray(arr)) return;
        arr.forEach(f => {
          if (!f) return;
          if (f.fileRef) return;
          if (f.dataUrl && typeof f.dataUrl === 'string'
              && f.dataUrl.indexOf('data:image') === 0) {
            pendingImages.push({ f: f });
          }
        });
      });
    }

    /* 统一处理素材 / 要求里的待迁移图片 */
    for (const job of pendingImages) {
      const ref = await saveBase64Image(job.f.dataUrl, job.f.name || 'image.png');
      if (ref) {
        job.f.fileRef = ref;
        job.f.dataUrl = '';
        changed = true;
        migrated++;
      }
    }

    if (changed) setTodos(todos);
  } catch (e) {}

  /* --- 4. 已结单 --- */
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

  /* --- 5. 撤单 --- */
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

  /* --- 6. 废稿 --- */
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

  /* --- 7. 当前小票页的预览图 --- */
  try {
    if (typeof previewImageData === 'string'
        && previewImageData.indexOf('data:image') === 0) {
      const ref = await saveBase64Image(previewImageData, 'preview.png');
      if (ref) { previewImageData = ref; migrated++; }
    }
  } catch (e) {}

  return migrated;
}


/* ═══════════════════════════════════════════════════════
   [M-06] 数据修复主入口

   两步：
     1. repairData()    —— 弹窗确认
     2. doRepairData()  —— 真正执行
   ═══════════════════════════════════════════════════════ */

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

  /* 1. 先做一次修复前备份 */
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

  /* 2. 逐版本迁移 */
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

  /* 3. 图片搬迁 */
  try {
    const migratedImages = await migrateImagesToIndexedDB(ctx);
    if (migratedImages > 0) {
      ctx.report.push('图片搬迁：' + migratedImages + ' 张已迁入 IndexedDB');
    }
  } catch (e) {
    ctx.report.push('图片搬迁失败：' + (e && e.message ? e.message : '未知'));
  }

  /* 4. 补录流水 */
  let flowStats = { count: 0, amount: 0 };
  try {
    flowStats = repairMissingFlows() || flowStats;
  } catch (e) {
    ctx.report.push('补流水出错：' + (e && e.message ? e.message : '未知'));
  }

  /* 5. 建立单主索引 */
  let masters = [];
  try {
    masters = getMasterList();
  } catch (e) {
    ctx.report.push('单主索引出错：' + (e && e.message ? e.message : '未知'));
  }

  /* 6. 记一笔日志 */
  appendMigrationLog({
    from: fromV,
    to: toV,
    flowAdded: flowStats.count,
    flowAmount: flowStats.amount,
    masterCount: masters.length,
  });

  /* 7. 弹出结果 */
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
  bodyHtml += '<p style="font-size:12px;color:var(--ink-soft);margin:10px 0 0;">可到「统计」页和「单主」页查看最新数据。</p>';

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

  /* 8. 刷新各页面 */
  try {
    if (typeof renderStatsPage === 'function') renderStatsPage();
    if (typeof renderMasterList === 'function') renderMasterList();
    if (typeof renderTodoList === 'function') renderTodoList();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof applyReceiptSettings === 'function') applyReceiptSettings();
  } catch (e) {}
}


/* ═══════════════════════════════════════════════════════
   [M-07] 启动时自动迁移

   用户每次打开页面时：
     - 如果是全新用户（版本 0）→ 直接标记为当前版本
     - 如果版本落后 → 静默迁移（不弹窗，出错只 console）
   ═══════════════════════════════════════════════════════ */

async function autoMigrateOnStartup() {
  const fromV = getSchemaVersion();
  const toV = SCHEMA_VERSION;

  /* 全新用户：直接标当前版本，不迁移 */
  if (fromV === 0) {
    setSchemaVersion(toV);
    return;
  }

  /* 存档版本比代码新：可能是代码回滚了，不处理 */
  if (fromV > toV) {
    console.warn('[迁移] 本地版本高于代码版本，跳过');
    return;
  }

  /* 已经是新版：不用迁移 */
  if (fromV === toV) return;

  /* 逐版本迁移 */
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

  /* 图片搬迁 */
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

/* ╔══════════════════════════════════════════════════════╗
   ║  第 5 段 · 小票设置模块                               ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [R-01] 默认设置 + 字体映射表                        ║
   ║   [R-02] 小票设置的读 / 写                            ║
   ║   [R-03] 图片压缩 + 字体解析                          ║
   ║   [R-04] 应用设置到小票 DOM                           ║
   ║   [R-05] 票头 / 票尾 / 背景图渲染                     ║
   ║   [R-06] 图片编辑器（拖动 / 等比 / 拉伸）             ║
   ║   [R-07] 上传 / 清除 / 适应                           ║
   ║   [R-08] 状态保存                                     ║
   ║   [R-09] 颜色 / 透明度 / 字号                         ║
   ║   [R-10] 小票预设（存储 / 加载 / 删除）               ║
   ║   [R-11] 本地字体导入                                 ║
   ║   [R-12] 占位模式                                     ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [R-01] 默认设置 + 字体映射表
   ═══════════════════════════════════════════════════════ */

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

/* 字体下拉里每个选项 → 实际 font-family 字符串 */
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

/* 字号范围 */
const DEFAULT_FONT_SIZE = 13.5;
const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 24;


/* ═══════════════════════════════════════════════════════
   [R-02] 小票设置的读 / 写
   ═══════════════════════════════════════════════════════ */

function getReceiptSettings() {
  const stored = safeLSGet(RECEIPT_SETTINGS_KEY, null,
    v => v && typeof v === 'object');
  if (!stored) {
    return JSON.parse(JSON.stringify(DEFAULT_RECEIPT_SETTINGS));
  }

  const merged = Object.assign({}, DEFAULT_RECEIPT_SETTINGS, stored);

  /* 老字段兼容：fontCN / fontEN → font */
  if (!merged.font) {
    merged.font = stored.fontCN || stored.fontEN || 'system';
  }

  /* 票尾文本：空值填默认 */
  if (!merged.footer1 || String(merged.footer1).trim() === '') {
    merged.footer1 = DEFAULT_RECEIPT_SETTINGS.footer1;
  }
  if (!merged.footer2 || String(merged.footer2).trim() === '') {
    merged.footer2 = DEFAULT_RECEIPT_SETTINGS.footer2;
  }

  /* 字号兜底 */
  if (typeof merged.fontSize !== 'number' || !isFinite(merged.fontSize)) {
    merged.fontSize = DEFAULT_FONT_SIZE;
  }

  /* 图片状态兜底 */
  if (!merged.headerImgState) merged.headerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  if (!merged.footerImgState) merged.footerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
  if (!merged.bgImgState)     merged.bgImgState     = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };

  /* 清掉历史残留的贴纸字段 */
  delete merged.stickers;
  delete merged.stickerImg;
  delete merged.stickerImgState;

  return merged;
}

function setReceiptSettings(obj) {
  const ok = safeLSSet(RECEIPT_SETTINGS_KEY, obj);
  if (!ok) {
    alert(
      '保存失败：浏览器存储空间已满。\n\n' +
      '建议：\n' +
      '1) 换一张更小的图片\n' +
      '2) 点击设置面板里的「清除」删掉其它已上传的图片\n' +
      '3) 到「设置 → 数据同步」导出备份后清理'
    );
  }
  return ok;
}


/* ═══════════════════════════════════════════════════════
   [R-03] 图片压缩 + 字体解析
   ═══════════════════════════════════════════════════════ */

/* 压缩图片文件（上传时用）。
   注：这个函数现在只有部分场景还在用，主要给老的 base64 流程兜底。 */
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

/* 把字体 key 解析成实际的 font-family 字符串 */
function resolveFontFamily(fontKey) {
  if (!fontKey) return FONT_FAMILY_MAP['system'];
  if (FONT_FAMILY_MAP[fontKey]) return FONT_FAMILY_MAP[fontKey];
  /* 本地导入的字体：key 以 "Local_" 开头 */
  if (fontKey.indexOf('Local_') === 0) {
    return `"${fontKey}", sans-serif`;
  }
  return FONT_FAMILY_MAP['system'];
}


/* ═══════════════════════════════════════════════════════
   [R-04] 应用设置到小票 DOM

   ★ 修复 bug #3：原来 `if (value !== '')` 导致清空后再也删不掉，
     现在无条件同步表单里的值。
   ═══════════════════════════════════════════════════════ */

function applyReceiptSettings() {
  const receipt = $('receipt');
  if (!receipt) return;

  const s = getReceiptSettings();

  /* ★ 修复：票尾文本无条件同步（包括空值） */
  if ($('rsFooter1')) s.footer1 = $('rsFooter1').value;
  if ($('rsFooter2')) s.footer2 = $('rsFooter2').value;

  if ($('rsBgColor'))        s.bgColor        = $('rsBgColor').value;
  if ($('rsColorPrimary'))   s.colorPrimary   = $('rsColorPrimary').value;
  if ($('rsColorSecondary')) s.colorSecondary = $('rsColorSecondary').value;
  if ($('rsBgOpacity'))      s.bgOpacity      = parseFloat($('rsBgOpacity').value);
  if ($('rsFont'))           s.font           = $('rsFont').value;
  if ($('rsFontSize')) {
    const fs = parseFloat($('rsFontSize').value);
    if (isFinite(fs) && fs > 0) s.fontSize = fs;
  }

  /* 同步到表单旁的 hex 输入 / 显示文本 */
  if ($('rsBgColorHex'))        $('rsBgColorHex').value = s.bgColor;
  if ($('rsColorPrimaryHex'))   $('rsColorPrimaryHex').value = s.colorPrimary;
  if ($('rsColorSecondaryHex')) $('rsColorSecondaryHex').value = s.colorSecondary;
  if ($('rsBgOpacityVal'))      $('rsBgOpacityVal').textContent = Math.round((s.bgOpacity || 0) * 100) + '%';
  if ($('rsFontSizeVal'))       $('rsFontSizeVal').textContent = Number(s.fontSize || DEFAULT_FONT_SIZE).toFixed(1) + 'px';
  if (typeof updateFontSizeDot === 'function') updateFontSizeDot();

  setReceiptSettings(s);

  /* 应用 CSS 变量到小票 */
  const fontFamily = resolveFontFamily(s.font);
  receipt.style.setProperty('--rc-font', fontFamily);
  receipt.style.setProperty('--rc-ink', s.colorPrimary || '#111111');
  receipt.style.setProperty('--rc-ink-soft', s.colorSecondary || '#555555');
  receipt.style.setProperty('--rc-font-size', (s.fontSize || DEFAULT_FONT_SIZE) + 'px');
  receipt.style.background = s.bgColor || '#ffffff';

  /* 票尾两行文字：空值 → 显示默认值 */
  const l1 = $('outFooterLine1');
  const l2 = $('outFooterLine2');
  if (l1) {
    l1.textContent = (s.footer1 && s.footer1.trim()) ? s.footer1 : DEFAULT_RECEIPT_SETTINGS.footer1;
  }
  if (l2) {
    l2.textContent = (s.footer2 && s.footer2.trim()) ? s.footer2 : DEFAULT_RECEIPT_SETTINGS.footer2;
  }

  /* 三张图 */
  applyBgImgRef(s.bgImg, s.bgImgState, s.bgOpacity);
  applyBlockImgRef('header', s.headerImg, s.headerImgState);
  applyBlockImgRef('footer', s.footerImg, s.footerImgState);
}


/* ═══════════════════════════════════════════════════════
   [R-05] 票头 / 票尾 / 背景图渲染
   ═══════════════════════════════════════════════════════ */

/* 应用票头 / 票尾（已解析好的 URL） */
function applyBlockImg(kind, src, state) {
  const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
  const img   = kind === 'header' ? $('outHeaderImg')   : $('outFooterImg');
  if (!block || !img) return;

  /* 没图：清掉 */
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

    const natW = img.naturalWidth  || 1;
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
    img.onload  = doApply;
    img.onerror = () => { block.classList.remove('show'); block.style.height = '0px'; };
    img.src = src;
  }
}

/* 把 ref（可能是 file_id，也可能是 dataURL）解析成 URL 后应用 */
function applyBlockImgRef(kind, ref, state) {
  const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
  const img   = kind === 'header' ? $('outHeaderImg')   : $('outFooterImg');
  if (!block || !img) return;

  if (!ref) {
    applyBlockImg(kind, '', state);
    return;
  }

  resolveImageSrc(ref).then(url => {
    if (!url) { applyBlockImg(kind, '', state); return; }
    applyBlockImg(kind, url, state);
  }).catch(() => {
    applyBlockImg(kind, '', state);
  });
}

/* 更新票头 / 票尾块的高度（因为图片是绝对定位的） */
function updateBlockHeight(block, img) {
  if (!block || !img) return;
  const imgH = img.offsetHeight || 0;
  const imgT = parseFloat(img.style.top) || 0;
  block.style.height = Math.max(0, imgT + imgH) + 'px';
}

/* 应用背景图 */
function applyBgImg(src, state, opacity) {
  const wrap = $('outBgWrap');
  const img  = $('outBgImg');
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

    const receipt  = $('receipt');
    const receiptW = receipt ? receipt.clientWidth  : 560;
    const receiptH = receipt ? receipt.clientHeight : 800;

    const natW = img.naturalWidth  || 1;
    const natH = img.naturalHeight || 1;

    if (!state.w || state.w === 0) {
      /* 首次：铺满整张小票 */
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
    img.onload  = doApply;
    img.onerror = () => { wrap.classList.remove('has-img'); img.classList.remove('has-img'); };
    img.src = src;
  }
}

/* 把 ref 解析成 URL 后应用背景 */
function applyBgImgRef(ref, state, opacity) {
  const wrap = $('outBgWrap');
  const img  = $('outBgImg');
  if (!wrap || !img) return;

  if (!ref) {
    applyBgImg('', state, opacity);
    return;
  }

  resolveImageSrc(ref).then(url => {
    if (!url) { applyBgImg('', state, opacity); return; }
    applyBgImg(url, state, opacity);
  }).catch(() => {
    applyBgImg('', state, opacity);
  });
}


/* ═══════════════════════════════════════════════════════
   [R-06] 图片编辑器（拖动 / 等比 / 拉伸）
   ═══════════════════════════════════════════════════════ */

var __imgSess = null;   /* 当前拖动会话 */

/* 更新红点手柄 + 四个边缘拉伸条的显示位置 */
function updateImageHandles(container, img) {
  if (!container || !img) return;

  const l = parseFloat(img.style.left) || 0;
  const t = parseFloat(img.style.top)  || 0;
  const w = img.offsetWidth  || 0;
  const h = img.offsetHeight || 0;

  /* 右下角红点（等比缩放） */
  const dot = container.querySelector('.receipt-img-handle');
  if (dot) {
    dot.style.left = (l + w - 9) + 'px';
    dot.style.top  = (t + h - 9) + 'px';
  }

  /* 边缘虚线拉伸条 */
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

/* 给一张图片绑定编辑交互（移动 / 等比 / 拉伸） */
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
      /* 平移 */
      l = s.l0 + dx;
      t = s.t0 + dy;
    } else if (s.mode === 'scale') {
      /* 等比缩放（右下角红点）：用对角线平均值作为缩放增量 */
      const ar = (s.w0 > 0 && s.h0 > 0) ? (s.h0 / s.w0) : 1;
      const deltaW = (dx + dy * ar) / 2;
      w = Math.max(20, s.w0 + deltaW);
      h = Math.max(20, w * ar);
    } else if (s.mode === 'resize') {
      /* 单边拉伸 */
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

/* 把三张图的编辑交互都挂上（每次打开设置面板时调一次） */
function setupReceiptImgDrag() {
  /* 票头 */
  (function () {
    const block = $('outHeaderBlock');
    const img   = $('outHeaderImg');
    if (!block || !img || !block.classList.contains('show')) return;
    bindImageEditor(block, img, 'header', {
      onChange: function () { updateBlockHeight(block, img); },
      onEnd:    function () { saveImgState('header', img); }
    });
  })();

  /* 票尾 */
  (function () {
    const block = $('outFooterBlock');
    const img   = $('outFooterImg');
    if (!block || !img || !block.classList.contains('show')) return;
    bindImageEditor(block, img, 'footer', {
      onChange: function () { updateBlockHeight(block, img); },
      onEnd:    function () { saveImgState('footer', img); }
    });
  })();

  /* 背景 */
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


/* ═══════════════════════════════════════════════════════
   [R-07] 打开 / 关闭设置面板 + 上传 / 清除 / 适应
   ═══════════════════════════════════════════════════════ */

function openReceiptSettings() {
  const layout = $('receiptLayout');
  if (!layout) return;
  layout.classList.add('settings-open');
  fillReceiptSettingsForm();
  applyReceiptSettings();
  renderCustomFontList();
  setTimeout(() => setupReceiptImgDrag(), 150);

  /* 手机端：把设置面板滚动到视野内 */
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

/* 把设置面板里的所有字段填上当前值 */
function fillReceiptSettingsForm() {
  const s = getReceiptSettings();

  if ($('rsFooter1')) $('rsFooter1').value = s.footer1 || '';
  if ($('rsFooter2')) $('rsFooter2').value = s.footer2 || '';

  if ($('rsBgColor'))        $('rsBgColor').value = s.bgColor || '#ffffff';
  if ($('rsBgColorHex'))     $('rsBgColorHex').value = s.bgColor || '#ffffff';
  if ($('rsBgOpacity'))      $('rsBgOpacity').value = (s.bgOpacity === undefined ? 1 : s.bgOpacity);
  if ($('rsBgOpacityVal'))   $('rsBgOpacityVal').textContent = Math.round((s.bgOpacity === undefined ? 1 : s.bgOpacity) * 100) + '%';

  if ($('rsColorPrimary'))   $('rsColorPrimary').value = s.colorPrimary || '#111111';
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
  if (typeof updateFontSizeDot === 'function') updateFontSizeDot();

  /* 字体下拉：先按存的选，找不着就退回 system */
  if ($('rsFont')) {
    let f = s.font || 'system';
    const exists = Array.from($('rsFont').options).some(o => o.value === f);
    if (!exists) f = 'system';
    $('rsFont').value = f;
  }

  /* 色卡的高亮 */
  ['rsBgColor', 'rsColorPrimary', 'rsColorSecondary'].forEach(id => {
    const el = $(id);
    if (el) updateSwatchActive(id, el.value);
  });
}

/* 字体大小滑块输入时 */
function onFontSizeChanged() {
  if ($('rsFontSizeVal') && $('rsFontSize')) {
    const fs = parseFloat($('rsFontSize').value) || DEFAULT_FONT_SIZE;
    $('rsFontSizeVal').textContent = fs.toFixed(1) + 'px';
  }
  applyReceiptSettings();
}

/* 点"默认字号"黑点：恢复默认 */
function resetFontSize() {
  if ($('rsFontSize')) $('rsFontSize').value = DEFAULT_FONT_SIZE;
  if ($('rsFontSizeVal')) $('rsFontSizeVal').textContent = DEFAULT_FONT_SIZE.toFixed(1) + 'px';

  const s = getReceiptSettings();
  s.fontSize = DEFAULT_FONT_SIZE;
  setReceiptSettings(s);
  applyReceiptSettings();
}

/* 更新"默认字号"黑点的位置（按 13.5px 在滑块上的比例计算） */
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

/* 绑定票头 / 票尾 / 背景的上传 */
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
        if (kind === 'header') {
          oldRef = s.headerImg;
          s.headerImg = ref;
          s.headerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
        } else if (kind === 'footer') {
          oldRef = s.footerImg;
          s.footerImg = ref;
          s.footerImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
        } else {
          oldRef = s.bgImg;
          s.bgImg = ref;
          s.bgImgState = { w: 0, h: 0, l: 0, t: 0, baseW: 0 };
        }

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

/* 当前正在编辑哪张图：'header' / 'footer' / 'bg' / null */
var __activeReceiptImage = null;

function setActiveReceiptImage(kind) {
  if (__activeReceiptImage === kind) {
    __activeReceiptImage = null;
  } else {
    __activeReceiptImage = kind;
  }
  updateReceiptImageActiveState();
  setTimeout(() => setupReceiptImgDrag(), 50);
}

function updateReceiptImageActiveState() {
  const headerBlock = $('outHeaderBlock');
  const footerBlock = $('outFooterBlock');
  if (headerBlock) {
    if (__activeReceiptImage === 'header') headerBlock.classList.add('receipt-img-edit-active');
    else                                    headerBlock.classList.remove('receipt-img-edit-active');
  }
  if (footerBlock) {
    if (__activeReceiptImage === 'footer') footerBlock.classList.add('receipt-img-edit-active');
    else                                    footerBlock.classList.remove('receipt-img-edit-active');
  }

  const bgWrap = $('outBgWrap');
  if (bgWrap) {
    if (__activeReceiptImage === 'bg') bgWrap.classList.add('receipt-img-edit-active');
    else                                bgWrap.classList.remove('receipt-img-edit-active');
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


/* ═══════════════════════════════════════════════════════
   [R-08] 状态保存（编辑完一张图后，把它的尺寸写回设置）
   ═══════════════════════════════════════════════════════ */

function saveImgState(kind, img) {
  const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
  if (!block) return;
  const s = getReceiptSettings();
  const state = {
    w: parseFloat(img.style.width)  || img.offsetWidth,
    h: parseFloat(img.style.height) || img.offsetHeight,
    l: parseFloat(img.style.left) || 0,
    t: parseFloat(img.style.top)  || 0,
    baseW: block.offsetWidth || block.clientWidth || 0,
  };
  if (kind === 'header')      s.headerImgState = state;
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


/* ═══════════════════════════════════════════════════════
   [R-09] 颜色 / 透明度 / 色卡高亮
   ═══════════════════════════════════════════════════════ */

function onColorChanged(which) {
  const map = {
    bgColor:        ['rsBgColor',        'rsBgColorHex'],
    colorPrimary:   ['rsColorPrimary',   'rsColorPrimaryHex'],
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
    else                                                btn.classList.remove('active');
  });
}

function onOpacityChanged() {
  if ($('rsBgOpacityVal') && $('rsBgOpacity')) {
    $('rsBgOpacityVal').textContent = Math.round(parseFloat($('rsBgOpacity').value) * 100) + '%';
  }
  applyReceiptSettings();
}


/* ═══════════════════════════════════════════════════════
   [R-10] 小票预设（存储 / 加载 / 删除）
   ═══════════════════════════════════════════════════════ */

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

  try { localStorage.removeItem(RECEIPT_SETTINGS_KEY); } catch (e) {}
  __activeReceiptImage = null;
  closeModal();
  fillReceiptSettingsForm();
  applyReceiptSettings();
  updateReceiptImageActiveState();
  if ($('receiptLayout') && $('receiptLayout').classList.contains('settings-open')) {
    setTimeout(() => setupReceiptImgDrag(), 100);
  }
}


/* ═══════════════════════════════════════════════════════
   [R-11] 本地字体导入

   浏览器不允许 JS 永久保存字体文件，所以：
     - 每次打开页面要重新导入
     - 存在内存里的 registeredFonts Map 里
   ═══════════════════════════════════════════════════════ */

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
  if (type === 'success')      el.style.color = '#2e7d32';
  else if (type === 'error')   el.style.color = 'var(--red)';
  else if (type === 'info')    el.style.color = 'var(--ink-soft)';
  else                         el.style.color = '';
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
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


/* ═══════════════════════════════════════════════════════
   [R-12] 占位模式

   打开"占位"开关时：
     - 隐藏"定制细则"和"其他"两个面板
     - 定金锁定为固定金额（排单费）
   ═══════════════════════════════════════════════════════ */

function applyPlaceholderMode(on) {
  /* ★ 只隐藏"稿件组容器"和"添加稿件组"按钮，
     保留整个 detailGroupPanel（含标题栏和占位开关） */
  const groupsContainer = $('groupsContainer');
  const addGroupBtn = $('addGroupBtn');
  const extrasPanel = $('orderExtrasPanel');

  if (on) {
    if (groupsContainer) groupsContainer.style.display = 'none';
    if (addGroupBtn)     addGroupBtn.style.display = 'none';
    if (extrasPanel)     extrasPanel.style.display = 'none';
    clearAllFieldErrors();
  } else {
    if (groupsContainer) groupsContainer.style.display = '';
    if (addGroupBtn)     addGroupBtn.style.display = '';
    if (extrasPanel)     extrasPanel.style.display = '';
  }
}

/* ╔══════════════════════════════════════════════════════╗
   ║  第 6 段 · 小票生成核心                               ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [G-01] 节点比例合计检查                             ║
   ║   [G-02] 生成前校验                                   ║
   ║   [G-03] calcItem  —— 算单个稿件                      ║
   ║   [G-04] calcGroup —— 算单个稿件组                    ║
   ║   [G-05] generate  —— 生成小票（主流程）              ║
   ║   [G-06] 小票页离开提醒                               ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [G-01] 节点比例合计检查

   一个稿件里的所有"节点"（data-is-node="1"）的数值之和，
   必须等于 100。否则说明按比例拆分不完总价。
   ═══════════════════════════════════════════════════════ */

function getItemNodeSum(block) {
  let sum = 0;
  block.querySelectorAll('.sub-item[data-is-node="1"] .sub-value').forEach(inp => {
    sum += Number(inp.value) || 0;
  });
  return sum;
}


/* ═══════════════════════════════════════════════════════
   [G-02] 生成前校验

   遍历所有表单，把错误收集到 errors 数组。
   同时记录"第一个出错的元素"，方便滚动定位。
   ═══════════════════════════════════════════════════════ */

function validateBeforeGenerate() {
  clearAllFieldErrors();

  const errors = [];
  let firstErrorEl = null;

  const addError = (el, msg) => {
    if (el) el.classList.add('field-error');
    errors.push(msg);
    if (!firstErrorEl && el) firstErrorEl = el;
  };

  /* --- 通用必填 --- */
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

  /* --- 占位单：只校验排单费，不校验其它 --- */
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

  /* --- 普通单：截稿日期 --- */
  const deadlineEl = $('deadline');
  if (deadlineEl && !deadlineEl.value) {
    addError(deadlineEl, '请填写「截稿日期」');
  }

  /* --- 稿件组 --- */
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

        /* 节点比例合计必须 = 100% */
        if (item.querySelector('.sub-item[data-is-node="1"]')) {
          const sum = getItemNodeSum(item);
          if (Math.abs(sum - 100) > 0.01) {
            errors.push(
              `稿件组 ${gi + 1} 第 ${ii + 1} 个稿件：「节点比例合计」= ${num2(sum)}%，必须 = 100.00%`
            );
          }
        }

        /* 每个增项 / 节点：名称和数值必填 */
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


/* ═══════════════════════════════════════════════════════
   [G-03] calcItem —— 算单个稿件

   输入：一个 .item-block DOM 元素
   输出：{
     name, price, qty, license, m,       // 基础信息
     addons: [{ name, op, value, unit, subtotal }],   // 增项（每件加价）
     nodes:  [{ name, op, value, unit, subtotal }],   // 节点（按比例拆分）
     baseUnit,                            // 单元原价 = 基础价 + 增项合计
     addonSum,                            // 增项合计（单元）
     partsUnitSum,                        // 单元合计（有节点用节点之和，否则用单元原价）
     itemSubtotal,                        // 稿件小计 = partsUnitSum × 数量 × 权限倍率
     hasNodes,                            // 有没有节点
   }

   算法说明：
     1) 增项：× 按基础价的百分比，＋ 按固定金额。都加到"单元原价"上
     2) 节点：按"单元原价 × 比例"算，一个稿件的所有节点比例合计必须 = 100%
     3) 稿件小计 = 部件合计 × 数量 × 权限倍率
   ═══════════════════════════════════════════════════════ */

function calcItem(block, licenseOverride) {
  const name    = block.querySelector('.item-name').value.trim();
  const price   = Number(block.querySelector('.item-price').value) || 0;
  const qty     = Number(block.querySelector('.item-qty').value) || 1;
  const license = licenseOverride || block.querySelector('.item-license').value;
  const m       = getLicenseMultiplier(license);

  const addons = [];   /* 增项 */
  const nodes  = [];   /* 节点 */

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
    a.unit     = unit;
    a.subtotal = unit * qty * m;
    addonSum  += unit;
  });

  /* 单元原价 = 基础价 + 增项合计 */
  const baseUnit = price + addonSum;

  /* 第三步：算节点（基于单元原价 × 比例） */
  let nodeSum = 0;
  nodes.forEach(n => {
    const unit = baseUnit * n.value / 100;
    n.unit     = unit;
    n.subtotal = unit * qty * m;
    nodeSum   += unit;
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


/* ═══════════════════════════════════════════════════════
   [G-04] calcGroup —— 算单个稿件组

   输入：一个 .group-block DOM 元素
   输出：{
     items: [...],                          // 组内每个稿件的 calcItem 结果
     groupSubtotal,                         // 组内稿件小计之和
     extras: [...], extrasTotal,            // 组附加费用
     discounts: [...], discountsTotal,      // 组优惠折扣
     groupTotal,                            // 组合计 = 组小计 + 附加 - 优惠
     nonNodeSubtotal,                       // 非节点稿件的金额（用于判断纯节点单）
     nodeItemsFirstAmount,                  // 所有节点稿件的"第一个节点"金额之和（纯节点单预付款）
   }
   ═══════════════════════════════════════════════════════ */

function calcGroup(groupBlock) {
  const items = [];
  let groupSubtotal       = 0;
  let nonNodeSubtotal     = 0;
  let nodeItemsFirstAmount = 0;

  /* 组内每个稿件 */
  groupBlock.querySelectorAll('.item-block').forEach(block => {
    const r = calcItem(block);
    if (!r.name) return;
    items.push(r);
    groupSubtotal += r.itemSubtotal;

    if (r.hasNodes) {
      /* 节点稿件：记下第一个节点的金额（用于纯节点单的预付款） */
      if (r.nodes[0]) nodeItemsFirstAmount += r.nodes[0].subtotal;
    } else {
      nonNodeSubtotal += r.itemSubtotal;
    }
  });

  /* 组附加费用：算法 × 时按组小计的百分比，＋ 时按固定金额 */
  const extras = [];
  let extrasTotal = 0;
  groupBlock.querySelectorAll('.group-extras .ge-row').forEach(row => {
    const name  = row.querySelector('.ge-name').value.trim();
    const op    = row.querySelector('.ge-op-select').value;
    const value = Number(row.querySelector('.ge-value').value) || 0;
    if (!name) return;

    let amount;
    if (op === 'multiply') amount = groupSubtotal * value / 100;
    else                   amount = value;

    extras.push({ name, op, value, amount, base: groupSubtotal });
    extrasTotal += amount;
  });

  /* 组优惠折扣：算法 × 时基数是"组小计 + 组附加费" */
  const groupDiscountBase = groupSubtotal + extrasTotal;
  const discounts = [];
  let discountsTotal = 0;
  groupBlock.querySelectorAll('.group-discounts .ge-row').forEach(row => {
    const name  = row.querySelector('.gd-name').value.trim();
    const op    = row.querySelector('.gd-op-select').value;
    const value = Number(row.querySelector('.gd-value').value) || 0;
    if (!name) return;

    let amount;
    if (op === 'multiply') amount = groupDiscountBase * value / 100;
    else                   amount = value;

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


/* ═══════════════════════════════════════════════════════
   [G-05] generate —— 生成小票（主流程）

   步骤：
     1. 检查身份 / ID 是否填了
     2. 校验表单
     3. 读基础信息，写进小票 DOM
     4. 处理预览图
     5. 遍历稿件组 → 生成每个组的表格 + 汇总
     6. 遍历订单级附加 / 优惠 / 赠品
     7. 算订单总价 / 应付 / 预付款 / 尾款
     8. 应用小票外观设置
     9. 显示小票面板 + 工具栏
   ═══════════════════════════════════════════════════════ */

/* 可选信息行：值为空时隐藏整行 */
function setOptionalRow(rowEl, value) {
  if (!rowEl) return;
  if (!value || String(value).trim() === '') rowEl.style.display = 'none';
  else rowEl.style.display = 'flex';
}

/* 检查身份 / ID 是否已填，没填弹窗让用户去填 */
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
  /* 1. 检查身份 / ID */
  if (!checkIdentityAndName()) return;

  /* 2. 校验表单 */
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
        catch (e) {}
      }, 120);
    }
    return;
  }

  /* 3. 读基础信息 */
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

  /* 4. 写进小票 DOM */
  $('outOrderNo').textContent = makeOrderNo(orderDate);

  if ($('outScheduleDate'))  $('outScheduleDate').textContent  = scheduleDate || '—';
  if ($('outDeadline'))      $('outDeadline').textContent      = deadline     || '—';
  if ($('outIdentityLabel')) $('outIdentityLabel').textContent = identity;
  if ($('outArtist'))        $('outArtist').textContent        = artist || '—';
  if ($('outPlatform'))      $('outPlatform').textContent      = platform;

  $('outClientAt').textContent = '@' + (client || '—');

  $('outProject').textContent   = project   || '—';
  $('outAttribute').textContent = attribute || '—';
  $('outCharacter').textContent = character || '—';
  setOptionalRow($('rowProject'),   project);
  setOptionalRow($('rowAttribute'), attribute);
  setOptionalRow($('rowCharacter'), character);

  /* 5. 预览图 */
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

  /* 6. 遍历稿件组 */
  const outGroups = $('outGroups');
  outGroups.innerHTML = '';

  let orderSubtotal    = 0;    /* 订单总价（所有组合计之和） */
  let totalItemCount   = 0;    /* 所有稿件数（用于判断纯节点单） */
  let nodeItemCount    = 0;    /* 节点稿件数 */
  let groupIndex       = 0;
  const nodeFirstDetail = [];  /* 纯节点单的预付款明细 */

  if (!placeholderOn) {
    document.querySelectorAll('#groupsContainer .group-block').forEach((groupBlock) => {
      groupIndex++;
      const groupLabel = resolveGroupLabel(groupBlock, groupIndex);
      const cg = calcGroup(groupBlock);
      /* 空组跳过 */
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

      /* --- 组装这一组的 HTML --- */
      const section = document.createElement('div');
      section.className = 'group-section';

      let html = `<div class="group-section-title">${escapeHtml(groupLabel)}</div>`;
      html += `<table class="list"><thead><tr>
        <th>稿件</th><th class="r">单价</th><th class="c">数量</th><th class="c">权限</th><th class="r">小计</th>
      </tr></thead><tbody>`;

      cg.items.forEach((r, idx) => {
        /* 主行 */
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

        /* 增项（└ 前缀区分） */
        r.addons.forEach(x => {
          const opStr = opSymbol(x.op) + (x.op === 'multiply' ? pctShort(x.value) : num2(x.value));
          html += `<tr class="part-row"><td><div style="padding-left:26px;">└ ${escapeHtml(x.name)}（${opStr}）</div></td>
            <td class="r"><span class="sub">${fmt(x.unit)}</span></td>
            <td class="c"><span class="sub">${r.qty}件</span></td>
            <td class="c"><span class="sub">${licenseText(r.license)}</span></td>
            <td class="r"><span class="sub">${fmt(x.subtotal)}</span></td></tr>`;
        });

        /* 节点（◆ 前缀区分） */
        r.nodes.forEach(x => {
          html += `<tr class="part-row"><td><div style="padding-left:26px;">◆ ${escapeHtml(x.name)}（×${pctShort(x.value)}）</div></td>
            <td class="r"><span class="sub">${fmt(x.unit)}</span></td>
            <td class="c"><span class="sub">${r.qty}件</span></td>
            <td class="c"><span class="sub">${licenseText(r.license)}</span></td>
            <td class="r"><span class="sub">${fmt(x.subtotal)}</span></td></tr>`;
        });
      });

      html += `</tbody></table>`;

      /* --- 组汇总 --- */
      let summaryHtml = '<div class="group-summary">';
      summaryHtml += `<div class="gs-row"><span class="gs-name">原价小计</span><span class="gs-val">${fmt(cg.groupSubtotal)}</span></div>`;

      /* 附加费用 */
      if (cg.extras.length) {
        const formulas = cg.extras.map(ex => {
          if (ex.op === 'multiply') return `${escapeHtml(ex.name)}：${fmt(ex.base)} ×${pctShort(ex.value)} = ${fmt(ex.amount)}`;
          return `${escapeHtml(ex.name)}：＋${fmt(ex.value)} = ${fmt(ex.amount)}`;
        }).join('；');
        summaryHtml += `<div class="gs-row"><span class="gs-name">附加费用（${formulas}）</span><span class="gs-val">${fmt(cg.extrasTotal)}</span></div>`;
      } else {
        summaryHtml += `<div class="gs-row"><span class="gs-name">附加费用</span><span class="gs-val">${fmt(0)}</span></div>`;
      }

      /* 优惠折扣 */
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

    /* 一组都没有：显示"立项待定" */
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
    /* 占位单：显示"占位待定" */
    const section = document.createElement('div');
    section.className = 'group-section';
    section.innerHTML = `
      <div class="group-section-title">占位待定</div>
      <div style="padding:10px 0;color:var(--rc-ink-soft);font-size:13px;">
        本单为占位单，具体内容待定。
      </div>`;
    outGroups.appendChild(section);
  }

  /* 7. 订单级附加费用 */
  let orderExtrasTotal = 0;
  const orderExtrasNames = [];
  if (!placeholderOn) {
    document.querySelectorAll('#extrasContainer .oe-row').forEach(row => {
      const name = row.querySelector('.extra-name').value.trim();
      const op   = row.querySelector('.extra-mode').value;
      const val  = Number(row.querySelector('.extra-val').value) || 0;
      if (!name) return;
      let amount = (op === 'multiply') ? orderSubtotal * val / 100 : val;
      orderExtrasTotal += amount;
      const opStr = (op === 'multiply') ? ('×' + pctShort(val)) : ('＋' + fmt(val));
      orderExtrasNames.push(escapeHtml(name) + '（' + opStr + '）');
    });
  }

  /* 8. 订单级优惠 */
  let orderDiscountTotal = 0;
  const orderDiscountsNames = [];
  if (!placeholderOn) {
    document.querySelectorAll('#discountsContainer .oe-row').forEach(row => {
      const name = row.querySelector('.discount-name').value.trim();
      const op   = row.querySelector('.discount-mode').value;
      const val  = Number(row.querySelector('.discount-val').value) || 0;
      if (!name) return;
      let amount = (op === 'multiply') ? orderSubtotal * val / 100 : val;
      orderDiscountTotal += amount;
      const opStr = (op === 'multiply') ? ('×' + pctShort(val)) : ('−' + fmt(val));
      orderDiscountsNames.push(escapeHtml(name) + '（' + opStr + '）');
    });
  }

  /* 订单总价行 */
  $('outTotal').textContent = fmt(orderSubtotal);

  /* 订单级附加费用行 */
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

  /* 订单级优惠行 */
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

  /* 9. 应付金额 */
  const payable = Math.max(0, orderSubtotal + orderExtrasTotal - orderDiscountTotal);
  $('outPayable').textContent = fmt(payable);

  /* 10. 预付款 */
  let prepaid = 0;
  let prepaidLabelText = '预付金额';

  if (placeholderOn) {
    /* 占位单：预付款 = 排单费 */
    prepaid = depositInput;
    prepaidLabelText = '预付金额（排单费：' + fmt(prepaid) + '）';
  } else {
    /* 纯节点单：预付款 = 每个节点稿件的"第一个节点"金额之和 */
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
      /* 普通单：定金按百分比或固定金额 */
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

  /* 11. 占位单转立项单时的"实收预付"行 */
  const fromConvert = window.__convertFromPlaceholder;
  const useDeduct   = window.__convertDeduct;
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

  /* 12. 待结尾款 */
  const finalPay = Math.max(0, payable - prepaid);
  $('outFinal').textContent = fmt(finalPay);

  /* 13. 赠品 */
  const outGifts = $('outGifts');
  outGifts.innerHTML = '';
  let hasGift = false;
  if (!placeholderOn) {
    const giftNames = document.querySelectorAll('.gift-name');
    const giftVals  = document.querySelectorAll('.gift-val');
    giftNames.forEach((inp, i) => {
      const name = inp.value.trim();
      const val  = giftVals[i].value;
      if (!name) return;
      hasGift = true;
      const row = document.createElement('div');
      row.className = 'info-row';
      row.innerHTML = `<span>${escapeHtml(name)}</span><span>${val ? fmt(Number(val) || 0) : "—"}</span>`;
      outGifts.appendChild(row);
    });
  }
  if ($('outGiftsBox')) $('outGiftsBox').style.display = hasGift ? 'block' : 'none';

  /* 14. 应用小票外观设置 */
  applyReceiptSettings();

  /* 15. 显示小票面板 + 工具栏 */
  $('receiptPanel').classList.remove('hidden');
  const tb = $('receiptToolbar');
  if (tb) tb.classList.remove('hidden');

  window.__receiptGenerated = true;
  window.__receiptImported  = false;
  window.__receiptWarnIgnore = false;

  const rp = $('receiptPanel');
  if (rp && typeof rp.scrollIntoView === 'function') {
    rp.scrollIntoView({ behavior: 'smooth' });
  }
}


/* ═══════════════════════════════════════════════════════
   [G-06] 小票页离开提醒

   生成小票后如果用户切走但还没点"导入订单"，弹确认框。
   三种情况不提醒：
     - 从没生成过
     - 已经导入过
     - 用户点过"之后不再提醒"
   ═══════════════════════════════════════════════════════ */

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

/* 包装 showPage：切走小票页时检查一遍 */
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
   ║  第 7 段 · 订单数据 + 列表页 + 详情页                 ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [O-01] 订单数据存取 + 排序 + 卡片标题格式化         ║
   ║   [O-02] 订单列表页（待办列表）                       ║
   ║   [O-03] 删除订单                                     ║
   ║   [O-04] 订单详情页                                   ║
   ║   [O-05] 详情页编辑模式                               ║
   ║   [O-06] 事项勾选 / 增删                              ║
   ║   [O-07] 联系方式复制                                 ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [O-01] 订单数据存取 + 排序 + 卡片标题格式化
   ═══════════════════════════════════════════════════════ */

/* 按截稿日期升序排序；没截稿的排最后 */
function getSortedTodos() {
  const todos = getTodos();
  todos.sort((a, b) => {
    if (!a.deadline && !b.deadline) return (a.createdAt || 0) - (b.createdAt || 0);
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    if (a.deadline === b.deadline) return (a.createdAt || 0) - (b.createdAt || 0);
    return a.deadline.localeCompare(b.deadline);
  });
  /* 顺便给每条订单打上"序号"，用于卡片标题 */
  todos.forEach((t, i) => { t.number = i + 1; });
  return todos;
}

/* 序号转 3 位数字：1 → "001" */
function formatTodoNumber(n) {
  return String(n).padStart(3, '0');
}

/* 订单卡片的标题："001 点点 的立项单" */
function formatTodoTitle(t) {
  const num = formatTodoNumber(t.number || 1);
  const name = (t.clientName || '未命名').trim();
  if (t.isPlaceholder) {
    return num + ' ' + name + ' 的占位单';
  }
  return num + ' ' + name + ' 的立项单';
}

/* 距截稿日文案（HTML 版，带红字强调） */
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

/* 距截稿日文案（纯文本版，详情页用） */
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

/* 判断订单是否"所有事项都已完成" */
function isTodoCompleted(t) {
  if (!t) return false;
  if (t.isPlaceholder) return false;
  const items = t.items || [];
  if (!items.length) return false;
  return items.every(x => x.done === true);
}

/* 判断订单是否"待结"状态 */
function isTodoPending(t) {
  return t && t.status === 'pending';
}


/* ═══════════════════════════════════════════════════════
   [O-02] 订单列表页（待办列表）
   ═══════════════════════════════════════════════════════ */

function renderTodoList() {
  const box = $('todoListContainer');
  if (!box) return;

  const todos = getSortedTodos();

  /* 空态 */
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

/* 渲染单张订单卡片 */
function renderTodoCard(t) {
  const id = escapeAttr(t.id);
  const isPlaceholder = !!t.isPlaceholder;
  const isPending = isTodoPending(t);
  const titleHtml = escapeHtml(formatTodoTitle(t));

  /* 三横线图标 */
  const moreSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="7" x2="20" y2="7"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="17" x2="20" y2="17"/>
    </svg>`;

  /* --- 待结状态：单独一种样式 --- */
  if (isPending) {
    const pendingAmt = Number(t.pendingAmount) || 0;
    return `<div class="todo-card is-pending">
      <div class="todo-card-body" onclick="openTodoDetail('${id}')">
        <div class="todo-card-title">${titleHtml}</div>
        ${renderTodoCardTags(t.tags)}
        <div class="todo-card-pending-row">
          <span class="todo-card-pending-tag">待结</span>
          <span class="todo-card-pending-amount">${fmt(pendingAmt)}</span>
        </div>
      </div>
      <button class="todo-more-btn" onclick="openTodoMoreMenu(event, '${id}')" title="更多">${moreSvg}</button>
      <button class="todo-settle-btn" onclick="settleTodo('${id}')">结单</button>
    </div>`;
  }

  /* --- 普通状态 --- */
  const total = (t.items || []).length;
  const done  = (t.items || []).filter(x => x.done).length;

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
      ${renderTodoCardTags(t.tags)}
      <div class="todo-card-meta">
        ${progressHtml}
        <span class="todo-card-deadline">${daysHtml}</span>
      </div>
    </div>
    <button class="todo-more-btn" onclick="openTodoMoreMenu(event, '${id}')" title="更多">${moreSvg}</button>
    <button class="todo-card-delete" onclick="askDeleteTodo('${id}')" title="删除">×</button>
  </div>`;
}


/* ═══════════════════════════════════════════════════════
   [O-03] 删除订单
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [O-04] 订单详情页
   ═══════════════════════════════════════════════════════ */

var __currentTodoId = null;   /* 当前打开的订单 ID */
var __todoEditMode = false;   /* 详情页是否在编辑模式 */

function openTodoDetail(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) { alert('未找到该订单'); return; }

  __currentTodoId = id;
  __todoEditMode = false;

  /* 标题（带序号） */
  const sorted = getSortedTodos();
  const withNum = sorted.find(x => x.id === id) || t;
  $('tdTitle').textContent = formatTodoTitle(withNum);

  /* 标签文案：占位单说"开单日期"，普通单说"截稿日期" */
  if ($('tdDeadlineLabel')) $('tdDeadlineLabel').textContent = t.isPlaceholder ? '开单日期' : '截稿日期';
  if ($('tdDaysLeftLabel')) $('tdDaysLeftLabel').textContent = t.isPlaceholder ? '距离开单日' : '距离截稿日';

  /* 基本信息 */
  $('tdClientId').value = t.clientId || '';
  $('tdPlatform').value = t.platform || '';
  if ($('tdContactType')) $('tdContactType').value = normalizeContactType(t.contactType);
  $('tdContact').value  = t.contact  || '';
  $('tdDeadline').value = t.deadline || '';
  $('tdDaysLeft').value = calcDaysLeftText(t.deadline);
  $('tdNote').value     = t.note     || '';

  /* "更改"按钮的文案：占位单显示"转立项单" */
  const changeBtn = $('tdChangeReceiptBtn');
  if (changeBtn) {
    changeBtn.textContent = t.isPlaceholder ? '转立项单' : '更改';
  }

  /* 事项 / 素材 / 要求 / 标签 */
  renderTodoItems(t);
  renderTodoThumbs('material', t.materials || []);
  renderTodoThumbs('requirement', t.requirements || []);
  renderTodoTags(t);

  setTodoEditMode(false);
  showPage('pageTodoDetail');
}


/* ═══════════════════════════════════════════════════════
   [O-05] 详情页编辑模式
   ═══════════════════════════════════════════════════════ */

/* ★ 进入编辑模式时记录快照，返回时比对 */
var __todoEditSnapshot = null;

function takeTodoEditSnapshot() {
  return {
    clientId:    $('tdClientId') ? String($('tdClientId').value || '') : '',
    platform:    $('tdPlatform') ? String($('tdPlatform').value || '') : '',
    contactType: $('tdContactType') ? String($('tdContactType').value || '') : '',
    contact:     $('tdContact') ? String($('tdContact').value || '') : '',
    deadline:    $('tdDeadline') ? String($('tdDeadline').value || '') : '',
    note:        $('tdNote') ? String($('tdNote').value || '') : '',
  };
}

function isTodoEditDirty() {
  if (!__todoEditSnapshot) return false;
  const cur = takeTodoEditSnapshot();
  const old = __todoEditSnapshot;
  return cur.clientId    !== old.clientId
      || cur.platform    !== old.platform
      || cur.contactType !== old.contactType
      || cur.contact     !== old.contact
      || cur.deadline    !== old.deadline
      || cur.note        !== old.note;
}

function setTodoEditMode(on) {
  __todoEditMode = !!on;

  /* ★ 进入编辑时记录快照；退出时清掉 */
  if (on) {
    __todoEditSnapshot = takeTodoEditSnapshot();
  } else {
    __todoEditSnapshot = null;
  }

  /* 可编辑字段 */
  const editableIds = ['tdClientId', 'tdPlatform', 'tdContact', 'tdDeadline', 'tdNote'];
  editableIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.readOnly = !on;
    }
  });

  if ($('tdContactType')) $('tdContactType').disabled = !on;

  /* 编辑态下显示"添加事项"按钮 */
  const addBtn = $('tdAddItemBtn');
  if (addBtn) addBtn.style.display = on ? '' : 'none';

  /* "编辑"和"保存"按钮切换 */
  const editBtn = $('tdEditBtn');
  const saveBtn = $('tdSaveBtn');
  if (editBtn) editBtn.style.display = on ? 'none' : '';
  if (saveBtn) saveBtn.style.display = on ? '' : 'none';

  /* 刷新事项和标签（编辑态下事项会多一个删除按钮） */
  const t = getTodos().find(x => x.id === __currentTodoId);
  if (t) {
    renderTodoItems(t);
    renderTodoTags(t);
  }
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

  /* 刷新标题和剩余天数 */
  const sorted = getSortedTodos();
  const withNum = sorted.find(x => x.id === __currentTodoId);
  if (withNum) $('tdTitle').textContent = formatTodoTitle(withNum);
  $('tdDaysLeft').value = calcDaysLeftText(todos[idx].deadline);

  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
  if (typeof renderMasterList === 'function') renderMasterList();
}

function backToTodoList() {
  /* ★ 编辑模式下有未保存修改 → 弹确认框 */
  if (__todoEditMode && isTodoEditDirty()) {
    showTodoLeaveConfirm();
    return;
  }

  __currentTodoId = null;
  __todoEditMode = false;
  __todoEditSnapshot = null;
  renderTodoList();
  showPage('pageTodo');
}

/* ★ 三选确认框：保存 / 放弃 / 取消 */
function showTodoLeaveConfirm() {
  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>未保存的修改</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:8px 0;line-height:1.7;">检测到编辑内容有改动，要保存吗？</p>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;flex-wrap:wrap;">
            <button class="action-btn ghost" onclick="closeModal()">取消</button>
            <button class="action-btn ghost" style="border-color:var(--red);color:var(--red);" onclick="confirmTodoLeaveDiscard()">放弃修改</button>
            <button class="action-btn" onclick="confirmTodoLeaveSave()">保存并返回</button>
          </div>
        </div>
      </div>
    </div>`;
}

function confirmTodoLeaveDiscard() {
  closeModal();
  __currentTodoId = null;
  __todoEditMode = false;
  __todoEditSnapshot = null;
  renderTodoList();
  showPage('pageTodo');
}

function confirmTodoLeaveSave() {
  closeModal();
  /* saveTodoDetail 内部会 setTodoEditMode(false)，把快照清掉 */
  saveTodoDetail();
  /* 保存后返回列表（此时已不是编辑模式，不会再弹框） */
  backToTodoList();
}


/* ═══════════════════════════════════════════════════════
   [O-06] 事项勾选 / 增删
   ═══════════════════════════════════════════════════════ */

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
  todos[idx].updatedAt = Date.now();   /* ★ 顺便更新 updatedAt */
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
  todos[idx].updatedAt = Date.now();
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
  todos[idx].isPlaceholder = false;   /* 一旦加了事项，就不再是占位单 */
  todos[idx].updatedAt = Date.now();

  setTodos(todos);
  closeModal();
  renderTodoItems(todos[idx]);
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof renderStatsPage === 'function') renderStatsPage();
}


/* ═══════════════════════════════════════════════════════
   [O-07] 联系方式复制
   ═══════════════════════════════════════════════════════ */

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

/* ╔══════════════════════════════════════════════════════╗
   ║  第 8 段 · 素材 / 要求 / 快照 / 导入订单              ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [F-01] 素材 / 要求 上传                             ║
   ║   [F-02] 缩略图渲染 + 删除                            ║
   ║   [F-03] 图片查看器（全屏预览）                       ║
   ║   [F-04] 小票快照：抓取表单到 JSON                    ║
   ║   [F-05] 小票快照：回填表单                           ║
   ║   [F-06] changeTodoReceipt + 占位单转立项单           ║
   ║   [F-07] 从小票页导入订单（importToTodo）             ║
   ║   [F-08] calcSnapshotAmounts —— 从快照算金额          ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [F-01] 素材 / 要求 上传
   ═══════════════════════════════════════════════════════ */

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
        } catch (err) {
          console.error('读取失败', file.name, err);
        }
      }

      todos[idx].updatedAt = Date.now();
      const ok = setTodos(todos);
      if (!ok) return;

      renderTodoThumbs(kind, todos[idx][key]);
    });
  });
}


/* ═══════════════════════════════════════════════════════
   [F-02] 缩略图渲染 + 删除
   ═══════════════════════════════════════════════════════ */

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
  todos[idx].updatedAt = Date.now();
  setTodos(todos);

  if (target) {
    const ref = target.fileRef || target.dataUrl;
    if (ref) {
      try { await deleteImageRef(ref); } catch (e) {}
    }
  }

  renderTodoThumbs(kind, todos[idx][key]);
}


/* ═══════════════════════════════════════════════════════
   [F-03] 图片查看器（全屏预览）
   ═══════════════════════════════════════════════════════ */

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

/* 订单详情页"小票"按钮：显示这条订单关联的小票图片 */
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

/* 通用全屏预览（结单 / 撤单 / 废稿详情里用） */
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


/* ═══════════════════════════════════════════════════════
   [F-04] 小票快照：抓取表单到 JSON

   把当前小票页所有表单值抓成一个纯 JSON 对象，
   存进订单，以后编辑时能原样恢复。
   ═══════════════════════════════════════════════════════ */

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
    previewImage: previewImageData || '',
    receiptTags: (window.__receiptTags || []).slice()
  };
}


/* ═══════════════════════════════════════════════════════
   [F-05] 小票快照：回填表单

   把订单里存的快照，还原成小票页的表单内容。
   ═══════════════════════════════════════════════════════ */

function restoreReceiptFormSnapshot(snap) {
  if (!snap) return;

  /* 基础信息 */
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

  /* 稿件组 */
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

  /* 订单级附加 / 优惠 / 赠品 */
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

  /* 预览图 */
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

  /* 标签 */
  window.__receiptTags = (snap.receiptTags || []).slice();
  updateReceiptTagBtn();

  renumberGroups();
}


/* ═══════════════════════════════════════════════════════
   [F-06] changeTodoReceipt + 占位单转立项单

   订单详情页的"更改"按钮：
     - 普通单 → 打开小票页，编辑
     - 占位单 → 询问是否用排单费抵扣预付款，然后转立项单
   ═══════════════════════════════════════════════════════ */

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

  /* 记下上下文，等 importToTodo 时使用 */
  window.__editingTodoId = t.id;
  window.__convertFromPlaceholder = true;
  window.__convertDeduct = !!useDeduct;
  window.__placeholderPrepaid = placeholderPrepaid;

  /* 关闭占位开关 */
  if ($('placeholderToggle')) $('placeholderToggle').checked = false;
  if (typeof setDepositModeLocked === 'function') setDepositModeLocked(false);
  if (typeof applyPlaceholderMode === 'function') applyPlaceholderMode(false);

  /* 填回订单里的基础信息 */
  if ($('client'))       $('client').value       = t.clientId || '';
  if ($('orderDate'))    $('orderDate').value    = t.orderDate || '';
  if ($('scheduleDate')) $('scheduleDate').value = t.scheduleDate || '';
  if ($('deadline'))     $('deadline').value     = t.deadline || '';

  if ($('platform') && t.platform) {
    const opts = Array.from($('platform').options).map(o => o.value);
    if (opts.indexOf(t.platform) > -1) $('platform').value = t.platform;
  }

  /* 恢复快照或清空表单 */
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

/* 普通单：把订单数据载入小票页编辑 */
function editTodoReceipt() {
  const todos = getTodos();
  const t = todos.find(x => x.id === __currentTodoId);
  if (!t) { alert('订单不存在'); return; }

  window.__editingTodoId = t.id;

  if ($('client'))       $('client').value       = t.clientId || '';
  if ($('orderDate'))    $('orderDate').value    = t.orderDate || '';
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
    /* 没有快照：用 items 简单填充 */
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


/* ═══════════════════════════════════════════════════════
   [F-07] 从小票页导入订单（importToTodo）

   ★ 修复：编辑订单时，如果订单类型从"占位"变成"普通"（或反过来），
     要把旧类型的流水清掉，避免重复记录。
   ═══════════════════════════════════════════════════════ */

async function importToTodo() {
  const receiptPanel = $('receiptPanel');
  if (!receiptPanel || receiptPanel.classList.contains('hidden')) {
    showSimpleAlert('提示', '请先点「确定生成」生成小票。');
    return;
  }

  /* 1. 读基础信息 */
  const clientId     = ($('client').value || '').trim();
  const platform     = ($('platform').value || '').trim();
  const clientName   = clientId || '未命名';
  const placeholderOn = $('placeholderToggle') && $('placeholderToggle').checked;

  const orderDateVal    = ($('orderDate').value || '').trim();
  const scheduleDateVal = ($('scheduleDate').value || '').trim();
  const deadlineVal     = ($('deadline').value || '').trim();

  /* 占位单的"有效截稿日"用排单日期 */
  const effectiveDeadline = placeholderOn ? scheduleDateVal : deadlineVal;

  /* 2. 生成事项列表 */
  const items = [];
  if (!placeholderOn) {
    document.querySelectorAll('#groupsContainer .item-block').forEach(block => {
      const nameInput = block.querySelector('.item-name');
      const name = nameInput ? (nameInput.value || '').trim() : '';
      if (name) items.push({ id: makeItemId(), text: name, done: false });
    });
  }

  /* 3. 抓快照 */
  const snapshot = captureReceiptFormSnapshot();

  /* 4. 从快照算金额 */
  let amounts = { payable: 0, prepaid: 0, final: 0 };
  try {
    amounts = calcSnapshotAmounts(snapshot) || amounts;
  } catch (e) {
    console.warn('金额计算失败', e);
  }

  /* 5. 截小票图 */
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
  } catch (e) {
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

  /* ===========================================================
     情况 A：编辑已有订单
     =========================================================== */
  if (editingId) {
    const idx = todos.findIndex(x => x.id === editingId);
    if (idx >= 0) {
      const t = todos[idx];
      const oldPrepaid = Number(t.prepaid) || 0;
      const oldReceiptRef = t.receiptImage || '';
      const wasPlaceholder = !!t.isPlaceholder;

      /* 更新字段 */
      t.clientId        = clientId;
      t.clientName      = clientName;
      t.platform        = platform;
      t.orderDate       = orderDateVal;
      t.scheduleDate    = scheduleDateVal;
      t.deadline        = effectiveDeadline;
      t.items           = items;
      t.receiptSnapshot = snapshot;
      t.tags            = (window.__receiptTags || []).slice();
      t.isPlaceholder   = !!placeholderOn && items.length === 0;
      t.payable         = amounts.payable;
      t.prepaid         = amounts.prepaid;
      t.originalFinal   = amounts.final;
      t.updatedAt       = Date.now();

      if (receiptImageRef) {
        t.receiptImage = receiptImageRef;
      }

      /* 待结状态：金额要同步 */
      if (t.status === 'pending') {
        t.pendingAmount = amounts.final;
      }

      if (!setTodos(todos)) return;

      /* 旧小票图片可以删了 */
      if (receiptImageRef && oldReceiptRef && oldReceiptRef !== receiptImageRef) {
        try { await deleteImageRef(oldReceiptRef); } catch (e) {}
      }

      /* --- 流水处理 --- */
      /* 类型可能发生变化：占位 → 普通，或普通 → 占位，或不变 */
      const nowPlaceholder = !!t.isPlaceholder;

      /* 先清掉所有旧的预付款 / 排单费流水 */
      removeFlowsByTodoIdAndType(editingId, 'prepaid');
      removeFlowsByTodoIdAndType(editingId, 'dispatch');

      if (fromConvert) {
        /* 占位单转立项单：
           - 如果开启抵扣：预付款扣除排单费，同时补一条"排单费"流水
           - 如果不开抵扣：排单费保留为独立实收，预付款按新的正常记录 */
        let prepaidToRecord = amounts.prepaid;
        if (useDeduct && oldPrepaid > 0) {
          prepaidToRecord = Math.max(0, amounts.prepaid - oldPrepaid);
        }
        if (prepaidToRecord > 0) {
          addFlow('prepaid', prepaidToRecord, '预付款 · ' + clientName, orderDateVal || today, { todoId: editingId });
        }
        if (useDeduct && oldPrepaid > 0) {
          addFlow('dispatch', oldPrepaid, '排单费 · ' + clientName, orderDateVal || today, { todoId: editingId });
        }
      } else if (nowPlaceholder) {
        /* 现在还是占位单：记排单费 */
        if (amounts.prepaid > 0) {
          addFlow('dispatch', amounts.prepaid, '排单费 · ' + clientName, orderDateVal || today, { todoId: editingId });
        }
      } else {
        /* 普通单：记预付款 */
        if (amounts.prepaid > 0) {
          addFlow('prepaid', amounts.prepaid, '预付款 · ' + clientName, orderDateVal || today, { todoId: editingId });
        }
      }

      /* 清掉一次性上下文 */
      window.__editingTodoId = null;
      window.__convertFromPlaceholder = false;
      window.__convertDeduct = false;
      window.__placeholderPrepaid = 0;
      window.__receiptImported = true;
      window.__receiptTags = [];
      updateReceiptTagBtn();

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
      /* 找不到原订单（被删了）：清掉上下文，走"新建"流程 */
      window.__editingTodoId = null;
      window.__convertFromPlaceholder = false;
      window.__convertDeduct = false;
      window.__placeholderPrepaid = 0;
    }
  }

  /* ===========================================================
     情况 B：新建订单
     =========================================================== */
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
    tags: (window.__receiptTags || []).slice(),
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

  /* 记流水 */
  if (amounts.prepaid > 0) {
    const flowType = t.isPlaceholder ? 'dispatch' : 'prepaid';
    const flowNote = (t.isPlaceholder ? '排单费 · ' : '预付款 · ') + clientName;
    addFlow(flowType, amounts.prepaid, flowNote, orderDateVal || today, { todoId: newId });
  }

  window.__receiptImported = true;
  window.__receiptTags = [];
  updateReceiptTagBtn();

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


/* ═══════════════════════════════════════════════════════
   [F-08] calcSnapshotAmounts —— 从快照算金额

   和小票页的 calcItem / calcGroup 是同一套算法，
   但作用在纯 JSON 快照上，不依赖 DOM。
   ═══════════════════════════════════════════════════════ */

function calcSnapshotAmounts(snap) {
  const result = { payable: 0, prepaid: 0, final: 0 };
  if (!snap) return result;

  const isPlaceholder = !!snap.placeholder;

  /* 占位单：只有排单费 */
  if (isPlaceholder) {
    const prepaid = Number(snap.deposit) || 0;
    return { payable: 0, prepaid: prepaid, final: 0 };
  }

  if (!snap.groups) return result;

  let orderSubtotal  = 0;
  let totalItemCount = 0;
  let nodeItemCount  = 0;
  let nodeFirstTotal = 0;

  (snap.groups || []).forEach(g => {
    let groupSubtotal = 0;

    (g.items || []).forEach(it => {
      const price = Number(it.price) || 0;
      const qty   = Number(it.qty) || 1;
      const m     = getLicenseMultiplier(it.license);

      totalItemCount++;

      /* 增项合计 */
      let addonSum = 0;
      (it.subItems || []).forEach(si => {
        if (si.isNode) return;
        const sv = Number(si.value) || 0;
        if (si.op === 'multiply') addonSum += price * sv / 100;
        else                      addonSum += sv;
      });

      const baseUnit = price + addonSum;

      /* 节点 */
      const nodeItems = (it.subItems || []).filter(si => si.isNode);
      const hasNodes  = nodeItems.length > 0;
      if (hasNodes) nodeItemCount++;

      let nodeSum = 0;
      nodeItems.forEach(si => {
        const sv = Number(si.value) || 0;
        nodeSum += baseUnit * sv / 100;
      });

      const partsUnitSum = hasNodes ? nodeSum : baseUnit;
      const sub = partsUnitSum * qty * m;
      groupSubtotal += sub;

      /* 纯节点单的预付款：记下每个节点稿件的第一个节点金额 */
      if (hasNodes) {
        const firstNode = nodeItems[0];
        const firstUnit = baseUnit * (Number(firstNode.value) || 0) / 100;
        nodeFirstTotal += firstUnit * qty * m;
      }
    });

    /* 组附加 */
    let extras = 0;
    (g.extras || []).forEach(ex => {
      const v = Number(ex.value) || 0;
      extras += (ex.op === 'multiply') ? groupSubtotal * v / 100 : v;
    });

    /* 组优惠（基数是组小计 + 组附加） */
    let discounts = 0;
    const base = groupSubtotal + extras;
    (g.discounts || []).forEach(dc => {
      const v = Number(dc.value) || 0;
      discounts += (dc.op === 'multiply') ? base * v / 100 : v;
    });

    orderSubtotal += groupSubtotal + extras - discounts;
  });

  /* 订单级附加 / 优惠 */
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

  /* 预付款 */
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
   ║  第 9 段 · 菜单 + 结单 / 撤单 / 废稿 + 列表页          ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [M-01] 三横线菜单                                   ║
   ║   [M-02] 结单流程（含优惠尾款 / 待结）                ║
   ║   [M-03] 废稿流程                                     ║
   ║   [M-04] 撤单流程                                     ║
   ║   [M-05] 四圆按钮切换 + 列表状态                      ║
   ║   [M-06] 结 / 撤 / 废列表渲染                         ║
   ║   [M-07] 详情弹窗                                     ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [M-01] 三横线菜单
   ═══════════════════════════════════════════════════════ */

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

  /* 同一个按钮二次点击：关闭 */
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

  /* 图标 */
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

  /* 待结状态不显示"结单"（有独立的结单按钮） */
  let items = [];
  if (!isPending) {
    items.push({ key: 'settle',  label: '结单', cls: 'is-settle',  svg: icoSettle  });
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

  /* 位置：默认在按钮右下方，出界时自动翻转 */
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

  /* 延迟绑定外部点击，避免本事件的冒泡立刻关掉 */
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


/* ═══════════════════════════════════════════════════════
   [M-02] 结单流程
   ═══════════════════════════════════════════════════════ */

function settleTodo(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;

  /* 待结单：走"确认待结尾款"分支 */
  if (t.status === 'pending') {
    settlePendingConfirm(id);
    return;
  }

  /* 占位单：先转立项单 */
  if (t.isPlaceholder) {
    showSimpleAlert(
      '无法结单',
      '这是一条占位单，请先进入详情页点击「转立项单」，填写立项内容后再结单。'
    );
    return;
  }

  /* 事项没完成 */
  if (!isTodoCompleted(t)) {
    showSimpleAlert('无法结单', '订单细则还未全部完成，请先完成所有事项。');
    return;
  }

  openSettleDiscountModal(id);
}

/* 结单第一步：问尾款要不要优惠 */
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
    else                            btn.classList.remove('active');
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

  /* 优惠不能超过尾款 */
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

/* 结单第二步：确认收款 */
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

/* 已收到尾款：结单 */
function settleReceived() {
  const state = window.__settleState;
  if (!state) { closeModal(); return; }

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.id);
  if (idx < 0) { closeModal(); return; }

  const t = todos[idx];
  const today = fmtDateStr(new Date());
  const totalReceived = state.prepaid + state.finalAmount;

  /* 存结单记录 */
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
    tags: (t.tags || []).slice(),
  });

  if (!completed) { closeModal(); return; }

  /* 记尾款流水 */
  if (state.finalAmount > 0) {
    addFlow('final', state.finalAmount, '尾款 · ' + (t.clientName || '未命名'), today, {
      todoId: t.id,
      completedId: completed.id,
    });
  }

  /* 从待办列表移除 */
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

/* 尚未收到：标记为待结 */
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

/* 待结单再次结单：只确认收款，不再问优惠 */
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
    tags: (t.tags || []).slice(),
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


/* ═══════════════════════════════════════════════════════
   [M-03] 废稿流程
   ═══════════════════════════════════════════════════════ */

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

  /* 占位单：只问退不退排单费 */
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

  /* 普通单：完整流程 */
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
    tags: (t.tags || []).slice(),
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
    else                            btn.classList.remove('active');
  });

  const valuePanel = $('discardValuePanel');
  const calcPanel  = $('discardCalcPanel');
  const deductRow  = $('discardDeductRow');

  /* "不收"：隐藏后续面板 */
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
    if (deductVal)  deductVal.textContent = '-' + fmt(state.prepaid);
  } else {
    if (deductRow2) deductRow2.style.display = 'none';
  }

  /* 用户没手动改过才自动填 */
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

  /* --- 情况 1：不收废稿费 --- */
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
      tags: (t.tags || []).slice(),
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

  /* --- 情况 2：应收 > 0 --- */
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
      tags: (t.tags || []).slice(),
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

  /* --- 情况 3：应收 < 0（要退款）--- */
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

  /* --- 情况 4：应收 = 0 --- */
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
      tags: (t.tags || []).slice(),
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
    tags: (t.tags || []).slice(),
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


/* ═══════════════════════════════════════════════════════
   [M-04] 撤单流程
   ═══════════════════════════════════════════════════════ */

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

  /* 占位单：只问退不退排单费 */
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

  /* 普通单：完整流程 */
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
    tags: (t.tags || []).slice(),
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
    else                         btn.classList.remove('active');
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
    else                           btn.classList.remove('active');
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
    else                           btn.classList.remove('active');
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

  /* --- 撤单类型：退款 --- */
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
      tags: (t.tags || []).slice(),
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

  /* --- 撤单类型：收跑单费 --- */
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
      tags: (t.tags || []).slice(),
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
    /* 跑单费为负：问是否退款 */
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
    /* 跑单费 = 0 */
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
      tags: (t.tags || []).slice(),
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
    tags: (t.tags || []).slice(),
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


/* ═══════════════════════════════════════════════════════
   [M-05] 四圆按钮切换 + 列表状态
   ═══════════════════════════════════════════════════════ */

function switchOrderTab(tab) {
  if (tab === 'todo')           showPage('pageTodo');
  else if (tab === 'completed') showPage('pageCompleted');
  else if (tab === 'cancelled') showPage('pageCancelled');
  else if (tab === 'discarded') showPage('pageDiscarded');
}

/* 三个列表页各自的状态 */
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

/* 初始化三个列表页的年月选择器 */
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
      else                              btn.classList.remove('active');
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

/* 根据范围模式算出起止日期 */
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

/* 统一的列表渲染入口 */
function renderOrderList(prefix) {
  if (prefix === 'completed') return renderCompletedList();
  if (prefix === 'cancelled') return renderCancelledList();
  if (prefix === 'discarded') return renderDiscardedList();
}


/* ═══════════════════════════════════════════════════════
   [M-06] 结 / 撤 / 废列表渲染
   ═══════════════════════════════════════════════════════ */

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
        ${renderTodoCardTags(c.tags)}
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
        ${renderTodoCardTags(c.tags)}
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
        ${renderTodoCardTags(c.tags)}
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


/* ═══════════════════════════════════════════════════════
   [M-07] 详情弹窗
   ═══════════════════════════════════════════════════════ */

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

/* 删除结单记录 */
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

/* 初始化三个列表页的筛选栏 */
initOrderFilterBars();

/* ╔══════════════════════════════════════════════════════╗
   ║  第 10 段 · 排单 + 统计 + 记账 + 明细                 ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [CAL-01] 排单日历 · 状态 + 初始化                   ║
   ║   [CAL-02] 排单日历 · 年月切换                        ║
   ║   [CAL-03] 排单日历 · 日期映射 + 渲染                 ║
   ║   [CAL-04] 排单日历 · 月度汇总                        ║
   ║   [CAL-05] 排单日历 · 单日详情弹窗                    ║
   ║   [STA-01] 统计 · 状态 + 初始化                       ║
   ║   [STA-02] 统计 · 范围切换                            ║
   ║   [STA-03] 统计 · 渲染主页面                          ║
   ║   [STA-04] 统计 · 记账弹窗                            ║
   ║   [STA-05] 统计 · 明细弹窗                            ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [CAL-01] 排单日历 · 状态 + 初始化
   ═══════════════════════════════════════════════════════ */

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

/* 把状态同步到年月下拉框 */
function syncSchedSelectors() {
  if ($('schedYear'))  $('schedYear').value  = __schedYear;
  if ($('schedMonth')) $('schedMonth').value = __schedMonth + 1;
}


/* ═══════════════════════════════════════════════════════
   [CAL-02] 排单日历 · 年月切换
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [CAL-03] 排单日历 · 日期映射 + 渲染

   日期映射格式：{ 'YYYY-MM-DD': { deadlines: [订单...], starts: [订单...] } }
     - deadlines：普通单（截稿日）
     - starts：占位单（开单日）
   ═══════════════════════════════════════════════════════ */

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

  /* 本月第一天是周几（0=周日，转成"周一起始"：周一=0） */
  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay();
  startWeekday = (startWeekday === 0) ? 6 : startWeekday - 1;

  /* 本月总天数 */
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateMap = buildSchedDateMap();
  const todayStr = fmtDateStr(new Date());

  let html = '';

  /* 前置空格 */
  for (let i = 0; i < startWeekday; i++) {
    html += '<div class="sched-cell is-empty"></div>';
  }

  /* 1 ~ 本月天数 */
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

    /* 标记点：红=截稿，蓝=开单，红蓝渐变=都有 */
    let marksHtml = '';
    if (dlCount && stCount) {
      marksHtml = '<span class="sched-mark is-both"></span>';
    } else if (dlCount) {
      marksHtml = '<span class="sched-mark is-deadline"></span>';
    } else if (stCount) {
      marksHtml = '<span class="sched-mark is-placeholder"></span>';
    }

    /* 数量角标：>1 才显示 */
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

  /* 尾部空格（补满最后一行） */
  const totalCells = startWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    html += '<div class="sched-cell is-empty"></div>';
  }

  grid.innerHTML = html;

  renderSchedMonthSummary(dateMap);
}


/* ═══════════════════════════════════════════════════════
   [CAL-04] 排单日历 · 月度汇总
   ═══════════════════════════════════════════════════════ */

/* 本月订单数（按接单日期去重，含所有类型） */
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

/* 本月待完成的订单（按截稿日过滤，不含占位单） */
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

/* 所有未完成的订单总数 */
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

function renderSchedMonthSummary(dateMap) {
  const box = $('schedMonthSummary');
  if (!box) return;

  const prefix = __schedYear + '-'
    + String(__schedMonth + 1).padStart(2, '0') + '-';

  /* 本月占位单数 */
  let stCount = 0;
  Object.keys(dateMap).forEach(function (dateStr) {
    if (dateStr.indexOf(prefix) !== 0) return;
    stCount += dateMap[dateStr].starts.length;
  });

  const monthOrderCount = countMonthOrders();
  const monthUndone     = getUndoneTodosInMonth().length;
  const totalUndone     = getTotalUndoneTodosCount();

  box.innerHTML =
    '<span class="sched-sum-item">本月订单 <strong>' + monthOrderCount + '</strong> 项</span>' +
    '<span class="sched-sum-item">占位单 <strong>' + stCount + '</strong> 项</span>' +
    '<span class="sched-sum-item">本月待完成 <strong>' + monthUndone + '</strong> 项</span>' +
    '<span class="sched-sum-item">总计待完成订单 <strong>' + totalUndone + '</strong> 项</span>';
}


/* ═══════════════════════════════════════════════════════
   [CAL-05] 排单日历 · 单日详情弹窗
   ═══════════════════════════════════════════════════════ */

function openSchedDayPanel(dateStr) {
  __schedSelectedDate = dateStr;

  /* 高亮选中日 */
  document.querySelectorAll('.sched-grid .sched-cell').forEach(function (cell) {
    if (cell.dataset.date === dateStr) cell.classList.add('is-selected');
    else                                cell.classList.remove('is-selected');
  });

  /* 解析日期 */
  var parts = dateStr.split('-');
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10) - 1;
  var d = parseInt(parts[2], 10);
  var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var wd = weekdays[new Date(y, m, d).getDay()];

  var dateMap = buildSchedDateMap();
  var info = dateMap[dateStr] || { deadlines: [], starts: [] };

  /* 构造列表 HTML */
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


/* ═══════════════════════════════════════════════════════
   [STA-01] 统计 · 状态 + 初始化
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [STA-02] 统计 · 范围切换
   ═══════════════════════════════════════════════════════ */

function switchStatsRange(mode) {
  __statsRangeMode = mode;

  /* 高亮按钮 */
  document.querySelectorAll('.stats-range-btn').forEach(btn => {
    if (btn.dataset.range === mode) btn.classList.add('active');
    else                            btn.classList.remove('active');
  });

  const ymRow = $('statsYmRow');
  const customRow = $('statsCustomRow');
  const monthSel = $('statsMonth');
  const monthLabel = $('statsMonthLabel');

  if (mode === 'custom') {
    if (ymRow) ymRow.style.display = 'none';
    if (customRow) customRow.style.display = 'flex';
  } else if (mode === 'week' || mode === 'last7') {
    /* 本周 / 最近七天：不需要年月选择 */
    if (ymRow) ymRow.style.display = 'none';
    if (customRow) customRow.style.display = 'none';
  } else {
    if (ymRow) ymRow.style.display = 'flex';
    if (customRow) customRow.style.display = 'none';
  }

  /* 年模式下隐藏月份 */
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

/* 根据当前模式算出起止日期 */
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

  /* 自定义 */
  let s = __statsCustomStart;
  let e = __statsCustomEnd;
  if (!s || !e) { s = e = fmtDateStr(today); }
  return { start: s, end: e, label: s + ' 至 ' + e };
}

function isInRange(dateStr, start, end) {
  if (!dateStr) return false;
  return dateStr >= start && dateStr <= end;
}

/* 取范围内所有流水，按日期降序 */
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

/* 判断一笔退款是不是"撤单退款" */
function isFlowFromCancelRefund(f) {
  return f.type === 'refund' && String(f.note || '').indexOf('撤单退款') === 0;
}
/* 判断一笔退款是不是"废稿退款" */
function isFlowFromDiscardRefund(f) {
  return f.type === 'refund' && String(f.note || '').indexOf('废稿退款') === 0;
}


/* ═══════════════════════════════════════════════════════
   [STA-03] 统计 · 渲染主页面
   ═══════════════════════════════════════════════════════ */

function renderStatsPage() {
  const range = getStatsRange();
  const flows = getFilteredFlows(range);
  const todos = getTodos();
  const completedList = getCompleted();
  const cancelledList = getCancelled();
  const discardedList = getDiscarded();

  /* 汇总实收 / 退款 / 支出 */
  let income = 0;
  let refund = 0;
  let expense = 0;

  flows.forEach(f => {
    const amt = Number(f.amount) || 0;
    if (f.type === 'refund') refund += amt;
    else if (f.type === 'expense') expense += amt;
    else income += amt;
  });

  /* 待结：所有未清订单的尾款 */
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

  /* 客户去重 */
  const clientSet = {};
  todos.forEach(t => { const id = (t.clientId || '').trim(); if (id) clientSet[id] = true; });
  completedList.forEach(c => { const id = (c.clientId || '').trim(); if (id) clientSet[id] = true; });
  cancelledList.forEach(c => { const id = (c.clientId || '').trim(); if (id) clientSet[id] = true; });
  discardedList.forEach(c => { const id = (c.clientId || '').trim(); if (id) clientSet[id] = true; });
  const clientCount = Object.keys(clientSet).length;

  const orderCount = todos.length + completedList.length + cancelledList.length + discardedList.length;

  const cancelCount = cancelledList.length;
  const discardCount = discardedList.length;

  /* 写进 DOM */
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


/* ═══════════════════════════════════════════════════════
   [STA-04] 统计 · 记账弹窗
   ═══════════════════════════════════════════════════════ */

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
    else                            btn.classList.remove('active');
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


/* ═══════════════════════════════════════════════════════
   [STA-05] 统计 · 明细弹窗

   从一笔流水推断"这笔钱对应的订单状态"（用于明细里显示）。
   ═══════════════════════════════════════════════════════ */

function getFlowOrderStatus(flow) {
  if (!flow) return '—';

  if (flow.type === 'income')  return '记账·收入';
  if (flow.type === 'expense') return '记账·支出';

  if (flow.type === 'final')   return '已结单';
  if (flow.type === 'discard') return '废稿';
  if (flow.type === 'cancel')  return '已撤单';

  if (flow.type === 'refund') {
    if (String(flow.note || '').indexOf('撤单退款') === 0) return '已撤单';
    if (String(flow.note || '').indexOf('废稿退款') === 0) return '废稿';
    return '记账·退款';
  }

  /* prepaid / dispatch：去订单系统里查它的状态 */
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

  /* --- 实收明细 --- */
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

  /* --- 待结明细 --- */
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

  /* --- 退款明细 --- */
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

  /* --- 支出明细 --- */
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
   ║  第 11 段 · 单主 + 票夹 + 备忘录 + 导入导出           ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [MA-01] 单主 · 状态 + 缓存                          ║
   ║   [MA-02] 单主 · 构建列表（核心聚合算法）             ║
   ║   [MA-03] 单主 · 列表页渲染                           ║
   ║   [MA-04] 单主 · 管理模式                             ║
   ║   [MA-05] 单主 · 删除                                 ║
   ║   [MA-06] 单主 · 添加                                 ║
   ║   [MA-07] 单主 · 筛选                                 ║
   ║   [MA-08] 单主 · 详情页                               ║
   ║   [MA-09] 单主 · 历史订单 + 小票票夹                  ║
   ║   [MA-10] 小票页 · 从单主列表选人                     ║
   ║   [TF-01] 票夹                                        ║
   ║   [MEM-01] 备忘录                                     ║
   ║   [EXP-01] 数据导出 / 导入 / 恢复初始                 ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [MA-01] 单主 · 状态 + 缓存
   ═══════════════════════════════════════════════════════ */

var __masterSort = 'recent';
var __currentMasterKey = null;
var __masterEditMode = false;
var __masterFilter = null;
var __masterManageMode = false;
var __masterSelectedKeys = {};

/* 列表缓存（指纹法）：
   数据源没变就直接返回上次的结果，避免搜索框每打一个字都重建列表 */
var __masterListCache = null;
var __masterListCacheKey = '';

/* 用「各数据源条数 + 最新时间戳」组成指纹 */
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

/* 对外入口：带缓存 */
function getMasterList() {
  const key = computeMasterListCacheKey();
  if (__masterListCache && __masterListCacheKey === key) {
    return __masterListCache;
  }
  const result = buildMasterList();
  __masterListCache = result;
  __masterListCacheKey = key;
  return result;
}


/* ═══════════════════════════════════════════════════════
   [MA-02] 单主 · 构建列表（核心聚合算法）

   把订单 / 结单 / 撤单 / 废稿 / 流水 / 手动档案 / 覆盖 全部聚合，
   生成"每位单主一条记录"的列表。

   ★ 性能优化：
     - 用索引表代替循环里的 .find()，避免 O(n²)
     - 流程：先建 map（clientId → 记录），再一次遍历各数据源
   ═══════════════════════════════════════════════════════ */

function buildMasterList() {
  const todos = getTodos();
  const completedList = getCompleted();
  const cancelledList = getCancelled();
  const discardedList = getDiscarded();
  const overrides = getMasterOverrides();
  const manualList = getManualMasters();
  const flows = getFlows();

  const map = {};

  /* 保证某位单主在 map 里存在（没有就建空壳） */
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

  /* 记录一条订单 + 维护首末日期 */
  function pushOrder(m, record) {
    m.orders.push(record);
    if (record.date) {
      if (!m.firstOrderDate || record.date < m.firstOrderDate) m.firstOrderDate = record.date;
      if (!m.lastOrderDate || record.date > m.lastOrderDate) m.lastOrderDate = record.date;
    }
  }

  /* --- 1. 待办订单 --- */
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

  /* --- 2. 已结单 --- */
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

  /* --- 3. 已撤单 --- */
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

  /* --- 4. 已废稿 --- */
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

  /* --- 5. 手动添加的单主档案 --- */
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

  /* --- 6. 流水汇总（累计消费） ---
     建索引表，避免每条流水都去 find() */
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

  /* --- 7. 覆盖信息（用户手动改过备注 / 标签 / 联系方式） --- */
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


/* ═══════════════════════════════════════════════════════
   [MA-03] 单主 · 列表页渲染
   ═══════════════════════════════════════════════════════ */

function setMasterSort(sort) {
  __masterSort = sort;
  document.querySelectorAll('.master-sort-btn').forEach(btn => {
    if (btn.dataset.sort === sort) btn.classList.add('active');
    else                            btn.classList.remove('active');
  });
  renderMasterList();
}

function renderMasterList() {
  const box = $('masterListContainer');
  if (!box) return;

  const all = getMasterList().filter(m => !isMasterHidden(m.key));
  const q = ($('masterSearch') ? $('masterSearch').value : '').trim().toLowerCase();

  /* 筛选 + 搜索 */
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

  /* 排序 */
  filtered.sort((a, b) => {
    if (__masterSort === 'amount') return (b.totalIncome || 0) - (a.totalIncome || 0);
    if (__masterSort === 'orders') return (b.orderCount || 0) - (a.orderCount || 0);
    if (__masterSort === 'id')     return (a.clientId || '').localeCompare(b.clientId || '');
    /* recent */
    const da = a.lastOrderDate || '';
    const db = b.lastOrderDate || '';
    if (da !== db) return db.localeCompare(da);
    return (b.orderCount || 0) - (a.orderCount || 0);
  });

  /* 计数 + 提示 */
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

  /* 渲染卡片 */
  box.innerHTML = '<div class="master-list">' + filtered.map(m => {
    const key = escapeAttr(m.key);
    const tagsArr = String(m.tags || '').split(',').map(t => t.trim()).filter(x => x);
    const tagsHtml = tagsArr.slice(0, 3).map(t =>
      `<span class="master-card-tag">${escapeHtml(t)}</span>`
    ).join('');

    const contactFull = m.contact ? formatContactFull(m.contactType, m.contact) : '—';
    const isSelected = !!__masterSelectedKeys[m.key];

    /* 管理模式：勾选圈 */
    const circleHtml = __masterManageMode
      ? `<div class="master-select-circle" onclick="event.stopPropagation();toggleMasterSelect('${key}')" title="选择">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/>
             ${isSelected ? '<polyline points="8 12 11 15 16 9"/>' : ''}
           </svg>
         </div>`
      : '';

    /* 管理模式：不显示删除按钮 */
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


/* ═══════════════════════════════════════════════════════
   [MA-04] 单主 · 管理模式
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [MA-05] 单主 · 删除（单个）
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [MA-06] 单主 · 添加
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [MA-07] 单主 · 筛选
   ═══════════════════════════════════════════════════════ */

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
    else                              btn.classList.remove('active');
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


/* ═══════════════════════════════════════════════════════
   [MA-08] 单主 · 详情页
   ═══════════════════════════════════════════════════════ */

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

  /* --- 情况 1：改了 ID --- */
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
      /* ★ 关键修复：把旧 ID 从隐藏列表里恢复，
         避免用户改回旧 ID 时发现单主消失了 */
      unhideMaster(oldClientId);
    }

    addManualMaster({ clientId: newClientId, platform, contact, contactType, note });
    setMasterOverride(newClientId, { platform, contact, contactType, note, tags });
    unhideMaster(newClientId);

    __currentMasterKey = newClientId;

  /* --- 情况 2：ID 没变 --- */
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


/* ═══════════════════════════════════════════════════════
   [MA-09] 单主 · 历史订单 + 小票票夹
   ═══════════════════════════════════════════════════════ */

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
    if (o.status === 'active')          { statusText = '待完成'; statusCls = 'is-active'; }
    else if (o.status === 'pending')    { statusText = '待结';   statusCls = 'is-pending'; }
    else if (o.status === 'placeholder'){ statusText = '待开单'; statusCls = 'is-active'; }
    else if (o.status === 'completed')  { statusText = '已结';   statusCls = 'is-completed'; }
    else if (o.status === 'cancelled')  { statusText = '已撤';   statusCls = 'is-cancelled'; }
    else if (o.status === 'discarded')  { statusText = '废稿';   statusCls = 'is-discarded'; }

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


/* ═══════════════════════════════════════════════════════
   [MA-10] 小票页 · 从单主列表选人
   ═══════════════════════════════════════════════════════ */

function openClientPickerForReceipt() {
  const list = getMasterList()
    .filter(m => !isMasterHidden(m.key) && m.clientId && m.key !== MASTER_UNKNOWN_KEY);

  /* 按最近订单排，其次按累计消费 */
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

  /* 平台：找不到就临时加一个 option */
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


/* ═══════════════════════════════════════════════════════
   [TF-01] 票夹
   ═══════════════════════════════════════════════════════ */

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

/* 收集所有小票（已结单 + 待结的待办单） */
function collectTicketItems() {
  const items = [];

  /* 已结单的小票 */
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

  /* 待结订单的小票 */
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

  /* 搜索 */
  const q = ($('ticketFolderSearch') ? $('ticketFolderSearch').value : '').trim().toLowerCase();
  let items = all;
  if (q) {
    items = items.filter(it => {
      const hay = (it.clientId + ' ' + it.clientName + ' ' + (it.date || '')).toLowerCase();
      return hay.indexOf(q) > -1;
    });
  }

  /* 排序 */
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

  /* 空态判断 */
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

/* 分页加载：每次追加一批 */
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


/* ═══════════════════════════════════════════════════════
   [MEM-01] 备忘录
   ═══════════════════════════════════════════════════════ */

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

  /* 已完成状态：询问取消完成 */
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

  /* 未完成状态：询问完成 */
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

  /* 打钩动画：先标记 is-done，320ms 后删除 */
  const item = $('memoItem_' + id);
  if (item) {
    item.classList.add('is-done');
    const checkBtn = item.querySelector('.memo-item-check svg');
    if (checkBtn) {
      const existing = checkBtn.querySelector('polyline');
      if (!existing) {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly.setAttribute('points', '8 12 11 15 16 9');
        checkBtn.appendChild(poly);
      }
    }
  }

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


/* ═══════════════════════════════════════════════════════
   [EXP-01] 数据导出 / 导入 / 恢复初始

   ★ 导出 key 和备份 key 保持一致（BACKUP_KEYS 在第 4 段定义）
   ═══════════════════════════════════════════════════════ */

async function exportAllData() {
  try {
    const lsData = {};
    BACKUP_KEYS.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try { lsData[key] = JSON.parse(raw); }
        catch (e) { lsData[key] = raw; }
      }
    });

    /* 图片：从 IDB 里读出来转成 base64 */
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

    /* 文件名带时间戳 */
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
      } catch (err) {
        alert('文件解析失败：不是有效的 JSON 文件。');
        return;
      }

      if (!data || typeof data !== 'object') {
        alert('文件内容为空或格式不对。');
        return;
      }

      /* 区分新旧格式：新格式有 __meta + localStorage + files */
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

      /* 先写图片，再写文字数据 */
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
        } catch (err) {
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

/* 恢复初始状态（清空全部） */
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
  closeModal();
  exportAllData();
}

function confirmResetAllData() {
  if (!confirm('最后确认：确定要清空所有数据吗？此操作不可恢复！')) return;

  closeModal();

  /* 清空所有 listReceipt 开头的 key */
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

  /* 清空 IDB 图片 */
  idbClearFiles().catch(() => {}).finally(() => {
    alert('已恢复初始状态，页面将刷新。');
    location.reload();
  });
}


/* ═══════════════════════════════════════════════════════
   [EXP-02] 通用剪贴板兜底（原本在 [JS-01D]）

   navigator.clipboard 不可用时的兼容方案
   ═══════════════════════════════════════════════════════ */

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); alert('已复制：' + text); }
  catch (e) { alert('复制失败，请手动选择复制'); }
  document.body.removeChild(ta);
}

/* ╔══════════════════════════════════════════════════════╗
   ║  第 12 段 · 设置联动 + 稿件组 + 增项 / 节点           ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [SET-01] 身份 / 设置联动（★修复 bug #1 #2）         ║
   ║   [SET-02] 身份预设管理                               ║
   ║   [SET-03] 权限预设管理                               ║
   ║   [SET-04] 定金预设联动                               ║
   ║   [SET-05] 平台下拉 + 管理                            ║
   ║   [SET-06] 工期 / 截稿日联动                          ║
   ║   [GRP-01] 稿件组（动态编号）                         ║
   ║   [GRP-02] 组内稿件                                   ║
   ║   [GRP-03] 预设匹配下拉面板                           ║
   ║   [GRP-04] 组附加 / 组优惠                            ║
   ║   [GRP-05] 增项 / 节点 弹窗                           ║
   ║   [GRP-06] 制品预设填充                               ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [SET-01] 身份 / 设置联动

   ★ 修复 bug #1（ID 不持久化）
   ★ 修复 bug #2（身份不持久化）
   ═══════════════════════════════════════════════════════ */

function onIdentityChange() {}

function syncMainFromSettings() {
  if ($('identity') && $('setIdentity')) $('identity').value = $('setIdentity').value;
  if ($('artist') && $('setName'))       $('artist').value   = $('setName').value;

  /* ★ 新增：把设置里的身份 / ID 落盘 */
  if ($('setName'))     setSavedArtistName($('setName').value);
  if ($('setIdentity')) setDefaultIdentity($('setIdentity').value);
}

/* 重置小票页：清空所有字段 + 恢复默认 */
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

  window.__receiptTags = [];
  if (typeof updateReceiptTagBtn === 'function') updateReceiptTagBtn();

  window.__receiptGenerated = false;
  window.__receiptImported  = false;
  window.__receiptWarnIgnore = false;
}


/* ═══════════════════════════════════════════════════════
   [SET-02] 身份预设管理
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [SET-03] 权限预设管理
   ═══════════════════════════════════════════════════════ */

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

/* 刷新所有稿件里的"权限"下拉框（用户改了权限预设后调用） */
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


/* ═══════════════════════════════════════════════════════
   [SET-04] 定金预设联动
   ═══════════════════════════════════════════════════════ */

function syncDepositFromSettings() {
  const mode = $('setDepositMode').value;
  const value = $('setDeposit').value;
  setDepositPreset({ mode, value: value === '' ? '' : Number(value) });
  $('depositMode').value = mode;
  $('deposit').value = value;
  updateSetDepositUnit();
  updateDepositUnit();
}


/* ═══════════════════════════════════════════════════════
   [SET-05] 平台下拉 + 管理
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [SET-06] 工期 / 截稿日联动
   ═══════════════════════════════════════════════════════ */

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

/* 占位单时把定金模式锁死为"固定金额" */
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


/* ═══════════════════════════════════════════════════════
   [GRP-01] 稿件组（动态编号）
   ═══════════════════════════════════════════════════════ */

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

  /* 只剩一组：清空内容但保留结构 */
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


/* ═══════════════════════════════════════════════════════
   [GRP-02] 组内稿件
   ═══════════════════════════════════════════════════════ */

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
  /* 只剩一件：清空内容但保留一行 */
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


/* ═══════════════════════════════════════════════════════
   [GRP-03] 预设匹配下拉面板
   ═══════════════════════════════════════════════════════ */

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

function onItemNameInput(input)  { renderMatchPanel(input); }
function onItemNameFocus(input)  { renderMatchPanel(input); }

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

  /* 单双面计价：弹窗让用户选单/双面 */
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


/* ═══════════════════════════════════════════════════════
   [GRP-04] 组附加 / 组优惠
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [GRP-05] 增项 / 节点 弹窗
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [GRP-06] 制品预设填充
   ═══════════════════════════════════════════════════════ */

function fillPresetIntoBlock(block, preset) {
  if (!block || !preset) return;
  const nameInput  = block.querySelector('.item-name');
  const priceInput = block.querySelector('.item-price');
  const qtyInput   = block.querySelector('.item-qty');

  /* 先清掉旧的增项 / 节点 */
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
   ║  第 13 段 · 稿件预设 + 分组 + 拖动                    ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [PRE-01] 预设摘要 / 模式标签                        ║
   ║   [PRE-02] 预设选择弹窗（带分组过滤）                 ║
   ║   [PRE-03] 预设编辑弹窗（新建 / 编辑）                ║
   ║   [PRE-04] 预设删除                                   ║
   ║   [PRE-05] 设置页主渲染（分组卡片）                   ║
   ║   [PRE-06] 分组展开 / 收起                            ║
   ║   [PRE-07] 分组增删改 + 上下移动                      ║
   ║   [PRE-08] 预设移动到其他分组                         ║
   ║   [PRE-09] 分组「+」按钮：从"未分组"选入              ║
   ║   [PRE-10] 预设卡片拖动排序                           ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [PRE-01] 预设摘要 / 模式标签
   ═══════════════════════════════════════════════════════ */

/* 把预设对象转成一行摘要文本 */
function presetSummary(p) {
  if (p.mode === 'fixed') {
    return '固定价 ' + fmt(p.fixedPrice);
  }

  if (p.mode === 'sides') {
    return '单面 ' + fmt(p.singlePrice) + ' / 双面 ' + fmt(p.doublePrice);
  }

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

/* 模式代码 → 中文标签 */
function modeLabel(m) {
  return {
    fixed: '固定价',
    sides: '单双面计价',
    base_addon: '基础+增项',
    nodes: '按节点计价',
    base_addon_nodes: '基础+增项+节点',
  }[m] || m;
}


/* ═══════════════════════════════════════════════════════
   [PRE-02] 预设选择弹窗（带分组过滤）

   在小票页点稿件的"选择预设"按钮时弹出。
   ═══════════════════════════════════════════════════════ */

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

  /* 按分组过滤 */
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

  /* 表格 */
  let rows = '';
  if (!presets.length) {
    rows = `<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);padding:20px 6px;">该分组下暂无预设</td></tr>`;
  } else {
    rows = presets.map(p => {
      const info = presetSummary(p);
      /* ★ 用全局索引（allPresets）定位，因为后续按全局数组取值 */
      const globalIdx = allPresets.findIndex(x => x === p);
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


/* ═══════════════════════════════════════════════════════
   [PRE-03] 预设编辑弹窗（新建 / 编辑）

   ★ 修复 bug #6：预设重名
     保存时如果名称和别的预设重复，弹提示，不保存。
   ═══════════════════════════════════════════════════════ */

var editingPresetIndex = -1;   /* -1 表示"新建"，>=0 表示"编辑第几条" */

function openPresetSetting() {
  showPage('pagePresetSetting');
  renderPresetCards();
}

function editPreset(i) {
  editingPresetIndex = i;
  openPresetAddModal(getPresets()[i]);
}

function openPresetAddModal(data) {
  /* 没传参数 = 新建 */
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

/* 分组下拉框的选项 */
function renderPresetGroupOptions(selectedId) {
  const groups = getPresetGroups();
  groups.sort((a, b) => (a.order || 0) - (b.order || 0));
  let html = `<option value="" ${!selectedId ? 'selected' : ''}>（未分组）</option>`;
  groups.forEach(g => {
    html += `<option value="${escapeAttr(g.id)}" ${selectedId === g.id ? 'selected' : ''}>${escapeHtml(g.name)}</option>`;
  });
  return html;
}

/* 根据计价方式渲染对应的字段 */
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

  /* 回填已有的增项 / 节点 */
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

/* 添加一行增项 */
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

/* 添加一行节点 */
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

/* 检查节点比例合计是否 = 100% */
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

/* 保存预设（新建或编辑） */
function savePreset() {
  const name = $('f_name').value.trim();
  const mode = $('f_mode').value;
  const groupId = $('f_group') ? ($('f_group').value || '') : '';

  if (!name) { $('f_name').focus(); return; }

  /* ★ 修复 bug #6：检查重名 */
  const presets = getPresets();
  const isEditing = (editingPresetIndex >= 0 && presets[editingPresetIndex]);
  const dup = presets.some((p, i) => {
    if (p.name !== name) return false;
    /* 编辑时排除自己 */
    if (isEditing && i === editingPresetIndex) return false;
    return true;
  });
  if (dup) {
    showSimpleAlert('提示', '已存在同名预设「' + escapeHtml(name) + '」，请换个名字。');
    return;
  }

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

  /* 写入数组 */
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


/* ═══════════════════════════════════════════════════════
   [PRE-04] 预设删除
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [PRE-05] 设置页主渲染（分组卡片）
   ═══════════════════════════════════════════════════════ */

var __presetGroupOpenMap = {};   /* 记录每组是否展开 */

function renderPresetCards() {
  const box = $('presetCards');
  if (!box) return;

  const groups = getPresetGroups();
  const allPresets = getPresets();

  /* 按 order 排序 */
  groups.sort((a, b) => (a.order || 0) - (b.order || 0));

  /* 未分组预设 */
  const ungrouped = allPresets.filter(p => !p.groupId);

  let html = '';

  /* --- 分组列表 --- */
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

  /* --- 未分组块 --- */
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

  /* 空态 */
  if (!allPresets.length && !groups.length) {
    box.innerHTML = '<p style="color:var(--ink-soft);text-align:center;padding:30px 0;">暂无预设，点击上方「+ 添加预设」创建。</p>';
    return;
  }

  box.innerHTML = html;

  /* 绑定拖动 */
  bindPresetCardDrag();
}

/* 单条预设卡片 */
function renderPresetCardItem(p, groupId) {
  /* ★ 用引用相等找全局索引，比按名字更稳 */
  const globalIdx = getPresets().indexOf(p);
  const summary = presetSummary(p);
  return `
    <div class="preset-card" data-preset-name="${escapeAttr(p.name)}" data-group-id="${escapeAttr(groupId)}">
      <div class="preset-card-drag-handle" title="拖动排序">
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


/* ═══════════════════════════════════════════════════════
   [PRE-06] 分组展开 / 收起
   ═══════════════════════════════════════════════════════ */

function togglePresetGroupOpen(groupId, e) {
  if (e && e.target.closest('.preset-group-actions')) return;

  __presetGroupOpenMap[groupId] = !__presetGroupOpenMap[groupId];
  const block = document.querySelector('.preset-group-block[data-group-id="' + CSS.escape(groupId) + '"]');
  if (block) {
    if (__presetGroupOpenMap[groupId]) block.classList.add('is-open');
    else                                block.classList.remove('is-open');
  }
}


/* ═══════════════════════════════════════════════════════
   [PRE-07] 分组增删改 + 上下移动
   ═══════════════════════════════════════════════════════ */

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

/* 删除分组（连带该组下的预设一起删） */
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
  /* 删分组 */
  const groups = getPresetGroups().filter(g => g.id !== groupId);
  setPresetGroups(groups);

  /* 删该组下所有预设 */
  const presets = getPresets().filter(p => p.groupId !== groupId);
  setPresets(presets);

  delete __presetGroupOpenMap[groupId];

  closeModal();
  renderPresetCards();
}

/* 分组上移 */
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

/* 分组下移 */
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


/* ═══════════════════════════════════════════════════════
   [PRE-08] 预设移动到其他分组
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [PRE-09] 分组「+」按钮：从"未分组"选入
   ═══════════════════════════════════════════════════════ */

function openPresetGroupAddPicker(targetGroupId) {
  const g = getPresetGroupById(targetGroupId);
  if (!g) { showSimpleAlert('提示', '分组不存在。'); return; }

  const ungrouped = getPresets().filter(p => !p.groupId);

  /* 没有未分组预设 */
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
  /* 重新渲染会丢焦点，手动聚焦回搜索框 */
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
    /* 已被移走：刷新列表 */
    renderPresetGroupAddPicker(targetGroupId, ($('umPickerSearch') ? $('umPickerSearch').value : ''));
    return;
  }

  presets[idx].groupId = targetGroupId;
  setPresets(presets);

  /* 保持弹窗打开，方便连续添加 */
  const searchVal = $('umPickerSearch') ? $('umPickerSearch').value : '';
  renderPresetGroupAddPicker(targetGroupId, searchVal);

  /* 刷新后面的设置页 */
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


/* ═══════════════════════════════════════════════════════
   [PRE-10] 预设卡片拖动排序

   ★ 合并说明：
     原代码里 [JS-18] 是一份实现，[JS-18-PATCH v3.3-Soft]
     在运行时又重写了一遍。这两份实际是同一个功能，
     现已合并为这一份，不再需要运行时补丁。
   ═══════════════════════════════════════════════════════ */

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

  /* 忽略来自按钮 / 输入框的按下 */
  if (e.target.closest('.preset-card-btn')) return;
  if (e.target.closest('input, textarea, select, button')) return;

  const card = e.target.closest('.preset-card');
  if (!card) return;

  const presetName = card.dataset.presetName;
  const groupId = card.dataset.groupId;
  if (!presetName || !groupId) return;

  /* 清理旧会话 */
  if (__presetDrag) {
    const old = __presetDrag;
    if (old.card) {
      old.card.classList.remove('is-dragging');
      old.card.style.transform = '';
      old.card.style.zIndex = '';
      old.card.style.transition = '';
    }
    __presetDrag = null;
  }

  const rect = card.getBoundingClientRect();

  __presetDrag = {
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
}

function onPresetCardPointerMove(e) {
  const s = __presetDrag;
  if (!s) return;
  if (e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

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
      s.card.style.transition = 'none';
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch (err) {}
      }
    }
    return;
  }

  e.preventDefault();

  /* 被拖卡片跟随手指（轻微放大） */
  s.card.style.transform = 'translateY(' + dy + 'px) scale(1.02)';

  const groupBody = s.card.closest('.preset-group-body');
  if (!groupBody) return;

  /* 用"卡片初始中心 + 位移"作为判定点 */
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

  /* 目标位置没变：不折腾 DOM */
  const targetName = targetCard ? targetCard.dataset.presetName : '__END__';
  const targetKey = targetName + '|' + (insertBefore ? 'before' : 'after');

  if (s.lastTargetKey === targetKey) return;
  s.lastTargetKey = targetKey;

  siblings.forEach(el => el.classList.remove('is-drop-target'));

  /* FLIP 步骤 1：记录重排前，其他卡片的 top */
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

  /* FLIP 步骤 2：让其他卡片平滑"滑"到新位置（0.28s 柔和曲线） */
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
}

function onPresetCardPointerUp(e) {
  const s = __presetDrag;
  if (!s) return;
  if (e && e.pointerId !== undefined && e.pointerId !== s.pointerId) return;

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

  /* 松手：被拖卡片平滑归位（0.34s） */
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
    __presetDrag = null;
    return;
  }

  const groupId = s.groupId;
  const allPresets = getPresets();

  const groupPresets = newOrder
    .map(name => allPresets.find(p => p.name === name))
    .filter(Boolean);

  /* 有名字找不到对应预设：放弃保存，避免数据错乱 */
  if (groupPresets.length !== newOrder.length) {
    __presetDrag = null;
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

  /* 兜底：还没放进去的补到末尾 */
  others.forEach(p => {
    if (ordered.indexOf(p) === -1) ordered.push(p);
  });

  setPresets(ordered);
  __presetDrag = null;
}

/* ╔══════════════════════════════════════════════════════╗
   ║  第 14 段 · 附加费用 / 优惠折扣 + 订单级行            ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [OE-01] 订单级附加费用（小票页其他面板）            ║
   ║   [OE-02] 订单级优惠折扣                              ║
   ║   [OE-03] 赠品                                        ║
   ║   [EP-01] 附加费用预设 · 存取                         ║
   ║   [EP-02] 附加费用预设 · 列表页                       ║
   ║   [EP-03] 附加费用预设 · 编辑弹窗                     ║
   ║   [EP-04] 附加费用预设 · 选择弹窗                     ║
   ║   [DP-01] 优惠折扣预设 · 存取                         ║
   ║   [DP-02] 优惠折扣预设 · 列表页                       ║
   ║   [DP-03] 优惠折扣预设 · 编辑弹窗                     ║
   ║   [DP-04] 优惠折扣预设 · 选择弹窗                     ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [OE-01] 订单级附加费用（小票页其他面板）
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [OE-02] 订单级优惠折扣
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [OE-03] 赠品
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [EP-01] 附加费用预设 · 存取
   ═══════════════════════════════════════════════════════ */

function openExtraPresetSetting() {
  showPage('pageExtraPreset');
  renderExtraPresetCards();
}


/* ═══════════════════════════════════════════════════════
   [EP-02] 附加费用预设 · 列表页
   ═══════════════════════════════════════════════════════ */

function renderExtraPresetCards() {
  const presets = getExtraPresets();
  const box = $('extraPresetCards');
  if (!box) return;
  if (!presets.length) {
    box.innerHTML = '<p style="color:var(--ink-soft);">暂无预设，点击「+ 添加附加费用预设」创建。</p>';
    return;
  }
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


/* ═══════════════════════════════════════════════════════
   [EP-03] 附加费用预设 · 编辑弹窗
   ═══════════════════════════════════════════════════════ */

let editingExtraPresetIndex = -1;

function editExtraPreset(i) {
  editingExtraPresetIndex = i;
  openExtraPresetAddModal(getExtraPresets()[i]);
}

function openExtraPresetAddModal(data) {
  data = data || { op: 'multiply', name: '', value: '' };
  /* 无参数 = 新建 */
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


/* ═══════════════════════════════════════════════════════
   [EP-04] 附加费用预设 · 选择弹窗
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [DP-01] 优惠折扣预设 · 存取
   ═══════════════════════════════════════════════════════ */

function openDiscountPresetSetting() {
  showPage('pageDiscountPreset');
  renderDiscountPresetCards();
}


/* ═══════════════════════════════════════════════════════
   [DP-02] 优惠折扣预设 · 列表页
   ═══════════════════════════════════════════════════════ */

function renderDiscountPresetCards() {
  const presets = getDiscountPresets();
  const box = $('discountPresetCards');
  if (!box) return;
  if (!presets.length) {
    box.innerHTML = '<p style="color:var(--ink-soft);">暂无预设，点击「+ 添加优惠折扣预设」创建。</p>';
    return;
  }
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


/* ═══════════════════════════════════════════════════════
   [DP-03] 优惠折扣预设 · 编辑弹窗
   ═══════════════════════════════════════════════════════ */

let editingDiscountPresetIndex = -1;

function editDiscountPreset(i) {
  editingDiscountPresetIndex = i;
  openDiscountPresetAddModal(getDiscountPresets()[i]);
}

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


/* ═══════════════════════════════════════════════════════
   [DP-04] 优惠折扣预设 · 选择弹窗
   ═══════════════════════════════════════════════════════ */

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
   ║  第 15 段 · 保存图片 + 上传预览 + 标签 + 筛选          ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [IMG-01] 保存图片（★ 修复 bug #4）                  ║
   ║   [IMG-02] 上传预览图                                 ║
   ║   [INIT-01] 订单模块初始化                            ║
   ║   [TAG-01] 标签库 + 小票页标签按钮                    ║
   ║   [TAG-02] 小票页标签编辑弹窗                         ║
   ║   [TAG-03] 订单卡片标签渲染                           ║
   ║   [TAG-04] 订单详情页标签区                           ║
   ║   [TAG-05] 订单详情标签编辑弹窗                       ║
   ║   [FIL-01] 订单筛选 · 状态 + 弹窗                     ║
   ║   [FIL-02] 订单筛选 · 应用筛选                        ║
   ║   [FIL-03] 订单筛选 · 结果页渲染                      ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [IMG-01] 保存图片

   ★ 修复 bug #4：
     原来 load 事件和 setTimeout 都会触发 after()，
     导致图片加载慢时会下载两张。
     现在用一次性 guard 保证 after() 只跑一次。
   ═══════════════════════════════════════════════════════ */

/* 截图前把所有编辑手柄藏起来（避免被截进去） */
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
  /* 清掉正在拖动的块（避免半透明拖动态被截进去） */
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
    /* ★ 一次性 guard：图片加载慢时，load 和 timeout 只跑一个 */
    let fired = false;
    const runOnce = () => {
      if (fired) return;
      fired = true;
      after();
    };
    photoImg.addEventListener('load', runOnce, { once: true });
    setTimeout(runOnce, 1500);
  } else {
    after();
  }
}


/* ═══════════════════════════════════════════════════════
   [IMG-02] 上传预览图

   小票页的"预览图片"：支持选文件、粘贴、清除。
   ═══════════════════════════════════════════════════════ */

let previewImageData = '';

function bindUpload() {
  const fileInput = $('previewFile');
  const clearBtn = $('clearPreviewBtn');

  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (file) loadFile(file);
    });
  }

  /* 支持从剪贴板粘贴图片 */
  document.addEventListener('paste', function (e) {
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
      try { await deleteImageRef(oldRef); } catch (e) {}
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


/* ═══════════════════════════════════════════════════════
   [INIT-01] 订单模块初始化

   只做两件事：绑定素材/要求上传、渲染列表。
   ═══════════════════════════════════════════════════════ */

function initTodoModule() {
  setupTodoFileInputs();
  renderTodoList();
}


/* ═══════════════════════════════════════════════════════
   [TAG-01] 标签库 + 小票页标签按钮

   TAG_COLORS / TAG_LIBRARY_KEY / TAG_MAX_COUNT
   已在第 1 段（00-utils）定义。

   getTagLibrary / setTagLibrary / addTagToLibrary
   已在第 2 段（存储层）定义。
   ═══════════════════════════════════════════════════════ */

/* 小票页当前的标签（临时状态，导入订单时会一起存） */
window.__receiptTags = [];

/* 刷新小票页"标签"按钮的显示 */
function updateReceiptTagBtn() {
  const btn = $('receiptTagBtn');
  if (!btn) return;
  const tags = window.__receiptTags || [];
  if (tags.length) {
    btn.classList.add('has-tags');
    btn.textContent = '标签 · ' + tags.length;
  } else {
    btn.classList.remove('has-tags');
    btn.textContent = '标签';
  }
}


/* ═══════════════════════════════════════════════════════
   [TAG-02] 小票页标签编辑弹窗
   ═══════════════════════════════════════════════════════ */

function openReceiptTagEditor() {
  window.__tagEditorState = {
    selected: (window.__receiptTags || []).slice(),
    inputColor: 'red',
  };
  renderReceiptTagEditor();
}

function renderReceiptTagEditor() {
  const state = window.__tagEditorState;
  if (!state) return;

  const selected = state.selected || [];
  const lib = getTagLibrary();

  /* 已选标签（带删除 ×） */
  const selectedHtml = selected.length
    ? selected.map((t, i) => {
        const color = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
        return '<span class="tag-chip tag-color-' + color + '">' +
          escapeHtml(t.name) +
          '<button type="button" class="tag-chip-del" onclick="removeReceiptTag(' + i + ')" title="删除">×</button>' +
        '</span>';
      }).join('')
    : '<span class="tag-editor-empty">还没有添加标签</span>';

  /* 历史标签库 */
  const libHtml = lib.length
    ? lib.map((t, i) => {
        const used = selected.some(s => s.name === t.name);
        const color = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
        return '<span class="tag-chip tag-color-' + color + (used ? ' is-used' : '') + '" ' +
               (used ? '' : 'onclick="addReceiptTagFromLibrary(' + i + ')"') +
               '>' + escapeHtml(t.name) + '</span>';
      }).join('')
    : '<span class="tag-editor-empty">还没有历史标签</span>';

  const countCls = selected.length >= TAG_MAX_COUNT ? 'is-full' : '';
  const countText = selected.length >= TAG_MAX_COUNT
    ? '已达到上限（' + TAG_MAX_COUNT + ' 个）'
    : '已选 ' + selected.length + ' / ' + TAG_MAX_COUNT;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeTagEditor()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>编辑标签</h3>
          <button class="icon-btn" onclick="closeTagEditor()">×</button>
        </div>
        <div class="modal-body">
          <div class="tag-editor-wrap">
            <label class="tag-editor-label">当前标签</label>
            <div class="tag-editor-selected">${selectedHtml}</div>
            <div class="tag-editor-count ${countCls}">${countText}</div>
          </div>
          <div class="tag-editor-wrap">
            <label class="tag-editor-label">新建标签</label>
            <div class="tag-editor-input-row">
              <input id="tagEditorInput" placeholder="输入标签名（如：加急）" maxlength="12" onkeydown="if(event.key==='Enter')addReceiptTagFromInput()" />
              <div class="tag-color-picker" id="tagColorPicker">
                ${TAG_COLORS.map(c =>
                  '<button type="button" class="tag-color-dot dot-' + c + (c === state.inputColor ? ' active' : '') + '" ' +
                  'onclick="pickTagColor(\'' + c + '\')" title="' + c + '"></button>'
                ).join('')}
              </div>
              <button type="button" class="tag-editor-add-btn" onclick="addReceiptTagFromInput()">添加</button>
            </div>
          </div>
          <div class="tag-editor-wrap">
            <label class="tag-editor-label">历史标签（点击添加）</label>
            <div class="tag-editor-history">${libHtml}</div>
          </div>
          <div class="actions" style="justify-content:space-between;margin-top:22px;">
            <button type="button" class="action-btn ghost" onclick="clearReceiptTags()">清空全部</button>
            <div style="display:flex;gap:10px;">
              <button type="button" class="action-btn ghost" onclick="closeTagEditor()">取消</button>
              <button type="button" class="action-btn" onclick="saveReceiptTags()">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('tagEditorInput'); if (el) el.focus(); }, 50);
}

function pickTagColor(c) {
  if (window.__tagEditorState) window.__tagEditorState.inputColor = c;
  document.querySelectorAll('#tagColorPicker .tag-color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.classList.contains('dot-' + c));
  });
}

function addReceiptTagFromInput() {
  const input = $('tagEditorInput');
  if (!input) return;
  const name = String(input.value || '').trim();
  if (!name) { input.focus(); return; }

  const state = window.__tagEditorState;
  if (!state) return;
  if (state.selected.length >= TAG_MAX_COUNT) { alert('最多只能添加 ' + TAG_MAX_COUNT + ' 个标签'); return; }
  if (state.selected.some(t => t.name === name)) { alert('这个标签已经加过了'); input.value = ''; input.focus(); return; }

  state.selected.push({ name: name, color: state.inputColor || 'red' });
  input.value = '';
  renderReceiptTagEditor();
}

function addReceiptTagFromLibrary(idx) {
  const lib = getTagLibrary();
  const t = lib[idx];
  if (!t) return;
  const state = window.__tagEditorState;
  if (!state) return;
  if (state.selected.length >= TAG_MAX_COUNT) { alert('最多只能添加 ' + TAG_MAX_COUNT + ' 个标签'); return; }
  if (state.selected.some(s => s.name === t.name)) return;
  state.selected.push({ name: t.name, color: t.color || 'red' });
  renderReceiptTagEditor();
}

function removeReceiptTag(idx) {
  const state = window.__tagEditorState;
  if (!state) return;
  state.selected.splice(idx, 1);
  renderReceiptTagEditor();
}

function clearReceiptTags() {
  const state = window.__tagEditorState;
  if (!state || !state.selected.length) return;
  if (!confirm('清空全部标签吗？')) return;
  state.selected = [];
  renderReceiptTagEditor();
}

function closeTagEditor() {
  window.__tagEditorState = null;
  closeModal();
}

function saveReceiptTags() {
  const state = window.__tagEditorState;
  if (!state) return;
  window.__receiptTags = (state.selected || []).slice();
  /* 存入历史库（同名不重复） */
  window.__receiptTags.forEach(t => addTagToLibrary(t.name, t.color));
  updateReceiptTagBtn();
  closeTagEditor();
}


/* ═══════════════════════════════════════════════════════
   [TAG-03] 订单卡片标签渲染

   给订单列表的卡片用，最多显示 3 个，超出显示 +N。
   ═══════════════════════════════════════════════════════ */

function renderTodoCardTags(tags) {
  if (!tags || !tags.length) return '';
  const MAX_SHOW = 3;
  const shown = tags.slice(0, MAX_SHOW);
  const more = tags.length - MAX_SHOW;
  let html = '<div class="todo-card-tags">';
  shown.forEach(t => {
    const color = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
    html += '<span class="tag-chip tag-color-' + color + '">' + escapeHtml(t.name) + '</span>';
  });
  if (more > 0) html += '<span class="tag-chip tag-chip-more">+' + more + '</span>';
  html += '</div>';
  return html;
}


/* ═══════════════════════════════════════════════════════
   [TAG-04] 订单详情页标签区
   ═══════════════════════════════════════════════════════ */

function renderTodoTags(t) {
  const box = $('tdTagsInline');
  if (!box) return;

  const tags = (t && t.tags) || [];
  let html = '';
  tags.forEach(tag => {
    const color = TAG_COLORS.indexOf(tag.color) > -1 ? tag.color : 'red';
    html += '<span class="tag-chip tag-color-' + color + '">' + escapeHtml(tag.name) + '</span>';
  });
  /* 编辑态下多一个"编辑 / +标签"按钮 */
  if (__todoEditMode) {
    html += '<button type="button" class="td-tags-add-btn" onclick="openTodoTagEditor()">' +
              (tags.length ? '编辑' : '+ 标签') +
            '</button>';
  }
  box.innerHTML = html;
}


/* ═══════════════════════════════════════════════════════
   [TAG-05] 订单详情标签编辑弹窗
   ═══════════════════════════════════════════════════════ */

function openTodoTagEditor() {
  const todos = getTodos();
  const t = todos.find(x => x.id === __currentTodoId);
  if (!t) return;

  window.__todoTagEditState = {
    todoId: t.id,
    selected: (t.tags || []).map(x => ({ name: x.name, color: x.color })),
    inputColor: 'red',
  };
  renderTodoTagEditor();
}

function renderTodoTagEditor() {
  const state = window.__todoTagEditState;
  if (!state) return;
  const selected = state.selected || [];
  const lib = getTagLibrary();

  const selectedHtml = selected.length
    ? selected.map((t, i) => {
        const color = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
        return '<span class="tag-chip tag-color-' + color + '">' +
          escapeHtml(t.name) +
          '<button type="button" class="tag-chip-del" onclick="removeTodoTag(' + i + ')" title="删除">×</button>' +
        '</span>';
      }).join('')
    : '<span class="tag-editor-empty">还没有添加标签</span>';

  const libHtml = lib.length
    ? lib.map((t, i) => {
        const used = selected.some(s => s.name === t.name);
        const color = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
        return '<span class="tag-chip tag-color-' + color + (used ? ' is-used' : '') + '" ' +
               (used ? '' : 'onclick="addTodoTagFromLibrary(' + i + ')"') +
               '>' + escapeHtml(t.name) + '</span>';
      }).join('')
    : '<span class="tag-editor-empty">还没有历史标签</span>';

  const countCls = selected.length >= TAG_MAX_COUNT ? 'is-full' : '';
  const countText = selected.length >= TAG_MAX_COUNT
    ? '已达到上限（' + TAG_MAX_COUNT + ' 个）'
    : '已选 ' + selected.length + ' / ' + TAG_MAX_COUNT;

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeTodoTagEditor()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>编辑标签</h3>
          <button class="icon-btn" onclick="closeTodoTagEditor()">×</button>
        </div>
        <div class="modal-body">
          <div class="tag-editor-wrap">
            <label class="tag-editor-label">当前标签</label>
            <div class="tag-editor-selected">${selectedHtml}</div>
            <div class="tag-editor-count ${countCls}">${countText}</div>
          </div>
          <div class="tag-editor-wrap">
            <label class="tag-editor-label">新建标签</label>
            <div class="tag-editor-input-row">
              <input id="todoTagInput" placeholder="输入标签名" maxlength="12" onkeydown="if(event.key==='Enter')addTodoTagFromInput()" />
              <div class="tag-color-picker" id="todoTagColorPicker">
                ${TAG_COLORS.map(c =>
                  '<button type="button" class="tag-color-dot dot-' + c + (c === state.inputColor ? ' active' : '') + '" ' +
                  'onclick="pickTodoTagColor(\'' + c + '\')" title="' + c + '"></button>'
                ).join('')}
              </div>
              <button type="button" class="tag-editor-add-btn" onclick="addTodoTagFromInput()">添加</button>
            </div>
          </div>
          <div class="tag-editor-wrap">
            <label class="tag-editor-label">历史标签（点击添加）</label>
            <div class="tag-editor-history">${libHtml}</div>
          </div>
          <div class="actions" style="justify-content:space-between;margin-top:22px;">
            <button type="button" class="action-btn ghost" onclick="clearTodoTags()">清空全部</button>
            <div style="display:flex;gap:10px;">
              <button type="button" class="action-btn ghost" onclick="closeTodoTagEditor()">取消</button>
              <button type="button" class="action-btn" onclick="saveTodoTags()">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  setTimeout(() => { const el = $('todoTagInput'); if (el) el.focus(); }, 50);
}

function pickTodoTagColor(c) {
  if (window.__todoTagEditState) window.__todoTagEditState.inputColor = c;
  document.querySelectorAll('#todoTagColorPicker .tag-color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.classList.contains('dot-' + c));
  });
}

function addTodoTagFromInput() {
  const input = $('todoTagInput');
  if (!input) return;
  const name = String(input.value || '').trim();
  if (!name) { input.focus(); return; }

  const state = window.__todoTagEditState;
  if (!state) return;
  if (state.selected.length >= TAG_MAX_COUNT) { alert('最多只能添加 ' + TAG_MAX_COUNT + ' 个标签'); return; }
  if (state.selected.some(t => t.name === name)) { alert('这个标签已经加过了'); input.value = ''; input.focus(); return; }

  state.selected.push({ name: name, color: state.inputColor || 'red' });
  input.value = '';
  renderTodoTagEditor();
}

function addTodoTagFromLibrary(idx) {
  const lib = getTagLibrary();
  const t = lib[idx];
  if (!t) return;
  const state = window.__todoTagEditState;
  if (!state) return;
  if (state.selected.length >= TAG_MAX_COUNT) { alert('最多只能添加 ' + TAG_MAX_COUNT + ' 个标签'); return; }
  if (state.selected.some(s => s.name === t.name)) return;
  state.selected.push({ name: t.name, color: t.color || 'red' });
  renderTodoTagEditor();
}

function removeTodoTag(idx) {
  const state = window.__todoTagEditState;
  if (!state) return;
  state.selected.splice(idx, 1);
  renderTodoTagEditor();
}

function clearTodoTags() {
  const state = window.__todoTagEditState;
  if (!state || !state.selected.length) return;
  if (!confirm('清空全部标签吗？')) return;
  state.selected = [];
  renderTodoTagEditor();
}

function closeTodoTagEditor() {
  window.__todoTagEditState = null;
  closeModal();
}

function saveTodoTags() {
  const state = window.__todoTagEditState;
  if (!state) return;

  const todos = getTodos();
  const idx = todos.findIndex(x => x.id === state.todoId);
  if (idx < 0) { closeTodoTagEditor(); return; }

  todos[idx].tags = (state.selected || []).slice();
  todos[idx].updatedAt = Date.now();
  setTodos(todos);
  todos[idx].tags.forEach(t => addTagToLibrary(t.name, t.color));

  closeTodoTagEditor();
  renderTodoTags(todos[idx]);
  if (typeof renderTodoList === 'function') renderTodoList();
}


/* ═══════════════════════════════════════════════════════
   [FIL-01] 订单筛选 · 状态 + 弹窗
   ═══════════════════════════════════════════════════════ */

var __orderFilter = {
  range: 'all',
  customStart: '',
  customEnd: '',
  tags: [],
  statuses: [],
};
var __orderFilterResults = [];

/* 可筛选的状态列表 */
const ORDER_FILTER_STATUSES = [
  { key: 'todo-active',      label: '未完成' },
  { key: 'todo-placeholder', label: '待开单' },
  { key: 'todo-pending',     label: '待结' },
  { key: 'completed',        label: '已结单' },
  { key: 'cancelled',        label: '已撤单' },
  { key: 'discarded',        label: '已废稿' },
];

function openOrderFilterModal() {
  renderOrderFilterModal();
}

function renderOrderFilterModal() {
  const state = __orderFilter;
  const lib = getTagLibrary();

  /* 时间范围按钮 */
  const rangeBtns = ['all', 'month', 'year', 'custom'].map(k => {
    const label = { all: '全部', month: '本月', year: '本年', custom: '自定义' }[k];
    return '<button type="button" class="ofm-range-btn' + (state.range === k ? ' active' : '') +
           '" onclick="setOrderFilterRange(\'' + k + '\')">' + label + '</button>';
  }).join('');

  /* 标签列表 */
  const tagListHtml = lib.length
    ? lib.map(t => {
        const sel = state.tags.indexOf(t.name) > -1;
        const color = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
        return '<span class="tag-chip tag-color-' + color + (sel ? ' is-selected' : '') +
               '" onclick="toggleOrderFilterTag(\'' + escapeAttr(t.name) + '\')">' +
               escapeHtml(t.name) + '</span>';
      }).join('')
    : '<span class="ofm-empty">还没有历史标签，先在小票页添加</span>';

  /* 状态按钮 */
  const statusBtns = ORDER_FILTER_STATUSES.map(s => {
    const sel = state.statuses.indexOf(s.key) > -1;
    return '<button type="button" class="ofm-status-btn' + (sel ? ' active' : '') +
           '" onclick="toggleOrderFilterStatus(\'' + s.key + '\')">' + s.label + '</button>';
  }).join('');

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeOrderFilterModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>筛选订单</h3>
          <button class="icon-btn" onclick="closeOrderFilterModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="ofm-section">
            <label class="ofm-section-label">接单时间范围</label>
            <div class="ofm-range-btns">${rangeBtns}</div>
            <div class="ofm-custom-range" id="ofmCustomRange" style="${state.range === 'custom' ? '' : 'display:none;'}">
              <input type="date" id="ofmStartDate" value="${escapeAttr(state.customStart || '')}" />
              <span style="font-size:12px;color:var(--ink-soft);">至</span>
              <input type="date" id="ofmEndDate" value="${escapeAttr(state.customEnd || '')}" />
            </div>
          </div>

          <div class="ofm-section">
            <label class="ofm-section-label">标签（多选，任意匹配）</label>
            <div class="ofm-tag-list">${tagListHtml}</div>
          </div>

          <div class="ofm-section">
            <label class="ofm-section-label">状态（多选）</label>
            <div class="ofm-status-list">${statusBtns}</div>
          </div>

          <div class="actions" style="justify-content:space-between;margin-top:22px;">
            <button type="button" class="action-btn ghost" onclick="clearOrderFilter()">清空条件</button>
            <div style="display:flex;gap:10px;">
              <button type="button" class="action-btn ghost" onclick="closeOrderFilterModal()">取消</button>
              <button type="button" class="action-btn" onclick="applyOrderFilter()">确定</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function setOrderFilterRange(k) {
  __orderFilter.range = k;
  document.querySelectorAll('.ofm-range-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() ===
      ({ all: '全部', month: '本月', year: '本年', custom: '自定义' }[k]));
  });
  const c = $('ofmCustomRange');
  if (c) c.style.display = (k === 'custom') ? '' : 'none';
}

function toggleOrderFilterTag(name) {
  const i = __orderFilter.tags.indexOf(name);
  if (i > -1) __orderFilter.tags.splice(i, 1);
  else        __orderFilter.tags.push(name);

  /* 局部刷新标签区，避免整窗重绘丢滚动位置 */
  const lib = getTagLibrary();
  const html = lib.map(t => {
    const sel = __orderFilter.tags.indexOf(t.name) > -1;
    const color = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
    return '<span class="tag-chip tag-color-' + color + (sel ? ' is-selected' : '') +
           '" onclick="toggleOrderFilterTag(\'' + escapeAttr(t.name) + '\')">' +
           escapeHtml(t.name) + '</span>';
  }).join('');
  const box = document.querySelector('.ofm-tag-list');
  if (box) box.innerHTML = html || '<span class="ofm-empty">还没有历史标签</span>';
}

function toggleOrderFilterStatus(k) {
  const i = __orderFilter.statuses.indexOf(k);
  if (i > -1) __orderFilter.statuses.splice(i, 1);
  else        __orderFilter.statuses.push(k);
  document.querySelectorAll('.ofm-status-btn').forEach(btn => {
    const label = ORDER_FILTER_STATUSES.find(s => s.label === btn.textContent.trim());
    if (!label) return;
    btn.classList.toggle('active', __orderFilter.statuses.indexOf(label.key) > -1);
  });
}

function clearOrderFilter() {
  __orderFilter = { range: 'all', customStart: '', customEnd: '', tags: [], statuses: [] };
  renderOrderFilterModal();
}

function closeOrderFilterModal() {
  closeModal();
}


/* ═══════════════════════════════════════════════════════
   [FIL-02] 订单筛选 · 应用筛选
   ═══════════════════════════════════════════════════════ */

function applyOrderFilter() {
  const state = __orderFilter;

  /* 自定义范围：校验 */
  if (state.range === 'custom') {
    state.customStart = $('ofmStartDate') ? $('ofmStartDate').value : '';
    state.customEnd   = $('ofmEndDate')   ? $('ofmEndDate').value   : '';
    if (!state.customStart || !state.customEnd) {
      alert('请选择完整的自定义日期范围');
      return;
    }
    if (state.customStart > state.customEnd) {
      alert('开始日期不能晚于结束日期');
      return;
    }
  }

  const range = getOrderFilterRange(state);
  const results = [];

  /* --- 匹配函数 --- */
  const tagMatch = (itemTags) => {
    if (!state.tags.length) return true;
    if (!itemTags || !itemTags.length) return false;
    return itemTags.some(t => state.tags.indexOf(t.name) > -1);
  };
  const statusMatch = (s) => {
    if (!state.statuses.length) return true;
    return state.statuses.indexOf(s) > -1;
  };
  const rangeMatch = (dateStr) => {
    if (!range.start && !range.end) return true;
    if (!dateStr) return false;
    if (range.start && dateStr < range.start) return false;
    if (range.end && dateStr > range.end) return false;
    return true;
  };

  /* --- 待办 --- */
  getTodos().forEach(t => {
    let s = 'todo-active';
    if (t.isPlaceholder) s = 'todo-placeholder';
    else if (t.status === 'pending') s = 'todo-pending';

    if (!rangeMatch(t.orderDate)) return;
    if (!statusMatch(s)) return;
    if (!tagMatch(t.tags)) return;

    results.push({ type: 'todo', status: s, data: t, orderDate: t.orderDate || '' });
  });

  /* --- 已结单 --- */
  getCompleted().forEach(c => {
    if (!rangeMatch(c.orderDate)) return;
    if (!statusMatch('completed')) return;
    if (!tagMatch(c.tags)) return;
    results.push({ type: 'completed', status: 'completed', data: c, orderDate: c.orderDate || '' });
  });

  /* --- 已撤单 --- */
  getCancelled().forEach(c => {
    if (!rangeMatch(c.orderDate)) return;
    if (!statusMatch('cancelled')) return;
    if (!tagMatch(c.tags)) return;
    results.push({ type: 'cancelled', status: 'cancelled', data: c, orderDate: c.orderDate || '' });
  });

  /* --- 已废稿 --- */
  getDiscarded().forEach(c => {
    if (!rangeMatch(c.orderDate)) return;
    if (!statusMatch('discarded')) return;
    if (!tagMatch(c.tags)) return;
    results.push({ type: 'discarded', status: 'discarded', data: c, orderDate: c.orderDate || '' });
  });

  /* 按接单日期倒序 */
  results.sort((a, b) => {
    const da = a.orderDate || '';
    const db = b.orderDate || '';
    if (da !== db) return db.localeCompare(da);
    return 0;
  });

  __orderFilterResults = results;
  closeOrderFilterModal();
  renderOrderFilterResult();
  showPage('pageOrderFilterResult');
}

/* 把筛选条件里的 range 转成起止日期 */
function getOrderFilterRange(state) {
  const now = new Date();
  if (state.range === 'month') {
    const y = now.getFullYear(), m = now.getMonth();
    const start = y + '-' + String(m + 1).padStart(2, '0') + '-01';
    const lastDay = new Date(y, m + 1, 0).getDate();
    const end = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
    return { start, end };
  }
  if (state.range === 'year') {
    const y = now.getFullYear();
    return { start: y + '-01-01', end: y + '-12-31' };
  }
  if (state.range === 'custom') {
    return { start: state.customStart || '', end: state.customEnd || '' };
  }
  return { start: '', end: '' };
}


/* ═══════════════════════════════════════════════════════
   [FIL-03] 订单筛选 · 结果页渲染
   ═══════════════════════════════════════════════════════ */

function renderOrderFilterResult() {
  const box = $('orderFilterResultContainer');
  const summary = $('ofrSummary');
  if (!box) return;

  const results = __orderFilterResults || [];
  if (summary) summary.textContent = '共 ' + results.length + ' 条';

  if (!results.length) {
    box.innerHTML =
      '<div class="ofr-empty">' +
        '<div class="ofr-empty-icon">🔍</div>' +
        '<div>没有符合条件的订单</div>' +
      '</div>';
    return;
  }

  box.innerHTML = '<div class="order-filter-result-list">' +
    results.map(r => renderOrderFilterCard(r)).join('') +
  '</div>';
}

function renderOrderFilterCard(r) {
  const { type, status, data } = r;

  /* 状态标签 + 样式类 */
  let statusLabel = '', statusCls = '';
  if (status === 'todo-active')           { statusLabel = '未完成'; statusCls = 'is-todo'; }
  else if (status === 'todo-placeholder') { statusLabel = '待开单'; statusCls = 'is-todo'; }
  else if (status === 'todo-pending')     { statusLabel = '待结';   statusCls = 'is-pending'; }
  else if (status === 'completed')        { statusLabel = '已结单'; statusCls = 'is-completed'; }
  else if (status === 'cancelled')        { statusLabel = '已撤单'; statusCls = 'is-cancelled'; }
  else if (status === 'discarded')        { statusLabel = '已废稿'; statusCls = 'is-discarded'; }

  const d = data;
  const title = escapeHtml(d.clientName || d.clientId || '未命名');

  const tagsHtml = (d.tags && d.tags.length)
    ? '<div class="ofr-card-tags">' + d.tags.map(t => {
        const c = TAG_COLORS.indexOf(t.color) > -1 ? t.color : 'red';
        return '<span class="tag-chip tag-color-' + c + '">' + escapeHtml(t.name) + '</span>';
      }).join('') + '</div>'
    : '';

  /* 根据类型拼不同的元信息 */
  let metaParts = [];
  metaParts.push('ID：' + escapeHtml(d.clientId || '—'));
  metaParts.push('接单：' + escapeHtml(d.orderDate || '—'));
  if (type === 'todo') {
    metaParts.push('截稿：' + escapeHtml(d.deadline || '—'));
  } else if (type === 'completed') {
    metaParts.push('完成：' + escapeHtml(d.completedDate || '—'));
    metaParts.push('实收：' + fmt(d.totalReceived || 0));
  } else if (type === 'cancelled') {
    metaParts.push('撤单：' + escapeHtml(d.cancelledDate || '—'));
  } else if (type === 'discarded') {
    metaParts.push('作废：' + escapeHtml(d.discardedDate || '—'));
  }

  /* 点击进对应详情页 */
  let clickFn = 'openTodoDetail';
  if (type === 'completed') clickFn = 'openCompletedDetail';
  else if (type === 'cancelled') clickFn = 'openCancelledDetail';
  else if (type === 'discarded') clickFn = 'openDiscardedDetail';

  return '<div class="ofr-card ' + statusCls + '" onclick="' + clickFn + '(\'' + escapeAttr(d.id) + '\')">' +
    '<div class="ofr-card-body">' +
      '<div class="ofr-card-title-row">' +
        '<div class="ofr-card-title">' + title + '</div>' +
      '</div>' +
      tagsHtml +
      '<div class="ofr-card-meta">' +
        metaParts.map(p => '<span>' + p + '</span>').join('') +
      '</div>' +
    '</div>' +
    '<div class="ofr-card-status ' + statusCls + '">' + statusLabel + '</div>' +
  '</div>';
}

function backFromOrderFilterResult() {
  showPage('pageTodo');
}

/* ╔══════════════════════════════════════════════════════╗
   ║  第 16 段 · 手册 / 公告 / 主题 / 宠语 / 工具箱        ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [UM-01] 用户手册数据表                              ║
   ║   [UM-02] 用户手册渲染                                ║
   ║   [UM-03] 用户手册条目弹窗                            ║
   ║   [ANN-01] 更新公告文案表                             ║
   ║   [ANN-02] 公告弹窗 + 已读标记                        ║
   ║   [ANN-03] 更新公告历史页                             ║
   ║   [THM-01] 主题列表 + 应用 / 弹窗                     ║
   ║   [HOME-01] 首页宠语文案库                            ║
   ║   [HOME-02] 宠语数据收集（订单 / 备忘 / 收入 / 尾款）  ║
   ║   [HOME-03] 宠语主渲染                                ║
   ║   [TB-01] 首页工具箱                                  ║
   ║   [TB-02] 联系我们                                    ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [UM-01] 用户手册数据表

   每个模块包含若干条目，条目点击后弹窗显示 html 内容。
   要新增手册内容，往 USER_MANUAL_MODULES 数组里加即可。
   ═══════════════════════════════════════════════════════ */

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
          <p>点顶部<strong>「模板」按钮</strong>，弹出模板列表：</p>
          <ul>
            <li>当前使用中的会标注「使用中」</li>
            <li>点名字即可切换，右侧预览立即更新</li>
            <li>切换后新模板会用自己的默认位置（每个模板独立记忆）</li>
          </ul>
          <p class="rs-tip-sm">模板由开发者预先内置，暂不支持用户自行上传。</p>
        `
      },
      {
        title: '三、位置调整',
        html: `
          <p>在「样式 → 基础样式」标题右边，点<strong>「位置」按钮</strong>打开调整工具。</p>
          <p>画布上会出现三个框：</p>
          <ul>
            <li><span style="color:#e74c3c">■</span> 红框：<strong>正文区</strong>（价格分类、附加模块）</li>
            <li><span style="color:#2ecc71">■</span> 绿框：<strong>署名</strong></li>
            <li><span style="color:#3498db">■</span> 蓝框：<strong>表尾说明</strong></li>
          </ul>
          <p>操作方式：</p>
          <ul>
            <li><strong>移动</strong>：拖框内部任意位置</li>
            <li><strong>缩放</strong>：拖边角 / 边缘的白色圆点</li>
            <li><strong>旋转</strong>：拖框顶部圆点（会显示角度）</li>
          </ul>
          <p>底部三个按钮：</p>
          <ul>
            <li><strong>保存</strong>：把当前调整保存到该模板（以后打开都生效）</li>
            <li><strong>恢复默认</strong>：回到模板的原始位置</li>
            <li><strong>关闭</strong>：不保存直接退出</li>
          </ul>
        `
      },
      {
        title: '四、价格分类',
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
        title: '五、附加模块',
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
        title: '六、流程与须知',
        html: `
          <p>「约稿流程」「约稿须知」是<strong>全局共用</strong>的，在「快捷操作」里编辑。</p>
          <p>填写一次后，所有价目表都会自动使用。</p>
          <p>开启「流程 / 须知另起一页」后，它们会强制新开一页，<strong>左栏是流程、右栏是须知</strong>。</p>
          <p>关闭时接在价目表内容末尾，仍保持左右两栏。</p>
        `
      },
      {
        title: '七、标题样式',
        html: `
          <p>三组标题可以<strong>各自</strong>选样式：分类标题 / 附加模块标题 / 流程须知标题。</p>
          <p>每个可选四种：<strong>色块、编号、胶囊、竖线</strong>。</p>
          <p>其中「胶囊」样式下，标题文字会放在一个彩色椭圆里，胶囊文字色可单独调节。</p>
        `
      },
      {
        title: '八、颜色',
        html: `
          <p>颜色分四组：</p>
          <ul>
            <li><strong>装饰色</strong>：色块圆点 / 编号 / 胶囊底 / 竖线这些装饰元素的颜色
              <ul>
                <li>「装饰色统一」打开 → 三种标题共用一个色</li>
                <li>关闭 → 三个色卡各自独立</li>
              </ul>
            </li>
            <li><strong>标题文字色</strong>：三种标题的文字色
              <ul>
                <li>「标题色统一」打开 → 三种标题共用一个色</li>
                <li>关闭 → 分类 / 附加 / 流程须知各自独立</li>
              </ul>
            </li>
            <li><strong>胶囊文字色</strong>：只有标题样式选「胶囊」时生效</li>
            <li><strong>内容色 / 小字色</strong>：条目名、价格、正文 / 备注、注脚</li>
          </ul>
          <p>面板右上角的 ↺ 按钮可一键恢复全部默认颜色。</p>
        `
      },
      {
        title: '九、字体',
        html: `
          <p>「字体」下拉里可以选系统字体或在线字体。</p>
          <p>「<strong>全部加粗</strong>」开关打开后，价目表里所有文字都会加粗（正文和标题一起变）。</p>
          <p>字体大小滑块控制整体字号，黑点是默认值，点击可恢复。</p>
        `
      },
      {
        title: '十、实时预览',
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
        title: '十一、预设存储 / 加载',
        html: `
          <p>顶部按钮：</p>
          <ul>
            <li><strong>存储</strong>：把当前全部内容 + 外观 + 流程须知存成一份预设</li>
            <li><strong>加载</strong>：套用已存的预设</li>
          </ul>
          <p>最多存 5 份预设。加载时外观会重置为极简黑白，内容按预设替换。</p>
        `
      },
      {
        title: '十二、导出图片',
        html: `
          <p>预览页右上角「保存图片」把每一页导出为一张 PNG。</p>
          <p>多页时会得到 <code>价目表_1.png</code>、<code>价目表_2.png</code>…</p>
          <p>导出时页面右下角的页码会被隐藏。</p>
        `
      }
    ]
  },
  {
    id: 'tags',
    title: '标签与筛选',
    items: [
      {
        title: '一、给订单加标签',
        html: `
          <p>打开小票页，「企划信息」标题右边有一个黑色圆角的<strong>「标签」按钮</strong>。</p>
          <p>点它打开标签弹窗，可以：</p>
          <ul>
            <li>从<strong>历史标签</strong>里点击选择（点一下直接加）</li>
            <li>或者在下方的输入框里<strong>输入新标签</strong></li>
            <li>选颜色（红 / 黄 / 蓝 / 黑 / 灰）</li>
            <li>点标签上的 × 可以删除单个标签</li>
            <li>左下角「清空全部」清掉所有已选</li>
          </ul>
          <p>每个订单最多 5 个标签。有标签时按钮会变蓝，后面显示数量。</p>
          <p>点「保存」后，标签会跟着订单一起被导入。</p>
        `
      },
      {
        title: '二、修改已有订单的标签',
        html: `
          <p>打开订单详情页，点右上角<strong>「编辑」</strong>按钮。</p>
          <p>「联系方式」那一行的<strong>右边</strong>会出现当前标签，还有一个「+ 标签」或「编辑」按钮。</p>
          <p>点它打开同一个弹窗，可以加、删、改标签。</p>
          <p>非编辑状态下只显示标签，不能点。</p>
        `
      },
      {
        title: '三、标签颜色',
        html: `
          <p>5 种颜色，文字统一白色：</p>
          <ul>
            <li><strong>红色</strong>：适合"加急"、"催"</li>
            <li><strong>黄色</strong>：适合"重要"</li>
            <li><strong>蓝色</strong>：适合"企划"、"系列"</li>
            <li><strong>黑色</strong>：适合"黑名单"、"危险"</li>
            <li><strong>灰色</strong>：适合"老客户"、"普通"</li>
          </ul>
          <p>颜色跟名字绑定：比如第一次"加急"选了红色，以后选"加急"会自动红色。</p>
        `
      },
      {
        title: '四、订单列表上的标签',
        html: `
          <p>所有订单卡片（待办 / 已结 / 已撤 / 已废）都会显示标签。</p>
          <p>每张卡<strong>最多显示 3 个</strong>标签，超出会用 <code>+N</code> 折叠。</p>
          <p>标签显示在订单标题下面、进度信息上面。</p>
        `
      },
      {
        title: '五、筛选订单',
        html: `
          <p>打开「订单 → 待」页，<strong>右上角有个「筛选」按钮</strong>。</p>
          <p>点开弹窗，可以设置三组条件（都是可选的）：</p>
          <ul>
            <li><strong>接单时间范围</strong>：全部 / 本月 / 本年 / 自定义</li>
            <li><strong>标签</strong>：从历史标签里多选，<strong>命中任意一个</strong>就符合</li>
            <li><strong>状态</strong>：未完成 / 待开单 / 待结 / 已结单 / 已撤单 / 已废稿（多选）</li>
          </ul>
          <p>点「确定」，跳到<strong>筛选结果页</strong>，显示所有符合条件的订单——不分待/结/撤/废，混在一起，按接单日期倒序。</p>
          <p>点卡片可以直接进对应详情页。</p>
        `
      },
      {
        title: '六、筛选条件说明',
        html: `
          <p>三组条件都是「<strong>与</strong>」的关系：</p>
          <ul>
            <li>时间 + 标签 + 状态必须同时满足</li>
          </ul>
          <p>同一组内部（比如多个标签、多个状态）是「<strong>或</strong>」的关系：</p>
          <ul>
            <li>选「加急 + 立绘」→ 有加急<strong>或</strong>立绘的订单都显示</li>
            <li>选「未完成 + 待结」→ 未完成<strong>或</strong>待结的订单都显示</li>
          </ul>
          <p>不选任何条件时，显示全部订单。</p>
          <p>点弹窗左下角「清空条件」可以一键重置。</p>
        `
      }
    ]
  }
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


/* ═══════════════════════════════════════════════════════
   [ANN-01] 更新公告文案表

   新增版本时，往 ANNOUNCEMENTS 里加一条即可。
   key 是版本号，和 APP_VERSION 对上就会弹。
   ═══════════════════════════════════════════════════════ */

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
  '1.0.3': {
    title: '订单标签与筛选',
    html: `
      <p>本次更新内容：</p>
      <ul style="padding-left:20px;line-height:1.85;">
        <li><strong>订单标签</strong>：小票页可给订单加标签（最多 5 个），5 种颜色可选。</li>
        <li><strong>标签库</strong>：用过的标签会自动存进历史库，下次点击即选。</li>
        <li><strong>订单卡片显示标签</strong>：待办 / 已结 / 已撤 / 已废卡片上都能看到。</li>
        <li><strong>订单筛选</strong>：订单页右上角可按时间 + 标签 + 状态组合筛选。</li>
      </ul>
      <p style="margin-top:12px;">已有数据会自动升级，无需手动处理。</p>
    `,
  },
  '1.1.0': {
    title: '价目表全面升级',
    html: `
      <p>本次更新内容：</p>
      <ul style="padding-left:20px;line-height:1.85;">
        <li><strong>模板系统</strong>：内置「云酥」「潮汐」两套模板，顶部「模板」按钮一键切换。</li>
        <li><strong>位置自由调整</strong>：正文区 / 署名 / 表尾说明三块，可自由拖动、缩放、旋转。用户调好位置会自动记住。</li>
        <li><strong>颜色全面拆分</strong>：装饰色、标题色都可选择「统一」或「分开」，分类标题 / 附加模块 / 流程须知各自独立。</li>
        <li><strong>胶囊文字色可调</strong>：标题样式选「胶囊」时，文字颜色不再锁死白色。</li>
        <li><strong>全部加粗开关</strong>：一键加粗价目表所有文字。</li>
        <li><strong>修复</strong>：编辑订单后直接返回会提醒保存；占位单开关不再消失。</li>
      </ul>
      <p style="margin-top:12px;">已有数据会自动升级，无需手动处理。</p>
    `,
  },
};


/* ═══════════════════════════════════════════════════════
   [ANN-02] 公告弹窗 + 已读标记
   ═══════════════════════════════════════════════════════ */

/* 拿到当前用户应该看到的公告：
   - 只展示最新那一条
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


/* ═══════════════════════════════════════════════════════
   [ANN-03] 更新公告历史页
   ═══════════════════════════════════════════════════════ */

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
    else                                       el.classList.remove('is-open');
  }
}

function backFromAnnouncementHistory() {
  showPage('pageMain');
}


/* ═══════════════════════════════════════════════════════
   [THM-01] 主题列表 + 应用 / 弹窗
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [HOME-01] 首页宠语文案库

   {placeholder} 是模板变量，渲染时会替换。
   ═══════════════════════════════════════════════════════ */

var HOME_SCRIPTS = {

  /* ---------- 时段问候 ---------- */
  greet: {
    earlyMorning: [   /* 5-7 */
      '主人主人早上好！我……我好困啊……主人已经起床了吗？',
      '主人早呀～我还迷迷糊糊的，但看到主人就精神了一半！',
      '主人……早上好……天亮得好早，我还没睡够呢……',
    ],
    morning: [        /* 7-9 */
      '主人早上好呀！我精神了！今天也要元气满满哦～',
      '主人早安！今天阳光真好，适合开工！',
      '主人早上好～我刚刚打了个滚，现在活力满满！',
    ],
    lateMorning: [    /* 9-11 */
      '主人上午好～我刚打了个盹，梦见主人了！',
      '主人上午好呀！太阳都晒屁股啦，主人忙起来了没？',
      '主人上午好～我在这儿陪主人一起加油！',
    ],
    noon: [           /* 11-13 */
      '主人中午好呀！吃饭了没？不许不吃饭哦！',
      '主人中午好～到饭点啦！主人要好好吃饭，才有力气画稿！',
      '主人中午好呀！我先去闻闻主人吃什么香～',
    ],
    afternoonEarly: [ /* 13-15 */
      '主人下午好～我有点困了……主人也困吗？',
      '主人下午好呀！我打了个哈欠，主人陪我一起犯困吧～',
      '主人下午好～刚吃完饭不要马上画哦，歇一歇！',
    ],
    afternoon: [      /* 15-18 */
      '主人下午好呀！太阳快下山啦，再撑一会儿～',
      '主人下午好～我今天一直在主人旁边转圈圈！',
      '主人下午好呀！再来一杯水，继续冲！',
    ],
    evening: [        /* 18-20 */
      '主人晚上好！今天辛苦啦～',
      '主人晚上好呀～天黑了，我给主人捶捶背（虽然我没有手）',
      '主人晚上好！今天过得怎么样呀？',
    ],
    night: [          /* 20-22 */
      '主人晚上好呀～天黑了，我想窝在主人身边。',
      '主人晚上好～夜风凉了，主人加件衣服哦。',
      '主人晚上好呀～我陪主人把今天的事收个尾吧！',
    ],
    lateNight: [      /* 22-24 */
      '主人……还不睡吗？我眼睛都睁不开了……',
      '主人……夜深了，我们收工好不好？',
      '主人……我困得不行了，但还想陪着主人……',
    ],
    deepNight: [      /* 0-5 */
      '主人！都这么晚了！我要生气了！（但还是要陪着主人）',
      '主人……这个点还醒着呀？明天会累的……',
      '主人，我们是不是该睡了呀……我尾巴都耷拉下来了……',
    ],
  },

  /* ---------- 订单情况 ---------- */
  orderOverdue: [
    '唔……有件事我得小声说一下：{order} 那单昨天就该交了，现在超了 {days} 天。我知道主人肯定不是故意的，但……要抓紧补上哦！我帮主人一起记着呢。',
    '主人……有件事我憋了一会儿了：{order} 超期 {days} 天啦。不怕不怕，补上就好，我一直在主人身边。',
    '{order} 那单超期 {days} 天了……主人别自责哦，赶紧把它搞定，我们一起冲！',
  ],
  orderToday: [
    '今天 {order} 那单要交哦！我帮主人数着日子呢，主人别装看不见嘛～',
    '主人！{order} 今天就要交啦！我提前替主人捏把汗……不过主人肯定行！',
    '今天交 {order} 哦～主人今天注定是忙碌又帅气的一天！',
  ],
  orderTomorrow: [
    '明天 {order} 那单要交哦，今晚早点歇，明天一鼓作气！',
    '{order} 明天到期，主人今天可以先磨一磨，别赶嘛～',
    '主人，{order} 明天就该交啦，今晚好好睡，明天才有精神！',
  ],
  orderSoon: [
    '手头最急的是 {order}，还有 {days} 天，来得及来得及～',
    '{order} 还有 {days} 天到期，主人可以按自己的节奏来。',
    '{order} 快到期啦，还有 {days} 天，主人安排一下就好～',
  ],
  orderActive: [
    '手头 {count} 单，最急的还有 {days} 天，主人可以慢慢磨～',
    '现在手头有 {count} 单哦，不慌不慌，主人一向稳的！',
    '手上 {count} 单在做，最急的还有 {days} 天，主人节奏刚好！',
  ],
  orderEmpty: [
    '手头空着，趁这会儿歇一歇嘛～ 去看会儿番，发会儿呆也好！',
    '现在手上没单哦，难得清闲，主人值得这样的日子～',
    '手头空空的，主人要不要奖励自己一个小休息？',
  ],

  /* ---------- 备忘录 ---------- */
  memoOverdue: [
    '备忘录里那两个小尾巴还挂着——{items}——其中 {overdue} 已经过期啦，主人顺手办掉好不好？',
    '备忘录还有 {count} 件事没办：{items}。{overdue} 已经超期了哦，主人要不要现在处理一下？',
    '备忘录里躺着 {count} 件事——{items}——{overdue} 过期啦，别拖呀主人！',
  ],
  memoWithItems: [
    '备忘录里还记着 {count} 件事——{items}——主人什么时候办呀？我都替主人着急了！',
    '备忘录里那两个小尾巴还挂着——{items}——办完就一身轻啦！',
    '还有 {count} 件小事在备忘录里躺着呢：{items}。主人顺手清一清嘛～',
  ],
  memoEmpty: [
    '备忘录空空的！主人这脑子是什么做的，SSD 吧！',
    '备忘录干净得像被我用舌头舔过！主人太清爽啦～',
    '备忘录一个字都没有，主人好能干！',
  ],

  /* ---------- 收入 / 尾款 ---------- */
  incomeUpBig: [
    '这个月攒下 <strong>{income}</strong> 啦！比上个月多了 <strong>{diff}</strong>！主人！！！财神本神！！！我宣布本月最佳人类就是主人！！！',
    '这个月攒下 <strong>{income}</strong>！比上月多了 <strong>{diff}</strong>！主人这是印钞机成精了吗！我尾巴要摇成螺旋桨了！',
  ],
  incomeUp: [
    '这个月攒下 <strong>{income}</strong>，比上个月多了 <strong>{diff}</strong>！主人又偷偷进化了，我都被震撼得说不出话！',
    '本月攒下 <strong>{income}</strong>，比上月多 <strong>{diff}</strong>～主人这是开挂了吧！我宣布本月最佳人类就是主人！',
  ],
  incomeDown: [
    '这个月攒下 <strong>{income}</strong>，比上个月少了 <strong>{diff}</strong>……但这不重要！主人一直在前进，我都看见了！',
    '本月攒下 <strong>{income}</strong>，比上月少了 <strong>{diff}</strong>……可是主人依然是我的英雄，谁反对我就咬谁！',
  ],
  incomeFirst: [
    '这个月攒下 <strong>{income}</strong> 啦，第一笔已经记上了！',
    '本月已经攒下 <strong>{income}</strong> 咯～开张就是好事！',
  ],
  incomeNone: [
    '本月还没开张……不着急，淡季嘛。主人可是很厉害的人，时间问题而已！',
    '这个月还没开张……没关系！主人这么优秀，迟早的事！我陪着主人一起等～',
  ],

  pendingHas: [
    '尾款还有两笔在路上，共 <strong>{amount}</strong>～主人的钱袋子马上就要鼓起来啦！',
    '尾款还有 <strong>{amount}</strong> 在路上！这哪是尾款啊，这是大风刮来的钱吧！',
  ],
  pendingOnly: [
    '有 {count} 单还挂着没结，主人抽空结一下嘛～',
    '还有 {count} 单没结哦，主人记得收尾～',
  ],
  pendingClear: [
    '尾款都到齐了，一分不欠！主人今天心里踏实吧～',
    '尾款一笔不欠！主人太厉害了！',
  ],

  /* ---------- 收尾 ---------- */
  endingNormal: [
    '我在这儿陪着主人一起加油～',
    '主人慢慢来，我一直都在！',
    '今天也一起冲鸭！',
  ],
  endingLate: [
    '别刷手机了嘛……早点睡好不好？我给你留了半个枕头🌙',
    '手上的事收一收，早点睡吧，明天又是新的一天🌙',
    '主人晚安，我守着呢🌙',
  ],
  endingAllClear: [
    '这种日子不多呀，偷得浮生半日闲，主人值得这样的时候～',
    '难得清爽的一天！主人趁这会儿歇一歇嘛～',
  ],
};


/* ═══════════════════════════════════════════════════════
   [HOME-02] 宠语数据收集
   ═══════════════════════════════════════════════════════ */

/* 简单种子随机：同一天内结果一致 */
function homeSeedRandom(seed) {
  let h = seed | 0;
  h = (h ^ 61) ^ (h >>> 16);
  h = (h + (h << 3)) | 0;
  h = h ^ (h >>> 4);
  h = Math.imul(h, 0x27d4eb2d);
  h = h ^ (h >>> 15);
  return (h >>> 0) / 4294967296;
}
function homePickFromSeed(arr, seed) {
  if (!arr || !arr.length) return '';
  const idx = Math.floor(homeSeedRandom(seed) * arr.length) % arr.length;
  return arr[idx];
}
function homeTodaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/* 时段判断 */
function homeGetGreetKey() {
  const h = new Date().getHours();
  if (h >= 5  && h < 7)  return 'earlyMorning';
  if (h >= 7  && h < 9)  return 'morning';
  if (h >= 9  && h < 11) return 'lateMorning';
  if (h >= 11 && h < 13) return 'noon';
  if (h >= 13 && h < 15) return 'afternoonEarly';
  if (h >= 15 && h < 18) return 'afternoon';
  if (h >= 18 && h < 20) return 'evening';
  if (h >= 20 && h < 22) return 'night';
  if (h >= 22 && h < 24) return 'lateNight';
  return 'deepNight';
}
function homeIsLateNight() {
  const h = new Date().getHours();
  return h >= 22 || h < 5;
}

/* 距今天数（正=未来，负=过去） */
function homeDaysFromToday(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  if (isNaN(d.getTime())) return null;
  return Math.round((d - today) / (1000 * 60 * 60 * 24));
}

/* 收集：最紧急的订单 */
function homeGetUrgentOrder() {
  const todos = getSortedTodos();
  const active      = todos.filter(t => t.status !== 'pending' && !t.isPlaceholder);
  const placeholder = todos.filter(t => t.isPlaceholder);

  /* 超期 */
  const overdue = active.filter(t => {
    const d = homeDaysFromToday(t.deadline);
    return d !== null && d < 0;
  });
  if (overdue.length) {
    const t = overdue[0];
    return {
      type: 'overdue',
      order: t.clientName || t.clientId || '某单',
      days: Math.abs(homeDaysFromToday(t.deadline)),
    };
  }

  /* 今天 */
  const today = active.filter(t => homeDaysFromToday(t.deadline) === 0);
  if (today.length) {
    return { type: 'today', order: today[0].clientName || today[0].clientId || '某单' };
  }

  /* 明天 */
  const tomorrow = active.filter(t => homeDaysFromToday(t.deadline) === 1);
  if (tomorrow.length) {
    return { type: 'tomorrow', order: tomorrow[0].clientName || tomorrow[0].clientId || '某单' };
  }

  /* 3 天内 */
  const soon = active.filter(t => {
    const d = homeDaysFromToday(t.deadline);
    return d !== null && d > 1 && d <= 3;
  });
  if (soon.length) {
    const t = soon[0];
    return { type: 'soon', order: t.clientName || t.clientId || '某单', days: homeDaysFromToday(t.deadline) };
  }

  /* 手头有单 */
  if (active.length) {
    let minDays = null;
    active.forEach(t => {
      const d = homeDaysFromToday(t.deadline);
      if (d !== null && (minDays === null || d < minDays)) minDays = d;
    });
    return { type: 'active', count: active.length, days: minDays };
  }

  /* 只有占位单 */
  if (placeholder.length) {
    return { type: 'placeholder', count: placeholder.length };
  }

  return { type: 'empty' };
}

/* 收集：备忘录信息 */
function homeGetMemoInfo() {
  const memos = getMemos().filter(m => !m.done);
  if (!memos.length) return { type: 'empty', count: 0 };

  const todayStr = fmtDateStr(new Date());
  const overdue  = memos.filter(m => m.dueDate && m.dueDate < todayStr);
  const others   = memos.filter(m => !m.dueDate || m.dueDate >= todayStr);

  others.sort((a, b) => {
    const da = a.dueDate || '9999-99-99';
    const db = b.dueDate || '9999-99-99';
    return da.localeCompare(db);
  });

  const all  = overdue.concat(others);
  const show = all.slice(0, 3);
  const items = show.map(m => m.text || '').filter(Boolean);

  return {
    type: overdue.length ? 'overdue' : 'items',
    count: memos.length,
    items: items,
    overdueText: overdue.length ? (overdue[0].text || '') : '',
  };
}

/* 收集：本月收入 */
function homeGetIncomeInfo() {
  const now = new Date();
  const start1 = fmtDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  const end1   = fmtDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const start0 = fmtDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const end0   = fmtDateStr(new Date(now.getFullYear(), now.getMonth(), 0));

  const calcNet = (start, end) => {
    let income = 0, refund = 0, expense = 0;
    getFlows().forEach(f => {
      if (!f.date || f.date < start || f.date > end) return;
      const amt = Number(f.amount) || 0;
      if (f.type === 'refund') refund += amt;
      else if (f.type === 'expense') expense += amt;
      else income += amt;
    });
    return income - refund - expense;
  };

  const thisMonth = calcNet(start1, end1);
  const lastMonth = calcNet(start0, end0);

  return {
    income: thisMonth,
    last: lastMonth,
    diff: thisMonth - lastMonth,
    hasThis: thisMonth > 0,
    hasLast: lastMonth > 0,
  };
}

/* 收集：待结尾款 */
function homeGetPendingInfo() {
  const todos = getTodos();
  let pendingAmount = 0;
  let pendingCount = 0;
  let totalUnsettled = 0;

  todos.forEach(t => {
    if (t.isPlaceholder) return;
    if (t.status === 'pending') {
      pendingAmount += Number(t.pendingAmount) || 0;
      pendingCount++;
    } else {
      const amt = Number(t.originalFinal) || 0;
      if (amt > 0) {
        pendingAmount += amt;
        pendingCount++;
      }
      totalUnsettled++;
    }
  });

  return {
    amount: pendingAmount,
    count: pendingCount,
    totalUnsettled: totalUnsettled,
    has: pendingCount > 0,
  };
}

/* 金额格式：取整 */
function homeFmtMoney(n) {
  const v = Number(n) || 0;
  const intPart = Math.round(Math.abs(v));
  return (v < 0 ? '-¥' : '¥') + intPart;
}


/* ═══════════════════════════════════════════════════════
   [HOME-03] 宠语主渲染
   ═══════════════════════════════════════════════════════ */

function renderHomeGreeting() {
  const box    = $('homeGreetingBox');
  const textEl = $('homeGreetingText');
  if (!box || !textEl) return;

  const seed = homeTodaySeed();
  const paragraphs = [];

  /* 1. 问候 */
  const greetArr = (HOME_SCRIPTS.greet && HOME_SCRIPTS.greet[homeGetGreetKey()]) || [];
  if (greetArr.length) paragraphs.push(homePickFromSeed(greetArr, seed + 1));

  /* 深夜模式：只安慰，不播报 */
  if (homeIsLateNight()) {
    const orderInfo = homeGetUrgentOrder();
    if (orderInfo.type === 'overdue') {
      paragraphs.push('有一件事明天再说吧，先别想了。今晚好好睡，明天才有力气。');
    }
    const endingArr = HOME_SCRIPTS.endingLate;
    if (endingArr && endingArr.length) {
      paragraphs.push(homePickFromSeed(endingArr, seed + 99));
    }
    renderHomeGreetingText(textEl, paragraphs);
    return;
  }

  /* 2. 订单 */
  const order = homeGetUrgentOrder();
  if (order.type === 'overdue') {
    paragraphs.push(
      homePickFromSeed(HOME_SCRIPTS.orderOverdue, seed + 2)
        .replace(/\{order\}/g, escapeHtml(order.order))
        .replace(/\{days\}/g, String(order.days))
    );
  } else if (order.type === 'today') {
    paragraphs.push(
      homePickFromSeed(HOME_SCRIPTS.orderToday, seed + 2)
        .replace(/\{order\}/g, escapeHtml(order.order))
    );
  } else if (order.type === 'tomorrow') {
    paragraphs.push(
      homePickFromSeed(HOME_SCRIPTS.orderTomorrow, seed + 2)
        .replace(/\{order\}/g, escapeHtml(order.order))
    );
  } else if (order.type === 'soon') {
    paragraphs.push(
      homePickFromSeed(HOME_SCRIPTS.orderSoon, seed + 2)
        .replace(/\{order\}/g, escapeHtml(order.order))
        .replace(/\{days\}/g, String(order.days))
    );
  } else if (order.type === 'active') {
    paragraphs.push(
      homePickFromSeed(HOME_SCRIPTS.orderActive, seed + 2)
        .replace(/\{count\}/g, String(order.count))
        .replace(/\{days\}/g, String(order.days !== null ? order.days : '几'))
    );
  } else if (order.type === 'placeholder') {
    paragraphs.push('还有 ' + order.count + ' 单待开单，主人不着急，慢慢来。');
  } else {
    paragraphs.push(homePickFromSeed(HOME_SCRIPTS.orderEmpty, seed + 2));
  }

  /* 3. 备忘录 */
  const memo = homeGetMemoInfo();
  if (memo.type === 'empty') {
    paragraphs.push(homePickFromSeed(HOME_SCRIPTS.memoEmpty, seed + 3));
  } else {
    const itemsHtml = memo.items
      .map(t => '<span class="greeting-memo">「' + escapeHtml(t) + '」</span>')
      .join('、');
    const overdueHtml = memo.overdueText
      ? '<span class="greeting-warn">「' + escapeHtml(memo.overdueText) + '」</span>'
      : '';

    if (memo.type === 'overdue') {
      paragraphs.push(
        homePickFromSeed(HOME_SCRIPTS.memoOverdue, seed + 3)
          .replace(/\{count\}/g, String(memo.count))
          .replace(/\{items\}/g, itemsHtml)
          .replace(/\{overdue\}/g, overdueHtml)
      );
    } else {
      paragraphs.push(
        homePickFromSeed(HOME_SCRIPTS.memoWithItems, seed + 3)
          .replace(/\{count\}/g, String(memo.count))
          .replace(/\{items\}/g, itemsHtml)
      );
    }
  }

  /* 4. 收入 + 尾款（合成一段） */
  const income  = homeGetIncomeInfo();
  const pending = homeGetPendingInfo();

  let incomeLine = '';
  if (!income.hasThis) {
    incomeLine = homePickFromSeed(HOME_SCRIPTS.incomeNone, seed + 4);
  } else if (!income.hasLast) {
    incomeLine = homePickFromSeed(HOME_SCRIPTS.incomeFirst, seed + 4)
      .replace(/\{income\}/g, homeFmtMoney(income.income));
  } else if (income.diff >= 500) {
    incomeLine = homePickFromSeed(HOME_SCRIPTS.incomeUpBig, seed + 4)
      .replace(/\{income\}/g, homeFmtMoney(income.income))
      .replace(/\{diff\}/g, homeFmtMoney(income.diff));
  } else if (income.diff > 0) {
    incomeLine = homePickFromSeed(HOME_SCRIPTS.incomeUp, seed + 4)
      .replace(/\{income\}/g, homeFmtMoney(income.income))
      .replace(/\{diff\}/g, homeFmtMoney(income.diff));
  } else if (income.diff < 0) {
    incomeLine = homePickFromSeed(HOME_SCRIPTS.incomeDown, seed + 4)
      .replace(/\{income\}/g, homeFmtMoney(income.income))
      .replace(/\{diff\}/g, homeFmtMoney(Math.abs(income.diff)));
  } else {
    incomeLine = homePickFromSeed(HOME_SCRIPTS.incomeFirst, seed + 4)
      .replace(/\{income\}/g, homeFmtMoney(income.income));
  }

  /* 尾款句子拼在后面 */
  if (pending.has) {
    incomeLine += ' ' + homePickFromSeed(HOME_SCRIPTS.pendingHas, seed + 5)
      .replace(/\{amount\}/g, homeFmtMoney(pending.amount));
  } else if (pending.totalUnsettled > 0) {
    incomeLine += ' ' + homePickFromSeed(HOME_SCRIPTS.pendingOnly, seed + 5)
      .replace(/\{count\}/g, String(pending.totalUnsettled));
  } else {
    incomeLine += ' ' + homePickFromSeed(HOME_SCRIPTS.pendingClear, seed + 5);
  }
  paragraphs.push(incomeLine);

  /* 5. 收尾 */
  const isAllClear = (order.type === 'empty')
                  && (memo.type === 'empty')
                  && !pending.has
                  && (pending.totalUnsettled === 0);

  if (isAllClear) {
    paragraphs.push(homePickFromSeed(HOME_SCRIPTS.endingAllClear, seed + 6));
  }

  renderHomeGreetingText(textEl, paragraphs);
}

function renderHomeGreetingText(textEl, paragraphs) {
  if (!textEl) return;
  const valid = (paragraphs || []).filter(p => p && String(p).trim());
  if (!valid.length) {
    textEl.innerHTML = '';
    return;
  }
  textEl.innerHTML = valid.map(p => '<p>' + p + '</p>').join('');
}

/* 包装 showPage：切到首页时重新渲染宠语 */
(function patchShowPageForHomeGreeting() {
  const __orig = window.showPage;
  if (typeof __orig !== 'function') return;
  window.showPage = function (id) {
    const result = __orig(id);
    if (id === 'pageMain') {
      setTimeout(renderHomeGreeting, 80);
    }
    return result;
  };
})();


/* ═══════════════════════════════════════════════════════
   [TB-01] 首页工具箱
   ═══════════════════════════════════════════════════════ */

const CONTACT_INFO = {
  xiaohongshu: '415633739',
  qqGroup: '1109781704',
  email: '2559187312@qq.com',
  note: '使用中遇到问题或想提建议，欢迎联系我们。'
};

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

/* 票夹入口（首页图标） */
function openTicketFolder() {
  showPage('pageTicketFolder');
}


/* ═══════════════════════════════════════════════════════
   [TB-02] 联系我们
   ═══════════════════════════════════════════════════════ */

function openContactUs() {
  const info = CONTACT_INFO || {};
  const qq = escapeHtml(info.qqGroup || '—');
  const mail = escapeHtml(info.email || '—');
  const xhs = escapeHtml(info.xiaohongshu || '—');
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
              <div class="contact-label">小红书</div>
              <div class="contact-value">${xhs}</div>
              <button type="button" class="contact-copy" title="复制" onclick="copyContactValue('${xhs}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15 H4 a2 2 0 0 1 -2 -2 V4 a2 2 0 0 1 2 -2 h9 a2 2 0 0 1 2 2 v1"/>
                </svg>
              </button>
            </div>
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

/* ╔══════════════════════════════════════════════════════╗
   ║  第 17 段 · 价目表                                    ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [PL-01] 存储 key + 默认值 + 模板定义                ║
   ║   [PL-02] 存取 + 老数据迁移                           ║
   ║   [PL-03] 入口 + Tab 切换 + 移动端预览                ║
   ║   [PL-04] 渲染入口 + 自适应缩放                       ║
   ║   [PL-05] 排序 + 条目化                               ║
   ║   [PL-06] 元素工厂                                    ║
   ║   [PL-07] 页面骨架                                    ║
   ║   [PL-08] 溢出检测 + 分页引擎                         ║
   ║   [PL-09] 设置页表单                                  ║
   ║   [PL-10] 分类操作                                    ║
   ║   [PL-11] 附加模块操作                                ║
   ║   [PL-12] 内容 / 样式修改                             ║
   ║   [PL-13] 流程 / 须知 弹窗                            ║
   ║   [PL-14] 图片 + 一键导入                             ║
   ║   [PL-15] 预设                                        ║
   ║   [PL-16] 保存图片                                    ║
   ║   [PL-17] 位置调整工具（开发用，保留）                ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [PL-01] 存储 key + 默认值 + 模板定义
   ═══════════════════════════════════════════════════════ */

/* 三个附加模块的固定顺序：用途 → 附加 → 优惠 */
const PL_MODULE_KEYS = ['usage', 'extra', 'discount'];
const PL_MODULE_DEFAULT_TITLES = {
  usage:    '用途',
  extra:    '附加',
  discount: '优惠',
};

/* 模板：底图 + 三个区（正文 / 署名 / 底部说明）的位置 */
const PL_TEMPLATES = [
  {
    id: 'jm1-blue',
    name: '云酥',
    bgUrl: 'templates/JM1-blue.png',
    layout: {
      content: { left: 5.67,  top: 16.09, width: 88.55, height: 72.2 },
      sign:    { left: 37.03, top: 9.24,  width: 30,    height: 4    },
      footer:  { left: 0,     top: 90.16, width: 100,   height: 3.13 }
    }
  },
  {
    id: 'tpl-2',
    name: '潮汐',
    bgUrl: 'templates/JM2-red.png',
    layout: {
      content: { left: 10.86, top: 14.77, width: 82.46, height: 76.92 },
      sign:    { left: 0.83, top: 95.77, width: 52.19, height: 4 },
      footer:  { left: 9.06, top: 91.3, width: 86.56, height: 4 }
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

/* 默认价目表内容 */
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

/* 默认外观设置 */
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

    /* 颜色 */
    colorTitleUnified:  true,       /* ★ 标题色统一开关 */
    colorTitle:         '#111111',  /* 统一时的标题色 */
    colorTitleCategory: '#111111',  /* ★ 分类标题文字色 */
    colorTitleModule:   '#111111',  /* ★ 附加模块标题文字色 */
    colorTitleNotice:   '#111111',  /* ★ 流程须知标题文字色 */

    colorContent: '#111111',   /* 内容色 */
    colorSmall:   '#555555',   /* 小字色 */
    decoUnified:  true,        /* 装饰色统一开关 */
    decoColor:    '#111111',   /* 统一装饰色 */
    decoCategory: '#111111',   /* 分类标题装饰色 */
    decoModule:   '#111111',   /* 附加模块标题装饰色 */
    decoNotice:   '#111111',   /* 流程须知标题装饰色 */

    font: 'system',
    fontSize: 13.5,
    boldAll: false,             /* ★ 全部加粗开关 */

    pillInk: '#ffffff',         /* ★ 胶囊文字色 */

    bgCoverImg: '',
    bgCoverOpacity: 1
  };
}

/* 默认全局数据（流程 / 须知） */
function makeDefaultPriceListGlobal() {
  return { process: [], notice: [] };
}


/* ═══════════════════════════════════════════════════════
   [PL-02] 存取 + 老数据迁移
   ═══════════════════════════════════════════════════════ */

/* 内容数据：补缺失字段 */
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

/* 外观设置：老结构升级到新结构 */
function migratePriceListSettings(settings) {
  let changed = false;

  const raw = (() => {
    try { return JSON.parse(localStorage.getItem(PRICE_LIST_SETTINGS_KEY)); }
    catch (e) { return null; }
  })() || {};

  /* 老 colorPrimary/colorSecondary → 新的六色 */
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

  /* 老的 bgColor 不再使用 */
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

  /* ★ 新增字段：补默认值 */
  if (settings.colorTitleUnified === undefined) {
    settings.colorTitleUnified = true;
    changed = true;
  }
  if (!settings.colorTitleCategory) {
    settings.colorTitleCategory = settings.colorTitle || '#111111';
    changed = true;
  }
  if (!settings.colorTitleModule) {
    settings.colorTitleModule = settings.colorTitle || '#111111';
    changed = true;
  }
  if (!settings.colorTitleNotice) {
    settings.colorTitleNotice = settings.colorTitle || '#111111';
    changed = true;
  }
  if (settings.boldAll === undefined) {
    settings.boldAll = false;
    changed = true;
  }
  if (!settings.pillInk) {
    settings.pillInk = '#ffffff';
    changed = true;
  }

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

      /* 老字段兼容 */
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


/* ═══════════════════════════════════════════════════════
   [PL-03] 入口 + Tab 切换 + 移动端预览
   ═══════════════════════════════════════════════════════ */

function openPriceList() {
  showPage('pagePriceList');
  renderPriceListPreview();
}

function backFromPriceList() {
  showPage('pageMain');
}

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

/* 移动端预览折叠状态 */
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

/* 预览渲染 debounce（改设置时不要每一帧都重建 DOM） */
var __plRenderDebounceTimer = null;

function schedulePlPreviewRender() {
  clearTimeout(__plRenderDebounceTimer);
  __plRenderDebounceTimer = setTimeout(() => {
    renderPriceListPreview();
  }, 100);
}


/* ═══════════════════════════════════════════════════════
   [PL-04] 渲染入口 + 自适应缩放

   ★ 优化说明：
     三个预览容器里，桌面端只有 plDesktopPreviewPages 可见，
     移动端只有 plMobilePreviewPages 可见。
     为了避免无谓渲染，只往可见容器里塞。

     但代码原逻辑是"三个都渲染"，这次保留原逻辑，
     因为窗口尺寸可能在渲染后被改变。
   ═══════════════════════════════════════════════════════ */

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

  /* 等字体加载完，避免尺寸抖动 */
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) {}
  }

  if (token !== __plRenderToken) return;

  /* 每个容器都渲染一份 */
  containers.forEach(c => {
    buildPriceListPages(c, data, settings, global);
  });

  /* 渲染完成后重算预览缩放 */
  requestAnimationFrame(() => {
    updatePlPreviewScale();
  });
}

/* 预览区自适应缩放：按可用宽度调整 --pl-preview-zoom */
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

    /* 缩放系数 = 可用宽度 / 640，上限 1 */
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

/* 判断价目表是否有内容（决定是否显示空态） */
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


/* ═══════════════════════════════════════════════════════
   [PL-05] 排序 + 条目化
   ═══════════════════════════════════════════════════════ */

/* 分类按 order 排序 */
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

/* 附加模块固定顺序 */
function getPlModulesInOrder(data) {
  return PL_MODULE_KEYS.map((key, idx) => ({
    key: key,
    mod: data[key],
    title: (data[key] && data[key].title) || PL_MODULE_DEFAULT_TITLES[key] || '',
    num: String(idx + 1).padStart(2, '0'),
  }));
}

/* 把"分类 + 模块"拍平成一串"条目"，分页引擎按这个处理 */
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
      /* 横排：整块一次放入 */
      entries.push({
        ownerId, ownerTitle, ownerNum, ownerStyle,
        ownerKind: 'block',
        isStart: true,
        isHorizontal: true,
        el: makePlBlockLineHorizontalEl(mod.lines)
      });
    } else {
      /* 竖排：一行一条 */
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


/* ═══════════════════════════════════════════════════════
   [PL-06] 元素工厂（生成 DOM）
   ═══════════════════════════════════════════════════════ */

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
  标题工厂。entry.ownerKind 决定是分类标题还是模块标题。
  两者都支持 data-style：block / number / pill / bar
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

    /* 跨页续：加个"·续"标记 */
    if (isContinue) {
      const cont = document.createElement('span');
      cont.className = 'pl-category-continue';
      cont.textContent = '·续';
      el.appendChild(cont);
    }
    wrap.appendChild(el);

    /* 分类标签：只在第一片时显示 */
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

/* 流程 / 须知块 */
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


/* ═══════════════════════════════════════════════════════
   [PL-07] 页面骨架

   生成一张"3:4 画布"的结构：
     - 模板底图
     - 用户背景图（覆盖）
     - 正文区
     - 署名区
     - 底部说明区
   ═══════════════════════════════════════════════════════ */

function createPlPage(container, settings, data, isFirst) {
  const template = getPlTemplate(settings.templateId);

  const page = document.createElement('div');
  page.className = 'pl-page';
  page.style.background = '#ffffff';

  /* 字体 */
  page.style.setProperty('--pl-font', resolveFontFamily(settings.font));
  page.style.setProperty('--pl-font-size', (settings.fontSize || PL_DEFAULT_FONT_SIZE) + 'px');

  /* 颜色：装饰色和标题色都按"统一 / 独立"决定 */
  const deco = (name) => settings.decoUnified ? settings.decoColor : settings[name];
  const titleColor = settings.colorTitle || '#111111';
  const titleUnified = settings.colorTitleUnified !== false;

  page.style.setProperty('--pl-color-title',   titleColor);
  page.style.setProperty('--pl-color-content', settings.colorContent || '#111111');
  page.style.setProperty('--pl-color-small',   settings.colorSmall   || '#555555');
  page.style.setProperty('--pl-deco-category', deco('decoCategory'));
  page.style.setProperty('--pl-deco-module',   deco('decoModule'));
  page.style.setProperty('--pl-deco-notice',   deco('decoNotice'));

  /* ★ 新增：三种标题文字色 */
  page.style.setProperty('--pl-color-title-category',
    titleUnified ? titleColor : (settings.colorTitleCategory || titleColor));
  page.style.setProperty('--pl-color-title-module',
    titleUnified ? titleColor : (settings.colorTitleModule   || titleColor));
  page.style.setProperty('--pl-color-title-notice',
    titleUnified ? titleColor : (settings.colorTitleNotice   || titleColor));

  /* ★ 新增：全部加粗 */
  if (settings.boldAll) {
    page.classList.add('is-bold');
  }

  /* ★ 新增：胶囊文字色 */
  page.style.setProperty('--pl-pill-ink', settings.pillInk || '#ffffff');

  /* 布局：优先用用户自定义位置，没有就用模板原始位置 */
  const customLayout = getPlCustomLayout(settings.templateId);
  const L = customLayout || template.layout;

  page.style.setProperty('--pl-content-left',   (L.content.left   || 0) + '%');
  page.style.setProperty('--pl-content-top',    (L.content.top    || 0) + '%');
  page.style.setProperty('--pl-content-width',  (L.content.width  || 0) + '%');
  page.style.setProperty('--pl-content-height', (L.content.height || 0) + '%');
  page.style.setProperty('--pl-content-rotate', (L.content.rotate || 0) + 'deg');

  page.style.setProperty('--pl-sign-left',      (L.sign.left      || 0) + '%');
  page.style.setProperty('--pl-sign-top',       (L.sign.top       || 0) + '%');
  page.style.setProperty('--pl-sign-width',     (L.sign.width     || 0) + '%');
  page.style.setProperty('--pl-sign-height',    (L.sign.height    || 0) + '%');
  page.style.setProperty('--pl-sign-rotate',    (L.sign.rotate    || 0) + 'deg');

  page.style.setProperty('--pl-footer-left',    (L.footer.left    || 0) + '%');
  page.style.setProperty('--pl-footer-top',     (L.footer.top     || 0) + '%');
  page.style.setProperty('--pl-footer-width',   (L.footer.width   || 0) + '%');
  page.style.setProperty('--pl-footer-height',  (L.footer.height  || 0) + '%');
  page.style.setProperty('--pl-footer-rotate',  (L.footer.rotate  || 0) + 'deg');

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


/* ═══════════════════════════════════════════════════════
   [PL-08] 溢出检测 + 分页引擎

   分页思路：
     1. 把"分类 + 模块"拍平成一串条目
     2. 逐条往左栏塞，塞不下就开右栏
     3. 左右都塞不下就开新页
     4. 跨页的"同一分类"标题加"·续"标记
   ═══════════════════════════════════════════════════════ */

/* 判断整页内层是否溢出 */
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

/* 判断某一栏是否溢出 */
function isPlColOverflow(page, col) {
  if (!col) return false;
  const area = page.querySelector('.pl-content-area');
  if (!area) return false;

  const colH  = col.getBoundingClientRect().height;
  const areaH = area.getBoundingClientRect().height;
  if (areaH <= 0) return false;
  return colH > areaH + 1;
}

/* 尝试把一个条目塞进某一栏（塞不下就回滚） */
function tryPlaceEntry(page, col, entry, colTrackers, usedOwners) {
  const needsTitle = !colTrackers.has(entry.ownerId) && !!entry.ownerTitle;
  const wasInUsed  = usedOwners.has(entry.ownerId);

  const nodes = [];
  if (needsTitle) {
    /* 该 owner 之前出现过 → 加"·续" */
    const titleEl = makePlOwnerTitleEl(entry, wasInUsed);
    if (titleEl) nodes.push(titleEl);
  }
  nodes.push(entry.el);

  const wasEmpty = col.children.length === 0;

  nodes.forEach(n => col.appendChild(n));
  if (needsTitle) colTrackers.add(entry.ownerId);
  if (!wasInUsed) usedOwners.add(entry.ownerId);

  /* 空栏允许第一条溢出（防止无限分页） */
  if (wasEmpty) return true;

  /* 溢出：回滚 */
  if (isPlColOverflow(page, col)) {
    nodes.forEach(n => { if (n.parentNode === col) col.removeChild(n); });
    if (needsTitle) colTrackers.delete(entry.ownerId);
    if (!wasInUsed) usedOwners.delete(entry.ownerId);
    return false;
  }

  return true;
}

/* 确保页面里有 columns 结构 */
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

/* 分页主入口 */
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

/* 自动分页 */
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
      /* 单栏：全塞左栏 */
      while (queue.length > 0) {
        const e = queue[0];
        if (!tryPlaceEntry(page, leftCol, e, leftTrackers, usedOwners)) break;
        queue.shift();
        placedSomething = true;
      }
    } else {
      /* 双栏：先塞满左栏，再塞右栏 */
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

    /* 空栏也塞不下 → 强制放一个（避免死循环） */
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

  /* 加页码 */
  const pages = container.querySelectorAll('.pl-page');
  pages.forEach((p, i) => appendPlPageNum(p, i + 1, pages.length));
}

/* 手动分页 */
function buildPlManualPages(container, data, settings, global, entries, isSingle, newPageMode) {
  /* 每个条目属于哪一页 */
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

        /* 双栏：左栏塞不下就塞右栏 */
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

/* 流程 / 须知：追加到末尾或另起一页 */
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

  /* 溢出：挪到新页 */
  if (isPlPageOverflow(lastPage)) {
    inner.removeChild(blockEl);
    const page = createPlPage(container, settings, data, false);
    const newInner = page.querySelector('.pl-content-inner');
    newInner.appendChild(blockEl);
  }
}

/* 构造"流程 + 须知"左右两栏块 */
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


/* ═══════════════════════════════════════════════════════
   [PL-09] 设置页表单
   ═══════════════════════════════════════════════════════ */

var __plFoldOpenMap = {};   /* 折叠块展开状态 */

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

/* 样式表单回填 */
function renderPriceListStyleForm(s) {
  if ($('plFollowTheme')) $('plFollowTheme').checked = !!s.followTheme;
  if ($('plShowDotted'))  $('plShowDotted').checked = s.showDottedLine !== false;
  if ($('plFont'))        $('plFont').value = s.font || 'system';
  if ($('plFontSize'))    $('plFontSize').value = s.fontSize || PL_DEFAULT_FONT_SIZE;
  if ($('plFontSizeVal')) $('plFontSizeVal').textContent = (s.fontSize || PL_DEFAULT_FONT_SIZE).toFixed(1) + 'px';
  if ($('plBoldAll'))     $('plBoldAll').checked = !!s.boldAll;
  if ($('plPillInk'))     $('plPillInk').value   = s.pillInk || '#ffffff';

  if ($('plColorTitle'))         $('plColorTitle').value         = s.colorTitle         || '#111111';
  if ($('plColorTitleCategory')) $('plColorTitleCategory').value = s.colorTitleCategory || '#111111';
  if ($('plColorTitleModule'))   $('plColorTitleModule').value   = s.colorTitleModule   || '#111111';
  if ($('plColorTitleNotice'))   $('plColorTitleNotice').value   = s.colorTitleNotice   || '#111111';
  if ($('plTitleColorUnified'))  $('plTitleColorUnified').checked = s.colorTitleUnified !== false;

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
  updateTitleColorBlocks();
  updatePlStyleBtns();
}

/* 字体下拉从"小票设置"的字体列表复制一份 */
function renderPriceListFontOptions() {
  const sel = $('plFont');
  const src = $('rsFont');
  if (!sel || !src) return;
  sel.innerHTML = src.innerHTML;
  const s = getPriceListSettings();
  const opts = Array.from(sel.options).map(o => o.value);
  sel.value = opts.indexOf(s.font) > -1 ? s.font : 'system';
}

/* 三组样式按钮的高亮 */
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

/* 装饰色"统一 / 独立"两个块显隐 */
function updateDecoBlocks() {
  const unified = !!($('plDecoUnified') && $('plDecoUnified').checked);
  const u = $('plDecoUnifiedBlock');
  const sp = $('plDecoSplitBlock');
  if (u) u.style.display = unified ? '' : 'none';
  if (sp) sp.style.display = unified ? 'none' : '';
}

/* ★ 新增：标题色"统一 / 分开"两个块的显隐 */
function updateTitleColorBlocks() {
  const unified = !!($('plTitleColorUnified') && $('plTitleColorUnified').checked);
  const u = $('plTitleColorUnifiedBlock');
  const sp = $('plTitleColorSplitBlock');
  if (u) u.style.display = unified ? '' : 'none';
  if (sp) sp.style.display = unified ? 'none' : '';
}

/* ★ 新增：切换"标题色统一"开关时 */
function onPlTitleColorUnifiedToggle() {
  const s = getPriceListSettings();
  s.colorTitleUnified = !!($('plTitleColorUnified') && $('plTitleColorUnified').checked);
  setPriceListSettings(s);
  updateTitleColorBlocks();
  renderPriceListPreview();
}


/* ═══════════════════════════════════════════════════════
   [PL-10] 模板网格 + 分类列表
   ═══════════════════════════════════════════════════════ */

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

}

function selectPlTemplate(id) {
  const s = getPriceListSettings();
  s.templateId = id;
  setPriceListSettings(s);
  renderPlTemplateGrid();
  renderPriceListPreview();
}

/* ★ 新增：纯文字模板选择弹窗（替代原"恢复"按钮） */
function openPlTemplatePicker() {
  const s = getPriceListSettings();
  const cur = s.templateId || 'jm1-blue';

  const itemsHtml = PL_TEMPLATES.map(t => {
    const isActive = t.id === cur;
    return `
      <div class="rp-item" onclick="pickPlTemplate('${escapeAttr(t.id)}')" style="${isActive ? 'border-color:#111;background:#f4f6f9;' : ''}">
        <div class="rp-item-name">
          ${escapeHtml(t.name)}
          ${isActive ? '<span style="font-size:11px;color:#2b7fff;margin-left:8px;font-weight:600;">使用中</span>' : ''}
        </div>
      </div>`;
  }).join('');

  $('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>选择模板</h3>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="rp-list">${itemsHtml}</div>
          <div class="actions" style="justify-content:flex-end;margin-top:18px;">
            <button class="action-btn" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>`;
}

/* ★ 点击某个模板：切换并保存 */
function pickPlTemplate(id) {
  const s = getPriceListSettings();
  s.templateId = id;
  setPriceListSettings(s);
  closeModal();
  renderPriceListStyleForm(s);
  renderPriceListPreview();
}

/* 分类列表 */
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

/* 单个分类折叠块 */
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

/* 附加模块列表 */
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

/* 页码下拉 */
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

/* 单条分类条目的编辑行 */
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


/* ═══════════════════════════════════════════════════════
   [PL-11] 分类操作
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [PL-12] 附加模块操作
   ═══════════════════════════════════════════════════════ */

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

/* 分类条目字段编辑 */
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

/* 横排开关 */
function onPlHorizontalToggle() {
  const s = getPriceListSettings();
  s.moduleHorizontal = !!($('plHorizontalModules') && $('plHorizontalModules').checked);
  setPriceListSettings(s);
  renderPriceListPreview();
}

/* 文案 / 开关 */
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
  if ($('plTitleSign'))  data.signature.content = $('plTitleSign').value;
  if ($('plBottomText')) data.footer.text = $('plBottomText').value;
  setPriceList(data);
}


/* ═══════════════════════════════════════════════════════
   [PL-13] 流程 / 须知 弹窗（行编辑器）
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [PL-14] 样式修改
   ═══════════════════════════════════════════════════════ */

function onPlStyleChange() {
  const s = getPriceListSettings();

  if ($('plFollowTheme')) s.followTheme = $('plFollowTheme').checked;
  if ($('plShowDotted'))  s.showDottedLine = $('plShowDotted').checked;
  if ($('plFont'))        s.font = $('plFont').value;
  if ($('plFontSize'))    s.fontSize = parseFloat($('plFontSize').value) || PL_DEFAULT_FONT_SIZE;
  if ($('plBoldAll'))     s.boldAll = $('plBoldAll').checked;
  if ($('plPillInk'))     s.pillInk = $('plPillInk').value;

  if ($('plColorTitle'))         s.colorTitle         = $('plColorTitle').value;
  if ($('plColorTitleCategory')) s.colorTitleCategory = $('plColorTitleCategory').value;
  if ($('plColorTitleModule'))   s.colorTitleModule   = $('plColorTitleModule').value;
  if ($('plColorTitleNotice'))   s.colorTitleNotice   = $('plColorTitleNotice').value;

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

/* 三组样式切换 */
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

/* 装饰色统一开关 */
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
  s.colorTitleUnified  = true;
  s.colorTitle         = '#111111';
  s.colorTitleCategory = '#111111';
  s.colorTitleModule   = '#111111';
  s.colorTitleNotice   = '#111111';
  s.colorContent = '#111111';
  s.colorSmall   = '#555555';
  s.decoUnified  = true;
  s.decoColor    = '#111111';
  s.decoCategory = '#111111';
  s.decoModule   = '#111111';
  s.decoNotice   = '#111111';
  s.pillInk      = '#ffffff';
  setPriceListSettings(s);

  renderPriceListStyleForm(s);
  renderPriceListPreview();
}

/* 字体大小复位 */
function resetPlFontSize() {
  if ($('plFontSize')) $('plFontSize').value = PL_DEFAULT_FONT_SIZE;
  if ($('plFontSizeVal')) $('plFontSizeVal').textContent = PL_DEFAULT_FONT_SIZE.toFixed(1) + 'px';
  const s = getPriceListSettings();
  s.fontSize = PL_DEFAULT_FONT_SIZE;
  setPriceListSettings(s);
  renderPriceListPreview();
}

/* 布局 / 分页 */
function setPlLayout(mode) {
  const s = getPriceListSettings();
  const wasSingle = s.layout === 'single';
  s.layout = mode;

  /* 切到单栏自动开横排 */
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

/* 图片（背景图） */
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

/* 一键导入：从稿件预设 / 权限 / 附加 / 优惠 里拉数据 */
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

  /* 按分组生成分类 */
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

  /* 未分组 → "其他" */
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

  /* 用途 = 权限 */
  const perms = getPermissions();
  data.usage.lines = perms.map(p => p.name + ' ×' + trimNum(p.rate));

  /* 附加 */
  const extras = getExtraPresets();
  data.extra.lines = extras.map(p => {
    const v = p.op === 'multiply' ? pctShort(p.value) : ('¥' + trimNum(p.value));
    return p.name + ' +' + v;
  });

  /* 优惠 */
  const discounts = getDiscountPresets();
  data.discount.lines = discounts.map(p => {
    const v = p.op === 'multiply' ? pctShort(p.value) : ('¥' + trimNum(p.value));
    return p.name + ' ' + (p.op === 'multiply' ? '×' : '−') + v;
  });

  /* 署名：从设置里带过来 */
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

/* 预设 → 价目表条目 */
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

/* 数字格式：整数不带小数点 */
function fmtPriceNum(n) {
  const v = Number(n) || 0;
  return v % 1 === 0 ? String(v) : v.toFixed(2);
}


/* ═══════════════════════════════════════════════════════
   [PL-15] 预设
   ═══════════════════════════════════════════════════════ */

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
  }
  renderPriceListPreview();
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
  renderPriceListPreview();
  showSimpleAlert('已恢复', '价目表外观已恢复默认。');
}


/* ═══════════════════════════════════════════════════════
   [PL-16] 保存图片
   ═══════════════════════════════════════════════════════ */

async function savePriceListImage() {
  const pages = document.querySelectorAll('#priceListPages .pl-page');
  if (!pages.length) {
    showSimpleAlert('提示', '价目表还没有内容。');
    return;
  }

  /* 导出前临时隐藏页码 */
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


/* ═══════════════════════════════════════════════════════
   [PL-17] 位置调整工具（开发用 · 保留）

   点价目表设置页"模板"区的「🔧 调整当前模板的内容位置」按钮打开。
   拖动三个色框，复制参数，贴进 PL_TEMPLATES 的 layout 里。
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   [PL-17] 位置调整工具（用户版 + 旋转 + 开发者保留）
   ═══════════════════════════════════════════════════════ */

var __plAdjustState = null;

function openPlAdjustTool() {
  const s = getPriceListSettings();
  const tpl = getPlTemplate(s.templateId);

  if (!tpl || !tpl.bgUrl) {
    showSimpleAlert('提示', '当前模板没有底图，无法调整。<br>请先在「模板」里选一个带底图的模板。');
    return;
  }

  /* 数据源：优先用自定义，没有就用模板原始 */
  const customLayout = getPlCustomLayout(s.templateId);
  const layout = customLayout
    ? JSON.parse(JSON.stringify(customLayout))
    : JSON.parse(JSON.stringify(tpl.layout));

  /* 补齐 rotate 字段 */
  ['content', 'sign', 'footer'].forEach(k => {
    if (!layout[k]) layout[k] = { left: 0, top: 0, width: 0, height: 0, rotate: 0 };
    if (typeof layout[k].rotate !== 'number') layout[k].rotate = 0;
  });

  const devMode = isPlDevMode();

  const overlay = document.createElement('div');
  overlay.className = 'pl-adjust-overlay';
  overlay.id = 'plAdjustOverlay';
  overlay.innerHTML =
    '<div class="pl-adjust-stage" id="plAdjustStage">' +
      '<img class="pl-adjust-bg" src="' + escapeAttr(tpl.bgUrl) + '" alt="" />' +
      '<div class="pl-adjust-frame" data-key="content">' +
        '<div class="pl-adjust-frame-label">正文区</div>' +
        makeAdjustHandles() +
        makeRotateHandle() +
      '</div>' +
      '<div class="pl-adjust-frame" data-key="sign">' +
        '<div class="pl-adjust-frame-label">署名</div>' +
        makeAdjustHandles() +
        makeRotateHandle() +
      '</div>' +
      '<div class="pl-adjust-frame" data-key="footer">' +
        '<div class="pl-adjust-frame-label">底部说明</div>' +
        makeAdjustHandles() +
        makeRotateHandle() +
      '</div>' +
    '</div>' +
    '<div class="pl-adjust-bar">' +
      '<h3>拖动移动 · 拉边角改大小 · 拖顶部圆点旋转</h3>' +
      (devMode ? '<div class="pl-adjust-info" id="plAdjustInfo"></div>' : '') +
      '<div class="pl-adjust-actions">' +
        (devMode ? '<button type="button" class="pl-adjust-btn ghost" id="plAdjustCopy">复制参数</button>' : '') +
        '<button type="button" class="pl-adjust-btn ghost" id="plAdjustReset">恢复默认</button>' +
        '<button type="button" class="pl-adjust-btn" id="plAdjustSave">保存</button>' +
        '<button type="button" class="pl-adjust-btn ghost" id="plAdjustClose">关闭</button>' +
      '</div>' +
      (devMode ? '<div style="margin-top:10px;font-size:11px;color:#888;">开发者模式已开启</div>' : '') +
    '</div>';

  document.body.appendChild(overlay);

  __plAdjustState = {
    overlay: overlay,
    stage: document.getElementById('plAdjustStage'),
    frames: {},
    layout: layout,
    originalLayout: JSON.parse(JSON.stringify(tpl.layout)),
    templateId: s.templateId,
    devMode: devMode
  };

  ['content', 'sign', 'footer'].forEach(function (key) {
    const el = overlay.querySelector('.pl-adjust-frame[data-key="' + key + '"]');
    __plAdjustState.frames[key] = el;
    applyFrameFromLayout(key);
    bindFrameMoveAndResize(key, el);
    bindFrameRotate(key, el);
  });

  updatePlAdjustInfo();

  if (devMode) {
    document.getElementById('plAdjustCopy').addEventListener('click', copyPlAdjustResult);
  }
  document.getElementById('plAdjustReset').addEventListener('click', resetPlAdjustAll);
  document.getElementById('plAdjustSave').addEventListener('click', savePlAdjustAll);
  document.getElementById('plAdjustClose').addEventListener('click', closePlAdjustTool);
}

function makeAdjustHandles() {
  return ['nw','n','ne','w','e','sw','s','se'].map(function (d) {
    return '<div class="pl-adjust-handle" data-dir="' + d + '"></div>';
  }).join('');
}

function makeRotateHandle() {
  return '<div class="pl-adjust-rotate-line"></div>' +
         '<div class="pl-adjust-rotate-dot" title="拖动旋转"></div>' +
         '<div class="pl-adjust-rotate-badge" style="display:none;">0°</div>';
}

/* 把 layout 数据应用到 frame 的样式 */
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
  el.style.transform = 'rotate(' + (L.rotate || 0) + 'deg)';
  el.style.transformOrigin = 'center center';

  const badge = el.querySelector('.pl-adjust-rotate-badge');
  if (badge) {
    const r = L.rotate || 0;
    if (r === 0) { badge.style.display = 'none'; }
    else { badge.style.display = ''; badge.textContent = r + '°'; }
  }
}

/* --- 拖动移动 + 边角 resize --- */
function bindFrameMoveAndResize(key, frame) {
  const st = __plAdjustState;
  if (!st) return;

  frame.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    /* 旋转手柄由另一个函数处理 */
    if (e.target.closest('.pl-adjust-rotate-dot')) return;
    if (e.target.closest('.pl-adjust-rotate-badge')) return;

    const handle = e.target.closest('.pl-adjust-handle');
    const dir = handle ? handle.dataset.dir : 'move';

    e.preventDefault();
    e.stopPropagation();

    const stageRect = st.stage.getBoundingClientRect();
    const L0 = st.layout[key];
    const startLeftPct   = L0.left   || 0;
    const startTopPct    = L0.top    || 0;
    const startWidthPct  = L0.width  || 0;
    const startHeightPct = L0.height || 0;

    const sx = e.clientX;
    const sy = e.clientY;

    function move(ev) {
      const dxPct = (ev.clientX - sx) / stageRect.width  * 100;
      const dyPct = (ev.clientY - sy) / stageRect.height * 100;

      let newLeft   = startLeftPct;
      let newTop    = startTopPct;
      let newWidth  = startWidthPct;
      let newHeight = startHeightPct;

      if (dir === 'move') {
        newLeft = startLeftPct + dxPct;
        newTop  = startTopPct  + dyPct;
      } else {
        if (dir.indexOf('w') > -1) {
          newLeft  = startLeftPct + dxPct;
          newWidth = startWidthPct - dxPct;
        }
        if (dir.indexOf('e') > -1) {
          newWidth = startWidthPct + dxPct;
        }
        if (dir.indexOf('n') > -1) {
          newTop    = startTopPct + dyPct;
          newHeight = startHeightPct - dyPct;
        }
        if (dir.indexOf('s') > -1) {
          newHeight = startHeightPct + dyPct;
        }
      }

      /* 最小 4% 宽 / 高 */
      if (newWidth < 4) {
        if (dir.indexOf('w') > -1) newLeft = startLeftPct + startWidthPct - 4;
        newWidth = 4;
      }
      if (newHeight < 4) {
        if (dir.indexOf('n') > -1) newTop = startTopPct + startHeightPct - 4;
        newHeight = 4;
      }

      L0.left   = roundPl2(newLeft);
      L0.top    = roundPl2(newTop);
      L0.width  = roundPl2(newWidth);
      L0.height = roundPl2(newHeight);

      frame.style.left   = L0.left + '%';
      frame.style.top    = L0.top + '%';
      frame.style.width  = L0.width + '%';
      frame.style.height = L0.height + '%';

      updatePlAdjustInfo();
    }

    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      updatePlAdjustInfo();
    }

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
}

/* --- 旋转 --- */
function bindFrameRotate(key, frame) {
  const st = __plAdjustState;
  if (!st) return;

  const dot = frame.querySelector('.pl-adjust-rotate-dot');
  if (!dot) return;

  dot.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startRect = frame.getBoundingClientRect();
    const cx = startRect.left + startRect.width / 2;
    const cy = startRect.top  + startRect.height / 2;

    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    const startRotate = st.layout[key].rotate || 0;

    function move(ev) {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
      let newRotate = startRotate + (angle - startAngle);

      /* 归一化 -180 ~ 180 */
      while (newRotate > 180)  newRotate -= 360;
      while (newRotate < -180) newRotate += 360;
      newRotate = Math.round(newRotate);

      st.layout[key].rotate = newRotate;
      frame.style.transform = 'rotate(' + newRotate + 'deg)';

      const badge = frame.querySelector('.pl-adjust-rotate-badge');
      if (badge) {
        if (newRotate === 0) { badge.style.display = 'none'; }
        else { badge.style.display = ''; badge.textContent = newRotate + '°'; }
      }

      updatePlAdjustInfo();
    }

    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    }

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
}

/* --- 更新底部信息 --- */
function updatePlAdjustInfo() {
  const st = __plAdjustState;
  if (!st) return;
  const el = document.getElementById('plAdjustInfo');
  if (!el) return;

  const L = st.layout;
  function fmt(o) {
    return '{ left: ' + o.left + ', top: ' + o.top + ', width: ' + o.width + ', height: ' + o.height + ', rotate: ' + (o.rotate || 0) + ' }';
  }
  el.textContent =
    'content: ' + fmt(L.content) + '\n' +
    'sign:    ' + fmt(L.sign)    + '\n' +
    'footer:  ' + fmt(L.footer);
}

/* --- 保存 --- */
function savePlAdjustAll() {
  const st = __plAdjustState;
  if (!st) return;
  const ok = setPlCustomLayout(st.templateId, st.layout);
  if (!ok) return;
  showSimpleAlert('已保存', '位置已保存。<br>以后用这个模板都会使用新位置。');
  closePlAdjustTool();
  renderPriceListPreview();
}

/* --- 恢复默认 --- */
function resetPlAdjustAll() {
  const st = __plAdjustState;
  if (!st) return;
  if (!confirm('确定把三个框恢复到模板原始位置吗？（当前的调整会被丢弃）')) return;

  st.layout = JSON.parse(JSON.stringify(st.originalLayout));
  ['content', 'sign', 'footer'].forEach(function (key) {
    if (!st.layout[key]) st.layout[key] = { left: 0, top: 0, width: 0, height: 0, rotate: 0 };
    if (typeof st.layout[key].rotate !== 'number') st.layout[key].rotate = 0;
    applyFrameFromLayout(key);
  });
  updatePlAdjustInfo();
}

/* --- 复制参数（开发者） --- */
function copyPlAdjustResult() {
  const st = __plAdjustState;
  if (!st) return;
  const info = document.getElementById('plAdjustInfo');
  if (!info) return;

  const tpl = getPlTemplate(st.templateId);
  const text =
    "id: '" + (tpl ? tpl.id : '') + "',\n" +
    info.textContent;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      alert('已复制到剪贴板，粘贴到 PL_TEMPLATES 里即可。');
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

/* --- 关闭 --- */
function closePlAdjustTool() {
  const st = __plAdjustState;
  if (!st) return;
  if (st.overlay && st.overlay.parentNode) {
    st.overlay.parentNode.removeChild(st.overlay);
  }
  __plAdjustState = null;
}


/* ═══════════════════════════════════════════════════════
   [PL-18] 价目表模块初始化
   ═══════════════════════════════════════════════════════ */

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
   ║  第 18 段 · 启动初始化（最后一段）                    ║
   ║                                                      ║
   ║  内容索引：                                           ║
   ║   [BOOT-01] 存储启动初始化                            ║
   ║   [BOOT-02] 首页 4 按钮 / 首页宠语的重渲染触发         ║
   ║   [BOOT-03] 基础初始化（顶层立即执行）                ║
   ║   [BOOT-04] 事件绑定                                  ║
   ║   [BOOT-05] 小票相关初始化                            ║
   ║   [BOOT-06] 收尾（字体黑点 / 公告弹窗）               ║
   ║   [BOOT-07] 启动主流程                                ║
   ╚══════════════════════════════════════════════════════╝ */


/* ═══════════════════════════════════════════════════════
   [BOOT-01] 存储启动初始化

   1. 尝试打开 IndexedDB
   2. 申请"持久化存储"（避免浏览器在空间紧张时自动清掉）
   ═══════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════
   [BOOT-02] 首页 4 按钮 / 首页宠语的重渲染触发

   首页 4 个按钮是 HTML 里写死的 onclick，不需要绑。
   这里只负责"切回首页时重渲染宠语"——已经在第 16 段
   用 wrapShowPage 包装过了，不再重复。
   ═══════════════════════════════════════════════════════ */

/* （此段无需代码，留作说明） */


/* ═══════════════════════════════════════════════════════
   [BOOT-03] 基础初始化（顶层立即执行）
   ═══════════════════════════════════════════════════════ */

/* --- 今天日期：小票页接单日期 / 排单日期默认填今天 --- */
(function initToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const today = `${y}-${m}-${dd}`;
  if ($('orderDate'))    $('orderDate').value    = today;
  if ($('scheduleDate')) $('scheduleDate').value = today;
})();

/* --- 身份：填下拉 + 列表 + 把小票页的影子和数据同步 --- */
(function initIdentity() {
  renderIdentitySelect();
  renderIdentityList();

  const def = getDefaultIdentity();
  if ($('setIdentity')) $('setIdentity').value = def;

  /* ★ 从 localStorage 恢复署名 ID（修复 bug #1） */
  if ($('setName')) $('setName').value = getSavedArtistName();

  syncMainFromSettings();
})();

/* --- 权限：渲染列表 + 同步到主页 --- */
renderPermissionList();
syncPermissionsToMain();

/* --- 平台：填下拉 + 同步到主页 --- */
renderSetPlatformSelect();
syncPlatformsToMain(getDefaultPlatform());

/* --- 定金：读预设，回填主页和设置页 --- */
(function initDeposit() {
  const dp = getDepositPreset();
  if ($('setDepositMode')) $('setDepositMode').value = dp.mode;
  if ($('setDeposit'))     $('setDeposit').value     = dp.value;
  if ($('depositMode'))    $('depositMode').value    = dp.mode;
  if ($('deposit'))        $('deposit').value        = dp.value;
})();

/* --- 事件绑定：工期 / 定金 / 导航 --- */
bindWorkDaysLogic();
bindDepositUnitLogic();
bindNav();

/* --- 小票相关：图片上传 / 字体上传 / 应用设置 / 字体列表 --- */
setupReceiptImgInputs();
setupFontFileInput();
applyReceiptSettings();
renderCustomFontList();

/* --- 订单模块初始化（绑素材 / 要求上传 + 渲染待办列表） --- */
initTodoModule();

/* --- 监听小票宽度变化：重算背景图和票头票尾的尺寸 --- */
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

/* --- 窗口大小变化：重算票头 / 票尾 / 背景 / 字体黑点 --- */
window.addEventListener('resize', () => {
  ['header', 'footer'].forEach(kind => {
    const block = kind === 'header' ? $('outHeaderBlock') : $('outFooterBlock');
    const img   = kind === 'header' ? $('outHeaderImg')   : $('outFooterImg');
    if (!block || !img) return;
    if (!block.classList.contains('show')) return;

    const s = getReceiptSettings();
    const state = kind === 'header' ? s.headerImgState : s.footerImgState;

    /* 没有自定义尺寸 → 按容器宽度自适应 */
    if (!state || !state.w) {
      const blockW = block.offsetWidth || block.clientWidth || 0;
      img.style.width = blockW + 'px';
      img.style.height = 'auto';
      updateBlockHeight(block, img);
      positionHandle(kind);
    }
  });

  /* 背景图：没有自定义尺寸 → 重新铺满 */
  const bg = $('outBgImg');
  if (bg && bg.classList.contains('has-img')) {
    const s = getReceiptSettings();
    if (!s.bgImgState || !s.bgImgState.w) {
      resolveImageSrc(s.bgImg).then(url => {
        if (url) applyBgImg(url, { w: 0, h: 0, l: 0, t: 0, baseW: 0 }, s.bgOpacity);
      });
    }
  }

  /* 字体大小黑点位置 */
  updateFontSizeDot();
});

/* --- 初始添加一个稿件组 --- */
addGroup();

/* --- 上传预览图 --- */
bindUpload();

/* --- 预设匹配面板：焦点刷新 --- */
refreshPresetDatalist();

/* --- 字体加载完后重新应用小票设置（避免首次显示字体没加载好） --- */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    applyReceiptSettings();
  });
}


/* ═══════════════════════════════════════════════════════
   [BOOT-04] 事件绑定（导航 / 顶栏 / 首页）

   bindNav 是给左侧 / 底部导航的 .nav-item 绑点击。
   首页四个图标是 HTML 里写死的 onclick，不用绑。
   ═══════════════════════════════════════════════════════ */

function bindNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', function () {
      const target = this.dataset.page;
      if (target) showPage(target);
    });
  });
}


/* ═══════════════════════════════════════════════════════
   [BOOT-05] 收尾函数
   ═══════════════════════════════════════════════════════ */

/* 字体大小黑点位置：延迟计算，避免布局未稳导致偏差 */
function finalizeFontDot() {
  setTimeout(() => {
    try { updateFontSizeDot(); } catch (e) {}
  }, 80);
}


/* ═══════════════════════════════════════════════════════
   [BOOT-06] 启动主流程

   顺序：
     1. 打开 IDB（最多等 3 秒，超时降级）
     2. 自动迁移老数据
     3. 初始化排单 / 统计
     4. 单主默认排序
     5. schema 版本兜底
     6. 字体黑点位置
     7. 渲染首页宠语
     8. 小票页标签按钮
     9. 更新公告弹窗
   ═══════════════════════════════════════════════════════ */

(async function initApp() {
  /* 1. 打开 IDB */
  await initStorageOnStartup();

  /* 2. 自动迁移老数据 */
  await autoMigrateOnStartup();

  /* 3. 初始化排单 / 统计 */
  initScheduleModule();
  initStatsModule();

  /* 4. 单主列表默认排序按钮高亮 */
  (function initMasterSortDefault() {
    document.querySelectorAll('.master-sort-btn').forEach(btn => {
      if (btn.dataset.sort === __masterSort) btn.classList.add('active');
      else                                    btn.classList.remove('active');
    });
  })();

  /* 5. schema 版本兜底：老数据没有版本号时补一个 */
  (function initSchemaVersionFallback() {
    const v = localStorage.getItem(SCHEMA_VERSION_KEY);
    if (v === null) setSchemaVersion(SCHEMA_VERSION);
  })();

  /* 6. 字体黑点位置 */
  finalizeFontDot();

  /* 7. 渲染首页宠语 */
  renderHomeGreeting();

  /* 8. 小票页标签按钮初始状态 */
  updateReceiptTagBtn();

  /* 9. 更新公告（迁移完成后再弹，400ms 让页面先稳定） */
  const pending = getPendingAnnouncement();
  if (pending) {
    setTimeout(() => showAnnouncementModal(pending), 400);
  }
})();


/* ═══════════════════════════════════════════════════════
   文件结束
   ═══════════════════════════════════════════════════════ */
   

/* ═══════════════════════════════════════════════════════
   [PL-POS] 自定义位置 · 数据层 + 开发者模式
   ═══════════════════════════════════════════════════════ */

const PL_CUSTOM_LAYOUT_KEY = 'listReceiptPriceListCustomLayouts';
const PL_DEV_MODE_KEY      = 'listReceiptPlDevMode';

/* --- 读所有自定义位置 --- */
function getPlCustomLayouts() {
  try {
    const obj = JSON.parse(localStorage.getItem(PL_CUSTOM_LAYOUT_KEY));
    if (obj && typeof obj === 'object') return obj;
  } catch (e) {}
  return {};
}

/* --- 读某个模板的自定义位置 --- */
function getPlCustomLayout(templateId) {
  if (!templateId) return null;
  const all = getPlCustomLayouts();
  return all[templateId] || null;
}

/* --- 保存某个模板的自定义位置 --- */
function setPlCustomLayout(templateId, layout) {
  if (!templateId || !layout) return false;
  const all = getPlCustomLayouts();
  all[templateId] = JSON.parse(JSON.stringify(layout));
  try {
    localStorage.setItem(PL_CUSTOM_LAYOUT_KEY, JSON.stringify(all));
    return true;
  } catch (e) {
    alert('保存失败：存储空间已满。');
    return false;
  }
}

/* --- 清掉某个模板的自定义位置（恢复默认） --- */
function clearPlCustomLayout(templateId) {
  if (!templateId) return;
  const all = getPlCustomLayouts();
  if (all[templateId]) {
    delete all[templateId];
    try { localStorage.setItem(PL_CUSTOM_LAYOUT_KEY, JSON.stringify(all)); } catch (e) {}
  }
}

/* --- 开发者模式 --- */
function isPlDevMode() {
  try { return localStorage.getItem(PL_DEV_MODE_KEY) === '1'; } catch (e) { return false; }
}
/* 四舍五入保留 2 位小数（用于位置百分比） */
function roundPl2(n) {
  return Math.round(n * 100) / 100;
}

function enablePlDevMode() {
  try { localStorage.setItem(PL_DEV_MODE_KEY, '1'); } catch (e) {}
  console.log('✓ 开发者模式已开启。刷新页面后，调整工具里会出现"复制参数"按钮。');
}
function disablePlDevMode() {
  try { localStorage.removeItem(PL_DEV_MODE_KEY); } catch (e) {}
  console.log('✓ 开发者模式已关闭。');
}

/* --- 用户入口：打开位置编辑工具 --- */
function openPlPositionEditor() {
  openPlAdjustTool();
}