export {};

declare global {
  interface Window {
    AndroidBridge?: {
      printReceipt: (orderJson: string) => string;
    };
  }
}
