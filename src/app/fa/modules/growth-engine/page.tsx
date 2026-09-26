import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("fa", "growth-engine");

export default function Page() {
  return <ModulePageShell locale="fa" slug="growth-engine" />;
}
