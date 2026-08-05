import { Student, SchoolClass, AppSettings } from '@/types';

export class RecapGeneratorService {
  /**
   * Generates formatted WhatsApp text message for a class recap.
   */
  public static generateWhatsAppRecap(
    cls: SchoolClass,
    classStudents: Student[],
    settings?: AppSettings,
    dateStr: string = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  ): string {
    const totalStudents = cls.totalStudents;
    const registered = classStudents.filter((s) => s.isRegistered);
    const registeredCount = registered.length;
    const percentage = ((registeredCount / totalStudents) * 100).toFixed(1);

    const baliGel1 = registered.filter((s) => s.wave === 'BALI_GEL_1').length;
    const baliGel2 = registered.filter((s) => s.wave === 'BALI_GEL_2').length;
    const yogyaGel1 = registered.filter((s) => s.wave === 'YOGYA_GEL_1').length;

    // T-Shirt size tally
    const sizeTally: Record<string, number> = {};
    registered.forEach((s) => {
      if (s.tShirtSize) {
        sizeTally[s.tShirtSize] = (sizeTally[s.tShirtSize] || 0) + 1;
      }
    });

    const sizeSummary = Object.entries(sizeTally)
      .map(([size, count]) => `${size}: ${count}`)
      .join(', ') || 'Belum terdata';

    // Jalur Tidak Mampu
    const waiverCount = registered.filter(
      (s) => s.waiverType && s.waiverType !== 'NONE'
    ).length;

    const schoolName = settings?.schoolName ? settings.schoolName.toUpperCase() : 'SMK PGRI 2 PONOROGO';
    const gel1Dates = settings?.baliGel1Dates || '07 – 11 November 2025';
    const gel2Dates = settings?.baliGel2Dates || '14 – 18 November 2025';
    const yogyaDates = settings?.yogyaGel1Dates || '15 – 16 November 2025';

    let text = `*📢 REKAP HARIAN PEMINATAN DARMAWISATA ${schoolName}*\n`;
    text += `*KELAS:* ${cls.name} (${cls.department})\n`;
    text += `*WALI KELAS:* ${cls.homeroomTeacher}\n`;
    text += `*TANGGAL REKAP:* ${dateStr}\n`;
    text += `--------------------------------------------------\n\n`;

    text += `*📊 RINGKASAN KEIKUTSERTAAN:*\n`;
    text += `• Total Siswa Kelas: *${totalStudents} Siswa*\n`;
    text += `• Sudah Mengisi Angket: *${registeredCount} Siswa (${percentage}%)*\n`;
    text += `• Belum Mengisi: *${totalStudents - registeredCount} Siswa*\n\n`;

    text += `*✈️ SEBARAN TUJUAN & GELOMBANG:*\n`;
    text += `• Bali Gelombang I (${gel1Dates}): *${baliGel1} Siswa*\n`;
    text += `• Bali Gelombang II (${gel2Dates}): *${baliGel2} Siswa*\n`;
    text += `• Yogyakarta (${yogyaDates}): *${yogyaGel1} Siswa*\n\n`;

    text += `*👕 REKAP UKURAN KAOS:*\n`;
    text += `[ ${sizeSummary} ]\n\n`;

    text += `*📝 KETERANGAN JALUR TIDAK MAMPU:*\n`;
    text += `• Pengajuan Jalur Tidak Mampu: *${waiverCount} Siswa*\n\n`;

    text += `*📋 DAFTAR SISWA TERDAFTAR:*\n`;
    registered.forEach((s, idx) => {
      const bus = s.busNumber ? `Bus ${s.busNumber}` : 'Bus -';
      const room = s.roomNumber ? `Kmr ${s.roomNumber}` : 'Kmr -';
      text += `${idx + 1}. ${s.name} (${s.nis}) | Kaos: ${s.tShirtSize || '-'} | ${bus} / ${room}\n`;
    });

    text += `\n--------------------------------------------------\n`;
    text += `*Catatan Wali Kelas:* Mohon bagi siswa yang belum mengisi angket agar segera konfirmasi melalui portal atau link resmi sekolah.\n`;
    text += `*${schoolName} - BISA & HEBAT!* 🚀`;

    return text;
  }

