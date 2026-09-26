import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("en", "support-transformation");

export default function Page() {
  return <WorkProjectShell locale="en" slug="support-transformation" />;
}
