import { List, Search } from "lucide-react";
export default function RoutingPage() {
  return (
    <div className="bg-white justify-center items-center min-h-screen">
      <div className="w-screen p-4 bg-blue-500 flex">
        <button type="button">
          <List />
        </button>
        <h1 className="text-white font-bold ml-4">Xem tuyến đường</h1>
      </div>
      <div className="w-full flex justify-center mt-5">
        <div className="relative w-1/2">
          {/* Icon search */}
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          {/* Input */}
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
