import { Account } from "@/components/account";
import { Logout } from "@/components/logout";
import Image from "next/image";

export default function Portal() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Logout/>
      <Account/>
    </main>
  );
}
