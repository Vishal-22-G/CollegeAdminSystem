import { 
  users, 
  faculty, 
  subjects, 
  divisions, 
  workloadAssignments, 
  timetableSlots, 
  excelUploads,
  type User, 
  type InsertUser,
  type Faculty,
  type InsertFaculty,
  type Subject,
  type InsertSubject,
  type Division,
  type InsertDivision,
  type WorkloadAssignment,
  type InsertWorkloadAssignment,
  type TimetableSlot,
  type InsertTimetableSlot,
  type ExcelUpload,
  type InsertExcelUpload,
  type FacultyWithWorkload,
  type WorkloadAssignmentWithDetails,
  type TimetableSlotWithDetails
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Faculty methods
  getAllFaculty(): Promise<Faculty[]>;
  getFaculty(id: number): Promise<Faculty | undefined>;
  getFacultyWithWorkload(id: number): Promise<FacultyWithWorkload | undefined>;
  createFaculty(faculty: InsertFaculty): Promise<Faculty>;
  updateFaculty(id: number, updates: Partial<InsertFaculty>): Promise<Faculty | undefined>;
  updateFacultyWorkload(id: number, hours: number): Promise<Faculty | undefined>;

  // Subject methods
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  getSubjectsByDepartment(department: string): Promise<Subject[]>;

  // Division methods
  getAllDivisions(): Promise<Division[]>;
  getDivision(id: number): Promise<Division | undefined>;
  createDivision(division: InsertDivision): Promise<Division>;
  getDivisionsByDepartment(department: string): Promise<Division[]>;

  // Workload assignment methods
  getAllWorkloadAssignments(): Promise<WorkloadAssignmentWithDetails[]>;
  getWorkloadAssignment(id: number): Promise<WorkloadAssignmentWithDetails | undefined>;
  getWorkloadAssignmentsByFaculty(facultyId: number): Promise<WorkloadAssignmentWithDetails[]>;
  createWorkloadAssignment(assignment: InsertWorkloadAssignment): Promise<WorkloadAssignment>;
  updateWorkloadAssignmentStatus(id: number, status: string): Promise<WorkloadAssignment | undefined>;
  deleteWorkloadAssignment(id: number): Promise<boolean>;

  // Timetable methods
  getAllTimetableSlots(): Promise<TimetableSlotWithDetails[]>;
  getTimetableSlotsByDivision(divisionId: number): Promise<TimetableSlotWithDetails[]>;
  getTimetableSlotsByFaculty(facultyId: number): Promise<TimetableSlotWithDetails[]>;
  createTimetableSlot(slot: InsertTimetableSlot): Promise<TimetableSlot>;
  updateTimetableSlot(id: number, updates: Partial<InsertTimetableSlot>): Promise<TimetableSlot | undefined>;
  deleteTimetableSlot(id: number): Promise<boolean>;

  // Excel upload methods
  getAllExcelUploads(): Promise<ExcelUpload[]>;
  createExcelUpload(upload: InsertExcelUpload): Promise<ExcelUpload>;
  updateExcelUploadStatus(id: number, status: string, processedRows?: number, totalRows?: number): Promise<ExcelUpload | undefined>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalFaculty: number;
    activeCourses: number;
    pendingTasks: number;
    avgWorkload: number;
  }>;
}

