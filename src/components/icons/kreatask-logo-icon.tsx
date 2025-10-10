
import { cn } from "@/lib/utils";

export const KreaTaskLogoIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", className)}
    {...props}
  >
    <path d="M2.5 13.0667C3.12513 12.083 6.34673 8.79543 8.5 7.5C10.5181 6.29131 10.7423 8.72973 10.5 9.5C10.2709 10.2244 9.5 11 8.5 11.5C7.5 12 7.5 12.5 7.5 12.5C7.5 12.5 11.5 11.5 15.5 8C19.5 4.5 21.5 5 21.5 5C21.5 5 21.5 8.5 19 13.5C16.5 18.5 12.5 20.5 10.5 20C8.5 19.5 3.5 18.5 2.5 13.0667Z" />
  </svg>
);
