// ============================================
// IMKEREI TAGESPLANER – SHARED CONFIG
// Supabase Client, DB Helper, Auth Utilities
// ============================================

const SUPABASE_URL = "https://reyswuedptkyfdkmdpft.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleXN3dWVkcHRreWZka21kcGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjM0MDQsImV4cCI6MjA4NzQzOTQwNH0.mrqs7lPs3S7B62sKpTbuzuxAcodil04RQ7HUjuQHuKI";
let sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
// Gibt session.user zurück oder redirected zu app.html
// Im Preview-Modus (Fehler/keine Session) wird null zurückgegeben
// ============================================
async function checkAuth(opts) {
    opts = opts || {};
    try {
        var result = await sb.auth.getSession();
        if (result.data.session) {
            currentUser = result.data.session.user;
            initPresence(currentUser);
            return currentUser;
        }
    } catch(e) {
        console.warn('Auth check failed:', e);
    }
    
    if (opts.preview) {
        // Preview-Modus: kein Redirect, null zurückgeben
        // Preview-Modus
        return null;
    }
    
    // Standard: Redirect zu Login
    window.location.href = 'app.html';
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
    setTimeout(function(){ el.classList.remove('show'); }, dauer);
}

// ============================================
// PUBLIC CLIENT (ohne Session, für öffentliche Seiten)
// Verwendet von: trachtkarte.html, imkeradmin.html
// ============================================
function createPublicClient() {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
}

// ============================================
// PRESENCE – Echtzeit Online-Status
// Wird automatisch nach checkAuth() gestartet
// ============================================
var presenceChannel = null;

function initPresence(user) {
    if (!user || presenceChannel) return;
    var pageName = document.title || location.pathname.split('/').pop() || 'Unbekannt';
    presenceChannel = sb.channel('online-users', { config: { presence: { key: user.id } } });
    presenceChannel.subscribe(function(status) {
        if (status === 'SUBSCRIBED') {
            presenceChannel.track({
                user_id: user.id,
                email: user.email,
                page: pageName,
                online_at: new Date().toISOString()
            });
        }
    });
}

// ============================================
// COOKIE / STORAGE HINWEIS-BANNER
// Nur technisch notwendige Speicherungen (TDDDG §25 Abs.2)
// ============================================
(function() {
    if (localStorage.getItem('cookie_notice_accepted')) return;
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = '<div style="max-width:900px;margin:0 auto;display:flex;align-items:center;gap:16px;flex-wrap:wrap">'
        + '<p style="flex:1;margin:0;font-size:.88rem;line-height:1.5;color:#3D2E1F">Diese App verwendet ausschließlich <strong>technisch notwendige Speicherungen</strong> (localStorage, Service Worker) für Anmeldung und Funktionalität. Es werden keine Tracking-Cookies gesetzt. '
        + '<a href="datenschutz.html" style="color:#F5A623;text-decoration:underline">Mehr erfahren</a></p>'
        + '<button onclick="localStorage.setItem(\'cookie_notice_accepted\',\'1\');this.parentElement.parentElement.remove()" '
        + 'style="background:#1C1410;color:#fff;border:none;padding:10px 24px;border-radius:100px;font-weight:700;font-size:.85rem;cursor:pointer;white-space:nowrap">Verstanden</button>'
        + '</div>';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#FFFBF0;padding:16px 24px;box-shadow:0 -2px 12px rgba(28,20,16,.1);border-top:2px solid #F5A623;z-index:9999';
    document.body.appendChild(banner);
})();
