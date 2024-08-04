"use client";

import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useLogin } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import Image from "next/image";



//import { usePlausible } from "next-plausible"

export function Login() {
    const router = useRouter()
    
    const { authenticated } = usePrivy()
    const { login } = useLogin({
        onComplete() {
            router.push("/portal")
        }
    })
    

    const Login = async () => {
        try {
            if (authenticated) {
                router.push("/portal")
            }
            if (!authenticated) {
                login()
            }
        } catch (error) {
            console.log(error)
        }
    }

    
    return (
        <Button onClick={Login} className="w-48 rounded-full bg-blue-600 cursor-pointer z-20 hover:bg-green-400">
            <div className="flex w-full justify-between">
              <p>Join CommLink Poral</p>
              <Image
                src="./LeftArrow.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
        </Button>
    );
}