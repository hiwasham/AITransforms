import WorkIndexShell, {
  buildWorkMetadata,
} from "@/components/WorkIndexShell";

export const metadata = buildWorkMetadata("ar");

export default function Page() {
  return <WorkIndexShell locale="ar" />;
}
