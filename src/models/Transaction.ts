export class Transaction {
    constructor(
        public readonly date: Date,
        public readonly from: string,
        public readonly to: string,
        public readonly narrative: string,
        public readonly amountPence: number,
    ) {}
}
