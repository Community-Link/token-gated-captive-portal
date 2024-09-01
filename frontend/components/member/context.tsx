"use client"

import { useBiconomy } from "@/providers/BiconomyContext";
import { PublicLockV14 } from "@unlock-protocol/contracts"
import { Network, Alchemy, OwnedNft } from "alchemy-sdk";
import { useEffect, useState } from "react";
import { MemberNotFound } from "./notFound";
import { useBlockNumber, useReadContract } from "wagmi";
import { MemberActive } from "./active";
import { MemberExpired } from "./expired";
import { useQueryClient } from "@tanstack/react-query";
import { WIFI_ADDRESS } from "@/abi/WiFi";



export function MemberContext() {
    const { smartAccountAddress } = useBiconomy()
    const queryClient = useQueryClient() 
    const { data: blockNumber } = useBlockNumber({ watch: true }) 

    const [ownedPortalKey, setOwnedPortalKey] = useState<OwnedNft | undefined | null >()
    
    
    const settings = {
        apiKey: "wQhhyq4-jQcPzFRui3PljR6pzRwd5N_n", //process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
        network: Network.OPT_MAINNET,
    };
    // init with key and chain info 
    const alchemy = new Alchemy(settings);
    
    
    const getOwnedNPortalKey = async()=>{
        if (smartAccountAddress) {
            const data = await alchemy.nft.getNftsForOwner(smartAccountAddress, {
                contractAddresses: [WIFI_ADDRESS]
            })
            if (data.ownedNfts.length >= 1) {
                setOwnedPortalKey(data.ownedNfts[0]) 
            } else {
                setOwnedPortalKey(null)
            }
        }
    }
    useEffect(()=>{
        getOwnedNPortalKey()
    },[smartAccountAddress, blockNumber])
    console.log(ownedPortalKey)

    const {data: hasValidaKey, queryKey} = useReadContract({
        abi: PublicLockV14.abi,
        address: '0x7e0cc161Cd22876004010b1DA831c855e75EbeB4',
        functionName: 'getHasValidKey',
        args: [(smartAccountAddress)]
    })
    
    useEffect(() => { 
        queryClient.invalidateQueries({ queryKey }) 
    }, [blockNumber, queryClient, queryKey]) 
    console.log(hasValidaKey)
   

    return (
        <div>
            {
                ownedPortalKey === undefined
                ? <p>potal access loading...</p>
                : (
                    <>
                        {
                            ownedPortalKey === null
                            //not member ie no nft
                            ? <><MemberNotFound/></>
                            : (
                                <>
                                    {
                                        hasValidaKey
                                        //memder expires xXdate
                                        ?<><MemberActive tokenId={ownedPortalKey?.tokenId}/></>
                                        //expired member please renew
                                        :<><MemberExpired tokenId={ownedPortalKey?.tokenId}/></>
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