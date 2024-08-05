"use client"

import { useBiconomy } from "@/providers/BiconomyContext";
import { useWallets } from "@privy-io/react-auth";

export function Account() {
    const { smartAccountAddress } = useBiconomy()
    const {wallets} = useWallets();

    const wallet = wallets[0];
    console.log(wallet?.address)
    console.log(smartAccountAddress)

    return (
      <div className="">
        <p>Your AA wallet is: {smartAccountAddress}</p>
        <p>Your EOA wallet is: {wallet?.address}</p>
      </div>
    );
}
  