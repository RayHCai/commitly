import { MarketingSiteHeader } from "@/components/marketing-site-header";

export function HomeTopBar({
  headerClassName,
}: {
  headerClassName?: string;
}) {
  return <MarketingSiteHeader className={headerClassName} />;
}
