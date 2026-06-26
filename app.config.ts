import { defineAppConfig } from '#imports';

declare module 'wxt/utils/define-app-config' {
  export interface WxtAppConfig {
    language?: {
      default?: 'en' | 'id';
      available?: { label: string; value: 'en' | 'id' }[];
    };
    about?: string;
    translation?: {
      [key: string]: {
        [lang in 'en' | 'id']?: string;
      };
    };
  }
}

export default defineAppConfig({
  language: {
    default: 'en',
    available: [
      { label: 'English (Default)', value: 'en' },
      { label: 'Bahasa Indonesia', value: 'id' },
    ],
  },
  translation: {
    'header.description': {
      en: 'Prayer reminders and daily inspiration while you browse',
      id: 'Pengingat sholat dan inspirasi harian saat kamu browsing',
    },
    'tabs.settings': {
      en: 'Settings',
      id: 'Pengaturan',
    },
    'tabs.home': {
      en: 'Today',
      id: 'Hari Ini',
    },
    'tabs.trends': {
      en: 'Trends',
      id: 'Tren',
    },
    'settings.theme': {
      en: 'Theme',
      id: 'Tema',
    },
    'settings.theme.description': {
      en: 'Customize the look and feel',
      id: 'Sesuaikan tampilan dan nuansa',
    },
    'settings.theme.system': {
      en: 'System',
      id: 'Sistem',
    },
    'settings.theme.light': {
      en: 'Light',
      id: 'Terang',
    },
    'settings.theme.dark': {
      en: 'Dark',
      id: 'Gelap',
    },
    'settings.language': {
      en: 'Language',
      id: 'Bahasa',
    },
    'settings.about': {
      en: 'About',
      id: 'Tentang',
    },
    'settings.about.description': {
      en: 'Remindeen is a browser extension specifically designed to be a prayer reminder and source of inspiration for Muslims in carrying out their daily activities.',
      id: 'Remindeen adalah ekstensi browser yang dirancang untuk menjadi pengingat sholat dan sumber inspirasi bagi umat Muslim dalam menjalankan aktivitas sehari-hari.',
    },
    'settings.support': {
      en: 'Support',
      id: 'Dukungan',
    },
    'settings.support.description': {
      en: 'Show your love by scanning the QR code below ❤️',
      id: 'Tunjukkan dukunganmu dengan memindai kode QR di bawah ini ❤️',
    },
    'widgets.today': {
      en: 'Today',
      id: 'Hari Ini',
    },
    'widgets.recent_activity': {
      en: 'Recent Activity',
      id: 'Aktivitas Terbaru',
    },
    'widgets.show_all': {
      en: 'Show all',
      id: 'Tampilkan semua',
    },
    'widgets.show_less': {
      en: 'Show less',
      id: 'Sembunyikan',
    },
    'settings.searchbar': {
      en: 'Search Bar',
      id: 'Bilah Pencarian',
    },
    'settings.searchbar.description': {
      en: 'Show or hide the search bar',
      id: 'Tampilkan atau sembunyikan bilah pencarian',
    },
    'settings.searchbar.toggle': {
      en: 'Show search bar on new tab',
      id: 'Tampilkan bilah pencarian di tab baru',
    },
    'settings.calendar': {
      en: 'Google Calendar',
      id: 'Google Kalender',
    },
    'settings.calendar.description': {
      en: 'Sync your tasks and habits to your Google Calendar',
      id: 'Sinkronkan tugas dan kebiasaan Anda ke Google Kalender',
    },
    'settings.calendar.connect': {
      en: 'Connect Google Calendar',
      id: 'Hubungkan Google Kalender',
    },
    'settings.calendar.connecting': {
      en: 'Connecting…',
      id: 'Menghubungkan…',
    },
    'settings.calendar.disconnect': {
      en: 'Disconnect',
      id: 'Putuskan',
    },
    'settings.calendar.connected': {
      en: 'Connected',
      id: 'Terhubung',
    },
    'prayers.imsak': {
      en: 'Imsak',
      id: 'Imsak',
    },
    'prayers.fajr': {
      en: 'Fajr',
      id: 'Subuh',
    },
    'prayers.dhuhr': {
      en: 'Dhuhr',
      id: 'Dzuhur',
    },
    'prayers.asr': {
      en: 'Asr',
      id: 'Ashar',
    },
    'prayers.maghrib': {
      en: 'Maghrib',
      id: 'Maghrib',
    },
    'prayers.isha': {
      en: 'Isha',
      id: 'Isya',
    },
    'prayers.hour_short': {
      en: 'hr',
      id: 'jam',
    },
    'prayers.minute_short': {
      en: 'min',
      id: 'menit',
    },
    'prayers.remaining_suffix': {
      en: ' left',
      id: ' lagi',
    },
    'prayers.fallback_remaining': {
      en: '0 min left',
      id: '0 menit lagi',
    },
    'prayers.error_not_found': {
      en: 'Prayer time data not found.',
      id: 'Data waktu salat tidak ditemukan.',
    },
    'prayers.error_failed': {
      en: 'Failed to fetch Prayer times',
      id: 'Gagal mengambil waktu salat',
    },
    'prayers.error_location': {
      en: 'Failed to get user location.',
      id: 'Gagal mendapatkan lokasi pengguna.',
    },
    'prayers.error_geolocation': {
      en: 'Geolocation is not supported by this browser.',
      id: 'Geolocation tidak didukung oleh browser ini.',
    },
    'location.loading': {
      en: 'Getting location...',
      id: 'Mendapatkan lokasi...',
    },
    'location.unknown_city': {
      en: 'Unknown City',
      id: 'Kota Tidak Diketahui',
    },
    'location.unknown_country': {
      en: 'Unknown Country',
      id: 'Negara Tidak Diketahui',
    },
    'location.not_found': {
      en: 'Location not found',
      id: 'Lokasi tidak ditemukan',
    },
    'location.failed': {
      en: 'Failed to get location',
      id: 'Gagal mendapatkan lokasi',
    },
    'location.allow': {
      en: 'Please allow location access',
      id: 'Harap izinkan akses lokasi',
    },
    'location.not_supported': {
      en: 'Geolocation not supported by this browser',
      id: 'Geolocation tidak didukung oleh browser ini',
    },
    'pager.page_home': {
      en: 'Home',
      id: 'Beranda',
    },
    'pager.page_productivity': {
      en: 'Productivity',
      id: 'Produktivitas',
    },
    'productivity.tab_kanban': {
      en: 'Kanban',
      id: 'Kanban',
    },
    'productivity.tab_habit': {
      en: 'Habit',
      id: 'Kebiasaan',
    },
    'auth.sign_in_with_google': {
      en: 'Sign in with Google',
      id: 'Masuk dengan Google',
    },
    'auth.sign_in_prompt_title': {
      en: 'Sign in to continue',
      id: 'Masuk untuk melanjutkan',
    },
    'auth.sign_in_prompt_description': {
      en: 'Your tasks and habits are synced to your account. Sign in with Google to get started.',
      id: 'Tugas dan kebiasaanmu disinkronkan ke akunmu. Masuk dengan Google untuk mulai.',
    },
    'auth.sign_out': {
      en: 'Sign out',
      id: 'Keluar',
    },
    'auth.signing_in': {
      en: 'Signing in...',
      id: 'Sedang masuk...',
    },
    'auth.sign_in_failed': {
      en: 'Sign-in failed. Please try again.',
      id: 'Gagal masuk. Silakan coba lagi.',
    },
    'kanban.column_todo': {
      en: 'To Do',
      id: 'Belum Dikerjakan',
    },
    'kanban.column_doing': {
      en: 'Doing',
      id: 'Sedang Dikerjakan',
    },
    'kanban.column_done': {
      en: 'Done',
      id: 'Selesai',
    },
    'kanban.add_task': {
      en: 'Add task',
      id: 'Tambah tugas',
    },
    'kanban.empty_state': {
      en: 'No tasks yet. Add your first task to get started.',
      id: 'Belum ada tugas. Tambahkan tugas pertamamu untuk mulai.',
    },
    'kanban.loading': {
      en: 'Loading tasks...',
      id: 'Memuat tugas...',
    },
    'kanban.error_loading': {
      en: 'Failed to load tasks.',
      id: 'Gagal memuat tugas.',
    },
    'kanban.form.title_label': {
      en: 'Title',
      id: 'Judul',
    },
    'kanban.form.title_placeholder': {
      en: "What's the task?",
      id: 'Apa tugasnya?',
    },
    'kanban.form.title_required': {
      en: 'Title is required',
      id: 'Judul wajib diisi',
    },
    'kanban.form.description_label': {
      en: 'Description (optional)',
      id: 'Deskripsi (opsional)',
    },
    'kanban.form.description_placeholder': {
      en: 'Add more detail...',
      id: 'Tambahkan detail...',
    },
    'kanban.form.start_date_label': {
      en: 'Start date',
      id: 'Tanggal mulai',
    },
    'kanban.form.due_date_label': {
      en: 'Due date',
      id: 'Tanggal jatuh tempo',
    },
    'kanban.form.priority_label': {
      en: 'Priority',
      id: 'Prioritas',
    },
    'kanban.form.priority_none': {
      en: 'None',
      id: 'Tidak ada',
    },
    'kanban.form.priority_low': {
      en: 'Low',
      id: 'Rendah',
    },
    'kanban.form.priority_medium': {
      en: 'Medium',
      id: 'Sedang',
    },
    'kanban.form.priority_high': {
      en: 'High',
      id: 'Tinggi',
    },
    'kanban.form.create_title': {
      en: 'New task',
      id: 'Tugas baru',
    },
    'kanban.form.edit_title': {
      en: 'Edit task',
      id: 'Ubah tugas',
    },
    'kanban.form.save': {
      en: 'Save',
      id: 'Simpan',
    },
    'kanban.form.cancel': {
      en: 'Cancel',
      id: 'Batal',
    },
    'kanban.form.delete': {
      en: 'Delete',
      id: 'Hapus',
    },
    'kanban.form.delete_confirm': {
      en: 'Delete this task? This cannot be undone.',
      id: 'Hapus tugas ini? Tindakan ini tidak dapat dibatalkan.',
    },
    'kanban.form.comments_label': {
      en: 'Comments',
      id: 'Komentar',
    },
    'kanban.form.comments_empty': {
      en: 'No comments yet.',
      id: 'Belum ada komentar.',
    },
    'kanban.form.comments_placeholder': {
      en: 'Add a comment...',
      id: 'Tambahkan komentar...',
    },
    'kanban.form.comments_send': {
      en: 'Send',
      id: 'Kirim',
    },
    'kanban.form.comments_edit': {
      en: 'Edit',
      id: 'Ubah',
    },
    'kanban.form.comments_delete': {
      en: 'Delete',
      id: 'Hapus',
    },
    'kanban.form.comments_save': {
      en: 'Save',
      id: 'Simpan',
    },
    'kanban.form.comments_cancel': {
      en: 'Cancel',
      id: 'Batal',
    },
    'kanban.form.comments_delete_confirm': {
      en: 'Delete this comment? This cannot be undone.',
      id: 'Hapus komentar ini? Tindakan ini tidak dapat dibatalkan.',
    },
    'habit.add_habit': {
      en: 'Add habit',
      id: 'Tambah kebiasaan',
    },
    'habit.empty_state': {
      en: 'No habits yet. Add your first habit to start tracking.',
      id: 'Belum ada kebiasaan. Tambahkan kebiasaan pertamamu untuk mulai melacak.',
    },
    'habit.loading': {
      en: 'Loading habits...',
      id: 'Memuat kebiasaan...',
    },
    'habit.error_loading': {
      en: 'Failed to load habits.',
      id: 'Gagal memuat kebiasaan.',
    },
    'habit.frequency_daily': {
      en: 'Daily',
      id: 'Harian',
    },
    'habit.frequency_weekly': {
      en: 'Weekly',
      id: 'Mingguan',
    },
    'habit.streak_suffix': {
      en: 'day streak',
      id: 'hari beruntun',
    },
    'habit.check_in': {
      en: 'Check in',
      id: 'Tandai selesai',
    },
    'habit.checked_in': {
      en: 'Checked in',
      id: 'Sudah ditandai',
    },
    'habit.form.title_label': {
      en: 'Title',
      id: 'Judul',
    },
    'habit.form.title_placeholder': {
      en: "What's the habit?",
      id: 'Apa kebiasaannya?',
    },
    'habit.form.title_required': {
      en: 'Title is required',
      id: 'Judul wajib diisi',
    },
    'habit.form.description_label': {
      en: 'Description (optional)',
      id: 'Deskripsi (opsional)',
    },
    'habit.form.description_placeholder': {
      en: 'Add more detail...',
      id: 'Tambahkan detail...',
    },
    'habit.form.frequency_label': {
      en: 'Frequency',
      id: 'Frekuensi',
    },
    'habit.form.priority_label': {
      en: 'Priority',
      id: 'Prioritas',
    },
    'habit.form.priority_none': {
      en: 'None',
      id: 'Tidak ada',
    },
    'habit.form.priority_low': {
      en: 'Low',
      id: 'Rendah',
    },
    'habit.form.priority_medium': {
      en: 'Medium',
      id: 'Sedang',
    },
    'habit.form.priority_high': {
      en: 'High',
      id: 'Tinggi',
    },
    'habit.form.create_title': {
      en: 'New habit',
      id: 'Kebiasaan baru',
    },
    'habit.form.edit_title': {
      en: 'Edit habit',
      id: 'Ubah kebiasaan',
    },
    'habit.form.save': {
      en: 'Save',
      id: 'Simpan',
    },
    'habit.form.cancel': {
      en: 'Cancel',
      id: 'Batal',
    },
    'habit.form.delete': {
      en: 'Delete',
      id: 'Hapus',
    },
    'habit.form.delete_confirm': {
      en: 'Delete this habit? This cannot be undone.',
      id: 'Hapus kebiasaan ini? Tindakan ini tidak dapat dibatalkan.',
    },
    'mcp.keys.menu_aria': {
      en: 'Open menu',
      id: 'Buka menu',
    },
    'mcp.keys.menu_label': {
      en: 'MCP Keys',
      id: 'Kunci MCP',
    },
    'mcp.keys.title': {
      en: 'MCP Keys',
      id: 'Kunci MCP',
    },
    'mcp.keys.label_input': {
      en: 'Label (optional)',
      id: 'Label (opsional)',
    },
    'mcp.keys.label_placeholder': {
      en: 'e.g. Hermes Agent',
      id: 'misalnya Hermes Agent',
    },
    'mcp.keys.generate': {
      en: 'Generate',
      id: 'Buat',
    },
    'mcp.keys.loading': {
      en: 'Loading keys...',
      id: 'Memuat kunci...',
    },
    'mcp.keys.load_error': {
      en: 'Failed to load keys.',
      id: 'Gagal memuat kunci.',
    },
    'mcp.keys.empty': {
      en: 'No keys yet.',
      id: 'Belum ada kunci.',
    },
    'mcp.keys.unlabeled': {
      en: 'Unlabeled',
      id: 'Tanpa label',
    },
    'mcp.keys.created': {
      en: 'Created',
      id: 'Dibuat',
    },
    'mcp.keys.last_used': {
      en: 'Last used',
      id: 'Terakhir dipakai',
    },
    'mcp.keys.expires': {
      en: 'Expires',
      id: 'Berlaku sampai',
    },
    'mcp.keys.never': {
      en: 'Never',
      id: 'Belum pernah',
    },
    'mcp.keys.revoke_confirm': {
      en: 'Revoke "{label}"? Any automation using this key will immediately lose access.',
      id: 'Cabut "{label}"? Automation yang memakai kunci ini akan langsung kehilangan akses.',
    },
    'mcp.keys.reveal_warning': {
      en: "Copy this key now — you won't be able to see it again.",
      id: 'Salin kunci ini sekarang — kamu tidak akan bisa melihatnya lagi.',
    },
    'mcp.keys.done': {
      en: 'Done',
      id: 'Selesai',
    },
    'mcp.keys.close': {
      en: 'Close',
      id: 'Tutup',
    },
  },
});