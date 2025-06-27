import { pgTable, text, serial, integer, boolean, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const faculty = pgTable("faculty", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  position: text("position").notNull(), // 'professor', 'associate_professor', 'assistant_professor'
  department: text("department").notNull(),
  maxHours: integer("max_hours").notNull(), // Based on position: 14, 16, 18
  currentHours: integer("current_hours").default(0).notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  department: text("department").notNull(),
  credits: integer("credits").notNull(),
});

export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
});

export const workloadAssignments = pgTable("workload_assignments", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  divisionId: integer("division_id").notNull(),
  type: text("type").notNull(), // 'lecture', 'tutorial', 'practical'
  hoursPerWeek: integer("hours_per_week").notNull(),
  classroom: text("classroom"),
  status: text("status").default("assigned").notNull(), // 'assigned', 'completed', 'pending'
});

export const timetableSlots = pgTable("timetable_slots", {
  id: serial("id").primaryKey(),
  divisionId: integer("division_id").notNull(),
  facultyId: integer("faculty_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Monday-Sunday)
  startTime: text("start_time").notNull(), // Format: "09:00"
  endTime: text("end_time").notNull(), // Format: "10:00"
  classroom: text("classroom").notNull(),
  type: text("type").notNull(), // 'lecture', 'tutorial', 'practical'
});

export const excelUploads = pgTable("excel_uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").default("processing").notNull(), // 'processing', 'completed', 'error'
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  processedRows: integer("processed_rows").default(0),
  totalRows: integer("total_rows").default(0),
});

// Insert schemas
export const insertFacultySchema = createInsertSchema(faculty).omit({ id: true, currentHours: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertDivisionSchema = createInsertSchema(divisions).omit({ id: true });
export const insertWorkloadAssignmentSchema = createInsertSchema(workloadAssignments).omit({ id: true, status: true });
export const insertTimetableSlotSchema = createInsertSchema(timetableSlots).omit({ id: true });
export const insertExcelUploadSchema = createInsertSchema(excelUploads).omit({ id: true, uploadedAt: true, processedRows: true, totalRows: true, status: true });

// Types
export type Faculty = typeof faculty.$inferSelect;
export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;
export type WorkloadAssignment = typeof workloadAssignments.$inferSelect;
export type InsertWorkloadAssignment = z.infer<typeof insertWorkloadAssignmentSchema>;
export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type InsertTimetableSlot = z.infer<typeof insertTimetableSlotSchema>;
export type ExcelUpload = typeof excelUploads.$inferSelect;
export type InsertExcelUpload = z.infer<typeof insertExcelUploadSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Extended types for API responses
export type FacultyWithWorkload = Faculty & {
  assignments: (WorkloadAssignment & { subject: Subject; division: Division })[];
};

export type TimetableSlotWithDetails = TimetableSlot & {
  faculty: Faculty;
  subject: Subject;
  division: Division;
};

export type WorkloadAssignmentWithDetails = WorkloadAssignment & {
  faculty: Faculty;
  subject: Subject;
  division: Division;
};
