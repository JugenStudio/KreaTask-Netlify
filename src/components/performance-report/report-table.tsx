"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { DetailedReportEntry } from "@/lib/types";
import { Badge } from "../ui/badge";
import { ArrowUpDown, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportTableProps {
  reportData: DetailedReportEntry[];
}

export function ReportTable({
  reportData,
}: ReportTableProps) {
  const { locale, t } = useLanguage();

  return (
    <div className="relative w-full overflow-auto border" style={{ height: 'calc(100vh - 350px)' }}>
      <Table className="w-full text-xs md:text-sm">
        <TableHeader className="bg-muted/50 sticky top-0">
          <TableRow>
            <TableHead className="p-2 md:p-4 w-12 hidden md:table-cell">
              <Checkbox />
            </TableHead>
            <TableHead className="p-2 md:p-4 min-w-[150px] cursor-pointer hover:bg-muted">
                <div className="flex items-center gap-1">
                    {t('report.table.employee')} <ArrowUpDown className="h-3 w-3" />
                </div>
            </TableHead>
            <TableHead className="p-2 md:p-4 min-w-[250px]">{t('report.table.task_title')}</TableHead>
            <TableHead className="p-2 md:p-4 min-w-[150px]">Jabatan</TableHead>
            <TableHead className="p-2 md:p-4 min-w-[120px] hidden md:table-cell">{t('report.table.priority')}</TableHead>
            <TableHead className="p-2 md:p-4 min-w-[120px]">{t('report.table.deadline')}</TableHead>
            <TableHead className="p-2 md:p-4 min-w-[120px] hidden md:table-cell">{t('report.table.completed_on')}</TableHead>
            <TableHead className="p-2 md:p-4 min-w-[180px]">{t('report.table.status')}</TableHead>
            <TableHead className="p-2 md:p-4 text-center min-w-[80px] hidden md:table-cell">{t('report.table.revisions')}</TableHead>
            <TableHead className="p-2 md:p-4 text-right cursor-pointer hover:bg-muted min-w-[100px]">
                <div className="flex items-center justify-end gap-1">
                    {t('report.table.score')} <ArrowUpDown className="h-3 w-3" />
                </div>
            </TableHead>
            <TableHead className="p-2 md:p-4 min-w-[300px]">{t('report.table.ai_justification')}</TableHead>
            <TableHead className="p-2 md:p-4 min-w-[150px] hidden md:table-cell">{t('report.table.reviewer')}</TableHead>
            <TableHead className="p-2 md:p-4 min-w-[150px] hidden md:table-cell">{t('report.table.assessment_date')}</TableHead>
             <TableHead className="p-2 md:p-4 text-center hidden md:table-cell">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((row) => (
            <TableRow key={row.id}>
                <TableCell className="p-2 md:p-4 hidden md:table-cell">
                    <Checkbox />
                </TableCell>
              <TableCell className="p-2 md:p-4 font-medium whitespace-nowrap">{row.employeeName}</TableCell>
              <TableCell className="p-2 md:p-4 whitespace-normal break-words">{row.taskTitle[locale]}</TableCell>
              <TableCell className="p-2 md:p-4"><Badge variant="outline">{row.role}</Badge></TableCell>
              <TableCell className="p-2 md:p-4 hidden md:table-cell">{row.priority}</TableCell>
              <TableCell className="p-2 md:p-4 whitespace-nowrap">{new Date(row.deadline).toLocaleDateString()}</TableCell>
              <TableCell className="p-2 md:p-4 whitespace-nowrap hidden md:table-cell">{new Date(row.completedOn).toLocaleDateString()}</TableCell>
              <TableCell className="p-2 md:p-4">
                <Badge variant={row.status === "Terlambat" ? "destructive" : "secondary"} className="flex items-center w-fit text-xs">
                   {row.status === "Terlambat" ? 
                      <XCircle className="mr-1 h-3 w-3" /> : 
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                   }
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="p-2 md:p-4 text-center hidden md:table-cell">{row.revisions}</TableCell>
              <TableCell className="p-2 md:p-4 font-bold text-right">{row.taskScore}</TableCell>
              <TableCell className="p-2 md:p-4 whitespace-normal break-words">{row.aiJustification[locale]}</TableCell>
              <TableCell className="p-2 md:p-4 whitespace-nowrap hidden md:table-cell">{row.reviewer}</TableCell>
              <TableCell className="p-2 md:p-4 whitespace-nowrap hidden md:table-cell">{new Date(row.assessmentDate).toLocaleDateString()}</TableCell>
               <TableCell className="hidden md:table-cell">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Entry</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
