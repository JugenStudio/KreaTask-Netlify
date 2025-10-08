"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DetailedReportEntry } from "@/lib/types";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/providers/language-provider";
import { CheckCircle2, XCircle } from "lucide-react";

interface ReportTableProps {
  reportData: DetailedReportEntry[];
}

export function ReportTable({
  reportData,
}: ReportTableProps) {
  const { locale, t } = useLanguage();

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('report.table.employee')}</TableHead>
            <TableHead>{t('report.table.task_title')}</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>{t('report.table.status')}</TableHead>
            <TableHead className="text-right">{t('report.table.score')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium whitespace-nowrap">{row.employeeName}</TableCell>
              <TableCell className="whitespace-normal break-words">{row.taskTitle[locale]}</TableCell>
              <TableCell><Badge variant="outline">{row.role}</Badge></TableCell>
              <TableCell>
                <Badge variant={row.status === "Terlambat" ? "destructive" : "secondary"} className="flex items-center w-fit text-xs">
                   {row.status === "Terlambat" ? 
                      <XCircle className="mr-1 h-3 w-3" /> : 
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                   }
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="font-bold text-right">{row.taskScore}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
