export default function HomePage() {
  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <div className="h-1/3 mt-5 ml-26 flex space-x-20 text-black font-bold">
        <div className="bg-gray p-22 rounded-xl shadow-lg border border-gray-500">
          <h2>Tổng số xe :</h2>
        </div>
        <div className="bg-gray p-22 rounded-xl shadow-lg border border-gray-500">
          <h2>Xe đang hoạt động :</h2>
        </div>
        <div className="bg-white p-22 rounded-xl shadow-lg border border-gray-500">
          <h2>Tổng học sinh :</h2>
        </div>
      </div>
      <div className="flex flex-1 mt-5 ml-3 space-x-4">
        <div className="w-2/3 mt-3 ml-3 text-black font-bold border border-black-1 w-2/3 rounded-lg">
          <h1>Map</h1>
        </div>
        <div className="flex-1 mt-3 mr-3 text-black font-bold border border-black-1 w-1/3 rounded-lg">
          <h1>chart</h1>
        </div>
      </div>
    </div>
  );
}
