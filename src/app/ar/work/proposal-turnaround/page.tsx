import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("ar", "proposal-turnaround");

export default function Page() {
  return <WorkProjectShell locale="ar" slug="proposal-turnaround" />;
}
