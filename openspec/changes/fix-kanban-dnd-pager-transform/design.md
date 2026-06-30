## Context

`Pager.tsx` mengelola dua halaman newtab dengan satu container `w-[200%]` yang digeser menggunakan `transform: translateX(-50%)` saat halaman kedua aktif. Menurut CSS spec, elemen dengan nilai `transform` selain `none` membentuk _containing block_ baru untuk descendant `position: fixed`. `DragOverlay` dari dnd-kit menggunakan `position: fixed` dan dirender di dalam tree KanbanBoard → ProductivityPage → Pager. Akibatnya, overlay diposisikan relatif terhadap container Pager (yang sudah bergeser), bukan relatif terhadap viewport, sehingga muncul di koordinat yang salah.

**Temuan tambahan setelah Keputusan 1 & 2 diimplementasikan:** bug yang sama masih terjadi. Penyebabnya `<section>` di `ProductivityPage.tsx` yang membungkus `<KanbanBoard />` langsung memakai class `GLASS_PANEL`, yang menyertakan Tailwind `backdrop-blur-xl` → `backdrop-filter: blur(...)`. Sama seperti `transform`, `backdrop-filter` selain `none` membentuk containing block baru untuk descendant `position: fixed` (dikonfirmasi di MDN "Containing block": filter/backdrop-filter ≠ none, `will-change` yang menyebut properti tersebut, dan `contain: layout|paint|content|strict` semua masuk kategori yang sama dengan `transform`). Tidak seperti transform Pager, `backdrop-blur-xl` di sini bukan detail implementasi yang bisa dibuang — `productivity-page-layout` punya requirement "Glass visual treatment" yang secara eksplisit mewajibkan blur ini pada Kanban panel. Artinya pendekatan "hilangkan properti pemicu containing block dari ancestor" sudah mencapai batasnya: akan selalu ada kemungkinan ancestor baru (modal, panel lain, dst.) yang punya alasan sah untuk pakai `transform`/`filter`/`backdrop-filter`. Keputusan 3 menambahkan portal sebagai fix struktural yang membuat masalah ini tidak bisa terjadi lagi, bukan hanya untuk ancestor yang sudah diketahui hari ini.

## Goals / Non-Goals

**Goals:**
- Hilangkan CSS `transform` dari ancestor mana pun yang membungkus `DragOverlay` saat drag aktif
- Pertahankan animasi slide horizontal yang terlihat user (sesuai spec `newtab-page-navigation`)
- Tambah `collisionDetection={pointerWithin}` sebagai safety net untuk collision detection berbasis pointer
- Tidak mengubah behavior keyboard nav, dot indicator, atau arrow controls
- Pastikan `DragOverlay` terlihat sejajar dengan pointer terlepas dari ancestor apa pun (transform, filter, backdrop-filter, contain, will-change) — termasuk `GLASS_PANEL`'s `backdrop-blur-xl` yang merupakan requirement permanen, bukan implementasi yang bisa diubah

**Non-Goals:**
- Refactor keseluruhan Pager atau menambah fitur navigasi baru
- Mengubah performa rendering halaman lain (HabitTracker, HomePage)
- Menambah GPU acceleration khusus untuk animasi slide
- Mengubah atau menghapus `backdrop-blur-xl` pada glass panel (dilindungi requirement `productivity-page-layout`)

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
- _Portal untuk DragOverlay_: Saat keputusan ini diambil, dianggap menambah kompleksitas tanpa memperbaiki akar masalah — tapi lihat **Keputusan 3**: ancestor kedua (`backdrop-filter` pada glass panel) yang ditemukan saat verifikasi membuat portal jadi pilihan yang tepat, karena ancestor itu tidak bisa dihilangkan seperti transform Pager
- _will-change: transform tanpa transform aktual_: Tidak membantu, `will-change: transform` sendiri juga membuat containing block baru
- _Animasi slide per halaman dengan `transform: translateX`_: Sama saja — transform aktif pada halaman aktif tetap membuat containing block, sehingga bug tidak hilang

### Keputusan 2: `collisionDetection={pointerWithin}` pada DndContext

Menambah `pointerWithin` dari `@dnd-kit/core` sebagai collision detection strategy. `pointerWithin` mendeteksi kolom target berdasarkan posisi pointer, bukan bounding rect overlay. Ini lebih intuitif untuk kanban (pengguna mengarahkan pointer ke kolom tujuan) dan memastikan bahkan jika ada offset visual kecil, fungsionalitas drop tetap benar.

