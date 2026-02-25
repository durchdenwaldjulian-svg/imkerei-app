// ============================================
// IMKEREI TAGESPLANER – SHARED CONFIG
// Supabase Client, DB Helper, Auth Utilities
// ============================================

const SUPABASE_URL = "https://reyswuedptkyfdkmdpft.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleXN3dWVkcHRreWZka21kcGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjM0MDQsImV4cCI6MjA4NzQzOTQwNH0.mrqs7lPs3S7B62sKpTbuzuxAcodil04RQ7HUjuQHuKI";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// ============================================
// DB HELPER - Supabase CRUD
// ============================================
const db = {
    async upsert(table, data) {
        var result = await sb.from(table).upsert(data);
        if (result.error) console.error('DB upsert error:', table, result.error);
        if (typeof showSaved === 'function') showSaved();
        return result;
    },
    async insert(table, data) {
        var result = await sb.from(table).insert(data);
        if (result.error) console.error('DB insert error:', table, result.error);
        if (typeof showSaved === 'function') showSaved();
        return result;
    },
    async update(table, data, id) {
        var result = await sb.from(table).update(data).eq('id', id);
        if (result.error) console.error('DB update error:', table, result.error);
        if (typeof showSaved === 'function') showSaved();
        return result;
    },
    async del(table, id) {
        var result = await sb.from(table).delete().eq('id', id);
        if (result.error) console.error('DB delete error:', table, result.error);
        if (typeof showSaved === 'function') showSaved();
        return result;
    },
    async delWhere(table, col, val) {
        var result = await sb.from(table).delete().eq(col, val);
        if (result.error) console.error('DB delWhere error:', table, result.error);
        return result;
    }
};

// ============================================
// AUTH HELPER für externe Seiten
// Gibt session.user zurück oder redirected zu index.html
// Im Preview-Modus (Fehler/keine Session) wird null zurückgegeben
// ============================================
async function checkAuth(opts) {
    opts = opts || {};
    try {
        var result = await sb.auth.getSession();
        if (result.data.session) {
            currentUser = result.data.session.user;
            return currentUser;
        }
    } catch(e) {
        console.warn('Auth check failed:', e);
    }
    
    if (opts.preview) {
        // Preview-Modus: kein Redirect, null zurückgeben
        console.log('🔓 Preview-Modus – Demo-Daten werden geladen');
        return null;
    }
    
    // Standard: Redirect zu Login
    window.location.href = 'index.html';
    return null;
}

// ============================================
// TOAST HELPER (funktioniert in allen Seiten)
// ============================================
function showToast(msg, typ, dauer) {
    typ = typ || '';
    dauer = dauer || 2500;
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (typ ? ' ' + typ : '');
    
    // Für externe Seiten mit anderem Toast-System
    if (el.style.display !== undefined && !el.classList.contains('show')) {
        el.style.display = 'block';
        setTimeout(function(){ el.style.display = 'none'; }, dauer);
    } else {
        setTimeout(function(){ el.classList.remove('show'); }, dauer);
    }
}
