## Why

Saat ini, men-drag card di Kanban Board sering menyebabkan card berpindah ke kolom yang salah (misal: drag di kolom "To Do" malah pindah ke "Doing"). Ini terjadi karena Pager menggunakan `transform: translateX(-50%)` pada container 200vw, yang menjadi CSS _containing block_ baru untuk elemen `position: fixed` — termasuk `DragOverlay` milik dnd-kit. Akibatnya overlay muncul jauh di sebelah kanan pointer, membuat collision detection salah membaca posisi card.

## What Changes

- **Pager.tsx**: Ganti mekanisme transisi halaman dari `transform: translateX` pada satu container besar ke `position: absolute` + `left`/`right` CSS animation pada masing-masing halaman, sehingga tidak ada ancestor yang memiliki CSS transform aktif saat drag berlangsung.
- **KanbanBoard.tsx**: Tambah `collisionDetection={pointerWithin}` pada `DndContext` sebagai safety net — collision detection berbasis posisi pointer, bukan bounding rect overlay.

## Capabilities

### New Capabilities

_(tidak ada — ini murni bug fix, tidak ada fitur baru)_

### Modified Capabilities

- `newtab-page-navigation`: Implementasi animasi slide halaman berubah dari transform-based ke left-property-based. Behavior yang terlihat user (horizontal slide, dot indicator, arrow controls, keyboard nav) **tidak berubah** — hanya teknik CSS internal yang diganti.

## Impact

- `entrypoints/newtab/` — tidak langsung, tapi Pager dipakai di sini
- `components/remindeen/pager/Pager.tsx` — file utama yang diubah
- `components/remindeen/kanban/KanbanBoard.tsx` — tambah `collisionDetection` prop
- Tidak ada perubahan API, dependensi eksternal, atau data schema
