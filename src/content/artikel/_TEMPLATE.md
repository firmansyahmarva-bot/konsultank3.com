---
title: "Judul Artikel Pembahasan K3 yang Jelas dan Informatif"
description: "Ringkasan ringkas isi artikel antara 120-160 karakter untuk meta description mesin pencari dan ringkasan cuplikan kartu tautan."
pillar: "panduan-penerapan-smk3"
updated: 2026-11-10
draft: true
related:
  - "advanced-accident-investigation-124"
  - "apakah-ohsas-18001-35"
---

# Panduan Penulisan Konten Baru Koleksi Artikel

Gunakan template ini saat menambahkan publikasi artikel baru ke dalam direktori `src/content/artikel/`.

## Format Frontmatter Wajib
- **title** (string, wajib): Judul lengkap artikel (usahakan di bawah 60 karakter).
- **description** (string, wajib): Deskripsi meta (120 - 160 karakter).
- **pillar** (string, wajib): Salah satu dari 4 pilar rujukan berikut:
  1. `program-pengendalian-kebisingan`
  2. `alat-pelindung-diri`
  3. `penyakit-akibat-kerja`
  4. `panduan-penerapan-smk3`
- **updated** (date YYYY-MM-DD, wajib): Tanggal pembaruan atau publikasi artikel.
- **draft** (boolean, opsional, default `false`): Jika disetel `true`, artikel tidak akan di-build dan diabaikan saat kompilasi.
- **related** (list of slugs, opsional): Daftar slug artikel lain yang saling terkait untuk rekomendasi bacaan.

## Aturan Penamaan File
- Beri nama file markdown sesuai slug URL yang diinginkan, menggunakan huruf kecil dan tanda hubung (kebab-case), contoh: `panduan-keselamatan-kerja-ruang-terbatas.md`.
- File yang diawali dengan garis bawah `_` (seperti `_TEMPLATE.md`) otomatis diabaikan oleh sistem koleksi Astro.
- Rute artikel yang diterbitkan akan otomatis beralamat di: `/artikel/<slug>/`.
