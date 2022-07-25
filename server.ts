import { XrphoneSdk, XrphoneTypes } from 'xrphone-sdk-nodejs';
import express, { Express, Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NextHandleFunction } from 'connect';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa';
import color from 'ansi-colors';
import { Accounting } from './db';

dotenv.config();

const xrphone = new XrphoneSdk();
const app: Express = express();

const handleError = (middleware: NextHandleFunction, req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
        if (err) return res.sendStatus(400);
        next();
    });
};

const requiresAuth = expressjwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.AUTH0_JWKS_URI as string,
    }) as unknown as jwt.Secret,
    audience: process.env.AUTH0_AUDIENCE,
    issuer: process.env.AUTH0_ISSUER,
    algorithms: ["RS256"],
});

app.use(morgan('combined'))
app.use(helmet());
app.use(cors());
app.use((req, res, next) => handleError(express.json(), req, res, next));
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.get("/ping", (req: Request, res: Response) => res.sendStatus(200));

app.post("/webhook/callback", requiresAuth, (req: Request, res: Response) => {
    const topic = req.headers['x-xrphone-topic'];
    switch (topic) {
        case 'INVOICE_LOOKUP':
            invoiceLookup(req, res);
            break;
        case 'INVOICE_PAYMENT':
            invoicePayment(req, res);
            break;
        default:
            res.sendStatus(404);
    }
});

const invoiceLookup = async (req: Request, res: Response) => {
    const requestBody: XrphoneTypes.WebhookTopicInvoiceLookupRequestBody = req.body;
    const record = await Accounting.findOne({ invoiceNumber: requestBody.invoiceNumber });
    if (record) {
        res.json(xrphone.createInvoiceLookupResponsePayload(record.amountDue, record.currency as XrphoneTypes.FiatCurrencyCodes));
    } else {
        res.status(404).send('Invoice not found!');
    }
};

const invoicePayment = async (req: Request, res: Response) => {
    const requestBody: XrphoneTypes.WebhookTopicInvoicePaymentRequestBody = req.body;
    const record = await Accounting.findOne({ invoiceNumber: requestBody.invoiceNumber });
    if (record?.payments) {
        record.payments.push({
            amount: requestBody.amount,
            currency: requestBody.fiatCurrency,
            memo: requestBody.memo
        });
        record.amountDue -= requestBody.amount;
        await record.save();
        res.json(xrphone.createInvoicePaymentResponsePayload('success'))
    } else {
        res.json(xrphone.createInvoicePaymentResponsePayload('failure'))
    }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n XRPhone Custom App Example\n`);
    console.log(`  Server running at:`);
    console.log(
        `  - Local:   ${color.cyan(`http://localhost:${color.bold(PORT as string + '/')}`)}`
    );
});
