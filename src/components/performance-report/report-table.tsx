

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
import { Card, CardContent } from "../ui/card";

interface ReportTableProps {
  tasks: Task[];
}

export function ReportTable({ tasks }: ReportTableProps) {
  const { locale, t } = useLanguage();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground bg-secondary/50 rounded-xl md:rounded-2xl">
        <CheckCircle className="h-10 w-10 md:h-12 md:w-12 mb-4 text-green-500" />
        <p className="font-semibold text-sm md:text-base">{t('report.history_panel.empty_title', {defaultValue: "All caught up!"})}</p>
        <p className="text-sm">{t('report.history_panel.empty_desc', {defaultValue: "No completed tasks to show right now."})}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block w-full overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('report.table.task_title')}</TableHead>
              <TableHead>{t('report.table.category')}</TableHead>
              <TableHead>{t('report.table.completed_on')}</TableHead>
              <TableHead>{t('report.table.score')}</TableHead>
              <TableHead>{t('report.table.status')}</TableHead>
              <TableHead className="text-right">{t('report.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {task.title[locale]}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.valueCategory}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(task.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-bold">
                  {task.value} {t('report.edit_modal.points')}
                </TableCell>
                <TableCell>
                  {task.approvedBy ? (
                     <Badge className="bg-green-500 text-white hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('report.table.approved')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('report.table.waiting')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm" className="transition-all active:scale-95">
                    <Link href={`/tasks/${task.id}`}>{t('report.table.view_button')}</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="transition-all active:scale-95 rounded-xl">
            <Link href={`/tasks/${task.id}`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm leading-tight text-card-foreground">{task.title[locale]}</p>
                        <p className="text-xs text-muted-foreground">{t('report.table.completed_on')}: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                        <Badge variant="outline" className="text-xs">{task.value} {t('report.edit_modal.points')}</Badge>
                        {task.approvedBy ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 text-xs hover:bg-green-200">
                                <CheckCircle className="h-2.5 w-2.5 mr-1" />
                                {t('report.table.approved')}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-xs">
                                <Clock className="h-2.5 w-2.5 mr-1" />
                                {t('report.table.waiting')}
                            </Badge>
                        )}
                    </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
