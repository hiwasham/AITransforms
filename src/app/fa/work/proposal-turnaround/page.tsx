import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("fa", "proposal-turnaround");

export default function Page() {
  return <WorkProjectShell locale="fa" slug="proposal-turnaround" />;
}
