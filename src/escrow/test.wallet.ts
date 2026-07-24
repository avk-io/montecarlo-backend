import { getSubaddressBalance } from "./escrow.wallet.service";

async function main() {
    const result = await getSubaddressBalance(1);
    console.log("subaddress balance:", result);
}

main().catch((err) => {
    console.error("Test failed:", err);
});