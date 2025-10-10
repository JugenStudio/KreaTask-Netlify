
import { cn } from "@/lib/utils";

export const KreaTaskLogoIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", className)}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15.5 12-7-5.5v11z" />
  </svg>
);
