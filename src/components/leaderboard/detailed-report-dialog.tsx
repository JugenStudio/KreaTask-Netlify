"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DetailedReportEntry } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Download } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

interface DetailedReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: DetailedReportEntry[];
}

export function DetailedReportDialog({
  isOpen,
  onClose,
  reportData,
}: DetailedReportDialogProps) {
  const { locale, t } = useLanguage();

  const handleExport = () => {
    // Basic CSV export functionality
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    const headers = [
      t('report.table.employee'),
      t('report.table.task_title'),
      t('report.table.category'),
      t('report.table.priority'),
      t('report.table.deadline'),
      t('report.table.completed_on'),
      t('report.table.status'),
      t('report.table.revisions'),
      t('report.table.score'),
      t('report.table.ai_justification'),
      t('report.table.reviewer'),
      t('report.table.assessment_date')
    ];
    csvContent += headers.join(",") + "\r\n";

    // Rows
    reportData.forEach(row => {
      const rowData = [
        `"${row.employeeName}"`,
        `"${row.taskTitle[locale]}"`,
        `"${row.category}"`,
        `"${row.priority}"`,
        `"${row.deadline}"`,
        `"${row.completedOn}"`,
        `"${row.status}"`,
        `"${row.revisions}"`,
        `"${row.taskScore}"`,
        `"${row.aiJustification[locale]}"`,
        `"${row.reviewer}"`,
        `"${row.assessmentDate}"`
      ].join(",");
      csvContent += rowData + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "detailed_performance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{t('report.title')}</DialogTitle>
          <DialogDescription>
          {t('report.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
            <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                {t('report.export_csv')}
            </Button>
        </div>
        <div className="h-full relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('report.table.employee')}</TableHead>
                <TableHead>{t('report.table.task_title')}</TableHead>
                <TableHead>{t('report.table.category')}</TableHead>
                <TableHead>{t('report.table.priority')}</TableHead>
                <TableHead>{t('report.table.deadline')}</TableHead>
                <TableHead>{t('report.table.completed_on')}</TableHead>
                <TableHead>{t('report.table.status')}</TableHead>
                <TableHead>{t('report.table.revisions')}</TableHead>
                <TableHead>{t('report.table.score')}</TableHead>
                <TableHead className="min-w-[200px]">{t('report.table.ai_justification')}</TableHead>
                <TableHead>{t('report.table.reviewer')}</TableHead>
                <TableHead>{t('report.table.assessment_date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.employeeName}</TableCell>
                  <TableCell>{row.taskTitle[locale]}</TableCell>
                  <TableCell><Badge variant="outline">{row.category}</Badge></TableCell>
                  <TableCell>{row.priority}</TableCell>
                  <TableCell>{new Date(row.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(row.completedOn).toLocaleDateString()}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.revisions}</TableCell>
                  <TableCell className="font-bold">{row.taskScore}</TableCell>
                  <TableCell>{row.aiJustification[locale]}</TableCell>
                  <TableCell>{row.reviewer}</TableCell>
                  <TableCell>{new Date(row.assessmentDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
