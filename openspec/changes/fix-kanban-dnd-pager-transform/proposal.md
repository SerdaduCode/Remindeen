## Why

Saat ini, men-drag card di Kanban Board sering menyebabkan card berpindah ke kolom yang salah (misal: drag di kolom "To Do" malah pindah ke "Doing"). Ini terjadi karena Pager menggunakan `transform: translateX(-50%)` pada container 200vw, yang menjadi CSS _containing block_ baru untuk elemen `position: fixed` — termasuk `DragOverlay` milik dnd-kit. Akibatnya overlay muncul jauh di sebelah kanan pointer, membuat collision detection salah membaca posisi card.

**Update setelah verifikasi manual (task 3.2):** Setelah Pager.tsx diperbaiki, bug yang sama masih terlihat. Ancestor lain ternyata juga membentuk containing block: `<section>` pembungkus `KanbanBoard` di `ProductivityPage.tsx` memakai class `GLASS_PANEL` yang menyertakan `backdrop-blur-xl` (`backdrop-filter`), dan `backdrop-filter` selain `none` juga membentuk containing block baru untuk descendant `position: fixed` — kategori CSS yang sama dengan `transform`. Berbeda dari transform Pager yang bisa dihilangkan, blur ini adalah requirement yang disengaja (lihat `productivity-page-layout` — "Glass visual treatment"), jadi tidak bisa sekadar dihapus. Solusinya adalah membuat `DragOverlay` tidak punya ancestor DOM sama sekali antara dirinya dan viewport, terlepas dari ancestor mana pun yang membungkusnya sekarang atau di masa depan.

## What Changes

- **Pager.tsx**: Ganti mekanisme transisi halaman dari `transform: translateX` pada satu container besar ke `position: absolute` + `left`/`right` CSS animation pada masing-masing halaman, sehingga tidak ada ancestor yang memiliki CSS transform aktif saat drag berlangsung.
- **KanbanBoard.tsx**: Tambah `collisionDetection={pointerWithin}` pada `DndContext` sebagai safety net — collision detection berbasis posisi pointer, bukan bounding rect overlay.
- **KanbanBoard.tsx**: Render `<DragOverlay>` lewat `createPortal` ke `document.body`, sehingga overlay tidak lagi punya ancestor DOM (Pager, glass panel `GLASS_PANEL`, atau wrapper apa pun di masa depan) yang bisa membentuk containing block baru. `DragOverlay` tetap berada di dalam React tree (di bawah `DndContext`) sehingga context dnd-kit tetap berfungsi — hanya lokasi DOM-nya yang dipindah.

## Capabilities

### New Capabilities

_(tidak ada — ini murni bug fix, tidak ada fitur baru)_

### Modified Capabilities

- `newtab-page-navigation`: Implementasi animasi slide halaman berubah dari transform-based ke left-property-based. Behavior yang terlihat user (horizontal slide, dot indicator, arrow controls, keyboard nav) **tidak berubah** — hanya teknik CSS internal yang diganti.
- `kanban-tasks`: Requirement baru bahwa drag overlay SHALL terlihat sejajar dengan pointer terlepas dari efek CSS (transform/filter/backdrop-filter/dll) milik ancestor mana pun — menggantikan scenario yang sebelumnya (kurang tepat) ditempatkan di bawah `newtab-page-navigation`.

## Impact

- `entrypoints/newtab/` — tidak langsung, tapi Pager dipakai di sini
- `components/remindeen/pager/Pager.tsx` — file utama yang diubah
- `components/remindeen/kanban/KanbanBoard.tsx` — tambah `collisionDetection` prop, dan portal `DragOverlay` ke `document.body`
- `components/remindeen/productivity/ProductivityPage.tsx` — tidak diubah, tapi ini sumber containing block kedua (`GLASS_PANEL` / `backdrop-blur-xl`) yang ditemukan saat verifikasi
- Tidak ada perubahan API, dependensi eksternal, atau data schema
