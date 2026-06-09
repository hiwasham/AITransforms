import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("fa", "support-transformation");

export default function Page() {
  return <WorkProjectShell locale="fa" slug="support-transformation" />;
}
