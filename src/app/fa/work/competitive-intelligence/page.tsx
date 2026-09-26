import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("fa", "competitive-intelligence");

export default function Page() {
  return <WorkProjectShell locale="fa" slug="competitive-intelligence" />;
}
