import { Search, Plus } from "lucide-react";

export default function FollowPage() {
  return (
    <div className="flex flex-col w-[95vw] mx-auto bg-white">
      <div className="flex bg-white w-full h-32 mt-5 p-4">
        <button className="h-12 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Thêm
        </button>

        <div className="flex-1 ml-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full shadow-lg py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>
      </div>
      <div className="flex">
        <div className="w-3/4 border border-gray-300 h-120 ml-5 mr-2 rounded-lg shadow-lg">
          <h1>map</h1>
        </div>
        <div className="w-1/4 border ml-2 mr-2 border-gray-300 h-120 rounded-lg shadow-lg">
          <h1>Danh sách thẻ trực tuyến </h1>
        </div>
      </div>
    </div>
  );
}
