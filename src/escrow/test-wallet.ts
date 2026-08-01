import { transferFunds } from "./escrow.wallet.service";

async function main() {
    const result = await transferFunds(
        0,
        "789qqBirGA9ixbtLubsTt7aeBDSwtPqmR6NuPa9772dnFPiegmybBZ1UZpwEKLM5SEYCVUqDTqXX6XMu3quyFXjMHizwaWJ",
        0.000029
    );
    console.log("Payment result:", result);
}

main().catch((err) => console.error("Transfer failed:", err));