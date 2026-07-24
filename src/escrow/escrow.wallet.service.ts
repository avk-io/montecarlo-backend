
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
    console.log(JSON.stringify(data, null, 2));

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
