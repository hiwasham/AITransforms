import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("ar", "support-transformation");

export default function Page() {
  return <WorkProjectShell locale="ar" slug="support-transformation" />;
}
