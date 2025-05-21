import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-[10px]">
      <p className="text-xl">Welcome to Happy Travels!</p>
      <Link href="/slides">
        <button className="flex items-center justify-center px-[10px] py-[5px] bg-[#1e1e1e] text-[#dcdcdc] cursor-pointer rounded-md shadow-md">let's travel...</button>
      </Link>
    </div>
  );
}
