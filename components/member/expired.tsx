import { useBiconomy } from "@/providers/BiconomyContext";
import { PaymasterMode } from "@biconomy/account";
import { Button } from "../ui/button";
import { extend } from "@/utils/extend";

interface MemberProps {
    tokenId: string | undefined
}

export function MemberExpired({ tokenId }: MemberProps) {
    const { smartAccount } = useBiconomy()

    const extendPortal = async() => {
        const tx = extend(Number(tokenId!))

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
            <p>You have a Portal Key, but no Internet Access. Click below to extend for another 24hrs</p>
            <div className="flex w-full justify-center">
                <Button onClick={extendPortal}>Extend Portal Key</Button>
            </div>
        </div>
    );
}