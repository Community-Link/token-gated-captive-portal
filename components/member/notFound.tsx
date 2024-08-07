import { useBiconomy } from "@/providers/BiconomyContext";
import { PaymasterMode } from "@biconomy/account";
import { Button } from "../ui/button";
import { purchase } from "@/utils/purchase";

export function MemberNotFound() {
    const { smartAccount, smartAccountAddress } = useBiconomy()

    const enterPortal = async() => {
        const tx = purchase(smartAccountAddress! as `0x${string}`)

        // Send the transaction and get the transaction hash
        const userOpResponse = await smartAccount!.sendTransaction(tx, {
            paymasterServiceData: {mode: PaymasterMode.SPONSORED},
        });
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash", transactionHash);
        const userOpReceipt  = await userOpResponse.wait();
        if(userOpReceipt.success == "true") { 
            console.log("UserOp receipt", userOpReceipt)
            console.log("Transaction receipt", userOpReceipt.receipt)
        }
    }
    return (
        <div className="flex flex-col justify-center w-full gap-5">
            <p>You do not have a Portal Key, click below to get Internet Access for 24hrs</p>
            <div className="flex w-full justify-center">
                <Button onClick={enterPortal}>Enter Portal</Button>
            </div>
        </div>
    );
}