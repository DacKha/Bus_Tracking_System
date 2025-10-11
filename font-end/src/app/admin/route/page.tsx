import { Search, Plus, Eye, Edit, Trash2, Bus, MapPin } from "lucide-react";

// định nghĩa kiểu cho status
type BusStatus = "active" | "maintenance" | "inactive";

interface Route {
  id: number;
  routeNumber: string;
  pickupPoint: string;
  endPoint: string;
  bus: string;
  status: BusStatus;
}

export default function RoutePage() {
  const routes: Route[] = [
    {
      id: 1,
      routeNumber: "Tuyến 01",
      pickupPoint: "Cầu Giấy - Láng Hạ",
      endPoint: "Trường THPT ABC",
      bus: "Bus 29B-001.23",
      status: "active",
    },
    {
      id: 2,
      routeNumber: "Tuyến 02",
      pickupPoint: "Đống Đa - Ba Đình",
      endPoint: "Trường THPT ABC",
      bus: "Bus 29B-002.45",
      status: "active",
    },
    {
      id: 3,
      routeNumber: "Tuyến 03",
      pickupPoint: "Hai Bà Trưng - Hoàn Kiếm",
      endPoint: "Trường THPT ABC",
      bus: "Bus 29B-003.67",
      status: "maintenance",
    },
    {
      id: 4,
      routeNumber: "Tuyến 04",
      pickupPoint: "Thanh Xuân - Hà Đông",
      endPoint: "Trường THPT ABC",
      bus: "Bus 29B-004.89",
      status: "active",
    },
    {
      id: 5,
      routeNumber: "Tuyến 05",
      pickupPoint: "Long Biên - Gia Lâm",
      endPoint: "Trường THPT ABC",
      bus: "Bus 29B-005.12",
      status: "inactive",
    },
    {
      id: 6,
      routeNumber: "Tuyến 06",
      pickupPoint: "Nam Từ Liêm - Bắc Từ Liêm",
      endPoint: "Trường THPT ABC",
      bus: "Bus 29B-006.34",
      status: "active",
    },
  ];

  const getBusStatusColor = (status: BusStatus): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBusStatusText = (status: BusStatus): string => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "maintenance":
        return "Bảo trì";
      case "inactive":
        return "Ngừng hoạt động";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tuyến đường</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Thêm tuyến đường
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tuyến đường..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      {/*Content**/}
      <div className="flex">
        {/* Routes Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tuyến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm đón
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm kết thúc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus tuyến này
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route, index) => (
                <tr
                  key={route.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-800">
                          {route.routeNumber.split(" ")[1]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {route.routeNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-green-500 mr-2" />
                      <span>{route.pickupPoint}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-red-500 mr-2" />
                      <span>{route.endPoint}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Bus className="w-4 h-4 text-blue-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {route.bus}
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBusStatusColor(
                            route.status
                          )}`}
                        >
                          {getBusStatusText(route.status)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          {/* Stats Cards */}
          <div className="flex flex-col md:grid-cols-3 ml-3 gap-3 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng tuyến</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {routes.length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bus className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">
                    {routes.filter((r) => r.status === "active").length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đang bảo trì</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {routes.filter((r) => r.status === "maintenance").length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ngừng hoạt động</p>
                  <p className="text-2xl font-bold text-red-600">
                    {routes.filter((r) => r.status === "inactive").length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
