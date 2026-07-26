import { transferFunds } from "./escrow.wallet.service";

async function main() {
    const result = await transferFunds(
        11,
        "77JFbEcpKbxAGVMsLrdiRYNJwLwzxeZRt4fRbpV23jM5KJX4tvruwY22EKPT3JTsCuTggyzkMLE9e6LZLqBCpqEE6yWMM2a",
        400000000
    );
    console.log("Partial payment result:", result);
}

main().catch((err) => console.error("Transfer failed:", err));