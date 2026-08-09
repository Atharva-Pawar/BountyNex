export function buildVerificationMessage(address: string): string {
  return [
    "BountyNex wallet verification",
    "",
    `Address: ${address}`,
    "",
    "Sign this message to prove you own this wallet.",
    "This does not cost anything and never exposes your private key.",
  ].join("\n");
}
