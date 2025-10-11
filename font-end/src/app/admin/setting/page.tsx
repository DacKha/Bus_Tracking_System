"use client";
import { useState } from "react";
import { Settings, Globe, Sun, Moon, Type, Check } from "lucide-react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("vi");
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
  ];

  const fontSizes = [
    { size: 14, label: "Nhỏ" },
    { size: 16, label: "Trung bình" },
    { size: 18, label: "Lớn" },
    { size: 20, label: "Rất lớn" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 w-screen ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`shadow-sm border-b transition-colors duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                darkMode ? "bg-gray-700" : "bg-blue-100"
              }`}
            >
              <Settings
                className={`w-6 h-6 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Cài Đặt</h1>
              <p
                className={`mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tùy chỉnh giao diện và ngôn ngữ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Language Settings */}
          <div
            className={`rounded-2xl shadow-sm border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Globe
                  className={`w-5 h-5 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h2 className="text-lg font-semibold">Ngôn Ngữ</h2>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Chọn ngôn ngữ hiển thị
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between hover:scale-105 ${
                      language === lang.code
                        ? darkMode
                          ? "border-blue-400 bg-blue-400/10"
                          : "border-blue-500 bg-blue-50"
                        : darkMode
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span
                        className="font-medium"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {lang.name}
                      </span>
                    </div>
                    {language === lang.code && (
                      <Check
                        className={`w-5 h-5 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div
            className={`rounded-2xl shadow-sm border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-blue-400" />
                ) : (
                  <Sun className="w-5 h-5 text-blue-600" />
                )}
                <h2 className="text-lg font-semibold">Giao Diện</h2>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Chọn chế độ sáng hoặc tối
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl transition-colors duration-300 ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    {darkMode ? (
                      <Moon className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Sun className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p
                      className="font-medium"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {darkMode ? "Chế độ tối" : "Chế độ sáng"}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {darkMode
                        ? "Dễ dàng cho mắt trong điều kiện ánh sáng yếu"
                        : "Giao diện sáng, rõ ràng"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                    darkMode ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${
                      darkMode
                        ? "transform translate-x-7"
                        : "transform translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Font Size Settings */}
          <div
            className={`rounded-2xl shadow-sm border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Type
                  className={`w-5 h-5 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h2 className="text-lg font-semibold">Kích Thước Chữ</h2>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Điều chỉnh độ lớn của văn bản
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: `${fontSize}px` }}>
                    Xem trước: Đây là văn bản mẫu với kích thước hiện tại
                  </span>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {fontSize}px
                  </span>
                </div>

                <div className="space-y-3">
                  {fontSizes.map((item) => (
                    <button
                      key={item.size}
                      onClick={() => setFontSize(item.size)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between hover:scale-105 ${
                        fontSize === item.size
                          ? darkMode
                            ? "border-blue-400 bg-blue-400/10"
                            : "border-blue-500 bg-blue-50"
                          : darkMode
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Type
                          className={`w-5 h-5 ${
                            fontSize === item.size
                              ? darkMode
                                ? "text-blue-400"
                                : "text-blue-600"
                              : darkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        />
                        <div className="text-left">
                          <p
                            className="font-medium"
                            style={{ fontSize: `${item.size}px` }}
                          >
                            {item.label}
                          </p>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {item.size}px
                          </p>
                        </div>
                      </div>
                      {fontSize === item.size && (
                        <Check
                          className={`w-5 h-5 ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div
                  className={`mt-6 p-4 rounded-xl ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Type
                      className={`w-4 h-4 ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      Slider điều chỉnh
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      darkMode ? "bg-gray-600" : "bg-gray-200"
                    }`}
                    style={{
                      background: `linear-gradient(to right, ${
                        darkMode ? "#3B82F6" : "#3B82F6"
                      } 0%, ${darkMode ? "#3B82F6" : "#3B82F6"} ${
                        ((fontSize - 12) / (24 - 12)) * 100
                      }%, ${darkMode ? "#4B5563" : "#E5E7EB"} ${
                        ((fontSize - 12) / (24 - 12)) * 100
                      }%, ${darkMode ? "#4B5563" : "#E5E7EB"} 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>12px</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-6">
            <button
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                darkMode
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              Lưu Cài Đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
