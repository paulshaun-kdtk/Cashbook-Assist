export interface Transaction {
    $id: string;
    $sequence: string;
    $createdAt: string;
    $updatedAt: string;
    which_cashbook: string;
    date: string;
    description: string;
    memo: string;
    amount: number;
    type: "income" | "expense";
    createdAt: string;
    category: string;
    balance: number;
}