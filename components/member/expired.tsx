import { useBiconomy } from "@/providers/BiconomyContext";
import { PaymasterMode } from "@biconomy/account";
import { Button } from "../ui/button";
import { extend } from "@/utils/extend";
import { useState } from "react";
import { motion } from "framer-motion";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

interface MemberProps {
    tokenId: string | undefined
}

export function MemberExpired({ tokenId }: MemberProps) {
    const { smartAccount } = useBiconomy()
    const [ loading, setLoading ] = useState<boolean>(false)

    const extendPortal = async() => {
        try {
            setLoading(true)
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
            setLoading(false)  
        } catch (error) {
            console.log(error)
            setLoading(false)  
        }
    }

    return (
        <div className="flex flex-col justify-center w-full gap-5">
            <p>You have a Portal Key, but no Internet Access. Click below to extend for another 24hrs</p>
            <div className="flex w-full justify-center">
                <Button onClick={extendPortal} className="w-36" disabled={loading}>
                    {
                        loading
                        ? (
                            <>
                                <motion.div
                                initial={{ rotate: 0 }} // Initial rotation value (0 degrees)
                                animate={{ rotate: 360 }} // Final rotation value (360 degrees)
                                transition={{
                                    duration: 1, // Animation duration in seconds
                                    repeat: Infinity, // Infinity will make it rotate indefinitely
                                    ease: "linear", // Animation easing function (linear makes it constant speed)
                                }}
                            >
                                    <DotsHorizontalIcon/>
                                </motion.div>
                            </>
                        )
                        : (
                            <>
                                Extend Portal Key
                            </>
                        )
                    }
                </Button>
            </div>
        </div>
    );
}