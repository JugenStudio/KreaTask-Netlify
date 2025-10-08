
"use client";

import { useEffect, useMemo, useState }from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allTasks as initialTasks, users } from "@/lib/data";
import type { Task, User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { isEmployee } from "@/lib/roles";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportTable } from "@/components/performance-report/report-table";
import { History, CheckCircle, Edit, ThumbsUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditValueModal } from "@/components/performance-report/edit-value-modal";

export default function PerformanceReportPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
    if (selectedRole) {
      const user = users.find(u => u.role === selectedRole);
      setCurrentUser(user || users[0]);
    } else {
      setCurrentUser(users[0]);
    }
  }, []);

  const handleApprove = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, approvedBy: "Direktur Utama" } : task
      )
    );
    toast({
      title: "Nilai Disetujui",
      description: "Nilai tugas telah divalidasi dan masuk ke riwayat.",
    });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateAndApprove = (taskId: string, newValue: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, value: newValue, approvedBy: "Direktur Utama" } : task
      )
    );
    toast({
      title: "Nilai Diperbarui & Disetujui",
      description: `Nilai tugas telah diubah menjadi ${newValue} dan divalidasi.`,
    });
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const completedTasks = useMemo(() => {
    if (!currentUser) return [];
    if (isEmployee(currentUser.role)) {
      return tasks.filter(task => 
        task.status === "Completed" && 
        task.assignees.some(assignee => assignee.id === currentUser.id)
      );
    }
    // Directors see all completed tasks in the main report
    return tasks.filter(task => task.status === "Completed");
  }, [currentUser, tasks]);

  const tasksToValidate = useMemo(() => {
      if (!currentUser || isEmployee(currentUser.role)) return [];
      // For directors, show tasks that are completed but not yet approved by Direktur Utama
      return tasks.filter(task => task.status === 'Completed' && task.approvedBy === null);
  }, [tasks, currentUser]);


  if (!currentUser) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-1/3" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  // Employee View: Show personal task history
  if (isEmployee(currentUser.role)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
              <History className="h-8 w-8" />
              Riwayat Tugas Selesai
            </h1>
            <p className="text-muted-foreground">
              Berikut adalah daftar semua tugas yang telah Anda selesaikan dan nilainya.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
              <ReportTable tasks={completedTasks} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Director/Super User View: Validation Panel + Full Report
  return (
    <>
      <div className="space-y-8">
          <div>
              <h1 className="text-3xl font-bold font-headline">Laporan & Validasi Kinerja</h1>
              <p className="text-muted-foreground">Setujui nilai tugas dan lihat riwayat kinerja tim.</p>
          </div>

          {/* Validation Panel */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ThumbsUp className="h-6 w-6 text-primary"/> Menunggu Validasi Anda</CardTitle>
                  <CardDescription>Daftar tugas yang nilainya perlu disetujui oleh Anda sebagai Direktur Utama.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="w-full overflow-x-auto rounded-lg border">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Tugas</TableHead>
                                  <TableHead>Karyawan</TableHead>
                                  <TableHead>Nilai Diajukan</TableHead>
                                  <TableHead>Dievaluasi Oleh</TableHead>
                                  <TableHead className="text-right">Aksi</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {tasksToValidate.length > 0 ? tasksToValidate.map(task => (
                                  <TableRow key={task.id}>
                                      <TableCell className="font-medium">{task.title.id}</TableCell>
                                      <TableCell>{task.assignees[0]?.name || 'N/A'}</TableCell>
                                      <TableCell>
                                          <Badge variant="outline">{task.value} Poin</Badge>
                                      </TableCell>
                                      <TableCell>
                                          <Badge variant="secondary">{task.evaluator}</Badge>
                                      </TableCell>
                                      <TableCell className="text-right space-x-2">
                                          <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}><Edit className="h-4 w-4 mr-2" /> Ubah</Button>
                                          <Button variant="default" size="sm" onClick={() => handleApprove(task.id)}><CheckCircle className="h-4 w-4 mr-2" /> Setujui</Button>
                                      </TableCell>
                                  </TableRow>
                              )) : (
                                  <TableRow>
                                      <TableCell colSpan={5} className="h-24 text-center">Tidak ada tugas yang memerlukan validasi saat ini.</TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </div>
              </CardContent>
          </Card>

          {/* Full Performance History */}
          <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
                          <History className="h-7 w-7" />
                          Riwayat Semua Tugas Selesai
                      </h2>
                      <p className="text-muted-foreground">
                          Berikut adalah daftar semua tugas yang telah diselesaikan oleh tim, termasuk yang sudah dan belum divalidasi.
                      </p>
                  </div>
              </div>
              <Card>
                  <CardContent className="pt-6">
                      <ReportTable tasks={completedTasks} />
                  </CardContent>
              </Card>
          </div>
      </div>

      {selectedTask && (
        <EditValueModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          task={selectedTask}
          onSave={handleUpdateAndApprove}
        />
      )}
    </>
  )
}
