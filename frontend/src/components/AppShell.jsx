import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import FloatingBg from "./FloatingBg";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex">
      <FloatingBg />
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopNav />
        <main className="flex-1 px-6 md:px-10 py-8">{children}</main>
      </div>
    </div>
  );
}
