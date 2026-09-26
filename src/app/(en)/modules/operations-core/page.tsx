import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("en", "operations-core");

export default function Page() {
  return <ModulePageShell locale="en" slug="operations-core" />;
}
