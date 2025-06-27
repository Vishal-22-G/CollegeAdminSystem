import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, FileSpreadsheet, Eye, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ExcelUpload } from "@shared/schema";

// Mock data for preview table (as mentioned in design reference)
const MOCK_PREVIEW_DATA = [
  {
    facultyName: "Dr. Rajesh Kumar",
    position: "Professor",
    department: "Computer Science",
    subject: "Advanced Algorithms",
    hours: 4,
    room: "CS-101"
  },
  {
    facultyName: "Prof. Priya Sharma",
    position: "Associate Professor", 
    department: "Mathematics",
    subject: "Linear Algebra",
    hours: 6,
    room: "MATH-201"
  },
  {
    facultyName: "Dr. Amit Mehta",
    position: "Assistant Professor",
    department: "Physics", 
    subject: "Quantum Physics",
    hours: 3,
    room: "PHY-301"
  }
];

export default function ExcelImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allUploads = [], isLoading } = useQuery<ExcelUpload[]>({
    queryKey: ["/api/excel-uploads"],
  });

  // Filter out deleted uploads
  const uploads = allUploads.filter(upload => upload.status !== "deleted");

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadData = {
        filename: `${Date.now()}_${file.name}`,
        originalName: file.name,
        fileSize: file.size,
      };
      
      const res = await apiRequest("POST", "/api/excel-uploads", uploadData);
      const uploadResult = await res.json();
      
      // Simulate processing delay
      setTimeout(async () => {
        await apiRequest("PATCH", `/api/excel-uploads/${uploadResult.id}/status`, {
          status: "completed",
          processedRows: Math.floor(Math.random() * 1000) + 100,
          totalRows: Math.floor(Math.random() * 1000) + 100,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/excel-uploads"] });
      }, 2000);
      
      return uploadResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/excel-uploads"] });
      toast({ title: "Success", description: "File uploaded successfully" });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to upload file",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/excel-uploads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/excel-uploads"] });
      toast({ title: "Success", description: "Upload deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete upload",
        variant: "destructive"
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && 
          file.type !== "application/vnd.ms-excel") {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'text-cms-success';
      case 'processing': return 'text-cms-warning';
      case 'error': return 'text-cms-danger';
      default: return 'text-slate-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUploadTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Upload Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-cms-primary/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-cms-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudUpload className="text-cms-primary text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Upload Excel File</h3>
            <p className="text-slate-500 mb-4">Drag and drop your .xlsx file here, or click to browse</p>
            
            {selectedFile ? (
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <FileSpreadsheet className="text-cms-success" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-slate-500">({formatFileSize(selectedFile.size)})</span>
                </div>
              </div>
            ) : null}
            
            <div className="flex items-center justify-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose File
              </Button>
              {selectedFile && (
                <Button 
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                </Button>
              )}
              <span className="text-sm text-slate-500">Maximum file size: 10MB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length > 0 ? (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      upload.status === 'completed' ? 'bg-cms-success/10' :
                      upload.status === 'processing' ? 'bg-cms-warning/10' : 'bg-cms-danger/10'
                    }`}>
                      <FileSpreadsheet className={getStatusIcon(upload.status)} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{upload.originalName}</h4>
                      <p className="text-sm text-slate-500">
                        {upload.totalRows && upload.totalRows > 0 ? `${upload.processedRows || 0}/${upload.totalRows} rows` : formatFileSize(upload.fileSize)} • 
                        Uploaded {formatUploadTime(upload.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(upload.status)}>
                      {upload.status === 'processing' && upload.totalRows && upload.totalRows > 0 ? 
                        `${Math.round(((upload.processedRows || 0) / upload.totalRows) * 100)}%` : 
                        upload.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`/excel-data/${upload.id}`, '_blank')}
                      title="View Data"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(upload.id)}
                      disabled={deleteMutation.isPending}
                      title="Delete Upload"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No uploads yet</h3>
              <p className="text-slate-500">Upload your first Excel file to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Preview</CardTitle>
            <Button>
              Process Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Hours/Week</TableHead>
                <TableHead>Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PREVIEW_DATA.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.facultyName}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>{row.hours}</TableCell>
                  <TableCell>{row.room}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
