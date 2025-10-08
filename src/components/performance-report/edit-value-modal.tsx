
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

interface EditValueModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
  onSave: (taskId: string, newValue: number) => void;
}

const possibleValues = [10, 20, 40, 50];

export function EditValueModal({ isOpen, onOpenChange, task, onSave }: EditValueModalProps) {
  const [selectedValue, setSelectedValue] = useState(task.value.toString());

  const handleSave = () => {
    onSave(task.id, parseInt(selectedValue, 10));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah Nilai Tugas</DialogTitle>
          <DialogDescription>
            Sesuaikan nilai untuk tugas &quot;{task.title.id}&quot; sebelum menyetujuinya.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-value" className="text-right">
              Nilai
            </Label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih nilai baru" />
                </SelectTrigger>
                <SelectContent>
                    {possibleValues.map(val => (
                        <SelectItem key={val} value={val.toString()}>
                            {val} Poin
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button type="button" onClick={handleSave}>Simpan & Setujui</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
