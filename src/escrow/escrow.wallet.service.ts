
export async function createEscrowSubaddress(label:string): Promise<{address:string;addressIndex:number}>
{
   const response =  await fetch("http://127.0.0.1:38083/json_rpc",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            { "jsonrpc": "2.0",
              "id": "0", 
              "method": "create_address", 
              "params": { "account_index": 0 ,
                label: label
              } 
            }
        )
    });

    if(!response.ok){
        throw new Error("Wallet RPC req failed");
    }

    const data = await response.json();
    if(data.error){
        throw new Error(
            `Wallet RPC error (${data.error.code}): ${data.error.message}`
        )
    }
    return {
        address : data.result.address,
        addressIndex: data.result.address_index,
    };
}

export async function getSubaddressBalance(addressIndex: number): Promise<{ balance: number; unlockedBalance: number }>{
    const response = await fetch("http://127.0.0.1:38083/json_rpc",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                "jsonrpc" : "2.0",
                "id" : "0",
                "method": "get_balance",
                "params":{
                    "account_index": 0,
                   "address_indices" : [addressIndex]
                }
            }
        )
    });

    if(!response.ok){
        throw new Error("Wallet RPC req failed");
    }

    const data = await response.json();

    if(data.error){
        throw new Error(
            `Wallet RPC error (${data.error.code}): ${data.error.message}`
        )
    }

    if(!data.result.per_subaddress?.length){
        throw new Error("Subaddress not found");
    }

    const sub = data.result.per_subaddress[0];

    return {
        balance : sub.balance,
        unlockedBalance: sub.unlocked_balance,
    };
}

export async function transferFunds(
    fromSubaddressIndex: number,
    toAddress: string,
    amountAtomic: number
): Promise<{ txHash: string }> {
    const response = await fetch("http://127.0.0.1:38083/json_rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "0",
            method: "transfer",
            params: {
                destinations: [
                    { amount: amountAtomic, address: toAddress },
                ],
                account_index: 0,
                // CRITICAL: restricts which outputs this transfer is allowed
                // to spend from. Without this, the wallet could pull funds
                // from ANY subaddress in the whole wallet to make up the
                // amount — meaning one escrow's payout could spend a
                // different escrow's money. This must always be set to
                // exactly the one subaddress this specific escrow owns.
                subaddr_indices: [fromSubaddressIndex],
                priority: 1,
                get_tx_key: true,
            },
        }),
    });

    if (!response.ok) {
        throw new Error("Wallet RPC req failed");
    }

    const data: any = await response.json();

    if (data.error) {
        throw new Error(
            `Wallet RPC error (${data.error.code}): ${data.error.message}`
        );
    }

    return { txHash: data.result.tx_hash };
}

// Replaces transferFunds. sweep_all is the correct RPC method for "pay out
// whatever this specific subaddress holds" — unlike transfer, it doesn't
// require specifying an exact destination amount, and it automatically
// deducts the network fee from the swept balance instead of requiring
// extra funds on top of the amount being sent. This avoids the "not
// enough money" failure that happens when transfer is asked to send an
// exact amount equal to the full available balance, leaving nothing for
// the fee.
export async function sweepEscrowFunds(
    fromSubaddressIndex: number,
    toAddress: string
): Promise<{ txHashes: string[]; amountsSwept: number[] }> {
    const response = await fetch("http://127.0.0.1:38083/json_rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "0",
            method: "sweep_all",
            params: {
                address: toAddress,
                account_index: 0,
                // Same safety property as before: restricts which funds
                // this sweep is allowed to touch to exactly this escrow's
                // own subaddress. Never omit this.
                subaddr_indices: [fromSubaddressIndex],
                priority: 1,
                get_tx_keys: true,
            },
        }),
    });

    if (!response.ok) {
        throw new Error("Wallet RPC req failed");
    }

    const data: any = await response.json();

    if (data.error) {
        throw new Error(
            `Wallet RPC error (${data.error.code}): ${data.error.message}`
        );
    }

    // sweep_all can split into multiple transactions if the subaddress
    // has several separate unspent outputs, so it returns arrays rather
    // than a single hash/amount.
    return {
        txHashes: data.result.tx_hash_list,
        amountsSwept: data.result.amount_list,
    };
}

export function isValidMoneroAddress(address:string): boolean{
    if(typeof address != "string"){
        return false;
    }

    const validPrefix = address.startsWith("5") || address.startsWith("7");
    return address.length === 95 && validPrefix;
}