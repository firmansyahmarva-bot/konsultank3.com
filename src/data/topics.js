export const pillars = {
  'program-pengendalian-kebisingan': {
    id: 'program-pengendalian-kebisingan',
    title: 'Program Pengendalian Kebisingan Industri',
    shortName: 'Pengendalian Kebisingan',
    path: '/program-pengendalian-kebisingan/',
    anchorText: 'Panduan Lengkap Program Pengendalian Kebisingan Industri & Standar NAB'
  },
  'alat-pelindung-diri': {
    id: 'alat-pelindung-diri',
    title: 'Standar Pemilihan & Penggunaan APD',
    shortName: 'Alat Pelindung Diri',
    path: '/alat-pelindung-diri/',
    anchorText: 'Panduan Lengkap Standar Pemilihan & Penggunaan Alat Pelindung Diri (APD)'
  },
  'penyakit-akibat-kerja': {
    id: 'penyakit-akibat-kerja',
    title: 'Pencegahan Penyakit Akibat Kerja (PAK)',
    shortName: 'Penyakit Akibat Kerja',
    path: '/penyakit-akibat-kerja/',
    anchorText: 'Panduan Lengkap Diagnosis & Pencegahan Penyakit Akibat Kerja (PAK)'
  },
  'panduan-penerapan-smk3': {
    id: 'panduan-penerapan-smk3',
    title: 'Panduan Penerapan & Audit SMK3',
    shortName: 'Audit SMK3 PP 50/2012',
    path: '/panduan-penerapan-smk3/',
    anchorText: 'Panduan Lengkap Penerapan & Pendampingan Audit SMK3 PP 50/2012'
  }
};

