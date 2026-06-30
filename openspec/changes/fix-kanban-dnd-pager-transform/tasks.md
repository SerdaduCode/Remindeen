## 1. Perbaiki Pager — Ganti Transform dengan Left Animation

- [x] 1.1 Buka `components/remindeen/pager/Pager.tsx` dan ganti struktur container dari satu `w-[200%]` div dengan `transform: translateX` menjadi wrapper `relative w-full overflow-hidden` yang berisi dua halaman `position: absolute` masing-masing
- [x] 1.2 Halaman aktif (`activeIndex === index`) set `left: 0`; halaman tidak aktif set `left: -100%` (Page 0 saat aktif) atau `left: 100%` (Page 1 saat tidak aktif), dengan `transition-[left] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`
- [x] 1.3 Pastikan `pointer-events-none` dan `aria-hidden` tetap diterapkan pada halaman yang tidak aktif (sama seperti sebelumnya)
- [x] 1.4 Verifikasi dot indicator, previous/next arrow, dan keyboard arrow nav masih berfungsi (tidak ada perubahan logika state)

## 2. Tambah Collision Detection di KanbanBoard

- [x] 2.1 Import `pointerWithin` dari `@dnd-kit/core` di `components/remindeen/kanban/KanbanBoard.tsx`
- [x] 2.2 Tambah prop `collisionDetection={pointerWithin}` pada komponen `DndContext`

## 3. Portal DragOverlay ke document.body

- [x] 3.1 Di `components/remindeen/kanban/KanbanBoard.tsx`, import `createPortal` dari `react-dom`
- [x] 3.2 Bungkus `<DragOverlay>...</DragOverlay>` yang sudah ada dengan `createPortal(..., document.body)`, tetap sebagai child JSX dari `<DndContext>` (hanya lokasi mount DOM yang berubah, bukan posisi di React tree)
- [x] 3.3 Pastikan `TaskCard` varian `dragging` tetap ter-style benar saat di-mount di luar tree visual aslinya (tidak ada CSS Module/scoped style yang bergantung pada ancestor) — dikonfirmasi: `TaskCard` hanya pakai Tailwind utility classes global, tidak ada CSS Module/scoped style

## 4. Verifikasi Manual

- [ ] 4.1 Buka newtab page dan navigasi ke halaman Productivity — animasi slide horizontal masih terlihat
- [x] 4.2 ~~Drag card di kolom "To Do" — overlay card muncul tepat di bawah pointer (tidak jauh ke kanan)~~ — masih offset setelah fix Pager saja; root cause kedua ditemukan (`GLASS_PANEL`'s `backdrop-blur-xl`), diperbaiki lewat task 3 di atas. Ulangi langkah ini setelah task 3 selesai.
- [ ] 4.3 Drag card di kolom "To Do" pada Kanban panel (yang memakai `backdrop-blur-xl`) — overlay card muncul tepat di bawah pointer
- [ ] 4.4 Drag card dari "To Do" ke "Doing" — card berpindah ke kolom yang dituju dengan benar
- [ ] 4.5 Drag card untuk mengubah urutan dalam satu kolom — urutan tersimpan dengan benar
- [ ] 4.6 Drag-and-drop dan lepas card tanpa target valid (drop di luar kolom) — animasi snap-back ke posisi asli masih berjalan normal setelah overlay di-portal
