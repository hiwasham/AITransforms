import WorkIndexShell, {
  buildWorkMetadata,
} from "@/components/WorkIndexShell";

export const metadata = buildWorkMetadata("en");

export default function Page() {
  return <WorkIndexShell locale="en" />;
}
