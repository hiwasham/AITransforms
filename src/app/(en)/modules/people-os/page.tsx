import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("en", "people-os");

export default function Page() {
  return <ModulePageShell locale="en" slug="people-os" />;
}