export const topicArticles = [
  // --- Pillar 1: Kebisingan ---
  {
    path: '/downloads/Tabel-Nilai-Ambang-Batas-Kebisingan-K3.html',
    title: 'Tabel Nilai Ambang Batas (NAB) Kebisingan Tempat Kerja',
    pillar: 'program-pengendalian-kebisingan',
    desc: 'Tabel batas pajanan kebisingan harian per jam kerja sesuai standar Permenaker No. 5 Tahun 2018.'
  },
  {
    path: '/contoh-lembar-checklist-amdal-gedung-862.html',
    title: 'Contoh Lembar Checklist AMDAL & Dokumen Lingkungan Gedung',
    pillar: 'program-pengendalian-kebisingan',
    desc: 'Checklist inspeksi pemantauan lingkungan gedung, baku mutu emisi, dan ambang batas kebisingan pagar perimeter.'
  },
  {
    path: '/cara-mensosialisasikan-k3-961.html',
    title: 'Strategi Efektif Mensosialisasikan K3 dan Membangun Budaya Safety',
    pillar: 'program-pengendalian-kebisingan',
    desc: 'Metode edukasi dan sosialisasi kepatuhan keselamatan, rambu kebisingan, dan program konservasi pendengaran pekerja.'
  },
  {
    path: '/contoh-format-instruksi-kerja-sebuah-perusahaan-755.html',
    title: 'Contoh Format Instruksi Kerja (SOP / IK) K3 di Perusahaan',
    pillar: 'program-pengendalian-kebisingan',
    desc: 'Template format instruksi kerja operasional mesin, isolasi kebisingan, dan standar keselamatan teknis bengkel.'
  },
  {
    path: '/basic-sefety-dan-healt-training-171.html',
    title: 'Basic Safety and Health Training: Fondasi Budaya K3 untuk Pekerja Industri',
    pillar: 'program-pengendalian-kebisingan',
    desc: 'Materi pelatihan dasar keselamatan dan kesehatan lingkungan kerja, pengendalian faktor bahaya fisika dan bising.'
  },

  // --- Pillar 2: APD ---
  {
    path: '/downloads/Formulir-JSA-Job-Safety-Analysis.html',
    title: 'Formulir Standar Job Safety Analysis (JSA)',
    pillar: 'alat-pelindung-diri',
    desc: 'Template analisis keselamatan tugas dan penetapan APD wajib per langkah pekerjaan lapangan.'
  },
  {
    path: '/aspek-k3-bekerja-di-ketinggian-1522.html',
    title: 'Aspek K3 Bekerja di Ketinggian (Working at Height)',
    pillar: 'alat-pelindung-diri',
    desc: 'Standar penggunaan full body harness, anchor point, lifeline, dan APD pencegah jatuh di ketinggian.'
  },
  {
    path: '/contoh-job-safety-analysis-pengelasan-815.html',
    title: 'Contoh Job Safety Analysis (JSA) Pekerjaan Pengelasan (Welding)',
    pillar: 'alat-pelindung-diri',
    desc: 'Identifikasi bahaya panas, percikan api, dan spesifikasi APD kedok las, respirator uap logam, serta sarung tangan kulit.'
  },
  {
    path: '/analisa-pekerjaan-k3-task-analysis-224.html',
    title: 'Analisa Pekerjaan K3 (Job Task Analysis): Panduan Praktis',
    pillar: 'alat-pelindung-diri',
    desc: 'Metodologi pembedahan langkah tugas kritis untuk menentukan perlindungan dan spesifikasi APD standar SNI/ANSI.'
  },
  {
    path: '/basic-safety-training-k3-676.html',
    title: 'Basic Safety Training (BST) K3 Industri & Konstruksi',
    pillar: 'alat-pelindung-diri',
    desc: 'Silabus pelatihan dasar kepatuhan APD, rambu peringatan bahaya, dan disiplin keselamatan kerja kontraktor.'
  },

  // --- Pillar 3: PAK ---
  {
    path: '/bahaya-fatigue-dan-cara-mencegahnya-1508.html',
    title: 'Bahaya Fatigue (Kelelahan Kerja) dan Cara Mencegahnya di Industri',
    pillar: 'penyakit-akibat-kerja',
    desc: 'Mekanisme pencegahan kelelahan kronis pekerja shift malam, jadwal istirahat, dan pencegahan penurunan konsentrasi.'
  },
  {
    path: '/beberapa-prinsip-ergonomi-288.html',
    title: 'Prinsip-Prinsip Dasar Ergonomi di Tempat Kerja',
    pillar: 'penyakit-akibat-kerja',
    desc: 'Penyelarasan antropometri tubuh manusia dan stasiun kerja untuk mencegah gangguan otot rangka (MSDs).'
  },
  {
    path: '/cara-penerapan-dan-pendekatan-ergonomi-285.html',
    title: 'Cara Penerapan dan Pendekatan Ergonomi di Stasiun Kerja Industri dan Perkantoran',
    pillar: 'penyakit-akibat-kerja',
    desc: 'Pedoman penataan kursi kerja, postur netral, pencahayaan layar display, dan teknik angkat-angkut aman.'
  },
  {
    path: '/bclsbasic-cardiac-life-support-for-paramedic-111.html',
    title: 'Basic Cardiac Life Support (BCLS) & Pertolongan Pertama Gawat Darurat K3',
    pillar: 'penyakit-akibat-kerja',
    desc: 'Protokol resusitasi jantung paru (RJP), pertolongan darurat henti nafas, dan kesiapsiagaan klinik kedokteran kerja.'
  },
  {
    path: '/check-list-kebersihan-rumah-sakit-831.html',
    title: 'Checklist K3 & Kebersihan Sanitasi Rumah Sakit (K3RS)',
    pillar: 'penyakit-akibat-kerja',
    desc: 'Kriteria pengawasan sanitasi medis, penanganan limbah B3 jarum suntik, dan pencegahan infeksi nosokomial okupasi.'
  },

  // --- Pillar 4: SMK3 ---
  {
    path: '/downloads/Checklist-Audit-SMK3-166-Kriteria.html',
    title: 'Checklist Audit SMK3 166 Kriteria (PP No. 50 Tahun 2012)',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Lembar audit mandiri lengkap 166 kriteria untuk persiapan perolehan sertifikat dan Bendera Emas Kemnaker RI.'
  },
  {
    path: '/advanced-accident-investigation-124.html',
    title: 'Investigasi Kecelakaan Kerja Tingkat Lanjut (Advanced Accident Investigation)',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Metode analisis akar penyebab kecelakaan (Root Cause Analysis - RCA) dan pelaporan insiden formal sistem SMK3.'
  },
  {
    path: '/apakah-ohsas-18001-35.html',
    title: 'Mengenal Standar OHSAS 18001 & Migrasi ke ISO 45001:2018',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Transformasi standar keselamatan OHSAS 18001 menuju ISO 45001 serta integrasinya dengan klausul audit SMK3 nasional.'
  },
  {
    path: '/bagimana-kinerja-ohsas-18001-52.html',
    title: 'Evaluasi Kinerja Sistem Manajemen K3: Dari OHSAS 18001 Menuju ISO 45001',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Indikator leading dan lagging indicator keselamatan kerja, evaluasi sasaran K3, dan siklus tinjauan manajemen.'
  },
  {
    path: '/apakah-iso-9001-2008-80.html',
    title: 'Memahami Sistem Manajemen Mutu ISO 9001 dan Integrasinya dengan K3',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Harmonisasi sistem mutu ISO 9001 dan SMK3 PP 50/2012 melalui struktur High Level Structure (HLS) Annex SL.'
  },
  {
    path: '/audit-sdm-makalah.html',
    title: 'Audit Sumber Daya Manusia dan Keselamatan Kerja: Panduan dan Metodologi',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Pengujian kepatuhan kompetensi personil K3, pemenuhan lisensi Kemnaker, dan efektivitas pelatihan keselamatan.'
  },
  {
    path: '/behavior-based-safety-127.html',
    title: 'Behavior Based Safety (BBS): Membangun Budaya Keselamatan Berbasis Perilaku',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Observasi keselamatan kerja tanpa saling menyalahkan, umpan balik langsung, dan reduksi tindakan tidak aman (unsafe acts).'
  },
  {
    path: '/berbagai-bentuk-komitmen-yang-dapat-ditunjuhkan-oleh-pimpinan-dan-manajemen-dalam-k3-195.html',
    title: 'Bentuk Komitmen Nyata Pimpinan dan Manajemen Puncak dalam K3',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Penyusunan kebijakan K3 tertulis, alokasi sumber daya finansial, dan keterlibatan aktif pimpinan dalam tinjauan manajemen.'
  },
  {
    path: '/certified-safety-officersertifikat-k3-migas-level-pelaksa-146.html',
    title: 'Sertifikasi Safety Officer K3 Migas Level Pelaksana: Silabus dan Persyaratan',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Kompetensi teknis pengawas lapangan, izin kerja panas/dingin, dan persyaratan sertifikasi personel sektor migas.'
  },
  {
    path: '/contoh-bentuk-laporan-qc-788.html',
    title: 'Contoh Format Laporan Quality Control (QC) & K3 Proyek',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Integrasi laporan ketidaksesuaian mutu dan laporan bahaya keselamatan konstruksi terpadu.'
  },
  {
    path: '/contoh-komunikasi-vertikal-dan-horizontal-954.html',
    title: 'Pola Komunikasi Vertikal dan Horizontal dalam Sistem Pelaporan K3',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Arsitektur komunikasi pelaporan bahaya near-miss dari pekerja lapangan ke P2K3 dan dewan direksi perusahaan.'
  },
  {
    path: '/contoh-kuesioner-tentang-hrd-808.html',
    title: 'Contoh Kuesioner HRD & Asesmen Budaya Keselamatan Kerja (Safety Climate)',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Instrumen survei persepsi karyawan terhadap komitmen keselamatan kerja manajemen dan fasilitas kerja sehat.'
  },
  {
    path: '/apa-pentingtinya-iso-26000-357.html',
    title: 'Mengenal Standar ISO 26000: Panduan Tanggung Jawab Sosial (CSR) dan K3',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Prinsip ketenagakerjaan beretika, perlindungan keselamatan buruh, dan tanggung jawab sosial korporasi.'
  },
  {
    path: '/bagaimana-miso-26000-membantu-organisasi-360.html',
    title: 'Bagaimana ISO 26000 Membantu Organisasi Membangun Keberlanjutan dan Keselamatan Kerja',
    pillar: 'panduan-penerapan-smk3',
    desc: 'Penyelarasan program K3 perusahaan dengan standar sustainabilitas global dan relasi pemangku kepentingan.'
  }
];

