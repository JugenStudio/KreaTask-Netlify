import { GitCommit } from "lucide-react";
import type { Revision } from "@/lib/types";

export function RevisionHistory({ revisions }: { revisions: Revision[] }) {
  if (revisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <GitCommit className="h-12 w-12 mb-4" />
        <p>No revisions yet.</p>
        <p className="text-sm">Changes to the task will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-headline font-semibold">Revision History</h3>
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 h-full w-px bg-border" style={{transform: 'translateX(7px)'}} />
        {revisions.map((revision, index) => (
          <div key={revision.id} className="relative flex items-start pb-8">
            <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-primary border-4 border-background" />
            <div className="pl-4">
              <p className="text-sm font-medium">{revision.author.name}</p>
              <p className="text-sm text-muted-foreground">{revision.change}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(revision.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
