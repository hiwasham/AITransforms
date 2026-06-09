import WorkIndexShell, {
  buildWorkMetadata,
} from "@/components/WorkIndexShell";

export const metadata = buildWorkMetadata("fa");

export default function Page() {
  return <WorkIndexShell locale="fa" />;
}
