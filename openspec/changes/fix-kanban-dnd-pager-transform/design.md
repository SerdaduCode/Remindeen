## Context

`Pager.tsx` mengelola dua halaman newtab dengan satu container `w-[200%]` yang digeser menggunakan `transform: translateX(-50%)` saat halaman kedua aktif. Menurut CSS spec, elemen dengan nilai `transform` selain `none` membentuk _containing block_ baru untuk descendant `position: fixed`. `DragOverlay` dari dnd-kit menggunakan `position: fixed` dan dirender di dalam tree KanbanBoard → ProductivityPage → Pager. Akibatnya, overlay diposisikan relatif terhadap container Pager (yang sudah bergeser), bukan relatif terhadap viewport, sehingga muncul di koordinat yang salah.

## Goals / Non-Goals

**Goals:**
- Hilangkan CSS `transform` dari ancestor mana pun yang membungkus `DragOverlay` saat drag aktif
- Pertahankan animasi slide horizontal yang terlihat user (sesuai spec `newtab-page-navigation`)
- Tambah `collisionDetection={pointerWithin}` sebagai safety net untuk collision detection berbasis pointer
- Tidak mengubah behavior keyboard nav, dot indicator, atau arrow controls

**Non-Goals:**
- Refactor keseluruhan Pager atau menambah fitur navigasi baru
- Mengubah performa rendering halaman lain (HabitTracker, HomePage)
- Menambah GPU acceleration khusus untuk animasi slide

## Decisions

### Keputusan 1: Ganti `transform` container 200vw dengan `left`-property animation per halaman

**Pendekatan sekarang:**
```
<div class="w-[200%]" style="transform: translateX(-50%)">
  <div class="w-1/2">Page 0</div>
  <div class="w-1/2">Page 1</div>
</div>
```

**Pendekatan baru:**
```
<div class="relative w-full overflow-hidden">
  <div style="left: activeIndex === 0 ? '0' : '-100%'" class="absolute inset-y-0 w-full transition-[left]">Page 0</div>
  <div style="left: activeIndex === 1 ? '0' : '100%'" class="absolute inset-y-0 w-full transition-[left]">Page 1</div>
</div>
```

**Mengapa ini:**
- Tidak ada `transform` pada ancestor mana pun → `position: fixed` descendant kembali relatif ke viewport
- Slide animation tetap ada secara visual (left bergerak dari 100% → 0)
- Perubahan minimal, tidak mengubah logika state atau event handler

**Alternatif yang dipertimbangkan:**
- _Opacity crossfade_: Menghilangkan animasi slide, melanggar spec `newtab-page-navigation` yang menyebut "horizontal slide"
- _Portal untuk DragOverlay_: Membutuhkan custom wrapper karena dnd-kit tidak mendukung portal natively; menambah kompleksitas tanpa memperbaiki akar masalah
- _will-change: transform tanpa transform aktual_: Tidak membantu, `will-change: transform` sendiri juga membuat containing block baru
- _Animasi slide per halaman dengan `transform: translateX`_: Sama saja — transform aktif pada halaman aktif tetap membuat containing block, sehingga bug tidak hilang

### Keputusan 2: `collisionDetection={pointerWithin}` pada DndContext

Menambah `pointerWithin` dari `@dnd-kit/core` sebagai collision detection strategy. `pointerWithin` mendeteksi kolom target berdasarkan posisi pointer, bukan bounding rect overlay. Ini lebih intuitif untuk kanban (pengguna mengarahkan pointer ke kolom tujuan) dan memastikan bahkan jika ada offset visual kecil, fungsionalitas drop tetap benar.

**Mengapa ini:** Default `rectIntersection` menggunakan bounding rect draggable yang diproyeksikan — lebih rentan terhadap edge case koordinat. `pointerWithin` lebih deterministik untuk layout kolom berdampingan.

## Risks / Trade-offs

- **`left` tidak GPU-accelerated** → Animasi menggunakan CPU compositing, bukan GPU. Untuk transisi halaman (yang jarang terjadi dan berlangsung 500ms), ini tidak signifikan secara performa. Pengguna tidak akan merasakan perbedaan.
- **`position: absolute` pada halaman non-aktif** → Halaman yang tidak aktif tetap ter-mount (tidak di-unmount). Ini sudah berlaku sebelumnya; behavior tidak berubah.
- **Kemungkinan halaman non-aktif masih menerima focus** → Diatasi dengan `pointer-events-none` dan `aria-hidden` yang sudah ada di Pager.

## Open Questions

_(tidak ada — scope change terbatas dan keputusan sudah solid)_
