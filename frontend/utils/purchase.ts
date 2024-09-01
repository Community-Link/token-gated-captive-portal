import { encodeFunctionData } from "viem"
import { WIFI_ABI, WIFI_ADDRESS } from "@/abi/WiFi";

export const purchase = (apId: string) => {
    const extendData = encodeFunctionData({
        abi: WIFI_ABI,
        functionName: "connect",
        args: [apId]
    })

    // Build the transactions
    const extendTx = {
        to: WIFI_ADDRESS,
        data: extendData,
        value: BigInt(0)
    };
    return extendTx
}
