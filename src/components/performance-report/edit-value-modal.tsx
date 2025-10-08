
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { Task } from "@/lib/types";
import { useLanguage } from "@/providers/language-provider";

interface EditValueModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
  onSave: (taskId: string, newValue: number) => void;
}

const possibleValues = [10, 20, 40, 50];

export function EditValueModal({ isOpen, onOpenChange, task, onSave }: EditValueModalProps) {
  const [selectedValue, setSelectedValue] = useState(task.value.toString());
  const { locale, t } = useLanguage();

  const handleSave = () => {
    onSave(task.id, parseInt(selectedValue, 10));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('report.edit_modal.title')}</DialogTitle>
          <DialogDescription>
            {t('report.edit_modal.description', { taskTitle: task.title[locale] })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-value" className="text-right">
              {t('report.edit_modal.value_label')}
            </Label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('report.edit_modal.select_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                    {possibleValues.map(val => (
                        <SelectItem key={val} value={val.toString()}>
                            {val} {t('report.edit_modal.points')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('report.edit_modal.cancel_button')}</Button>
          <Button type="button" onClick={handleSave}>{t('report.edit_modal.save_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
