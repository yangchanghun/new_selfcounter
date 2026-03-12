export {};

declare global {
  interface Window {
    AndroidBridge?: {
      printReceipt?: (data: string) => void;
    };
    CardBridge?: {
      openCardApp: (amount: number) => void;
    };
    onCardPaymentComplete?: () => void;
  }
}
