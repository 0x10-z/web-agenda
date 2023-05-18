import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import Body from "@/components/Body";

export default function IndexPage() {
  return (
    <div
      className="text-gray-700 overflow-hidden min-h-screen flex flex-col bg-slate-600"
      suppressHydrationWarning={true}
    >
      <PageHeader />
      <Body />
      <Footer />
    </div>
  );
}
