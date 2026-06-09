import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("ar", "growth-engine");

export default function Page() {
  return <ModulePageShell locale="ar" slug="growth-engine" />;
}
