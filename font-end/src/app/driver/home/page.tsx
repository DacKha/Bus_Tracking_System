export default function HomePage() {
  return (
    <div className="bg-white justify-center items-center min-h-screen">
      <div className="w-screen p-4 bg-blue-500">
        <h1 className="text-white font-bold">Xin Chào , Tài Xế!!</h1>
      </div>
      <div className="flex h-1/3 justify-center">
        <div className="p-10 w-1/3 h-60 mt-5 border border-gray-500 rounded-lg shadow-lg ">
          <h1>Lịch trình</h1>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="flex flex-col gap-3 mb-4 w-2/3 h-auto mt-10 border border-gray-500 shadow-lg rounded-xl">
          <div className="flex flex-row gap-3 mx-2 my-2">
            <button className="bg-blue-500 text-white p-4 rounded-lg flex flex-col items-center space-y-2 w-[45vw] shadow-md">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="text-center">
                <p className="font-semibold">Danh sách</p>
                <p className="text-sm">học sinh</p>
              </div>
            </button>

            <button className="bg-blue-500 text-white p-4 rounded-lg flex flex-col items-center w-[45vw] space-y-2 shadow-md">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <div className="text-center">
                <p className="font-semibold">Xem</p>
                <p className="text-sm">tuyến đường</p>
              </div>
            </button>
          </div>

          {/* Alert Button */}
          <div className="flex flex-cols mx-2 my-2">
            <button className="w-full h-auto bg-blue-500 text-white p-4 rounded-lg flex items-center justify-center space-x-3 shadow-md">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4 19h9a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-lg font-semibold">Báo cáo sự cố</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
