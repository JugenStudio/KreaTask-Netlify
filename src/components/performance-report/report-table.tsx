
"use client";

import Link from "next/link";
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
import { Button } from "../ui/button";

interface ReportTableProps {
  reportData: DetailedReportEntry[];
}

export function ReportTable({ reportData }: ReportTableProps) {
  const { locale } = useLanguage();

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Task Title</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.length > 0 ? (
            reportData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {row.employeeName}
                </TableCell>
                <TableCell className="whitespace-normal break-words max-w-xs">
                  {row.taskTitle[locale]}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{row.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "Terlambat" ? "destructive" : "secondary"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-right">
                  {row.taskScore}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tasks/${row.taskId}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