**Mengapa ini:** Default `rectIntersection` menggunakan bounding rect draggable yang diproyeksikan — lebih rentan terhadap edge case koordinat. `pointerWithin` lebih deterministik untuk layout kolom berdampingan.

### Keputusan 3: Portal `DragOverlay` ke `document.body`

```tsx
import { createPortal } from "react-dom";
// ...
<DndContext ...>
  <div className="flex flex-1 gap-3 overflow-x-auto">{/* columns */}</div>
  {createPortal(
    <DragOverlay>
      {activeTask && <TaskCard task={activeTask} onEdit={() => {}} dragging />}
    </DragOverlay>,
    document.body,
  )}
</DndContext>
```

`DragOverlay` tetap dirender sebagai child React dari `DndContext` — context dnd-kit (active id, transform, sensors) tetap mengalir lewat React tree seperti biasa. Yang berubah hanya node DOM tempat React me-mount-nya: bukan di dalam `KanbanBoard → ProductivityPage's GLASS_PANEL section → Pager`, melainkan langsung sebagai child `document.body`. Dengan demikian tidak ada ancestor DOM apa pun antara `DragOverlay` dan viewport — sehingga `position: fixed` di dalamnya selalu relatif ke viewport, terlepas dari `transform`/`filter`/`backdrop-filter`/`contain` yang dipakai ancestor mana pun, sekarang maupun di masa depan.

**Mengapa ini, bukan terus memburu ancestor satu-per-satu:** Keputusan 1 menghilangkan satu sumber containing block (Pager's transform), tapi bug yang sama langsung muncul lagi lewat sumber lain (`GLASS_PANEL`'s backdrop-filter) yang justru dilindungi requirement lain dan tidak boleh diubah. Memperbaiki ancestor demi ancestor adalah perbaikan yang tidak stabil — robust terhadap ancestor yang diketahui hari ini, rapuh terhadap yang berikutnya (modal baru, panel baru, dst.). Portal menghilangkan kelas bug ini secara permanen karena `DragOverlay` tidak lagi punya ancestor DOM untuk diperiksa.

**Alternatif yang dipertimbangkan:**
- _Hapus/kondisional-kan `backdrop-blur-xl` saat drag aktif_: Melanggar requirement "Glass visual treatment" milik `productivity-page-layout`; juga rapuh terhadap kenyataan bahwa flicker blur on/off saat drag terlihat aneh secara visual
- _Compensate offset secara manual via `modifiers` dnd-kit_: Mengharuskan menghitung ulang offset containing block setiap render (bounding rect dari ancestor blur) — kompleks dan rapuh terhadap perubahan layout
- _Tetap perbaiki ancestor satu-per-satu setiap kali ditemukan_: Ini pendekatan yang sudah gagal dua kali (Pager, lalu GLASS_PANEL); tidak scalable

## Risks / Trade-offs

- **`left` tidak GPU-accelerated** → Animasi menggunakan CPU compositing, bukan GPU. Untuk transisi halaman (yang jarang terjadi dan berlangsung 500ms), ini tidak signifikan secara performa. Pengguna tidak akan merasakan perbedaan.
- **`position: absolute` pada halaman non-aktif** → Halaman yang tidak aktif tetap ter-mount (tidak di-unmount). Ini sudah berlaku sebelumnya; behavior tidak berubah.
- **Kemungkinan halaman non-aktif masih menerima focus** → Diatasi dengan `pointer-events-none` dan `aria-hidden` yang sudah ada di Pager.
- **Portal & stacking order** → Setelah dipindah ke `document.body`, overlay muncul sebagai child terakhir `<body>`, yang secara default tampil di atas elemen lain (stacking context root). Karena drag hanya berlangsung saat tidak ada modal lain terbuka (`TaskFormModal`/`ApiKeysModal` menutup form saat drag dimulai), tidak ada konflik z-index yang teridentifikasi.
- **CSS global tetap berlaku** → Tidak ada CSS Module/Shadow DOM scoping di newtab entrypoint ini, jadi class Tailwind pada `TaskCard` tetap ter-style dengan benar meski di-mount di luar tree visual aslinya.

## Open Questions

_(tidak ada — scope change terbatas dan keputusan sudah solid)_
