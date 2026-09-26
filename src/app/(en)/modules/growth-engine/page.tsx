import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("en", "growth-engine");

export default function Page() {
  return <ModulePageShell locale="en" slug="growth-engine" />;
}
