import { db } from "./db";
import { faculty, subjects, divisions, workloadAssignments } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // Clear existing data first
  await db.delete(workloadAssignments);
  await db.delete(timetableSlots);
  await db.delete(faculty);
  await db.delete(subjects);
  await db.delete(divisions);
  console.log("Cleared existing data");

  // Add sample faculty
  const facultyData = [
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
      department: "Computer Science",
      maxHours: 16,
    },
    {
      name: "Dr. Amit Patel",
      email: "amit.patel@college.edu",
      position: "assistant_professor",
      department: "Computer Science",
      maxHours: 18,
    },
    {
      name: "Dr. Sunita Rao",
      email: "sunita.rao@college.edu",
      position: "professor",
      department: "Mathematics",
      maxHours: 14,
    },
    {
      name: "Prof. Vikram Singh",
      email: "vikram.singh@college.edu",
      position: "associate_professor",
      department: "Physics",
      maxHours: 16,
    },
  ];

  const insertedFaculty = await db.insert(faculty).values(facultyData).returning();
  console.log(`Inserted ${insertedFaculty.length} faculty members`);

  // Add sample subjects
  const subjectsData = [
    {
      name: "Advanced Algorithms",
      code: "CS401",
      credits: 4,
      department: "Computer Science",
      semester: 7,
    },
    {
      name: "Database Management Systems",
      code: "CS402",
      credits: 3,
      department: "Computer Science",
      semester: 5,
    },
    {
      name: "Web Development",
      code: "CS403",
      credits: 3,
      department: "Computer Science",
      semester: 6,
    },
    {
      name: "Machine Learning",
      code: "CS404",
      credits: 4,
      department: "Computer Science",
      semester: 8,
    },
    {
      name: "Software Engineering",
      code: "CS405",
      credits: 3,
      department: "Computer Science",
      semester: 6,
    },
    {
      name: "Linear Algebra",
      code: "MATH301",
      credits: 3,
      department: "Mathematics",
      semester: 3,
    },
    {
      name: "Quantum Physics",
      code: "PHY401",
      credits: 4,
      department: "Physics",
      semester: 7,
    },
  ];

  const insertedSubjects = await db.insert(subjects).values(subjectsData).returning();
  console.log(`Inserted ${insertedSubjects.length} subjects`);

  // Add sample divisions
  const divisionsData = [
    {
      name: "Computer Engineering - Division A",
      code: "CE-A",
      department: "Computer Science",
      semester: 5,
      academicYear: "2024-25",
      studentCount: 60,
    },
    {
      name: "Computer Engineering - Division B",
      code: "CE-B",
      department: "Computer Science",
      semester: 5,
      academicYear: "2024-25",
      studentCount: 58,
    },
    {
      name: "Information Technology - Division A",
      code: "IT-A",
      department: "Computer Science",
      semester: 6,
      academicYear: "2024-25",
      studentCount: 55,
    },
    {
      name: "Mathematics - Division A",
      code: "MATH-A",
      department: "Mathematics",
      semester: 3,
      academicYear: "2024-25",
      studentCount: 45,
    },
    {
      name: "Physics - Division A",
      code: "PHY-A",
      department: "Physics",
      semester: 7,
      academicYear: "2024-25",
      studentCount: 40,
    },
  ];

  const insertedDivisions = await db.insert(divisions).values(divisionsData).returning();
  console.log(`Inserted ${insertedDivisions.length} divisions`);

  // Add sample workload assignments
  const assignmentsData = [
    {
      facultyId: insertedFaculty[0].id, // Dr. Rajesh Kumar
      subjectId: insertedSubjects[0].id, // Advanced Algorithms
      divisionId: insertedDivisions[0].id, // CE-A
      type: "lecture",
      hoursPerWeek: 4,
      classroom: "Room 301",
    },
    {
      facultyId: insertedFaculty[1].id, // Prof. Priya Sharma
      subjectId: insertedSubjects[1].id, // Database Management Systems
      divisionId: insertedDivisions[0].id, // CE-A
      type: "lecture",
      hoursPerWeek: 3,
      classroom: "Room 302",
    },
    {
      facultyId: insertedFaculty[2].id, // Dr. Amit Patel
      subjectId: insertedSubjects[2].id, // Web Development
      divisionId: insertedDivisions[2].id, // IT-A
      type: "practical",
      hoursPerWeek: 3,
      classroom: "Computer Lab 1",
    },
    {
      facultyId: insertedFaculty[0].id, // Dr. Rajesh Kumar
      subjectId: insertedSubjects[3].id, // Machine Learning
      divisionId: insertedDivisions[1].id, // CE-B
      type: "lecture",
      hoursPerWeek: 4,
      classroom: "Room 303",
    },
    {
      facultyId: insertedFaculty[1].id, // Prof. Priya Sharma
      subjectId: insertedSubjects[4].id, // Software Engineering
      divisionId: insertedDivisions[2].id, // IT-A
      type: "tutorial",
      hoursPerWeek: 3,
      classroom: "Room 304",
    },
    {
      facultyId: insertedFaculty[3].id, // Dr. Sunita Rao
      subjectId: insertedSubjects[5].id, // Linear Algebra
      divisionId: insertedDivisions[3].id, // MATH-A
      type: "lecture",
      hoursPerWeek: 3,
      classroom: "Room 201",
    },
    {
      facultyId: insertedFaculty[4].id, // Prof. Vikram Singh
      subjectId: insertedSubjects[6].id, // Quantum Physics
      divisionId: insertedDivisions[4].id, // PHY-A
      type: "lecture",
      hoursPerWeek: 4,
      classroom: "Physics Lab 1",
    },
  ];

  const insertedAssignments = await db.insert(workloadAssignments).values(assignmentsData).returning();
  console.log(`Inserted ${insertedAssignments.length} workload assignments`);

  // Update faculty current hours
  for (const assignment of insertedAssignments) {
    const currentFaculty = insertedFaculty.find(f => f.id === assignment.facultyId);
    if (currentFaculty) {
      await db.update(faculty)
        .set({ currentHours: (currentFaculty.currentHours || 0) + assignment.hoursPerWeek })
        .where(eq(faculty.id, assignment.facultyId));
    }
  }

  console.log("Database seeding completed!");
}

// Import eq function
import { eq } from "drizzle-orm";

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };