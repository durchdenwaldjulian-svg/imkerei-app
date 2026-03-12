/* ============================================
   ACKERSCHLAGKARTEI – Supabase Config & Auth
   Gleiche Instanz wie Bienenplan
   ============================================ */

const SUPABASE_URL = "https://reyswuedptkyfdkmdpft.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleXN3dWVkcHRreWZka21kcGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjM0MDQsImV4cCI6MjA4NzQzOTQwNH0.mrqs7lPs3S7B62sKpTbuzuxAcodil04RQ7HUjuQHuKI";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUser = null;

const Auth = {
  async init() {
    const { data } = await sb.auth.getSession();
    if (data.session) {
      currentUser = data.session.user;
      this.showApp();
      return true;
    }
    this.showLogin();
    return false;
  },

  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      this.showError(error.message === 'Invalid login credentials'
        ? 'Falsche E-Mail oder Passwort'
        : error.message);
      return false;
    }
    currentUser = data.user;
    this.showApp();
    return true;
  },

  async register(email, password) {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) {
      this.showError(error.message);
      return false;
    }
    if (data.user && !data.session) {
      this.showError('Bestätigungs-E-Mail gesendet! Bitte prüfe dein Postfach.', true);
      return false;
    }
    currentUser = data.user;
    this.showApp();
    return true;
  },

  async logout() {
    await sb.auth.signOut();
    currentUser = null;
    this.showLogin();
  },

  showLogin() {
    document.body.classList.add('auth-mode');
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appShell').style.display = 'none';
  },

  showApp() {
    document.body.classList.remove('auth-mode');
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appShell').style.display = 'block';
    App.init();
  },

  showError(msg, isInfo) {
    const el = document.getElementById('authError');
    el.textContent = msg;
    el.className = 'auth-error' + (isInfo ? ' info' : '');
    el.style.display = 'block';
    if (isInfo) setTimeout(() => el.style.display = 'none', 5000);
  },

  toggleMode() {
    const login = document.getElementById('loginForm');
    const reg = document.getElementById('registerForm');
    const isLogin = login.style.display !== 'none';
    login.style.display = isLogin ? 'none' : 'block';
    reg.style.display = isLogin ? 'block' : 'none';
    document.getElementById('authError').style.display = 'none';
  }
};
