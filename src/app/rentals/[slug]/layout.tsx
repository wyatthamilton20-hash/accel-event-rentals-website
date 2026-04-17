import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
