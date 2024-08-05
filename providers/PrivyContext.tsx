"use client"


import { PrivyProvider } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"


type Props = {
    children: ReactNode,
}

export function PrivyContext ({ children }: Props) {

    const router = useRouter()

    return (
        <>
            <PrivyProvider
                appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
                config={{
                    /* Replace this with your desired login methods */
                    loginMethods: [ "sms", "wallet"],
                    /* Replace this with your desired appearance configuration */
                    appearance: {
                        theme: "light",
                        accentColor: "#0C3FFF",
                        logo: "",
                        showWalletLoginFirst: true,
                        walletList: ["metamask", "rainbow", "wallet_connect"], 
                    },
                    embeddedWallets: {
                        createOnLogin: 'users-without-wallets', 
                    }
                }}
            >
                {children}
            </PrivyProvider>
        </>
    )
}
