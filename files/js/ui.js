// js/ui.js — shared UI helpers used across all pages

// ── Toast ─────────────────────────────────────────────────────────────────
export function toast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = Object.assign(document.createElement('div'), { id: 'toast-container' });
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; setTimeout(() => el.remove(), 400); }, 3000);
}

// ── Modal ─────────────────────────────────────────────────────────────────
export function openModal({ title, body, footer }) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="btn btn-icon" id="modal-close-btn" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body" id="modal-body-inner">${body}</div>
      ${footer ? `<div style="padding:0 24px 20px"><div class="flex-end">${footer}</div></div>` : ''}
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
}

export function closeModal() {
  document.getElementById('modal-overlay')?.remove();
}

// ── Badge helpers ─────────────────────────────────────────────────────────
export function statusBadge(status) {
  const map = {
    OPTIMAL:  ['optimal',  'Optimal'],
    WARNING:  ['warning',  'Warning'],
    CRITICAL: ['critical', 'Critical'],
    IN_REPAIR:['in_repair','In Repair'],
    SCRAPPED: ['scrapped', 'Scrapped'],
  };
  const [cls, label] = map[status] || ['scrapped', status];
  return `<span class="badge badge-${cls}">${label}</span>`;
}

export function resultBadge(result) {
  const map = {
    PENDING:   ['pending',   'Pending'],
    DONE:      ['done',      'Done'],
    ESCALATED: ['escalated', 'Escalated'],
  };
  const [cls, label] = map[result] || ['pending', result];
  return `<span class="badge badge-${cls}">${label}</span>`;
}

// ── DOM helpers ───────────────────────────────────────────────────────────
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export function show(el) { el?.classList.remove('hidden'); }
export function hide(el) { el?.classList.add('hidden'); }

export function spinner() {
  return `<div class="loading-center"><div class="spinner"></div></div>`;
}

// ── Auth guard ────────────────────────────────────────────────────────────
export function getUser() {
  try { return JSON.parse(localStorage.getItem('iems_user')); } catch { return null; }
}
export function setUser(u) { localStorage.setItem('iems_user', JSON.stringify(u)); }
export function logout() {
  localStorage.removeItem('iems_token');
  localStorage.removeItem('iems_user');
  window.location.href = '/';
}

// ── Truncate ──────────────────────────────────────────────────────────────
export function trunc(str, n = 40) {
  return str && str.length > n ? str.slice(0, n) + '…' : (str || '');
}
