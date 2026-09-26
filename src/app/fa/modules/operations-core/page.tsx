import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("fa", "operations-core");

export default function Page() {
  return <ModulePageShell locale="fa" slug="operations-core" />;
}
