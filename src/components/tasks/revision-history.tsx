import { GitCommit } from "lucide-react";
import type { Revision } from "@/lib/types";
import { useLanguage } from "@/providers/language-provider";

export function RevisionHistory({ revisions }: { revisions: Revision[] }) {
  const { locale, t } = useLanguage();

  if (revisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <GitCommit className="h-12 w-12 mb-4" />
        <p>{t('history.no_revisions')}</p>
        <p className="text-sm">{t('history.no_revisions_desc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-headline font-semibold">{t('history.title')}</h3>
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 h-full w-px bg-border" style={{transform: 'translateX(7px)'}} />
        {revisions.map((revision, index) => (
          <div key={revision.id} className="relative flex items-start pb-8">
            <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-primary border-4 border-background" />
            <div className="pl-4">
              <p className="text-sm font-medium">{revision.author.name}</p>
              <p className="text-sm text-muted-foreground">{revision.change[locale]}</p>
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
