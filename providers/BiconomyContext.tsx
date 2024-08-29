"use client"


import { BiconomySmartAccountV2, createSmartAccountClient } from "@biconomy/account"
import type { ReactNode } from "react"
import React, { useContext, useEffect, useState } from "react"
import { WalletClient } from "viem"
import { optimism } from "viem/chains"
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { loginRadius } from "@/app/actions/loginRadius"
import { registerRadius } from "@/app/actions/registerRadius"
import { loginOpenWispFrame } from "@/app/actions/loginOpenWispFrame"


type Props = {
    children: ReactNode,
}

interface BiconomyInterface {
    smartAccount?: BiconomySmartAccountV2;
    smartAccountAddress?: string;
};

const Biconomy = React.createContext<BiconomyInterface>({
    smartAccount: undefined,
    smartAccountAddress: undefined
});

export function useBiconomy () {
    return useContext(Biconomy);
};

export function BiconomyContext ({ children }: Props) {
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | undefined>()
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | undefined>()
    const [embeddedWallet, setEmbeddedWallet] = useState<ConnectedWallet | undefined>()

    const {wallets} = useWallets();
    const {user, ready, authenticated} = usePrivy();
    const linkedIndexAccount = user?.linkedAccounts[0]!

    // make sure connected walltet == privy user before setting embed
    useEffect(() => {
        const connectedWallet = wallets[0]
        const connectedUserWallet = user?.wallet
        if (connectedWallet?.walletClientType === connectedUserWallet?.walletClientType) {
            setEmbeddedWallet(connectedWallet)
        }
    }, [ wallets, user ]);

    
    const getWalletClient = async () => {
        
        // Switch your wallet to your target chain before getting the viem WalletClient
        await embeddedWallet?.switchChain(optimism.id)

        // Get an EIP1193 provider from the user"s wallet
        const ethereumProvider = await embeddedWallet?.getEthereumProvider()

        // Create a Viem wallet client from the EIP1193 provider
        const walletClient = createWalletClient({
            account: embeddedWallet?.address as `0x${string}`,
            chain: optimism,
            transport: custom(ethereumProvider!)
        })
        return walletClient as WalletClient;
    }
    const createSmartAccount = async (walletClient: WalletClient) => {
        if (!walletClient) return;

        const smartAccount = await createSmartAccountClient({
            signer: walletClient,
            bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
            biconomyPaymasterApiKey: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY, // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
        });
      
        const address = await smartAccount.getAccountAddress();
        setSmartAccountAddress(address);
        setSmartAccount(smartAccount);
    };

    const getEmail = () => {
        if (linkedIndexAccount.type === "email") {
          return user?.email?.address
        }
    }


    const readyOrNot = async () => {
        //logout smart account        
        if (ready && !authenticated){
            setSmartAccountAddress(undefined);
            setSmartAccount(undefined);   
            setEmbeddedWallet(undefined)
        }
        
        //not ready or not logged in
        if (!ready || !authenticated) return;

        //find privy signer & create/login smart account
        if (!embeddedWallet) return; 
        const walletClient = await getWalletClient()
        if (embeddedWallet && !smartAccount) createSmartAccount(walletClient);

        
    }
    useEffect(() => {
        readyOrNot()
    }, [wallets, ready, authenticated, embeddedWallet]);


    const checkRegisterLogin = async () => {
        await registerRadius(smartAccountAddress!, getEmail()!)
        const data = await loginRadius(smartAccountAddress!, "0x001234")
        await loginOpenWispFrame(smartAccountAddress!, data.radius_user_token!)
        /*
        const storedToken = localStorage.getItem('radius_user_token');
        if (!storedToken || storedToken !== data.radius_user_token) {
            // Store the new token if there's no token stored or if the stored token is different from the new one
            localStorage.setItem('radius_user_token', data.radius_user_token);
        }
        */
        
    }
    useEffect(() => {
        // login or register radius
        if (smartAccountAddress) {
            checkRegisterLogin()
        }
    }, [ smartAccountAddress ]);


    return (
        <>
            <Biconomy.Provider value={{smartAccount: smartAccount, smartAccountAddress: smartAccountAddress}}>{children}</Biconomy.Provider>
        </>
    )
}


