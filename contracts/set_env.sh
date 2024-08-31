#!/bin/bash

export RPC_URL=http://127.0.0.1:8545
export DEPLOYER_PUBLIC_KEY=0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
export DEPLOYER_PRIVATE_KEY=0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

anvil -p 8545 &
ANVIL_PID=$!

cleanup() {
  kill $ANVIL_PID
}
trap cleanup EXIT

sleep 1

WIFI=$(forge create src/WiFi.sol:WiFi --rpc-url=$RPC_URL --private-key=$DEPLOYER_PRIVATE_KEY)
export WIFI_ADDRESS=$(echo "$WIFI" | grep "Deployed to:" | awk '{print $3}')

echo " "
echo "---------------------------------------------------------------------------"
echo "WiFi registrar contract deployed to $WIFI_ADDRESS"
echo "---------------------------------------------------------------------------"

wait $ANVIL_PID
