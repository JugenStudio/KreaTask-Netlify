import { ReportTable } from "@/components/performance-report/report-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { detailedReportData } from "@/lib/data";
import { FileText } from "lucide-react";

export default function PerformanceReportPage() {
  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3 text-card-foreground">
          <FileText className="h-10 w-10 text-primary" />
          Laporan Kinerja
        </h1>
        <p className="text-muted-foreground text-lg">Rincian detail dari semua tugas yang dinilai untuk periode ini.</p>
      </div>
      <Card className="rounded-2xl shadow-none border-none">
        <CardContent className="pt-6">
          <ReportTable reportData={detailedReportData} />
        </CardContent>
      </Card>
    </div>
  );
}
