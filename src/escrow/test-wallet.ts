import { transferFunds } from "./escrow.wallet.service";

async function main() {
    const result = await transferFunds(
        0,
        "78LJRbF9X6hQN7w8oxxGgeeHzmecfRj8D36iFpm59vdZGedXKBSWx81PomDEKWy13RehA4jN5Kci84ndeDo4bXzgNjsjAB2",
        1000000000
    );
    console.log("Payment result:", result);
}

main().catch((err) => console.error("Transfer failed:", err));