  /**
   * Generates formatted WhatsApp reminder text specifically listing students who HAVE NOT filled the form.
   */
  public static generateWhatsAppUnregisteredReminder(
    cls: SchoolClass,
    classStudents: Student[],
    settings?: AppSettings,
    dateStr: string = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  ): string {
    const unregistered = classStudents.filter((s) => !s.isRegistered);
    const totalStudents = classStudents.length || cls.totalStudents;
    const registeredCount = classStudents.length - unregistered.length;
    const percentage = totalStudents > 0 ? ((registeredCount / totalStudents) * 100).toFixed(1) : '0';

    const schoolName = settings?.schoolName ? settings.schoolName.toUpperCase() : 'SMK PGRI 2 PONOROGO';

    // Check for custom template
    if (settings?.templateClassReminder && settings.templateClassReminder.trim() !== '') {
      let daftarNama = '';
      if (unregistered.length === 0) {
        daftarNama = '🎉 SELAMAT! SELURUH SISWA SUDAH 100% MENGISI ANGKET!';
      } else {
        daftarNama = unregistered.map((s, idx) => `${idx + 1}. ${s.name} (NIS: ${s.nis})`).join('\n');
      }

      return settings.templateClassReminder
        .replaceAll('{SEKOLAH}', schoolName)
        .replaceAll('{KELAS}', cls.name)
        .replaceAll('{WALI_KELAS}', cls.homeroomTeacher || 'Wali Kelas')
        .replaceAll('{TANGGAL}', dateStr)
        .replaceAll('{TOTAL_SISWA}', String(totalStudents))
        .replaceAll('{SUDAH_MENGISI}', String(registeredCount))
        .replaceAll('{BELUM_MENGISI}', String(unregistered.length))
        .replaceAll('{PERSENTASE}', percentage)
        .replaceAll('{DAFTAR_NAMA_BELUM}', daftarNama);
    }

    let text = `*⚠️ PEMBERITAHUAN / REMINDER PENGISIAN ANGKET DARMAWISATA*\n`;
    text += `*${schoolName} - TAHUN AJARAN 2026/2027*\n`;
    text += `--------------------------------------------------\n`;
    text += `*KELAS:* ${cls.name} (${cls.department})\n`;
    text += `*WALI KELAS:* ${cls.homeroomTeacher}\n`;
    text += `*TANGGAL REKAP:* ${dateStr}\n\n`;

    text += `*📊 STATUS PENGISIAN ANGKET:*\n`;
    text += `• Total Siswa Kelas: *${totalStudents} Siswa*\n`;
    text += `• Sudah Mengisi: *${registeredCount} Siswa (${percentage}%)*\n`;
    text += `• Belum Mengisi: *${unregistered.length} Siswa*\n\n`;

    if (unregistered.length === 0) {
      text += `*🎉 SELAMAT! SELURUH SISWA KELAS ${cls.name} SUDAH 100% MENGISI ANGKET PEMINATAN!* 👏✨\n`;
    } else {
      text += `*⚠️ DAFTAR SISWA YANG BELUM MENGISI ANGKET (${unregistered.length} SISWA):*\n`;
      unregistered.forEach((s, idx) => {
        text += `${idx + 1}. ${s.name} (NIS: ${s.nis})\n`;
      });

      text += `\n*📌 HIMBAUAN KEPADA BAPAK/IBU WALI SISWA & SISWA:*\n`;
      text += `Mohon nama-nama siswa di atas untuk *SEGERA* melakukan pengisian angket peminatan Darmawisata (Bali / Yogyakarta) melalui portal resmi sekolah.\n\n`;
      text += `*Atas perhatian dan kerja samanya, kami ucapkan terima kasih.* 🙏\n`;
    }

    text += `--------------------------------------------------\n`;
    text += `*${schoolName} - BISA & HEBAT!* 🚀`;

    return text;
  }

