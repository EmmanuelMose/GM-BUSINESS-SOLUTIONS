interface BankConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  branch: string;
  swiftCode: string;
  instructions: string;
}

export const bankConfig: BankConfig = {
  bankName: process.env.BANK_NAME || "",
  accountName: process.env.BANK_ACCOUNT_NAME || "",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  bankCode: process.env.BANK_CODE || "",
  branch: process.env.BANK_BRANCH || "",
  swiftCode: process.env.BANK_SWIFT_CODE || "",
  instructions: process.env.BANK_INSTRUCTIONS || "Please use your order reference as payment reference. Payment confirmation may take 1-2 business days."
};

export default bankConfig;