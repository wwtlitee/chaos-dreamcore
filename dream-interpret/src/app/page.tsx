import { MainLayout } from "@/components/layout/main-layout";
import { RitualHome } from "@/components/home/ritual-home";

export default function HomePage() {
  return (
    <MainLayout hideFooter>
      <RitualHome />
    </MainLayout>
  );
}
