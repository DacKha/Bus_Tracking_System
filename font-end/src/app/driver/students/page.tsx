import { List } from "lucide-react";
export default function Student() {
  return (
    <div>
      <div className="flex w-full h-15 bg-blue-500 items-center">
        <button type="button">
          <List />
        </button>
        <h1 className="ml-2 text-center font-bold font-3xl">
          Xin chào tài xế!
        </h1>
      </div>
    </div>
  );
}
