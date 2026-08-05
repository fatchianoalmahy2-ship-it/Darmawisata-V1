export type DestinationType = 'BALI' | 'YOGYAKARTA';

export type WaveType = 'BALI_GEL_1' | 'BALI_GEL_2' | 'YOGYA_GEL_1';

export type GenderType = 'LAKI-LAKI' | 'PEREMPUAN';

export type TShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL';

export type WaiverType = 'NONE' | '25%' | '50%';

export type UserRole = 'PUBLIC_SISWA' | 'WALI_KELAS' | 'ADMIN';

export interface AuthUser {
  role: UserRole;
  name: string;
  username?: string;
  assignedClassName?: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  className: string;
  gender: GenderType;
  destination?: DestinationType;
  wave?: WaveType;
  tShirtSize?: TShirtSize;
  tShirtDesign?: 'A' | 'B';
  parentName?: string;
  parentJob?: string;
  parentAddress?: string;
  parentPhone?: string;
  studentPhone?: string;
  medicalHistory?: string;
  waiverType?: WaiverType;
  busNumber?: number;
  seatNumber?: number;
  roomNumber?: number;
  isRegistered: boolean;
  updatedAt?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  department: string;
  totalStudents: number;
  homeroomTeacher: string;
  teacherPhone?: string;
  teacherPassword?: string;
}

export interface Bus {
  id: string;
  busNumber: number;
  wave: WaveType;
  capacity: number;
  guide1: string;
  guide2: string;
  assignedStudentIds: string[];
}

export interface Room {
  id: string;
  roomNumber: number;
  gender: GenderType;
  capacity: number;
  wave: WaveType;
  assignedStudentIds: string[];
}

export interface TourDestinationInfo {
  id: string;
  name: string;
  destination: DestinationType;
  wave: WaveType;
  dates: string;
  price: number;
  formattedPrice: string;
  spots: string[];
}

export interface RundownItem {
  id?: string;
  day: number;
  time: string;
  activity: string;
  location: string;
  notes?: string;
}

export interface AppSettings {
  defaultBusCapacity: number;
  defaultRoomCapacity: number;
  waliKelasParticipationThreshold: number; // percentage, e.g. 75
  schoolName: string;
  schoolAddress: string;
  headmasterName: string;
  travelAgency: string;
  baliGel1Dates: string;
  baliGel2Dates: string;
  yogyaGel1Dates: string;
  baliPrice: number;
  yogyaPrice: number;
  angketDeadline: string;
  isAngketClosed: boolean;
  showAngketSearchButton?: boolean;
  appName?: string;
  appLogoUrl?: string;
  headerLogoUrl?: string;
  tshirtDesignAUrl?: string;
  tshirtDesignBUrl?: string;
  tshirtSectionTitle?: string;
  tshirtDesignATitle?: string;
  tshirtDesignADesc?: string;
  tshirtDesignBTitle?: string;
  tshirtDesignBDesc?: string;
  baliBadge?: string;
  baliTitle?: string;
  baliDesc?: string;
  yogyaBadge?: string;
  yogyaTitle?: string;
  yogyaDesc?: string;
  suratIzinOpeningText?: string;
  suratIzinClosingText?: string;
  autoRecapEnabled?: boolean;
  autoRecapTime?: string; // e.g. "16:00"
  autoRecapTargetGroup?: string;
  autoRecapTargetPhone?: string;
  templateUnregisteredSummary?: string;
  templateClassReminder?: string;
  lastAutoRecapSentAt?: string;
  lastAutoRecapSentStatus?: string;
  busAllocationRules?: string;
  roomAllocationRules?: string;
}

export interface WaliKelasSummary {
  className: string;
  teacherName: string;
  totalStudents: number;
  participatingStudents: number;
  percentage: number;
  isEligible: boolean;
  baliCount: number;
  yogyaCount: number;
  unassignedCount: number;
}

export interface SyncTask {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
  name: string;
}