import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllFaculty(): Promise<Faculty[]> {
    return await db.select().from(faculty);
  }

  async getFaculty(id: number): Promise<Faculty | undefined> {
    const [facultyMember] = await db.select().from(faculty).where(eq(faculty.id, id));
    return facultyMember || undefined;
  }

  async getFacultyWithWorkload(id: number): Promise<FacultyWithWorkload | undefined> {
    const facultyMember = await this.getFaculty(id);
    if (!facultyMember) return undefined;

    const assignments = await db
      .select({
        id: workloadAssignments.id,
        facultyId: workloadAssignments.facultyId,
        subjectId: workloadAssignments.subjectId,
        divisionId: workloadAssignments.divisionId,
        type: workloadAssignments.type,
        hoursPerWeek: workloadAssignments.hoursPerWeek,
        classroom: workloadAssignments.classroom,
        status: workloadAssignments.status,
        subject: subjects,
        division: divisions,
      })
      .from(workloadAssignments)
      .innerJoin(subjects, eq(workloadAssignments.subjectId, subjects.id))
      .innerJoin(divisions, eq(workloadAssignments.divisionId, divisions.id))
      .where(eq(workloadAssignments.facultyId, id));

    return {
      ...facultyMember,
      assignments,
    };
  }

  async createFaculty(insertFaculty: InsertFaculty): Promise<Faculty> {
    const [facultyMember] = await db.insert(faculty).values({
      ...insertFaculty,
      currentHours: 0,
    }).returning();
    return facultyMember;
  }

  async updateFaculty(id: number, updates: Partial<InsertFaculty>): Promise<Faculty | undefined> {
    const [updated] = await db.update(faculty).set(updates).where(eq(faculty.id, id)).returning();
    return updated || undefined;
  }

  async updateFacultyWorkload(id: number, hours: number): Promise<Faculty | undefined> {
    const [updated] = await db.update(faculty).set({ currentHours: hours }).where(eq(faculty.id, id)).returning();
    return updated || undefined;
  }

  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject || undefined;
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }

  async getSubjectsByDepartment(department: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.department, department));
  }

  async getAllDivisions(): Promise<Division[]> {
    return await db.select().from(divisions);
  }

  async getDivision(id: number): Promise<Division | undefined> {
    const [division] = await db.select().from(divisions).where(eq(divisions.id, id));
    return division || undefined;
  }

  async createDivision(insertDivision: InsertDivision): Promise<Division> {
    const [division] = await db.insert(divisions).values(insertDivision).returning();
    return division;
  }

  async getDivisionsByDepartment(department: string): Promise<Division[]> {
    return await db.select().from(divisions).where(eq(divisions.department, department));
  }

  async getAllWorkloadAssignments(): Promise<WorkloadAssignmentWithDetails[]> {
    return await db
      .select({
        id: workloadAssignments.id,
        facultyId: workloadAssignments.facultyId,
        subjectId: workloadAssignments.subjectId,
        divisionId: workloadAssignments.divisionId,
        type: workloadAssignments.type,
        hoursPerWeek: workloadAssignments.hoursPerWeek,
        classroom: workloadAssignments.classroom,
        status: workloadAssignments.status,
        faculty: faculty,
        subject: subjects,
        division: divisions,
      })
      .from(workloadAssignments)
      .innerJoin(faculty, eq(workloadAssignments.facultyId, faculty.id))
      .innerJoin(subjects, eq(workloadAssignments.subjectId, subjects.id))
      .innerJoin(divisions, eq(workloadAssignments.divisionId, divisions.id));
  }

  async getWorkloadAssignment(id: number): Promise<WorkloadAssignmentWithDetails | undefined> {
    const [assignment] = await db
      .select({
        id: workloadAssignments.id,
        facultyId: workloadAssignments.facultyId,
        subjectId: workloadAssignments.subjectId,
        divisionId: workloadAssignments.divisionId,
        type: workloadAssignments.type,
        hoursPerWeek: workloadAssignments.hoursPerWeek,
        classroom: workloadAssignments.classroom,
        status: workloadAssignments.status,
        faculty: faculty,
        subject: subjects,
        division: divisions,
      })
      .from(workloadAssignments)
      .innerJoin(faculty, eq(workloadAssignments.facultyId, faculty.id))
      .innerJoin(subjects, eq(workloadAssignments.subjectId, subjects.id))
      .innerJoin(divisions, eq(workloadAssignments.divisionId, divisions.id))
      .where(eq(workloadAssignments.id, id));
    return assignment || undefined;
  }

  async getWorkloadAssignmentsByFaculty(facultyId: number): Promise<WorkloadAssignmentWithDetails[]> {
    return await db
      .select({
        id: workloadAssignments.id,
        facultyId: workloadAssignments.facultyId,
        subjectId: workloadAssignments.subjectId,
        divisionId: workloadAssignments.divisionId,
        type: workloadAssignments.type,
        hoursPerWeek: workloadAssignments.hoursPerWeek,
        classroom: workloadAssignments.classroom,
        status: workloadAssignments.status,
        faculty: faculty,
        subject: subjects,
        division: divisions,
      })
      .from(workloadAssignments)
      .innerJoin(faculty, eq(workloadAssignments.facultyId, faculty.id))
      .innerJoin(subjects, eq(workloadAssignments.subjectId, subjects.id))
      .innerJoin(divisions, eq(workloadAssignments.divisionId, divisions.id))
      .where(eq(workloadAssignments.facultyId, facultyId));
  }

  async createWorkloadAssignment(insertAssignment: InsertWorkloadAssignment): Promise<WorkloadAssignment> {
    const [assignment] = await db.insert(workloadAssignments).values({
      ...insertAssignment,
      status: "assigned",
    }).returning();
    return assignment;
  }

  async updateWorkloadAssignmentStatus(id: number, status: string): Promise<WorkloadAssignment | undefined> {
    const [updated] = await db.update(workloadAssignments).set({ status }).where(eq(workloadAssignments.id, id)).returning();
    return updated || undefined;
  }

  async deleteWorkloadAssignment(id: number): Promise<boolean> {
    const result = await db.delete(workloadAssignments).where(eq(workloadAssignments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllTimetableSlots(): Promise<TimetableSlotWithDetails[]> {
    return await db
      .select({
        id: timetableSlots.id,
        divisionId: timetableSlots.divisionId,
        facultyId: timetableSlots.facultyId,
        subjectId: timetableSlots.subjectId,
        dayOfWeek: timetableSlots.dayOfWeek,
        startTime: timetableSlots.startTime,
        endTime: timetableSlots.endTime,
        classroom: timetableSlots.classroom,
        type: timetableSlots.type,
        faculty: faculty,
        subject: subjects,
        division: divisions,
      })
      .from(timetableSlots)
      .innerJoin(faculty, eq(timetableSlots.facultyId, faculty.id))
      .innerJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
      .innerJoin(divisions, eq(timetableSlots.divisionId, divisions.id));
  }

  async getTimetableSlotsByDivision(divisionId: number): Promise<TimetableSlotWithDetails[]> {
    return await db
      .select({
        id: timetableSlots.id,
        divisionId: timetableSlots.divisionId,
        facultyId: timetableSlots.facultyId,
        subjectId: timetableSlots.subjectId,
        dayOfWeek: timetableSlots.dayOfWeek,
        startTime: timetableSlots.startTime,
        endTime: timetableSlots.endTime,
        classroom: timetableSlots.classroom,
        type: timetableSlots.type,
        faculty: faculty,
        subject: subjects,
        division: divisions,
      })
      .from(timetableSlots)
      .innerJoin(faculty, eq(timetableSlots.facultyId, faculty.id))
      .innerJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
      .innerJoin(divisions, eq(timetableSlots.divisionId, divisions.id))
      .where(eq(timetableSlots.divisionId, divisionId));
  }

  async getTimetableSlotsByFaculty(facultyId: number): Promise<TimetableSlotWithDetails[]> {
    return await db
      .select({
        id: timetableSlots.id,
        divisionId: timetableSlots.divisionId,
        facultyId: timetableSlots.facultyId,
        subjectId: timetableSlots.subjectId,
        dayOfWeek: timetableSlots.dayOfWeek,
        startTime: timetableSlots.startTime,
        endTime: timetableSlots.endTime,
        classroom: timetableSlots.classroom,
        type: timetableSlots.type,
        faculty: faculty,
        subject: subjects,
        division: divisions,
      })
      .from(timetableSlots)
      .innerJoin(faculty, eq(timetableSlots.facultyId, faculty.id))
      .innerJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
      .innerJoin(divisions, eq(timetableSlots.divisionId, divisions.id))
      .where(eq(timetableSlots.facultyId, facultyId));
  }

  async createTimetableSlot(insertSlot: InsertTimetableSlot): Promise<TimetableSlot> {
    const [slot] = await db.insert(timetableSlots).values(insertSlot).returning();
    return slot;
  }

  async updateTimetableSlot(id: number, updates: Partial<InsertTimetableSlot>): Promise<TimetableSlot | undefined> {
    const [updated] = await db.update(timetableSlots).set(updates).where(eq(timetableSlots.id, id)).returning();
    return updated || undefined;
  }

  async deleteTimetableSlot(id: number): Promise<boolean> {
    const result = await db.delete(timetableSlots).where(eq(timetableSlots.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllExcelUploads(): Promise<ExcelUpload[]> {
    return await db.select().from(excelUploads);
  }

  async createExcelUpload(insertUpload: InsertExcelUpload): Promise<ExcelUpload> {
    const [upload] = await db.insert(excelUploads).values({
      ...insertUpload,
      status: "processing",
      processedRows: 0,
      totalRows: 0,
    }).returning();
    return upload;
  }

  async updateExcelUploadStatus(id: number, status: string, processedRows?: number, totalRows?: number): Promise<ExcelUpload | undefined> {
    const updates: any = { status };
    if (processedRows !== undefined) updates.processedRows = processedRows;
    if (totalRows !== undefined) updates.totalRows = totalRows;
    
    const [updated] = await db.update(excelUploads).set(updates).where(eq(excelUploads.id, id)).returning();
    return updated || undefined;
  }

  async getDashboardStats(): Promise<{
    totalFaculty: number;
    activeCourses: number;
    pendingTasks: number;
    avgWorkload: number;
  }> {
    const [facultyCount] = await db.select({ count: sql<number>`count(*)` }).from(faculty);
    const [subjectCount] = await db.select({ count: sql<number>`count(*)` }).from(subjects);
    const [assignmentCount] = await db.select({ count: sql<number>`count(*)` }).from(workloadAssignments).where(eq(workloadAssignments.status, "assigned"));
    const [avgWorkloadResult] = await db.select({ avg: sql<number>`avg(${faculty.currentHours})` }).from(faculty);

    return {
      totalFaculty: facultyCount.count,
      activeCourses: subjectCount.count,
      pendingTasks: assignmentCount.count,
      avgWorkload: Math.round(avgWorkloadResult.avg || 0),
    };
  }
}

export const storage = new DatabaseStorage();