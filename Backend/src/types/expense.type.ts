export type PaymentMethod =
    | "CASH"
    | "UPI"
    | "DEBIT_CARD"
    | "CREDIT_CARD"
    | "BANK_TRANSFER"
    | "WALLET"
    | "OTHER";

/** Payload required to create a new expense */
export interface ICreateExpenseDTO {
    userId: number;
    categoryId: number;
    title: string;
    amount: number;
    expenseDate?: Date | string;
    paymentMethod: PaymentMethod;
    note?: string;
}

/** Payload for updating an expense (all fields optional) */
export type IUpdateExpenseDTO = Partial<Omit<ICreateExpenseDTO, "userId">>;

/** Complete expense structure */
export interface IExpense {
    id: number;
    userId: number;
    categoryId: number;
    title: string;
    amount: number;
    expenseDate: Date;
    paymentMethod: PaymentMethod;
    note?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
