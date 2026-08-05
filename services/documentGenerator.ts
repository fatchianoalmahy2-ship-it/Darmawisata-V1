import { Student, AppSettings } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';

export class DocumentGeneratorService {
  /**
   * Builds printable data for Surat Izin Orang Tua
   */
  public static getSuratIzinData(student: Student, settings?: AppSettings) {
    const school = {
      ...schoolMetadata.school,
      name: settings?.schoolName || schoolMetadata.school.name,
      address: settings?.schoolAddress || schoolMetadata.school.address,
      headmaster: settings?.headmasterName || schoolMetadata.school.headmaster,
      travelAgency: settings?.travelAgency || schoolMetadata.school.travelAgency,
    };

    const destinationUpper = (student.destination || 'BALI').toUpperCase();
    const gel1Dates = settings?.baliGel1Dates || '07 – 11 November 2025';
    const gel2Dates = settings?.baliGel2Dates || '14 – 18 November 2025';
    const yogyaDates = settings?.yogyaGel1Dates || '15 – 16 November 2025';

    let wavesList: { name: string; dates: string }[] = [];
    if (destinationUpper.includes('YOGYA')) {
      wavesList = [
        { name: 'Yogyakarta Gelombang I', dates: yogyaDates }
      ];
    } else if (destinationUpper.includes('BALI')) {
      wavesList = [
        { name: 'Bali Gelombang I', dates: gel1Dates },
        { name: 'Bali Gelombang II', dates: gel2Dates }
      ];
    } else {
      wavesList = [
        { name: 'Bali Gelombang I', dates: gel1Dates },
        { name: 'Bali Gelombang II', dates: gel2Dates },
        { name: 'Yogyakarta Gelombang I', dates: yogyaDates }
      ];
    }

    return {
      school,
      studentName: student.name,
      nis: student.nis,
      className: student.className,
      parentName: student.parentName || '_____________________________________________',
      parentJob: student.parentJob || '___________________',
      parentAddress: student.parentAddress || '_____________________________________________',
      destination: student.destination || 'Bali',
      wavesList,
      wave: student.wave,
      dateFormatted: 'Ponorogo, November 2025',
      headmaster: school.headmaster,
    };
  }

  /**
   * Builds printable data for Surat Pernyataan Jalur Tidak Mampu
   */
  public static getSuratTidakMampuData(student: Student, settings?: AppSettings) {
    const school = {
      ...schoolMetadata.school,
      name: settings?.schoolName || schoolMetadata.school.name,
      address: settings?.schoolAddress || schoolMetadata.school.address,
      headmaster: settings?.headmasterName || schoolMetadata.school.headmaster,
      travelAgency: settings?.travelAgency || schoolMetadata.school.travelAgency,
    };

    return {
      school,
      studentName: student.name,
      nis: student.nis,
      className: student.className,
      parentName: student.parentName || '_____________________________________________',
      parentJob: student.parentJob || '___________________',
      parentAddress: student.parentAddress || '_____________________________________________',
      destination: student.destination || 'Bali',
      waiverType: student.waiverType || 'NONE',
      dateFormatted: 'Ponorogo, . . . . . . . . . . . . . . . .',
    };
  }
}

