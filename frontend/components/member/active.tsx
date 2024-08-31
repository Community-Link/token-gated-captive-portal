import { useBiconomy } from "@/providers/BiconomyContext";
import { PublicLockV14 } from "@unlock-protocol/contracts";
import { useReadContract } from "wagmi";

interface MemberProps {
    tokenId: string | undefined
}

export function MemberActive({ tokenId }: MemberProps) {


    const keyExpiration = useReadContract({
        abi: PublicLockV14.abi,
        address: '0x7e0cc161Cd22876004010b1DA831c855e75EbeB4',
        functionName: 'keyExpirationTimestampFor',
        args: [(BigInt(tokenId!))]
    })
    console.log(keyExpiration?.data)

    const formatDate = () => {
        const date = new Date(Number(keyExpiration?.data) * 1000); // convert seconds to milliseconds
        return date.toLocaleString('en-US'); // or any other locale
      };

    return (
        <div>
            <p>You have an active sub to the Portal! Enjoy your Internet Access!</p>
            <div className="flex gap-3">
                <p>Expires:</p>
                <p className="font-bold">{formatDate()}</p>
            </div>
        </div>
    );
}