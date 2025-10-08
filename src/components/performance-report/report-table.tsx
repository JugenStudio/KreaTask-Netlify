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
import { Download, ArrowUpDown, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ReportTableProps {
  reportData: DetailedReportEntry[];
}

export function ReportTable({
  reportData,
}: ReportTableProps) {
  const { locale, t } = useLanguage();

  return (
    <div className="relative w-full overflow-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="p-4 hidden md:table-cell">
              <Checkbox />
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted min-w-[200px]">
                <div className="flex items-center gap-1">
                    {t('report.table.employee')} <ArrowUpDown className="h-3 w-3" />
                </div>
            </TableHead>
            <TableHead className="min-w-[300px]">{t('report.table.task_title')}</TableHead>
            <TableHead className="min-w-[150px]">{t('report.table.category')}</TableHead>
            <TableHead className="min-w-[150px]">{t('report.table.priority')}</TableHead>
            <TableHead className="min-w-[150px]">{t('report.table.deadline')}</TableHead>
            <TableHead className="min-w-[150px]">{t('report.table.completed_on')}</TableHead>
            <TableHead className="min-w-[200px]">{t('report.table.status')}</TableHead>
            <TableHead className="text-center min-w-[100px]">{t('report.table.revisions')}</TableHead>
            <TableHead className="text-right cursor-pointer hover:bg-muted min-w-[120px]">
                <div className="flex items-center justify-end gap-1">
                    {t('report.table.score')} <ArrowUpDown className="h-3 w-3" />
                </div>
            </TableHead>
            <TableHead className="min-w-[400px]">{t('report.table.ai_justification')}</TableHead>
            <TableHead className="min-w-[150px]">{t('report.table.reviewer')}</TableHead>
            <TableHead className="min-w-[180px]">{t('report.table.assessment_date')}</TableHead>
             <TableHead className="text-center">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((row) => (
            <TableRow key={row.id}>
                <TableCell className="p-4 hidden md:table-cell">
                    <Checkbox />
                </TableCell>
              <TableCell className="font-medium whitespace-nowrap">{row.employeeName}</TableCell>
              <TableCell>{row.taskTitle[locale]}</TableCell>
              <TableCell><Badge variant="outline">{row.category}</Badge></TableCell>
              <TableCell>{row.priority}</TableCell>
              <TableCell className="whitespace-nowrap">{new Date(row.deadline).toLocaleDateString()}</TableCell>
              <TableCell className="whitespace-nowrap">{new Date(row.completedOn).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={row.status === "Terlambat" ? "destructive" : "secondary"} className="flex items-center w-fit">
                   {row.status === "Terlambat" ? 
                      <XCircle className="mr-1.5 h-3 w-3" /> : 
                      <CheckCircle2 className="mr-1.5 h-3 w-3" />
                   }
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{row.revisions}</TableCell>
              <TableCell className="font-bold text-right">{row.taskScore}</TableCell>
              <TableCell>{row.aiJustification[locale]}</TableCell>
              <TableCell className="whitespace-nowrap">{row.reviewer}</TableCell>
              <TableCell className="whitespace-nowrap">{new Date(row.assessmentDate).toLocaleDateString()}</TableCell>
               <TableCell>
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
