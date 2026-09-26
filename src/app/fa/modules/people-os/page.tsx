import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("fa", "people-os");

export default function Page() {
  return <ModulePageShell locale="fa" slug="people-os" />;
}
