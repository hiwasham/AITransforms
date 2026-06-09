import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("ar", "competitive-intelligence");

export default function Page() {
  return <WorkProjectShell locale="ar" slug="competitive-intelligence" />;
}
