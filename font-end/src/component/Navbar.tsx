export default function Navbar() {
  return (
    <header className="h-16 bg-blue-500 flex items-center justify-between px-6 text-white shadow">
      <div className="flex items-center space-x-2">
        <img src="/icon_bus.png" alt="" className="h-12" />
        <h1 className="text-lg font-bold">Smart School Bus</h1>
      </div>
      <div className="flex items-center space-x-2">
        <span className="mr-2">Admin Name</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="rounded-full w-8 h-8 border-2 border-white"
        />
      </div>
    </header>
  );
}
