import { List } from "lucide-react";
export default function HomePage() {
  return (
    <div className="bg-white justify-center items-center min-h-screen">
      <div className="w-screen p-4 bg-green-500 flex">
        <button type="button">
          <List />
        </button>
        <h1 className="text-white font-bold ml-4">Xin Chào , Anh /Chị !!</h1>
      </div>
    </div>
  );
}
