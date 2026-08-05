import * as XLSX from 'xlsx';

export class ExcelService {
  /**
   * Reads and parses an uploaded Excel file to JSON
   */
  public static async importExcel<T>(file: File): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, { defval: '' });
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Format file Excel tidak valid atau rusak.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Exports an array of objects to an Excel (.xlsx) file
   */
  public static exportToExcel<T extends Record<string, any>>(
    data: T[],
    fileName: string,
    sheetName: string = 'Data'
  ): void {
    if (typeof window === 'undefined') return;

    // Convert data array into sheets
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  /**
   * Formats and exports Student master data cleanly
   */
  public static exportMasterData(students: any[], fileName: string = 'Master_Data_Siswa'): void {
    const formatted = students.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis || '',
      'Nama Siswa': s.name || '',
      Kelas: s.className || '',
      'Jenis Kelamin': s.gender || '',
      Tujuan: s.destination || '',
      Gelombang: s.wave || '',
      'Ukuran Kaos': s.tShirtSize || '',
      'Orang Tua': s.parentName || '',
      'WA Ortu': s.parentPhone || '',
      'WA Siswa': s.studentPhone || '',
      'Riwayat Medis': s.medicalHistory || '',
      'Beasiswa/Jalur': s.waiverType || '',
      'Bus #': s.busNumber || '',
      'Kamar #': s.roomNumber || '',
      'Status Angket': s.isRegistered ? 'Sudah Mengisi' : 'Belum Mengisi',
    }));

    this.exportToExcel(formatted, fileName, 'Siswa');
  }
}
