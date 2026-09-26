import WorkProjectShell, {
  buildWorkProjectMetadata,
} from "@/components/WorkProjectShell";

export const metadata = buildWorkProjectMetadata("en", "competitive-intelligence");

export default function Page() {
  return <WorkProjectShell locale="en" slug="competitive-intelligence" />;
}
