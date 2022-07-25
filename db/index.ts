import { MongoMemoryServer } from 'mongodb-memory-server';
import { Schema, model, connect, disconnect } from 'mongoose';
import { XrphoneTypes } from 'xrphone-sdk';
import initialMockAccountingData from './mocks/accounting.mock';
import color from 'ansi-colors';

export interface IAccounting {
    invoiceNumber: number;
    initialAmount?: number;
    amountDue: number;
    currency: XrphoneTypes.FiatCurrencyCodes | string;
    payments?: Array<InvoicePayment>;
}

interface InvoicePayment {
    amount: number;
    currency: XrphoneTypes.FiatCurrencyCodes | string;
    memo: string;
}

const accountingSchema = new Schema<IAccounting>({
    invoiceNumber: { type: Number, required: true },
    initialAmount: { type: Number, required: false },
    amountDue: { type: Number, required: true },
    currency: { type: String, required: true },
    payments: { type: Array, required: false }
});

export const Accounting = model<IAccounting>('Accounting', accountingSchema);

/** 
 *  Load mock accounting sample data into the mongo memory server.
 *  Reminder that on server restarts the sample data will reset.
*/
(async () => {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const [prefix, mongoLocalBaseUri, mongoLocalPort] = mongoServer.getUri().split(':');
        console.log(`  - Local:   ${color.cyan(prefix+mongoLocalBaseUri+':'+color.bold(mongoLocalPort))}`);
        await connect(mongoServer.getUri());
        for (let x = 0; x < initialMockAccountingData.length; x++) {
            const accountingRecord: IAccounting = initialMockAccountingData[x];
            const accounting = new Accounting(accountingRecord);
            await accounting.save();
        }
    } catch (error: any) {
        await disconnect();
        console.log('mongodb-memory-server disconnected ==>', error.message);
    }
})();
