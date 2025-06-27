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
  type TimetableSlotWithDetails,
  type WorkloadAssignmentWithDetails
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private faculty: Map<number, Faculty>;
  private subjects: Map<number, Subject>;
  private divisions: Map<number, Division>;
  private workloadAssignments: Map<number, WorkloadAssignment>;
  private timetableSlots: Map<number, TimetableSlot>;
  private excelUploads: Map<number, ExcelUpload>;
  private currentIds: {
    users: number;
    faculty: number;
    subjects: number;
    divisions: number;
    workloadAssignments: number;
    timetableSlots: number;
    excelUploads: number;
  };

  constructor() {
    this.users = new Map();
    this.faculty = new Map();
    this.subjects = new Map();
    this.divisions = new Map();
    this.workloadAssignments = new Map();
    this.timetableSlots = new Map();
    this.excelUploads = new Map();
    this.currentIds = {
      users: 1,
      faculty: 1,
      subjects: 1,
      divisions: 1,
      workloadAssignments: 1,
      timetableSlots: 1,
      excelUploads: 1,
    };

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample faculty
    const sampleFaculty: InsertFaculty[] = [
      {
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@college.edu",
        position: "professor",
        department: "Computer Science",
        maxHours: 14,
      },
      {
        name: "Prof. Priya Sharma",
        email: "priya.sharma@college.edu",
        position: "associate_professor",
        department: "Mathematics",
        maxHours: 16,
      },
      {
        name: "Dr. Amit Mehta",
        email: "amit.mehta@college.edu",
        position: "assistant_professor",
        department: "Physics",
        maxHours: 18,
      },
      {
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@college.edu",
        position: "professor",
        department: "Computer Science",
        maxHours: 14,
      },
      {
        name: "Prof. Neha Patel",
        email: "neha.patel@college.edu",
        position: "associate_professor",
        department: "Computer Science",
        maxHours: 16,
      },
    ];

    // Sample subjects
    const sampleSubjects: InsertSubject[] = [
      { name: "Advanced Algorithms", code: "CS401", department: "Computer Science", credits: 4 },
      { name: "Database Systems", code: "CS402", department: "Computer Science", credits: 4 },
      { name: "Software Engineering", code: "CS403", department: "Computer Science", credits: 3 },
      { name: "Machine Learning", code: "CS404", department: "Computer Science", credits: 4 },
      { name: "Computer Networks", code: "CS405", department: "Computer Science", credits: 3 },
      { name: "Linear Algebra", code: "MATH201", department: "Mathematics", credits: 3 },
      { name: "Quantum Physics", code: "PHY301", department: "Physics", credits: 4 },
    ];

    // Sample divisions
    const sampleDivisions: InsertDivision[] = [
      { name: "Computer Engineering - Division A", department: "Computer Science", semester: 6, academicYear: "2024-25" },
      { name: "Computer Engineering - Division B", department: "Computer Science", semester: 6, academicYear: "2024-25" },
      { name: "Information Technology - Division A", department: "Computer Science", semester: 6, academicYear: "2024-25" },
      { name: "Electronics & Communication - Division A", department: "Electronics", semester: 6, academicYear: "2024-25" },
    ];

    // Initialize sample data
    sampleFaculty.forEach(f => this.createFaculty(f));
    sampleSubjects.forEach(s => this.createSubject(s));
    sampleDivisions.forEach(d => this.createDivision(d));

    // Create some workload assignments
    this.createWorkloadAssignment({
      facultyId: 1,
      subjectId: 1,
      divisionId: 1,
      type: "lecture",
      hoursPerWeek: 4,
      classroom: "CS-101",
    });

    this.createWorkloadAssignment({
      facultyId: 2,
      subjectId: 6,
      divisionId: 1,
      type: "lecture",
      hoursPerWeek: 6,
      classroom: "MATH-201",
    });

    this.createWorkloadAssignment({
      facultyId: 3,
      subjectId: 7,
      divisionId: 1,
      type: "lecture",
      hoursPerWeek: 4,
      classroom: "PHY-301",
    });

    // Update faculty current hours
    this.updateFacultyWorkload(1, 12);
    this.updateFacultyWorkload(2, 16);
    this.updateFacultyWorkload(3, 19);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Faculty methods
  async getAllFaculty(): Promise<Faculty[]> {
    return Array.from(this.faculty.values());
  }

  async getFaculty(id: number): Promise<Faculty | undefined> {
    return this.faculty.get(id);
  }

  async getFacultyWithWorkload(id: number): Promise<FacultyWithWorkload | undefined> {
    const facultyMember = this.faculty.get(id);
    if (!facultyMember) return undefined;

    const assignments = await this.getWorkloadAssignmentsByFaculty(id);
    return { ...facultyMember, assignments };
  }

  async createFaculty(insertFaculty: InsertFaculty): Promise<Faculty> {
    const id = this.currentIds.faculty++;
    const facultyMember: Faculty = { ...insertFaculty, id, currentHours: 0 };
    this.faculty.set(id, facultyMember);
    return facultyMember;
  }

  async updateFaculty(id: number, updates: Partial<InsertFaculty>): Promise<Faculty | undefined> {
    const facultyMember = this.faculty.get(id);
    if (!facultyMember) return undefined;

    const updated = { ...facultyMember, ...updates };
    this.faculty.set(id, updated);
    return updated;
  }

  async updateFacultyWorkload(id: number, hours: number): Promise<Faculty | undefined> {
    const facultyMember = this.faculty.get(id);
    if (!facultyMember) return undefined;

    const updated = { ...facultyMember, currentHours: hours };
    this.faculty.set(id, updated);
    return updated;
  }

  // Subject methods
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentIds.subjects++;
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async getSubjectsByDepartment(department: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(s => s.department === department);
  }

  // Division methods
  async getAllDivisions(): Promise<Division[]> {
    return Array.from(this.divisions.values());
  }

  async getDivision(id: number): Promise<Division | undefined> {
    return this.divisions.get(id);
  }

  async createDivision(insertDivision: InsertDivision): Promise<Division> {
    const id = this.currentIds.divisions++;
    const division: Division = { ...insertDivision, id };
    this.divisions.set(id, division);
    return division;
  }

  async getDivisionsByDepartment(department: string): Promise<Division[]> {
    return Array.from(this.divisions.values()).filter(d => d.department === department);
  }

  // Workload assignment methods
  async getAllWorkloadAssignments(): Promise<WorkloadAssignmentWithDetails[]> {
    const assignments = Array.from(this.workloadAssignments.values());
    return assignments.map(assignment => ({
      ...assignment,
      faculty: this.faculty.get(assignment.facultyId)!,
      subject: this.subjects.get(assignment.subjectId)!,
      division: this.divisions.get(assignment.divisionId)!,
    }));
  }

  async getWorkloadAssignment(id: number): Promise<WorkloadAssignmentWithDetails | undefined> {
    const assignment = this.workloadAssignments.get(id);
    if (!assignment) return undefined;

    return {
      ...assignment,
      faculty: this.faculty.get(assignment.facultyId)!,
      subject: this.subjects.get(assignment.subjectId)!,
      division: this.divisions.get(assignment.divisionId)!,
    };
  }

  async getWorkloadAssignmentsByFaculty(facultyId: number): Promise<WorkloadAssignmentWithDetails[]> {
    const assignments = Array.from(this.workloadAssignments.values())
      .filter(a => a.facultyId === facultyId);
    
    return assignments.map(assignment => ({
      ...assignment,
      faculty: this.faculty.get(assignment.facultyId)!,
      subject: this.subjects.get(assignment.subjectId)!,
      division: this.divisions.get(assignment.divisionId)!,
    }));
  }

  async createWorkloadAssignment(insertAssignment: InsertWorkloadAssignment): Promise<WorkloadAssignment> {
    const id = this.currentIds.workloadAssignments++;
    const assignment: WorkloadAssignment = { ...insertAssignment, id, status: "assigned" };
    this.workloadAssignments.set(id, assignment);
    return assignment;
  }

  async updateWorkloadAssignmentStatus(id: number, status: string): Promise<WorkloadAssignment | undefined> {
    const assignment = this.workloadAssignments.get(id);
    if (!assignment) return undefined;

    const updated = { ...assignment, status };
    this.workloadAssignments.set(id, updated);
    return updated;
  }

  async deleteWorkloadAssignment(id: number): Promise<boolean> {
    return this.workloadAssignments.delete(id);
  }

  // Timetable methods
  async getAllTimetableSlots(): Promise<TimetableSlotWithDetails[]> {
    const slots = Array.from(this.timetableSlots.values());
    return slots.map(slot => ({
      ...slot,
      faculty: this.faculty.get(slot.facultyId)!,
      subject: this.subjects.get(slot.subjectId)!,
      division: this.divisions.get(slot.divisionId)!,
    }));
  }

  async getTimetableSlotsByDivision(divisionId: number): Promise<TimetableSlotWithDetails[]> {
    const slots = Array.from(this.timetableSlots.values())
      .filter(s => s.divisionId === divisionId);
    
    return slots.map(slot => ({
      ...slot,
      faculty: this.faculty.get(slot.facultyId)!,
      subject: this.subjects.get(slot.subjectId)!,
      division: this.divisions.get(slot.divisionId)!,
    }));
  }

  async getTimetableSlotsByFaculty(facultyId: number): Promise<TimetableSlotWithDetails[]> {
    const slots = Array.from(this.timetableSlots.values())
      .filter(s => s.facultyId === facultyId);
    
    return slots.map(slot => ({
      ...slot,
      faculty: this.faculty.get(slot.facultyId)!,
      subject: this.subjects.get(slot.subjectId)!,
      division: this.divisions.get(slot.divisionId)!,
    }));
  }

  async createTimetableSlot(insertSlot: InsertTimetableSlot): Promise<TimetableSlot> {
    const id = this.currentIds.timetableSlots++;
    const slot: TimetableSlot = { ...insertSlot, id };
    this.timetableSlots.set(id, slot);
    return slot;
  }

  async updateTimetableSlot(id: number, updates: Partial<InsertTimetableSlot>): Promise<TimetableSlot | undefined> {
    const slot = this.timetableSlots.get(id);
    if (!slot) return undefined;

    const updated = { ...slot, ...updates };
    this.timetableSlots.set(id, updated);
    return updated;
  }

  async deleteTimetableSlot(id: number): Promise<boolean> {
    return this.timetableSlots.delete(id);
  }

  // Excel upload methods
  async getAllExcelUploads(): Promise<ExcelUpload[]> {
    return Array.from(this.excelUploads.values());
  }

  async createExcelUpload(insertUpload: InsertExcelUpload): Promise<ExcelUpload> {
    const id = this.currentIds.excelUploads++;
    const upload: ExcelUpload = { 
      ...insertUpload, 
      id, 
      status: "processing", 
      uploadedAt: new Date(),
      processedRows: 0,
      totalRows: 0,
    };
    this.excelUploads.set(id, upload);
    return upload;
  }

  async updateExcelUploadStatus(id: number, status: string, processedRows?: number, totalRows?: number): Promise<ExcelUpload | undefined> {
    const upload = this.excelUploads.get(id);
    if (!upload) return undefined;

    const updated = { 
      ...upload, 
      status,
      ...(processedRows !== undefined && { processedRows }),
      ...(totalRows !== undefined && { totalRows }),
    };
    this.excelUploads.set(id, updated);
    return updated;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalFaculty: number;
    activeCourses: number;
    pendingTasks: number;
    avgWorkload: number;
  }> {
    const totalFaculty = this.faculty.size;
    const activeCourses = this.subjects.size;
    const pendingTasks = Array.from(this.workloadAssignments.values())
      .filter(a => a.status === "pending").length;
    
    const facultyList = Array.from(this.faculty.values());
    const totalHours = facultyList.reduce((sum, f) => sum + f.currentHours, 0);
    const avgWorkload = facultyList.length > 0 ? totalHours / facultyList.length : 0;

    return {
      totalFaculty,
      activeCourses,
      pendingTasks,
      avgWorkload: Math.round(avgWorkload * 10) / 10,
    };
  }
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
