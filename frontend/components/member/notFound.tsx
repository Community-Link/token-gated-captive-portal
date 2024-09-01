import { useBiconomy } from "@/providers/BiconomyContext";
import { PaymasterMode } from "@biconomy/account";
import { Button } from "../ui/button";
import { purchase } from "@/utils/purchase";
import { motion } from "framer-motion";
import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

export function MemberNotFound() {
    const { smartAccount, smartAccountAddress } = useBiconomy()
    const [ loading, setLoading ] = useState<boolean>(false)

    const enterPortal = async() => {
        try {
            setLoading(true)
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
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)  
        }
    }
    return (
        <div className="flex flex-col justify-center w-full gap-5">
            <p>You do not have a Portal Key, click below to get Internet Access for 24hrs</p>
            <div className="flex w-full justify-center">
                <Button className="w-36" onClick={enterPortal} disabled={loading}>
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
                                Enter Portal
                            </>
                        )
                    }
                </Button>
            </div>
        </div>
    );
}