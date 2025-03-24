export interface LedgerEntry {
    id: number;
    timestamp: number;
    description: string;
    amount: number;
    runningProfit: number;
}

export interface Database {
    ledger: LedgerEntry[];
}
