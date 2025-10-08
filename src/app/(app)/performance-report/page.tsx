
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
import { History, CheckCircle, Edit, ThumbsUp, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditValueModal } from "@/components/performance-report/edit-value-modal";
import { useLanguage } from "@/providers/language-provider";

export default function PerformanceReportPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { t, locale } = useLanguage();

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
      title: t('report.toast.approved.title'),
      description: t('report.toast.approved.description'),
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
      title: t('report.toast.updated.title'),
      description: t('report.toast.updated.description', { value: newValue.toString() }),
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

  const handleExportCSV = () => {
    if (completedTasks.length === 0) {
      toast({
        title: t('report.toast.export_failed.title'),
        description: t('report.toast.export_failed.description'),
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "ID Tugas",
      "Judul Tugas",
      "Karyawan",
      "Kategori Nilai",
      "Nilai",
      "Tanggal Selesai",
      "Status Validasi",
      "Disetujui Oleh",
    ];

    const rows = completedTasks.map(task => [
      task.id,
      `"${task.title[locale].replace(/"/g, '""')}"`, // Handle quotes in title
      `"${task.assignees.map(a => a.name).join(', ')}"`,
      task.valueCategory,
      task.value,
      new Date(task.dueDate).toLocaleDateString('id-ID'),
      task.approvedBy ? "Disetujui" : "Menunggu Validasi",
      task.approvedBy || "N/A"
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "riwayat_tugas_selesai.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t('report.toast.export_success.title'),
      description: t('report.toast.export_success.description'),
    });
  };

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
              {t('report.employee_view.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('report.employee_view.description')}
            </p>
          </div>
           <Button onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            {t('report.export_csv')}
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="w-full overflow-x-auto">
              <ReportTable tasks={completedTasks} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Director/Super User View: Validation Panel + Full Report
  return (
    <>
      <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t('report.director_view.title')}</h1>
                <p className="text-muted-foreground">{t('report.director_view.description')}</p>
            </div>
            <Button onClick={handleExportCSV}>
              <FileDown className="h-4 w-4 mr-2" />
              {t('report.export_csv')}
            </Button>
          </div>

          {/* Validation Panel */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ThumbsUp className="h-6 w-6 text-primary"/> {t('report.validation_panel.title')}</CardTitle>
                  <CardDescription>{t('report.validation_panel.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="w-full overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>{t('report.validation_panel.table.task')}</TableHead>
                                  <TableHead>{t('report.validation_panel.table.employee')}</TableHead>
                                  <TableHead>{t('report.validation_panel.table.value')}</TableHead>
                                  <TableHead className="text-right">{t('report.validation_panel.table.actions')}</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {tasksToValidate.length > 0 ? tasksToValidate.map(task => (
                                  <TableRow key={task.id}>
                                      <TableCell className="font-medium whitespace-nowrap">{task.title[locale]}</TableCell>
                                      <TableCell className="whitespace-nowrap">{task.assignees[0]?.name || 'N/A'}</TableCell>
                                      <TableCell>
                                          <Badge variant="outline">{task.value} Poin</Badge>
                                      </TableCell>
                                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                                          <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}><Edit className="h-4 w-4 mr-2" /> {t('report.validation_panel.buttons.edit')}</Button>
                                          <Button variant="default" size="sm" onClick={() => handleApprove(task.id)}><CheckCircle className="h-4 w-4 mr-2" /> {t('report.validation_panel.buttons.approve')}</Button>
                                      </TableCell>
                                  </TableRow>
                              )) : (
                                  <TableRow>
                                      <TableCell colSpan={4} className="h-24 text-center">{t('report.validation_panel.empty')}</TableCell>
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
                          {t('report.history_panel.title')}
                      </h2>
                      <p className="text-muted-foreground">
                          {t('report.history_panel.description')}
                      </p>
                  </div>
              </div>
              <Card>
                  <CardContent className="pt-6">
                    <div className="w-full overflow-x-auto">
                      <ReportTable tasks={completedTasks} />
                    </div>
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

    