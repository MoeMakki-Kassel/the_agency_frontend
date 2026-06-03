import type { ElementType, ReactNode } from "react";
import { cn } from "./ui/utils";

type BidiLtrProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/** Renders Latin digits, phone, email, or codes with stable LTR direction inside RTL layout. */
export function BidiLtr({ children, className, as: Tag = "span" }: BidiLtrProps) {
  return (
    <Tag
      dir="ltr"
      className={cn("inline-block [unicode-bidi:isolate] tabular-nums", className)}
    >
      {children}
    </Tag>
  );
}
