import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFacultySchema, 
  insertSubjectSchema, 
  insertDivisionSchema, 
  insertWorkloadAssignmentSchema,
  insertTimetableSlotSchema,
  insertExcelUploadSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Faculty routes
  app.get("/api/faculty", async (req, res) => {
    try {
      const faculty = await storage.getAllFaculty();
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch faculty" });
    }
  });

  app.get("/api/faculty/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faculty = await storage.getFacultyWithWorkload(id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch faculty" });
    }
  });

  app.post("/api/faculty", async (req, res) => {
    try {
      const data = insertFacultySchema.parse(req.body);
      
      // Set max hours based on position
      let maxHours = 18; // default for assistant professor
      if (data.position === "professor") maxHours = 14;
      else if (data.position === "associate_professor") maxHours = 16;
      
      const faculty = await storage.createFaculty({ ...data, maxHours });
      res.status(201).json(faculty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create faculty" });
    }
  });

  app.patch("/api/faculty/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const faculty = await storage.updateFaculty(id, updates);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ message: "Failed to update faculty" });
    }
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const department = req.query.department as string;
      const subjects = department 
        ? await storage.getSubjectsByDepartment(department)
        : await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const data = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(data);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Division routes
  app.get("/api/divisions", async (req, res) => {
    try {
      const department = req.query.department as string;
      const divisions = department 
        ? await storage.getDivisionsByDepartment(department)
        : await storage.getAllDivisions();
      res.json(divisions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch divisions" });
    }
  });

  app.post("/api/divisions", async (req, res) => {
    try {
      const data = insertDivisionSchema.parse(req.body);
      const division = await storage.createDivision(data);
      res.status(201).json(division);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create division" });
    }
  });

  // Workload assignment routes
  app.get("/api/workload-assignments", async (req, res) => {
    try {
      const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string) : null;
      const assignments = facultyId 
        ? await storage.getWorkloadAssignmentsByFaculty(facultyId)
        : await storage.getAllWorkloadAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workload assignments" });
    }
  });

  app.post("/api/workload-assignments", async (req, res) => {
    try {
      const data = insertWorkloadAssignmentSchema.parse(req.body);
      const assignment = await storage.createWorkloadAssignment(data);
      
      // Update faculty current hours
      const faculty = await storage.getFaculty(data.facultyId);
      if (faculty) {
        const newHours = faculty.currentHours + data.hoursPerWeek;
        await storage.updateFacultyWorkload(data.facultyId, newHours);
      }
      
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workload assignment" });
    }
  });

  app.patch("/api/workload-assignments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const assignment = await storage.updateWorkloadAssignmentStatus(id, status);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update assignment status" });
    }
  });

  app.delete("/api/workload-assignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assignment = await storage.getWorkloadAssignment(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      const success = await storage.deleteWorkloadAssignment(id);
      if (success) {
        // Update faculty current hours
        const faculty = await storage.getFaculty(assignment.facultyId);
        if (faculty) {
          const newHours = Math.max(0, faculty.currentHours - assignment.hoursPerWeek);
          await storage.updateFacultyWorkload(assignment.facultyId, newHours);
        }
        res.json({ message: "Assignment deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete assignment" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Timetable routes
  app.get("/api/timetable", async (req, res) => {
    try {
      const divisionId = req.query.divisionId ? parseInt(req.query.divisionId as string) : null;
      const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string) : null;
      
      let slots;
      if (divisionId) {
        slots = await storage.getTimetableSlotsByDivision(divisionId);
      } else if (facultyId) {
        slots = await storage.getTimetableSlotsByFaculty(facultyId);
      } else {
        slots = await storage.getAllTimetableSlots();
      }
      
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.post("/api/timetable", async (req, res) => {
    try {
      const data = insertTimetableSlotSchema.parse(req.body);
      const slot = await storage.createTimetableSlot(data);
      res.status(201).json(slot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timetable slot" });
    }
  });

  app.patch("/api/timetable/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const slot = await storage.updateTimetableSlot(id, updates);
      if (!slot) {
        return res.status(404).json({ message: "Timetable slot not found" });
      }
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Failed to update timetable slot" });
    }
  });

  app.delete("/api/timetable/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTimetableSlot(id);
      if (success) {
        res.json({ message: "Timetable slot deleted successfully" });
      } else {
        res.status(404).json({ message: "Timetable slot not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timetable slot" });
    }
  });

  // Excel upload routes
  app.get("/api/excel-uploads", async (req, res) => {
    try {
      const uploads = await storage.getAllExcelUploads();
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch excel uploads" });
    }
  });

  app.post("/api/excel-uploads", async (req, res) => {
    try {
      const data = insertExcelUploadSchema.parse(req.body);
      const upload = await storage.createExcelUpload(data);
      res.status(201).json(upload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create excel upload record" });
    }
  });

  app.patch("/api/excel-uploads/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, processedRows, totalRows } = req.body;
      const upload = await storage.updateExcelUploadStatus(id, status, processedRows, totalRows);
      if (!upload) {
        return res.status(404).json({ message: "Excel upload not found" });
      }
      res.json(upload);
    } catch (error) {
      res.status(500).json({ message: "Failed to update excel upload status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
