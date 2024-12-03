import { Loader2 } from "lucide-react";

export function LoadingText({ text = "Loading..." }) {
  return (
    <div className="flex flex-row justify-center items-center my-auto h-full">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {text}
    </div>
  );
}
