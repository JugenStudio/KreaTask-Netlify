
"use client";

import { useEffect, useMemo, useState }from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTaskData } from "@/hooks/use-task-data";
import type { Task, User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { isEmployee } from "@/lib/roles";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportTable } from "@/components/performance-report/report-table";
import { History, CheckCircle, Edit, ThumbsUp, FileDown, Filter, Calendar as CalendarIcon, X, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditValueModal } from "@/components/performance-report/edit-value-modal";
import { useLanguage } from "@/providers/language-provider";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useCurrentUser } from "@/app/(app)/layout";
import Link from "next/link";

export default function PerformanceReportPage() {
  const { currentUser } = useCurrentUser();
  const { allTasks, users, isLoading, updateTask } = useTaskData();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedForApproval, setSelectedForApproval] = useState<Set<string>>(new Set());
  const { t, locale } = useLanguage();

  // Filters for report history
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "waiting">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();


  const handleApprove = (taskId: string) => {
    updateTask(taskId, { approvedBy: "Direktur Utama" });
    toast({
      title: t('report.toast.approved.title'),
      description: t('report.toast.approved.description'),
    });
  };

  const handleBulkApprove = () => {
    selectedForApproval.forEach(taskId => {
        updateTask(taskId, { approvedBy: "Direktur Utama" });
    });
    toast({
      title: t('report.validation_panel.tasks_approved_toast', { count: selectedForApproval.size.toString() }),
      description: t('report.validation_panel.tasks_approved_desc_toast'),
    });
    setSelectedForApproval(new Set());
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateAndApprove = (taskId: string, newValue: number) => {
    updateTask(taskId, { value: newValue, approvedBy: "Direktur Utama" });
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
      return allTasks.filter(task => 
        task.status === "Completed" && 
        task.assignees.some(assignee => assignee.id === currentUser.id)
      );
    }
    // Directors see all completed tasks in the main report
    return allTasks.filter(task => task.status === "Completed");
  }, [currentUser, allTasks]);
  
  const filteredCompletedTasks = useMemo(() => {
    return completedTasks.filter(task => {
      const employeeMatch = employeeFilter === 'all' || task.assignees.some(a => a.id === employeeFilter);
      const statusMatch = statusFilter === 'all' || (statusFilter === 'approved' && task.approvedBy) || (statusFilter === 'waiting' && !task.approvedBy);
      const dateMatch = !dateRange?.from || (new Date(task.dueDate) >= dateRange.from && (!dateRange.to || new Date(task.dueDate) <= dateRange.to));
      
      return employeeMatch && statusMatch && dateMatch;
    });
  }, [completedTasks, employeeFilter, statusFilter, dateRange]);


  const tasksToValidate = useMemo(() => {
      if (!currentUser || isEmployee(currentUser.role)) return [];
      // For directors, show tasks that are completed but not yet approved by Direktur Utama
      return allTasks.filter(task => task.status === 'Completed' && task.approvedBy === null);
  }, [allTasks, currentUser]);

  const toggleSelectAll = (checked: boolean) => {
    const newSelected = new Set<string>();
    if (checked) {
      tasksToValidate.forEach(task => newSelected.add(task.id));
    }
    setSelectedForApproval(newSelected);
  };

  const toggleSelectOne = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedForApproval);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedForApproval(newSelected);
  };

  const handleExportCSV = () => {
    const dataToExport = filteredCompletedTasks;
    if (dataToExport.length === 0) {
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

    const rows = dataToExport.map(task => [
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

  const resetFilters = () => {
    setEmployeeFilter("all");
    setStatusFilter("all");
    setDateRange(undefined);
  }

  if (!currentUser || isLoading) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 md:h-12 w-1/3" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  // Employee View: Show personal task history
  if (isEmployee(currentUser.role)) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild className="mb-4 w-fit transition-all active:scale-95">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back_to_home')}
            </Link>
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-3">
              <History className="h-6 w-6 md:h-8 md:w-8" />
              {t('report.employee_view.title')}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('report.employee_view.description')}
            </p>
          </div>
           <Button onClick={handleExportCSV} size="sm" className="md:size-auto transition-all active:scale-95">
            <FileDown className="h-4 w-4 mr-2" />
            {t('report.export_csv')}
          </Button>
        </div>
        <Card className="card-spotlight">
          <CardContent className="p-4 md:p-6">
            <ReportTable tasks={completedTasks} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Director/Super User View: Validation Panel + Full Report
  return (
    <>
      <div className="space-y-6 md:space-y-8">
          <Button variant="outline" size="sm" asChild className="mb-4 w-fit transition-all active:scale-95">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back_to_home')}
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('report.director_view.title')}</h1>
                <p className="text-muted-foreground text-sm md:text-base">{t('report.director_view.description')}</p>
            </div>
            <Button onClick={handleExportCSV} size="sm" className="md:size-auto transition-all active:scale-95">
              <FileDown className="h-4 w-4 mr-2" />
              {t('report.export_csv')}
            </Button>
          </div>

          {/* Validation Panel */}
          <Card className="card-spotlight">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl md:text-2xl"><ThumbsUp className="h-5 w-5 md:h-6 md:h-6 text-primary"/> {t('report.validation_panel.title')}</CardTitle>
                  <CardDescription>{t('report.validation_panel.description')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {tasksToValidate.length === 0 ? (
                   <div className="h-24 text-center flex flex-col justify-center items-center">
                       <p className="text-sm font-semibold">{t('report.validation_panel.empty')}</p>
                       <p className="text-xs text-muted-foreground">{t('report.validation_panel.empty_desc')}</p>
                   </div>
                ) : (
                  <>
                      {selectedForApproval.size > 0 && (
                          <div className="mb-4 flex items-center justify-between bg-secondary p-2 rounded-lg">
                              <p className="text-sm font-medium text-secondary-foreground">{t('report.validation_panel.selected', {count: selectedForApproval.size})}</p>
                              <Button size="sm" onClick={handleBulkApprove}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {t('report.validation_panel.buttons.approve_selected')}
                              </Button>
                          </div>
                      )}
                      {/* Desktop Table View */}
                      <div className="hidden md:block w-full overflow-x-auto">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead className="w-10">
                                          <Checkbox
                                            checked={selectedForApproval.size === tasksToValidate.length && tasksToValidate.length > 0}
                                            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                            aria-label="Select all"
                                          />
                                      </TableHead>
                                      <TableHead>{t('report.validation_panel.table.task')}</TableHead>
                                      <TableHead className="hidden sm:table-cell">{t('report.validation_panel.table.employee')}</TableHead>
                                      <TableHead>{t('report.validation_panel.table.value')}</TableHead>
                                      <TableHead className="text-right">{t('report.validation_panel.table.actions')}</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {tasksToValidate.map(task => (
                                      <TableRow key={task.id} data-state={selectedForApproval.has(task.id) && "selected"}>
                                          <TableCell>
                                            <Checkbox
                                              checked={selectedForApproval.has(task.id)}
                                              onCheckedChange={(checked) => toggleSelectOne(task.id, !!checked)}
                                              aria-label={`Select task ${task.id}`}
                                            />
                                          </TableCell>
                                          <TableCell className="font-medium whitespace-nowrap">{task.title[locale]}</TableCell>
                                          <TableCell className="whitespace-nowrap hidden sm:table-cell">{task.assignees[0]?.name || 'N/A'}</TableCell>
                                          <TableCell>
                                              <Badge variant="outline">{task.value} {t('report.edit_modal.points')}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right space-x-2 whitespace-nowrap">
                                              <Button variant="ghost" size="sm" onClick={() => handleEdit(task)} className="transition-all active:scale-95"><Edit className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">{t('report.validation_panel.buttons.edit')}</span></Button>
                                              <Button variant="default" size="sm" onClick={() => handleApprove(task.id)} className="transition-all active:scale-95"><CheckCircle className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">{t('report.validation_panel.buttons.approve')}</span></Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="block md:hidden space-y-3">
                          <div className="flex items-center space-x-2 pb-2 border-b">
                              <Checkbox
                                  id="mobile-select-all"
                                  checked={selectedForApproval.size === tasksToValidate.length && tasksToValidate.length > 0}
                                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                  aria-label={t('report.validation_panel.buttons.select_all')}
                              />
                              <Label htmlFor="mobile-select-all" className="text-sm font-medium">{t('report.validation_panel.buttons.select_all')}</Label>
                          </div>
                          {tasksToValidate.map(task => (
                              <Card key={task.id} className="rounded-xl p-3">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 flex items-start gap-3">
                                      <Checkbox
                                          id={`mobile-select-${task.id}`}
                                          checked={selectedForApproval.has(task.id)}
                                          onCheckedChange={(checked) => toggleSelectOne(task.id, !!checked)}
                                          className="mt-1"
                                      />
                                      <div>
                                        <p className="font-semibold text-sm leading-tight">{task.title[locale]}</p>
                                        <p className="text-xs text-muted-foreground">{task.assignees[0]?.name || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">{task.value} {t('report.edit_modal.points')}</Badge>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => handleEdit(task)} className="transition-all active:scale-95"><Edit className="h-4 w-4 mr-2" />{t('report.validation_panel.buttons.edit')}</Button>
                                      <Button variant="default" size="sm" onClick={() => handleApprove(task.id)} className="transition-all active:scale-95"><CheckCircle className="h-4 w-4 mr-2" />{t('report.validation_panel.buttons.approve')}</Button>
                                  </div>
                                </div>
                              </Card>
                          ))}
                      </div>
                  </>
                )}
              </CardContent>
          </Card>

          {/* Full Performance History */}
          <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h2 className="text-xl md:text-2xl font-bold font-headline flex items-center gap-3">
                          <History className="h-6 w-6 md:h-7 md:h-7" />
                          {t('report.history_panel.title')}
                      </h2>
                      <p className="text-muted-foreground text-sm md:text-base">
                          {t('report.history_panel.description')}
                      </p>
                  </div>
              </div>
              <Card className="card-spotlight">
                  <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                          <h4 className="text-base font-semibold flex-shrink-0">{t('report.history_panel.filter.title')}</h4>
                          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                              <SelectTrigger className="w-full sm:w-[180px] h-9">
                                  <SelectValue placeholder={t('report.history_panel.filter.employee_placeholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">{t('report.history_panel.filter.all_employees')}</SelectItem>
                                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                              </SelectContent>
                          </Select>

                          <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="date"
                                  variant={"outline"}
                                  className={cn(
                                    "w-full sm:w-[240px] justify-start text-left font-normal h-9",
                                    !dateRange && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dateRange?.from ? (
                                    dateRange.to ? (
                                      <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                      </>
                                    ) : (
                                      format(dateRange.from, "LLL dd, y")
                                    )
                                  ) : (
                                    <span>{t('report.history_panel.filter.date_placeholder')}</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-50" align="start">
                                <Calendar
                                  initialFocus
                                  mode="range"
                                  defaultMonth={dateRange?.from}
                                  selected={dateRange}
                                  onSelect={setDateRange}
                                  numberOfMonths={1}
                                />
                              </PopoverContent>
                            </Popover>
                          
                          <div className="flex items-center rounded-lg bg-muted p-1">
                              <Button variant={statusFilter === 'all' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setStatusFilter('all')}>{t('report.history_panel.filter.all_status')}</Button>
                              <Button variant={statusFilter === 'approved' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setStatusFilter('approved')}>{t('report.table.approved')}</Button>
                              <Button variant={statusFilter === 'waiting' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setStatusFilter('waiting')}>{t('report.table.waiting')}</Button>
                          </div>
                           {(employeeFilter !== 'all' || statusFilter !== 'all' || dateRange) && (
                              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-muted-foreground">
                                <X className="mr-2 h-4 w-4"/>
                                {t('report.history_panel.filter.reset_button')}
                              </Button>
                            )}
                      </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <ReportTable tasks={filteredCompletedTasks} />
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

    