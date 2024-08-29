"use client"

import { useBiconomy } from "@/providers/BiconomyContext";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { loginOpenWispFrame } from "@/app/actions/loginOpenWispFrame";


export function Account() {
    const { smartAccountAddress } = useBiconomy()
    const { wallets } = useWallets();
    const { user } = usePrivy()
    console.log(user?.linkedAccounts)
    const linkedIndexAccount = user?.linkedAccounts[0]!

    const wallet = wallets[0];
    console.log(wallet?.address)
    console.log(smartAccountAddress)

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
        <Button onClick={()=>{
          const storedToken = localStorage.getItem('radius_user_token');
          console.log(storedToken)
          loginOpenWispFrame(smartAccountAddress!, storedToken!)
        }}>
          Login Open Wisp
        </Button>
      </div>
    );
}
  