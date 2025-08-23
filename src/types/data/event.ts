// Event data structure
export interface EventData {
  title: string;
  subtitle?: string;
  date: string;
  location: string;
  price?: number;
  description?: string;
  payments?: {
    alternative?: {
      mbway?: {
        phone: string;
        instruction: string;
      };
    };
  };
  capacity?: {
    firstLot: number;
    totalCapacity: number;
  };
  [key: string]: unknown;
}