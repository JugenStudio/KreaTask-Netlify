import { ReportTable } from "@/components/performance-report/report-table";
import {
  Card,
} from "@/components/ui/card";
import { detailedReportData, users } from "@/lib/data";
import { FileText, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PerformanceReportPage() {
  const roles = [...new Set(users.map(user => user.role))];
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3 text-card-foreground">
            Laporan Kinerja
          </h1>
          <p className="text-muted-foreground">
            Rincian detail dari semua tugas yang dinilai untuk periode ini.
          </p>
        </div>
      </div>

       <Card className="rounded-2xl shadow-none border-none p-0">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-2 items-center w-full md:w-auto">
                      <div className="relative flex-1 md:flex-initial">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Cari berdasarkan nama..." className="w-full md:w-48 pl-8" />
                      </div>
                      <Select>
                          <SelectTrigger className="w-full md:w-40">
                              <SelectValue placeholder="Semua Status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Semua Status</SelectItem>
                              <SelectItem value="Selesai Tepat Waktu">Selesai Tepat Waktu</SelectItem>
                              <SelectItem value="Terlambat">Terlambat</SelectItem>
                          </SelectContent>
                      </Select>
                      <Select>
                          <SelectTrigger className="w-full md:w-40">
                              <SelectValue placeholder="Semua Jabatan" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Semua Jabatan</SelectItem>
                              {roles.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <Button variant="outline" className="hidden md:flex">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                      </Button>
                  </div>
              </div>
            </div>
          <ReportTable reportData={detailedReportData} />
      </Card>
    </div>
  );
}

    