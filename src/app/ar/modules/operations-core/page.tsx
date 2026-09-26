import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("ar", "operations-core");

export default function Page() {
  return <ModulePageShell locale="ar" slug="operations-core" />;
}
