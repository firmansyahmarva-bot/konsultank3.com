/**
 * KonsultanK3.com - Interactive Features Engine 2026
 * Lightweight, zero-dependency modern UX enhancements:
 * - Mobile Navigation Drawer & Hamburger Toggle
 * - Interactive Schedule Cohort Tabs
 * - Real-Time Article & Guide Search / Filter
 * - Dynamic Rotating Social Proof Toast
 * - Interactive Hero Quote Preview
 * - Floating Back-To-Top Button
 * - Lead Magnet Quick Modal
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    initMobileNav();
    initScheduleTabs();
    initArticleFilter();
    initHeroQuoteCalculator();
    initSocialProofToast();
    initBackToTop();
    initToolkitModals();
  }

  /* ==========================================================================
     1. Mobile Navigation & Drawer
     ========================================================================== */
  function initMobileNav() {
    const siteHeader = document.querySelector('.site-header');
    const navWrapper = document.querySelector('.nav-wrapper');
    const navMenu = document.querySelector('.nav-menu');
    if (!siteHeader || !navWrapper || !navMenu) return;

    // Check if toggle button already exists
    let toggleBtn = document.querySelector('.mobile-menu-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-menu-toggle';
      toggleBtn.setAttribute('aria-label', 'Buka Menu Navigasi');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = `
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      `;
      navWrapper.appendChild(toggleBtn);
    }

    // Create backdrop overlay
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
    }

    function toggleMenu(forceClose = false) {
      const isOpen = forceClose ? false : !navMenu.classList.contains('is-open');
      navMenu.classList.toggle('is-open', isOpen);
      toggleBtn.classList.toggle('is-active', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      backdrop.classList.toggle('is-visible', isOpen);
      document.body.classList.toggle('mobile-nav-lock', isOpen);
    }

    toggleBtn.addEventListener('click', () => toggleMenu());
    backdrop.addEventListener('click', () => toggleMenu(true));

    // Close when clicking a nav link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(true));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        toggleMenu(true);
      }
    });
  }

  /* ==========================================================================
     2. Interactive Schedule Tabs
     ========================================================================== */
  const SCHEDULE_DATA = {
    blended: [
      {
        popular: true,
        ribbon: 'Paling Direkomendasikan',
        title: 'Ahli K3 Umum Kemnaker RI',
        date: '📅 10 – 23 November 2026 (Blended Learning)',
        slot: '🔥 Kuota Tersisa: 4 Kursi Tersedia',
        slotClass: 'urgent',
        features: [
          'Sertifikat, SKP & Lisensi Kemnaker RI',
          'Modul UU K3, Regulasi & Softcopy Lengkap',
          'PKL Virtual / Praktik Lapangan Terpadu',
          '100% Garansi Bimbingan Ujian Ulang'
        ],
        ctaText: 'Amankan Kursi via WhatsApp &rarr;',
        ctaClass: 'btn-primary',
        waQuery: 'Halo KonsultanK3, saya ingin mengamankan kursi Ahli K3 Umum Batch 10-23 November 2026'
      },
      {
        popular: false,
        title: 'K3 Penanggulangan Kebakaran Kelas D/C',
        date: '📅 18 – 20 November 2026 (3 Hari Pelatihan)',
        slot: 'ℹ️ Kuota Kelas: 6 Kursi Tersedia',
        slotClass: 'info',
        features: [
          'Sertifikat Resmi Kemnaker RI',
          'Praktik Pemadaman Api & APAR Nyata',
          'Standar Tanggap Darurat Gedung & Pabrik',
          'Instruktur Damkar & Senior Safety Officer'
        ],
        ctaText: 'Daftar Program Kebakaran &rarr;',
        ctaClass: 'btn-secondary',
        waQuery: 'Halo KonsultanK3, saya tertarik pendaftaran K3 Kebakaran Batch 18-20 November 2026'
      },
      {
        popular: false,
        title: 'Teknisi K3 Listrik Industri',
        date: '📅 25 – 29 November 2026 (5 Hari Pelatihan)',
        slot: 'ℹ️ Kuota Kelas: 5 Kursi Tersedia',
        slotClass: 'info',
        features: [
          'Sertifikat & Lisensi Teknisi K3 Listrik Kemnaker',
          'Praktik Pengukuran Grounding & PUIL 2020',
          'Audit Instalasi Panel & Proteksi Petir',
          'Diktat Teknis & Tool Pengujian Terstandar'
        ],
        ctaText: 'Daftar Program Listrik &rarr;',
        ctaClass: 'btn-secondary',
        waQuery: 'Halo KonsultanK3, saya tertarik pendaftaran Teknisi K3 Listrik Batch 25-29 November 2026'
      }
    ],
    inhouse: [
      {
        popular: true,
        ribbon: 'Program Custom Perusahaan',
        title: 'In-House Training Ahli K3 Umum & Spesialis',
        date: '📅 Tanggal & Jadwal Fleksibel (Sesuai Kebutuhan)',
        slot: '🏢 Khusus Tim Korporasi (Min. 5 Peserta)',
        slotClass: 'info',
        features: [
          'Diselenggarakan di Pabrik / Kantor Perusahaan Anda',
          'Studi Kasus & Analisis Risiko Spesifik Pabrik Klien',
          'Sertifikat Resmi Kemnaker RI untuk Seluruh Peserta',
          'Efisiensi Biaya Rombongan hingga 35%'
        ],
        ctaText: 'Minta Proposal In-House &rarr;',
        ctaClass: 'btn-primary',
        waQuery: 'Halo KonsultanK3, kami ingin meminta proposal penawaran In-House Training Ahli K3 untuk perusahaan kami'
      },
      {
        popular: false,
        title: 'Simulasi Tanggap Darurat & Fire Drill Pabrik',
        date: '📅 1 – 2 Hari (Weekend / Weekday Sesuai Jadwal)',
        slot: '🚒 Pelatihan Tim Fire Brigade Internal',
        slotClass: 'urgent',
        features: [
          'Praktik Live Fire APAR & Dry Chemical Powder',
          'Simulasi Evakuasi Gedung & Uji Sistem Fire Alarm',
          'Penyusunan Rencana Tanggap Darurat (ERP)',
          'Sertifikat Kompetensi Tim Peran Kebakaran'
        ],
        ctaText: 'Jadwalkan Fire Drill &rarr;',
        ctaClass: 'btn-secondary',
        waQuery: 'Halo KonsultanK3, kami ingin berkonsultasi mengenai simulasi fire drill dan pelatihan APAR di tempat kerja'
      },
      {
        popular: false,
        title: 'Refreshment K3 & Audit Ergonomi Kerja',
        date: '📅 Sesi 1 Hari / Workshop Terarah',
        slot: '👥 Kapasitas Peserta Tidak Terbatas',
        slotClass: 'info',
        features: [
          'Audit Postur & Ergonomi Pekerja (Metode REBA/RULA)',
          'Sosialisasi Pencegahan Penyakit Akibat Kerja (PAK)',
          'Laporan Evaluasi & Rekomendasi Medis Okupasi',
          'Cocok untuk Karyawan Pabrik & Perkantoran'
        ],
        ctaText: 'Konsultasi Ergonomi &rarr;',
        ctaClass: 'btn-secondary',
        waQuery: 'Halo KonsultanK3, kami berminat konsultasi program asesmen ergonomi dan pencegahan PAK'
      }
    ],
    fasttrack: [
      {
        popular: true,
        ribbon: 'Uji Kompetensi Portofolio',
        title: 'Sertifikasi BNSP Ahli K3 Muda & Madya',
        date: '📅 2 Hari (Asesmen & Wawancara Asesor LSP K3)',
        slot: '⚡ Jalur Pengalaman Kerja / Portofolio',
        slotClass: 'urgent',
        features: [
          'Sertifikat Kompetensi Nasional Berlogo Garuda BNSP',
          'Tanpa Pelatihan Teori Panjang (Langsung Uji Kompetensi)',
          'Bimbingan Pemberkasan Portofolio & Pra-Asesmen',
          'Berlaku Nasional & Standar Industri Kontraktor'
        ],
        ctaText: 'Cek Syarat Portofolio BNSP &rarr;',
        ctaClass: 'btn-primary',
        waQuery: 'Halo KonsultanK3, saya ingin info syarat asesmen portofolio sertifikasi BNSP Ahli K3'
      },
      {
        popular: false,
        title: 'Pelatihan & Lisensi Auditor Internal SMK3',
        date: '📅 3 Hari (Pelatihan Intensif 166 Kriteria)',
        slot: '📋 Persiapan Audit Eksternal PP 50/2012',
        slotClass: 'info',
        features: [
          'Sertifikat Kompetensi Auditor Internal SMK3',
          'Penguasaan Gap Analysis 64, 122, dan 166 Kriteria',
          'Teknik Wawancara & Pembuktian Temuan Audit',
          'Bonus Template Checklist & Format Laporan Audit'
        ],
        ctaText: 'Daftar Auditor Internal &rarr;',
        ctaClass: 'btn-secondary',
        waQuery: 'Halo KonsultanK3, saya ingin pendaftaran pelatihan Auditor Internal SMK3 PP 50/2012'
      },
      {
        popular: false,
        title: 'Pengawas Operasional Pertama (POP) Migas/Tambang',
        date: '📅 4 Hari Pembinaan & Sertifikasi LSP',
        slot: '🛢️ Syarat Wajib Pengawas Lapangan',
        slotClass: 'info',
        features: [
          'Sertifikasi Pengawas Operasional Berstandar BNSP/Kementerian',
          'Dasar Tanggung Jawab Hukum & Keselamatan Operasional',
          'Teknik Inspeksi & Safety Talk Harian (TBM)',
          'Modul Terpadu & Simulasi Uji Wawancara'
        ],
        ctaText: 'Info Jadwal POP &rarr;',
        ctaClass: 'btn-secondary',
        waQuery: 'Halo KonsultanK3, saya berminat informasi sertifikasi POP (Pengawas Operasional Pertama)'
      }
    ]
  };

  function initScheduleTabs() {
    const tabBtns = document.querySelectorAll('.schedule-tabs-nav .tab-btn');
    const cardRow = document.querySelector('.schedule-card-row');
    if (!tabBtns.length || !cardRow) return;

    const keys = ['blended', 'inhouse', 'fasttrack'];

    function renderCards(key) {
      const items = SCHEDULE_DATA[key] || SCHEDULE_DATA.blended;
      cardRow.style.opacity = '0';
      cardRow.style.transform = 'translateY(8px)';
      cardRow.style.transition = 'all 0.25s ease';

      setTimeout(() => {
        cardRow.innerHTML = items.map(item => `
          <div class="schedule-card ${item.popular ? 'popular' : ''}">
            ${item.popular ? `<span class="popular-ribbon">${item.ribbon}</span>` : ''}
            <div class="schedule-title">${item.title}</div>
            <div class="schedule-date">${item.date}</div>
            <div class="slot-indicator ${item.slotClass === 'info' ? 'slot-indicator-info' : ''}">
              <span>${item.slot}</span>
            </div>
            <ul class="schedule-features">
              ${item.features.map(f => `
                <li><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${f}</li>
              `).join('')}
            </ul>
            <a href="https://wa.me/6281392943146?text=${encodeURIComponent(item.waQuery)}" class="btn ${item.ctaClass}" target="_blank" style="width: 100%;">
              ${item.ctaText}
            </a>
          </div>
        `).join('');

        cardRow.style.opacity = '1';
        cardRow.style.transform = 'translateY(0)';
      }, 150);
    }

    tabBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCards(keys[index]);
      });
    });
  }

  /* ==========================================================================
     3. Article & Technical Archive Instant Search & Category Filter
     ========================================================================== */
  function initArticleFilter() {
    const archiveList = document.querySelector('.archive-list');
    if (!archiveList) return;

    const container = archiveList.parentElement;
    if (!container) return;

    // Check if filter bar already exists
    if (document.querySelector('.article-filter-wrapper')) return;

    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'article-filter-wrapper';
    filterWrapper.innerHTML = `
      <div class="search-box-row">
        <div class="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="article-search-input" placeholder="Ketik kata kunci (contoh: kebisingan, ergonomi, JSA, SMK3, ISO, APD)..." aria-label="Cari artikel dan SOP K3">
          <button type="button" id="search-clear-btn" aria-label="Reset pencarian" style="display:none;">&times;</button>
        </div>
        <div id="filter-counter" class="filter-counter">Menampilkan 20 artikel</div>
      </div>
      <div class="category-pills-row">
        <button type="button" class="cat-pill active" data-filter="all">Semua Topik</button>
        <button type="button" class="cat-pill" data-filter="regulasi">Regulasi & OHSAS</button>
        <button type="button" class="cat-pill" data-filter="analisis">JSA & Investigasi</button>
        <button type="button" class="cat-pill" data-filter="ergonomi">Ergonomi & Kesehatan</button>
        <button type="button" class="cat-pill" data-filter="standar">SOP & Sertifikasi</button>
      </div>
    `;

    container.insertBefore(filterWrapper, archiveList);

    const searchInput = document.getElementById('article-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const counter = document.getElementById('filter-counter');
    const catPills = filterWrapper.querySelectorAll('.cat-pill');
    const cards = archiveList.querySelectorAll('.archive-card');

    // Categorize cards
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      let cat = 'standar';
      if (text.includes('ohsas') || text.includes('iso') || text.includes('regulasi') || text.includes('permenaker') || text.includes('amdal')) {
        cat = 'regulasi';
      } else if (text.includes('jsa') || text.includes('analisa') || text.includes('investigasi') || text.includes('safety') || text.includes('behavior')) {
        cat = 'analisis';
      } else if (text.includes('ergonomi') || text.includes('fatigue') || text.includes('kesehatan') || text.includes('kebersihan')) {
        cat = 'ergonomi';
      }
      card.dataset.category = cat;
    });

    let activeFilter = 'all';

    function applyFilter() {
      const query = searchInput.value.trim().toLowerCase();
      clearBtn.style.display = query ? 'block' : 'none';

      let visibleCount = 0;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matchesQuery = !query || text.includes(query);
        const matchesCat = activeFilter === 'all' || card.dataset.category === activeFilter;

        if (matchesQuery && matchesCat) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      counter.textContent = `Menampilkan ${visibleCount} dari ${cards.length} artikel`;

      // Handle empty state
      let emptyMsg = archiveList.querySelector('.filter-empty-state');
      if (visibleCount === 0) {
        if (!emptyMsg) {
          emptyMsg = document.createElement('div');
          emptyMsg.className = 'filter-empty-state';
          emptyMsg.innerHTML = `
            <div style="font-size:2rem; margin-bottom:8px;">🔎</div>
            <p>Tidak ditemukan panduan untuk kata kunci "<strong>${escapeHtml(query)}</strong>".</p>
            <button type="button" class="btn btn-secondary" style="padding:6px 14px; font-size:0.85rem; margin-top:10px;" id="reset-filter-btn">Reset Pencarian</button>
          `;
          archiveList.appendChild(emptyMsg);
          emptyMsg.querySelector('#reset-filter-btn').addEventListener('click', resetAll);
        }
        emptyMsg.style.display = 'block';
      } else if (emptyMsg) {
        emptyMsg.style.display = 'none';
      }
    }

    function resetAll() {
      searchInput.value = '';
      activeFilter = 'all';
      catPills.forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
      applyFilter();
    }

    searchInput.addEventListener('input', applyFilter);
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      applyFilter();
    });

    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.dataset.filter;
        applyFilter();
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  /* ==========================================================================
     4. Dynamic Rotating Social Proof Toast
     ========================================================================== */
  const PROOF_EVENTS = [
    { name: 'PT Chandra Asri Petrochemical', action: 'mendaftar In-House K3', time: '3 menit lalu' },
    { name: 'HSE Supervisor PT Pamapersada', action: 'mengunduh Checklist Audit SMK3', time: '5 menit lalu' },
    { name: 'PT Wijaya Karya (WIKA)', action: 'mendaftar K3 Bekerja di Ketinggian', time: '8 menit lalu' },
    { name: 'dr. Hendrawan', action: 'mendaftar Calon Ahli K3 Umum Batch November', time: '12 menit lalu' },
    { name: 'PT Astra Honda Motor', action: 'mendaftar Sertifikasi K3 Kebakaran', time: '15 menit lalu' },
    { name: 'Safety Officer PT Semen Indonesia', action: 'mengunduh Formulir JSA Pengelasan', time: '18 menit lalu' }
  ];

  function initSocialProofToast() {
    let toast = document.querySelector('.live-toast');
    if (!toast) return;

    // Add close button if not present
    if (!toast.querySelector('.toast-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close-btn';
      closeBtn.setAttribute('aria-label', 'Tutup Notifikasi');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toast.style.display = 'none';
        isDismissed = true;
      });
      toast.appendChild(closeBtn);
    }

    let currentIndex = 0;
    let isDismissed = false;
    let isPaused = false;

    toast.addEventListener('mouseenter', () => { isPaused = true; });
    toast.addEventListener('mouseleave', () => { isPaused = false; });

    setInterval(() => {
      if (isDismissed || isPaused) return;

      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % PROOF_EVENTS.length;
        const ev = PROOF_EVENTS[currentIndex];

        const titleElem = toast.querySelector('div > div:first-child');
        const descElem = toast.querySelector('div > div:last-child');

        if (titleElem) titleElem.textContent = 'Pendaftaran / Aktivitas Terbaru';
        if (descElem) descElem.textContent = `${ev.name} ${ev.action} (${ev.time})`;

        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      }, 400);

    }, 8500);
  }

  /* ==========================================================================
     5. Hero Quick Quote Calculator Interactive Feedback
     ========================================================================== */
  const COURSE_METRICS = {
    'Pembinaan Ahli K3 Umum (Kemnaker RI)': {
      duration: '12 Hari (120 JP)',
      method: 'Blended Online + PKL',
      badge: '📜 Lisensi & SKP Kemnaker RI',
      promo: 'Diskon Early Bird 15%'
    },
    'K3 Penanggulangan Kebakaran (Kelas D/C/B/A)': {
      duration: '3 Hari Pelatihan',
      method: 'Teori + Praktik APAR & Hydrant',
      badge: '🚒 Sertifikat Kemnaker KEP.186',
      promo: 'Praktik Lapangan Nyata'
    },
    'Teknisi & Ahli K3 Listrik': {
      duration: '5 Hari Pelatihan',
      method: 'Teori + Praktik Grounding PUIL',
      badge: '⚡ Lisensi K3 Listrik Permenaker 12/2015',
      promo: 'Kapasitas Terbatas'
    },
    'Pendampingan Audit SMK3 PP 50/2012': {
      duration: '1 – 3 Bulan Pendampingan',
      method: 'Gap Analysis, SOP & Mock Audit',
      badge: '🏆 Target Bendera Emas 166 Kriteria',
      promo: 'Konsultasi Pra-Audit Gratis'
    },
    'In-House Training Corporate Khusus': {
      duration: 'Jadwal Fleksibel',
      method: 'On-Site di Fasilitas Perusahaan',
      badge: '🏢 Silabus Kustom Sesuai Risiko',
      promo: 'Hemat Biaya Tim hingga 35%'
    }
  };

  function initHeroQuoteCalculator() {
    const progSelect = document.getElementById('hero-prog');
    const qtySelect = document.getElementById('hero-qty');
    const quoteBox = document.querySelector('.hero-quote-box');
    if (!progSelect || !quoteBox) return;

    let previewBadge = quoteBox.querySelector('.quote-live-preview');
    if (!previewBadge) {
      previewBadge = document.createElement('div');
      previewBadge.className = 'quote-live-preview';
      quoteBox.appendChild(previewBadge);
    }

    function updateBadge() {
      const prog = progSelect.value;
      const data = COURSE_METRICS[prog] || COURSE_METRICS['Pembinaan Ahli K3 Umum (Kemnaker RI)'];
      previewBadge.innerHTML = `
        <span class="preview-item">⏱️ <strong>${data.duration}</strong></span>
        <span class="preview-item">💻 ${data.method}</span>
        <span class="preview-item badge-green">${data.badge}</span>
      `;
    }

    progSelect.addEventListener('change', updateBadge);
    if (qtySelect) qtySelect.addEventListener('change', updateBadge);
    updateBadge();
  }

  /* ==========================================================================
     6. Floating Back to Top Button
     ========================================================================== */
  function initBackToTop() {
    let btn = document.querySelector('.back-to-top-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'back-to-top-btn';
      btn.setAttribute('aria-label', 'Kembali ke atas');
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
      document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     7. Lead Magnet Toolkit Quick Modal
     ========================================================================== */
  function initToolkitModals() {
    // Accessible modal handler for instant preview & options
    const downloadLinks = document.querySelectorAll('.download-pill-btn');
    if (!downloadLinks.length) return;

    // Ensure links carry proper target attributes and styling
    downloadLinks.forEach(link => {
      link.setAttribute('rel', 'noopener');
    });
  }

})();
