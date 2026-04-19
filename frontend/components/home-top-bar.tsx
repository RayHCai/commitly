import { MarketingSiteHeader } from "@/components/marketing-site-header";

export function HomeTopBar() {
  return (
    <>
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-1.5 bg-primary"
        aria-hidden
      />
      <div className="pt-1.5">
        <MarketingSiteHeader />
      </div>
    </>
  );
}
