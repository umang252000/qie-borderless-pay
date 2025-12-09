export {};

declare global {
  interface Window {
    qieWallet?: {
      isQIEWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}