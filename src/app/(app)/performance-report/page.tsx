import { ReportTable } from "@/components/performance-report/report-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { detailedReportData } from "@/lib/data";
import { FileText } from "lucide-react";

export default function PerformanceReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3 text-card-foreground">
            Laporan Kinerja
          </h1>
          <p className="text-muted-foreground">
            Laporan sederhana dari semua tugas yang telah dinilai.
          </p>
        </div>
      </div>

       <Card className="rounded-2xl shadow-none border-none">
          <CardContent className="p-6">
            <ReportTable reportData={detailedReportData} />
          </CardContent>
      </Card>
    </div>
  );
}