export function normalizePath(p) {
  if (!p) return '';
  return p.split('#')[0].split('?')[0];
}

export function getPillarById(id) {
  return pillars[id] || null;
}

export function getPillarByPath(p) {
  const norm = normalizePath(p);
  for (const pillar of Object.values(pillars)) {
    if (normalizePath(pillar.path) === norm) {
      return pillar;
    }
  }
  return null;
}

export function getPillarForArticle(articlePath) {
  const norm = normalizePath(articlePath);
  const found = topicArticles.find(a => normalizePath(a.path) === norm);
  if (!found) return null;
  return pillars[found.pillar] || null;
}

export function getArticlesForPillar(pillarId) {
  return topicArticles.filter(a => a.pillar === pillarId);
}

export function getRelatedArticles(currentPath, limit = 3) {
  const norm = normalizePath(currentPath);
  const article = topicArticles.find(a => normalizePath(a.path) === norm);
  if (!article) {
    // If not in legacy topic articles, check if it's a pillar itself or other page
    return [];
  }
  const siblings = topicArticles.filter(a => a.pillar === article.pillar);
  if (siblings.length <= 1) return [];

  const idx = siblings.findIndex(a => normalizePath(a.path) === norm);
  const results = [];
  for (let offset = 1; offset < siblings.length && results.length < limit; offset++) {
    const nextIdx = (idx + offset) % siblings.length;
    if (nextIdx !== idx) {
      results.push(siblings[nextIdx]);
    }
  }
  return results;
}
