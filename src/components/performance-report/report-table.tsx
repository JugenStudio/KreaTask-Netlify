
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
import type { Task } from "@/lib/types";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "../ui/button";
import { CheckCircle, Clock } from "lucide-react";

interface ReportTableProps {
  tasks: Task[];
}

export function ReportTable({ tasks }: ReportTableProps) {
  const { locale } = useLanguage();

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Completed On</TableHead>
            <TableHead>Nilai</TableHead>
            <TableHead>Status Validasi</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {task.title[locale]}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.valueCategory}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(task.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-bold">
                  {task.value} Poin
                </TableCell>
                <TableCell>
                  {task.approvedBy ? (
                     <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Disetujui
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Menunggu
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tasks/${task.id}`}>View</Link>
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
                No completed tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
