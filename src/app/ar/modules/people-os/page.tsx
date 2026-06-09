import ModulePageShell, {
  buildModuleMetadata,
} from "@/components/ModulePageShell";

export const metadata = buildModuleMetadata("ar", "people-os");

export default function Page() {
  return <ModulePageShell locale="ar" slug="people-os" />;
}
