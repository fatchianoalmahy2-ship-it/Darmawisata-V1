import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  nis: text('nis').notNull(),
  name: text('name').notNull(),
  className: text('class_name').notNull(),
  gender: text('gender').notNull(),
  destination: text('destination'),
  wave: text('wave'),
  tShirtSize: text('tshirt_size'),
  tShirtDesign: text('tshirt_design'),
  parentName: text('parent_name'),
  parentJob: text('parent_job'),
  parentAddress: text('parent_address'),
  parentPhone: text('parent_phone'),
  studentPhone: text('student_phone'),
  medicalHistory: text('medical_history'),
  waiverType: text('waiver_type'),
  busNumber: integer('bus_number'),
  seatNumber: integer('seat_number'),
  roomNumber: integer('room_number'),
  isRegistered: boolean('is_registered').default(false).notNull(),
  updatedAt: text('updated_at'),
});

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  totalStudents: integer('total_students').default(0).notNull(),
  homeroomTeacher: text('homeroom_teacher').notNull(),
  teacherPhone: text('teacher_phone'),
  teacherPassword: text('teacher_password'),
});

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rundowns = pgTable('rundowns', {
  id: text('id').primaryKey(),
  day: integer('day').notNull(),
  time: text('time').notNull(),
  activity: text('activity').notNull(),
  location: text('location').notNull(),
  notes: text('notes'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').default('PUBLIC_SISWA').notNull(),
  name: text('name').notNull(),
  assignedClassName: text('assigned_class_name'),
  createdAt: timestamp('created_at').defaultNow(),
});
