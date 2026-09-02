import { ViewTransition } from "react";

export default function LocalePageTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="vocora-page-enter" exit="vocora-page-exit" default="none">
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