  /**
   * Generates formatted WhatsApp text for school-wide summary of unregistered students per class.
   */
  public static generateWhatsAppAllUnregisteredSummary(
    classes: SchoolClass[],
    allStudents: Student[],
    settings?: AppSettings,
    dateStr: string = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  ): string {
    const totalSchoolStudents = allStudents.length;
    const totalRegistered = allStudents.filter((s) => s.isRegistered).length;
    const totalUnregistered = totalSchoolStudents - totalRegistered;
    const overallPercentage = totalSchoolStudents > 0 ? ((totalRegistered / totalSchoolStudents) * 100).toFixed(1) : '0';

    const schoolName = settings?.schoolName ? settings.schoolName.toUpperCase() : 'SMK PGRI 2 PONOROGO';

    // Rincian per kelas string
    let rincianPerKelas = '';
    classes.forEach((cls, idx) => {
      const clsStudents = allStudents.filter((s) => s.className === cls.name);
      const unreg = clsStudents.filter((s) => !s.isRegistered);
      const total = clsStudents.length || cls.totalStudents;
      const regCount = total - unreg.length;
      const pct = total > 0 ? Math.round((regCount / total) * 100) : 0;

      const statusTag = unreg.length === 0 ? '✅ 100% Tuntas' : `⚠️ ${unreg.length} Siswa Belum`;

      rincianPerKelas += `${idx + 1}. *${cls.name}* (${cls.homeroomTeacher || 'Wali Kelas'})\n`;
      rincianPerKelas += `   - Progres: ${regCount}/${total} (${pct}%)\n`;
      rincianPerKelas += `   - Status: *${statusTag}*\n`;
      if (unreg.length > 0 && unreg.length <= 5) {
        rincianPerKelas += `   - Nama Belum: ${unreg.map((s) => s.name).join(', ')}\n`;
      }
      rincianPerKelas += `\n`;
    });

    // Check custom template
    if (settings?.templateUnregisteredSummary && settings.templateUnregisteredSummary.trim() !== '') {
      return settings.templateUnregisteredSummary
        .replaceAll('{SEKOLAH}', schoolName)
        .replaceAll('{TANGGAL}', dateStr)
        .replaceAll('{TOTAL_SISWA}', String(totalSchoolStudents))
        .replaceAll('{SUDAH_MENGISI}', String(totalRegistered))
        .replaceAll('{BELUM_MENGISI}', String(totalUnregistered))
        .replaceAll('{PERSENTASE}', overallPercentage)
        .replaceAll('{RINCIAN_PER_KELAS}', rincianPerKelas.trim());
    }

    let text = `*📢 REKAPITULASI LAPORAN SISWA BELUM MENGISI ANGKET DARMAWISATA*\n`;
    text += `*${schoolName} - SELURUH KELAS XII*\n`;
    text += `*TANGGAL REKAP:* ${dateStr}\n`;
    text += `--------------------------------------------------\n\n`;

    text += `*📊 RINGKASAN SEKOLAH:*\n`;
    text += `• Total Seluruh Siswa: *${totalSchoolStudents} Siswa*\n`;
    text += `• Sudah Mengisi: *${totalRegistered} Siswa (${overallPercentage}%)*\n`;
    text += `• Belum Mengisi: *${totalUnregistered} Siswa*\n\n`;

    text += `*🏫 RINCIAN BELUM MENGISI PER KELAS:*\n`;
    text += rincianPerKelas;

    text += `--------------------------------------------------\n`;
    text += `*Catatan Panitia:* Mohon para Wali Kelas membantu mengimbau siswa yang belum mengisi angket.\n`;
    text += `*${schoolName} - BISA & HEBAT!* 🚀`;

    return text;
  }
}
