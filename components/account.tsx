"use client"

import { useBiconomy } from "@/providers/BiconomyContext";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { loginRadius } from "@/app/actions/loginRadius";
import { registerRadius } from "@/app/actions/registerRadius";
import { postAurhFreeRadius } from "@/app/actions/postAurhFreeRadius";
import { postAccountingFreeRadius } from "@/app/actions/postAccountingFreeRadius";


export function Account() {
    const { smartAccountAddress } = useBiconomy()
    const { wallets } = useWallets();
    const { user } = usePrivy()
    console.log(user?.linkedAccounts)
    const linkedIndexAccount = user?.linkedAccounts[0]!

    const wallet = wallets[0];
    console.log(wallet?.address)
    console.log(smartAccountAddress)

    const getEmail = () => {
      if (linkedIndexAccount.type === "email") {
        return user?.email?.address
      }
    }

    return (
      <div className="">
        {
          !smartAccountAddress 
          ?<><p>account loading...</p></>
          :(
            <>
              <p>Your AA wallet is: {smartAccountAddress}</p>
              <p>Your EOA wallet is: {wallet?.address}</p>
            </>
          )
        }
        <Button onClick={async ()=>{
           await loginRadius("string", "string1234")
        }}>Log Rad</Button>
        <Button onClick={async ()=>{
           await registerRadius(smartAccountAddress!, getEmail()!)
        }}>Reg Rad</Button>
        <Button onClick={async ()=>{
           await postAurhFreeRadius("0x001234", "string", "string", smartAccountAddress!, "Accept/")
        }}>Auth Rad</Button>
        <Button onClick={async ()=>{
           await postAccountingFreeRadius("smartAccountAddress"!, "0x001234")
        }}>Acc Rad</Button>
      </div>
    );
}
  