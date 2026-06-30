## 1. Perbaiki Pager — Ganti Transform dengan Left Animation

- [x] 1.1 Buka `components/remindeen/pager/Pager.tsx` dan ganti struktur container dari satu `w-[200%]` div dengan `transform: translateX` menjadi wrapper `relative w-full overflow-hidden` yang berisi dua halaman `position: absolute` masing-masing
- [x] 1.2 Halaman aktif (`activeIndex === index`) set `left: 0`; halaman tidak aktif set `left: -100%` (Page 0 saat aktif) atau `left: 100%` (Page 1 saat tidak aktif), dengan `transition-[left] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`
- [x] 1.3 Pastikan `pointer-events-none` dan `aria-hidden` tetap diterapkan pada halaman yang tidak aktif (sama seperti sebelumnya)
- [x] 1.4 Verifikasi dot indicator, previous/next arrow, dan keyboard arrow nav masih berfungsi (tidak ada perubahan logika state)

## 2. Tambah Collision Detection di KanbanBoard

- [x] 2.1 Import `pointerWithin` dari `@dnd-kit/core` di `components/remindeen/kanban/KanbanBoard.tsx`
- [x] 2.2 Tambah prop `collisionDetection={pointerWithin}` pada komponen `DndContext`

## 3. Verifikasi Manual

- [ ] 3.1 Buka newtab page dan navigasi ke halaman Productivity — animasi slide horizontal masih terlihat
- [ ] 3.2 Drag card di kolom "To Do" — overlay card muncul tepat di bawah pointer (tidak jauh ke kanan)
- [ ] 3.3 Drag card dari "To Do" ke "Doing" — card berpindah ke kolom yang dituju dengan benar
- [ ] 3.4 Drag card untuk mengubah urutan dalam satu kolom — urutan tersimpan dengan benar
