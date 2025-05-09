"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-white px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your submission has been received. Please click below to get started
          again!
        </p>
        <Button onClick={() => router.push("/")} className="w-full">
          <Repeat /> Submit Again
        </Button>
      </div>
    </div>
  );
}
