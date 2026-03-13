/* ============================================
   APP – Router, Navigation, Init
   ============================================ */

const App = {
  currentPage: 'dashboard',
  pages: ['dashboard', 'schlaege', 'karte', 'kulturen', 'massnahmen', 'auswertung', 'duengeplaner', 'pflanzenschutz', 'humusbilanz', 'deckungsbeitrag', 'stoffstrom', 'wetter', 'bodenproben', 'fruchtfolge', 'lager'],
  mobileMenuOpen: false,

  init() {
    this.initIcons();
    this.bindNav();
    this.bindMobileNav();
    this.handleRoute();
    this.initDuengerVorlage();
    window.addEventListener('hashchange', () => this.handleRoute());
    // Dropzone für Flächenimport initialisieren
    setTimeout(() => { if (typeof Flaechenimport !== 'undefined') Flaechenimport.initDropzone(); }, 100);
  },

  initDuengerVorlage() {
    const sel = document.getElementById('massDuengerVorlage');
    if (sel && typeof Duengeplaner !== 'undefined') {
      sel.innerHTML = '<option value="">Manuell eingeben...</option>' +
        Object.keys(Duengeplaner.duengerStamm).map(name => `<option value="${name}">${name}</option>`).join('');
    }
  },

  initIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
      const name = el.dataset.icon;
      if (Icons[name]) el.innerHTML = Icons[name];
    });
    document.querySelectorAll('[data-stat-icon]').forEach(el => {
      const name = el.dataset.statIcon;
      if (Icons[name]) el.innerHTML = Icons.render(name, 22);
    });
    const logo = document.getElementById('sidebarLogoIcon');
    if (logo) logo.innerHTML = Icons.render('ernte', 22);
  },

  handleRoute() {
    const hash = location.hash.slice(1) || 'dashboard';
    const page = this.pages.includes(hash) ? hash : 'dashboard';
    this.navigateTo(page);
  },

  navigateTo(page) {
    this.currentPage = page;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === page);
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });

    if (location.hash.slice(1) !== page) {
      history.replaceState(null, '', '#' + page);
    }

    this.renderPage(page);
    this.closeMobileMenu();
  },

  async renderPage(page) {
    switch (page) {
      case 'dashboard': await Dashboard.render(); break;
      case 'schlaege': await Schlaege.render(); break;
      case 'karte': await Karte.render(); break;
      case 'kulturen': await Kulturen.render(); break;
      case 'massnahmen': await Massnahmen.render(); break;
      case 'auswertung': await Auswertung.render(); break;
      case 'duengeplaner': await Duengeplaner.render(); break;
      case 'pflanzenschutz': await Pflanzenschutz.render(); break;
      case 'humusbilanz': await Humusbilanz.render(); break;
      case 'deckungsbeitrag': await Deckungsbeitrag.render(); break;
      case 'stoffstrom': await Stoffstrom.render(); break;
      case 'wetter': await Wetter.render(); break;
      case 'bodenproben': await Bodenproben.render(); break;
      case 'fruchtfolge': await Fruchtfolge.render(); break;
      case 'lager': await Lager.render(); break;
    }
  },

  bindNav() {
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) this.navigateTo(page);
      });
    });
  },

  bindMobileNav() {
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('menu-btn')) {
          this.toggleMobileMenu();
        } else if (btn.dataset.page) {
          this.navigateTo(btn.dataset.page);
        }
      });
    });

    document.querySelectorAll('.mobile-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) this.navigateTo(page);
      });
    });

    const closeBtn = document.querySelector('.mobile-menu-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeMobileMenu());
  },

  toggleMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      overlay.classList.toggle('open', this.mobileMenuOpen);
    }
  },

  closeMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
      overlay.classList.remove('open');
      this.mobileMenuOpen = false;
    }
  }
};

// === TOAST ===
function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// === MODAL HELPERS ===
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// === FORMAT HELPERS ===
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatNumber(n, decimals = 2) {
  return parseFloat(n || 0).toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// === HTML ESCAPE (XSS-Schutz) ===
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// === INIT (Auth prüft, dann App starten) ===
document.addEventListener('DOMContentLoaded', () => Auth.init());
