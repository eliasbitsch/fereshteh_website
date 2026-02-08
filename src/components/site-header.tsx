import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { ModeSwitcher } from "./mode-switcher";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full animate-delay-1000 animate-fade-down border-border/40 border-b bg-bg backdrop-blur-sm dark:bg-bg/95 supports-backdrop-filter:dark:bg-bg/60">
      <div className="container flex h-14 max-w-(--breakpoint-2xl) items-center sm:h-16">
        <MainNav />
        <MobileNav />
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <ModeSwitcher />
        </nav>
      </div>
    </header>
  );
}
