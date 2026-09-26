import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("en", "proposal-turnaround");

export default function Page() {
  return <WorkProjectShell locale="en" slug="proposal-turnaround" />;
}
