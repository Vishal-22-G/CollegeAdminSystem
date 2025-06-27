import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkloadAssignmentSchema } from "@shared/schema";
import { Faculty, Subject, Division, WorkloadAssignment } from "@/lib/types";
import { Plus, Search, Eye, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const workloadFormSchema = insertWorkloadAssignmentSchema.extend({
  facultyId: z.coerce.number(),
  subjectId: z.coerce.number(),
  divisionId: z.coerce.number(),
});

export default function WorkloadManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: faculty, isLoading: facultyLoading } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: divisions } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: workloadAssignments } = useQuery<WorkloadAssignment[]>({
    queryKey: ["/api/workload"],
  });

  const form = useForm<z.infer<typeof workloadFormSchema>>({
    resolver: zodResolver(workloadFormSchema),
    defaultValues: {
      status: "assigned",
      hoursPerWeek: 1,
    },
  });

  const createWorkloadMutation = useMutation({
    mutationFn: (data: z.infer<typeof workloadFormSchema>) =>
      apiRequest("POST", "/api/workload", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workload"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faculty"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Workload assignment created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create workload assignment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof workloadFormSchema>) => {
    createWorkloadMutation.mutate(data);
  };

  const getWorkloadStatus = (faculty: Faculty) => {
    const percentage = (faculty.currentHours / faculty.maxHours) * 100;
    if (percentage > 100) return { label: "Over Limit", variant: "destructive" as const };
    if (percentage >= 90) return { label: "Near Limit", variant: "outline" as const };
    return { label: "Under Limit", variant: "secondary" as const };
  };

  const filteredFaculty = faculty?.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || f.department === departmentFilter;
    const matchesPosition = !positionFilter || f.position === positionFilter;
    return matchesSearch && matchesDepartment && matchesPosition;
  });

  const uniqueDepartments = Array.from(new Set(faculty?.map(f => f.department) || []));

  return (
    <Layout title="Staff Workload Management" subtitle="Assign and manage faculty workload efficiently">
      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Positions</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="associate_professor">Associate Professor</SelectItem>
                  <SelectItem value="assistant_professor">Assistant Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Workload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign New Workload</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="facultyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faculty</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select faculty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {faculty?.map((f) => (
                                <SelectItem key={f.id} value={f.id.toString()}>
                                  {f.name} - {f.department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects?.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                  {s.name} ({s.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="divisionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Division</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select division" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {divisions?.map((d) => (
                                <SelectItem key={d.id} value={d.id.toString()}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hoursPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours per Week</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="classroom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classroom (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CS-101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createWorkloadMutation.isPending}>
                        {createWorkloadMutation.isPending ? "Creating..." : "Create Assignment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Workload Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Faculty</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Load</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Max Load</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {facultyLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 rounded w-48"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : (
                filteredFaculty?.map((f) => {
                  const status = getWorkloadStatus(f);
                  
                  return (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{f.name}</p>
                            <p className="text-sm text-slate-500">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {f.position.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{f.department}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{f.currentHours} hours</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{f.maxHours} hours</td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
