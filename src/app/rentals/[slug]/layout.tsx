import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function RentalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="pt-[140px]">{children}</div>
      <Footer />
    </>
  );
}
