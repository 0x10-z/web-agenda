import Navbar from "./Navbar";

interface PageHeaderProps {
  handleLogout: () => void;
}

export default function PageHeader({ handleLogout }: PageHeaderProps) {
  return (
    <section className="flex-none">
      <div className="mx-auto max-w-screen-lg">
        <Navbar handleLogout={handleLogout} />
      </div>
    </section>
  );
}
