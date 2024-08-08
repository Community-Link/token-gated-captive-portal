import { encodeFunctionData } from "viem"
import { PublicLockV14 } from "@unlock-protocol/contracts"


export const extend = (tokenId: string) => {
    const extendData = encodeFunctionData({
        abi: PublicLockV14.abi,
        functionName: "extend",
        args: [([BigInt(0)]), (BigInt(tokenId)), ("0x99342D3CE2d10C34b7d20D960EA75bd742aec468"), ("0x")]
    })

    // Build the transactions
    const extendTx = {
        to: "0x7e0cc161Cd22876004010b1DA831c855e75EbeB4",
        data: extendData,
        value: BigInt(0)
    };
    return extendTx
}