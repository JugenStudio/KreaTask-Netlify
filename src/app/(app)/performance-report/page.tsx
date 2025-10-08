
"use client";

import { useState } from "react";
import { ReportTable } from "@/components/performance-report/report-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { detailedReportData } from "@/lib/data";
import type { DetailedReportEntry, UserRole } from "@/lib/types";

export default function PerformanceReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "All">("All");

  const roles: UserRole[] = [...new Set(detailedReportData.map(d => d.role))];

  const filteredData = detailedReportData.filter((item) => {
    const matchesSearch = item.employeeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole =
      selectedRole === "All" || item.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Laporan Kinerja</h1>
          <p className="text-muted-foreground">
            Laporan sederhana dari semua tugas yang telah dinilai.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-none border-none">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <Select
              value={selectedRole}
              onValueChange={(value: UserRole | "All") => setSelectedRole(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
            <div className="w-full overflow-x-auto">
                <ReportTable reportData={filteredData} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
