"use client"

import { useBiconomy } from "@/providers/BiconomyContext";
import { Network, Alchemy, OwnedNft } from "alchemy-sdk";
import { useEffect, useState } from "react";
import { MemberNotFound } from "./notFound";
import { useBlockNumber } from "wagmi";
import { MemberActive } from "./active";


export function MemberContext() {
    const { smartAccountAddress } = useBiconomy()
    const { data: blockNumber } = useBlockNumber({ watch: true }) 

    const [ownedPortalKey, setOwnedPortalKey] = useState<OwnedNft[]| undefined>()
    
    
    const settings = {
        apiKey: "wQhhyq4-jQcPzFRui3PljR6pzRwd5N_n", //process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
        network: Network.OPT_MAINNET,
    };
    // init with key and chain info 
    const alchemy = new Alchemy(settings);
    
    
    const getOwnedNPortalKey = async()=>{
        if (smartAccountAddress) {
            const data = await alchemy.nft.getNftsForOwner(smartAccountAddress, {
                contractAddresses: ["0x7e0cc161Cd22876004010b1DA831c855e75EbeB4"]
            })
            setOwnedPortalKey(data.ownedNfts) 
        }
    }
    useEffect(()=>{
        getOwnedNPortalKey()
    },[smartAccountAddress, blockNumber])
    console.log(ownedPortalKey)

   

    return (
        <div>
            {
                !ownedPortalKey
                ? <p>loading...</p>
                : (
                    <>
                        {
                            ownedPortalKey.length == 0
                            //not member ie no nft
                            ? <><MemberNotFound/></>
                            : (
                                <>
                                    {
                                        //memder expires xXdate
                                        <MemberActive/>
                                        //expired member please renew
                                    }
                                </>
                            )
                            

                            
                        }
                    </>
                )
                
            }
        </div>
    );
}