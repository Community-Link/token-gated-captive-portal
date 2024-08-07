import { encodeFunctionData } from "viem"
import { PublicLockV13 } from "@unlock-protocol/contracts"


export const purchase = (reciever: `0x${string}`) => {
    const purchaseData = encodeFunctionData({
        abi: PublicLockV13.abi,
        functionName: "purchase",
        args: [([BigInt(0)]), ([reciever]), (["0x99342D3CE2d10C34b7d20D960EA75bd742aec468"]), (["0x99342D3CE2d10C34b7d20D960EA75bd742aec468"]), (["0x"])]
    })

    // Build the transactions
    const purchaseTx = {
        to: "0x7e0cc161Cd22876004010b1DA831c855e75EbeB4",
        data: purchaseData,
        value: BigInt(0)
    };
    return purchaseTx
}