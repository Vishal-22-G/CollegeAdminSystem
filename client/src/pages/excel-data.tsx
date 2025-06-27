import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, ArrowLeft, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import type { ExcelUpload } from "@shared/schema";

// Sample Excel data structure - in real implementation this would come from backend
interface ExcelDataRow {
  id: number;
  facultyName: string;
  position: string;
  department: string;
  subject: string;
  hours: number;
  room: string;
  semester: string;
  division: string;
  status: string;
}

// Mock data for demonstration - replace with actual API call
const SAMPLE_EXCEL_DATA: ExcelDataRow[] = [
  {
    id: 1,
    facultyName: "Dr. Rajesh Kumar",
    position: "Professor",
    department: "Computer Science",
    subject: "Advanced Algorithms",
    hours: 4,
    room: "CS-101",
    semester: "Spring 2025",
    division: "A",
    status: "Active"
  },
  {
    id: 2,
    facultyName: "Prof. Priya Sharma",
    position: "Associate Professor",
    department: "Mathematics",
    subject: "Linear Algebra",
    hours: 6,
    room: "MATH-201",
    semester: "Spring 2025",
    division: "B",
    status: "Active"
  },
  {
    id: 3,
    facultyName: "Dr. Amit Mehta",
    position: "Assistant Professor",
    department: "Physics",
    subject: "Quantum Physics",
    hours: 3,
    room: "PHY-301",
    semester: "Spring 2025",
    division: "A",
    status: "Pending"
  },
  {
    id: 4,
    facultyName: "Dr. Sarah Johnson",
    position: "Professor",
    department: "Computer Science",
    subject: "Machine Learning",
    hours: 5,
    room: "CS-102",
    semester: "Spring 2025",
    division: "C",
    status: "Active"
  },
  {
    id: 5,
    facultyName: "Prof. Michael Brown",
    position: "Associate Professor",
    department: "Mathematics",
    subject: "Calculus III",
    hours: 4,
    room: "MATH-103",
    semester: "Spring 2025",
    division: "A",
    status: "Active"
  }
];

export default function ExcelDataViewer() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch upload info
  const { data: upload } = useQuery<ExcelUpload>({
    queryKey: ["/api/excel-uploads", id],
    queryFn: async () => {
      // For now, return mock data - in real implementation, fetch from API
      return {
        id: parseInt(id || "1"),
        filename: "courses_new_updated.xlsx",
        originalName: "courses_new_updated.xlsx",
        fileSize: 68620,
        status: "completed",
        uploadedAt: new Date(),
        processedRows: 156,
        totalRows: 156
      } as ExcelUpload;
    }
  });

  // Get unique values for filters
  const departments = useMemo(() => {
    const depts = SAMPLE_EXCEL_DATA.map(row => row.department);
    return depts.filter((dept, index) => depts.indexOf(dept) === index);
  }, []);
  
  const positions = useMemo(() => {
    const pos = SAMPLE_EXCEL_DATA.map(row => row.position);
    return pos.filter((position, index) => pos.indexOf(position) === index);
  }, []);

  const statuses = useMemo(() => {
    const stats = SAMPLE_EXCEL_DATA.map(row => row.status);
    return stats.filter((status, index) => stats.indexOf(status) === index);
  }, []);

  // Filter and search data
  const filteredData = useMemo(() => {
    return SAMPLE_EXCEL_DATA.filter(row => {
      const matchesSearch = searchTerm === "" || 
        Object.values(row).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesDepartment = departmentFilter === "all" || row.department === departmentFilter;
      const matchesPosition = positionFilter === "all" || row.position === positionFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesPosition && matchesStatus;
    });
  }, [searchTerm, departmentFilter, positionFilter, statusFilter]);

  const exportToCSV = () => {
    const headers = ["Faculty Name", "Position", "Department", "Subject", "Hours", "Room", "Semester", "Division", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.facultyName,
        row.position,
        row.department,
        row.subject,
        row.hours,
        row.room,
        row.semester,
        row.division,
        row.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${upload?.originalName || 'excel-data'}_filtered.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/excel-import">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Imports
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-6 h-6 text-cms-primary" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {upload?.originalName || "Excel Data"}
                </h1>
                <p className="text-slate-500">
                  {upload?.processedRows || 0} rows processed • 
                  Uploaded {upload?.uploadedAt ? new Date(upload.uploadedAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={exportToCSV} className="bg-cms-primary hover:bg-cms-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Export Filtered Data
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Position Filter */}
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredData.length} of {SAMPLE_EXCEL_DATA.length} records
              </p>
              {(searchTerm || departmentFilter !== "all" || positionFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("all");
                    setPositionFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Search className="w-8 h-8 text-slate-400" />
                          <p className="text-slate-500">No records found matching your criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.facultyName}</TableCell>
                        <TableCell>{row.position}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>{row.hours}</TableCell>
                        <TableCell>{row.room}</TableCell>
                        <TableCell>{row.semester}</TableCell>
                        <TableCell>{row.division}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={row.status === "Active" ? "default" : "secondary"}
                            className={row.status === "Active" ? "bg-cms-success text-white" : ""}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}