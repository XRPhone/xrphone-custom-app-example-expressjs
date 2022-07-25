"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xrphone_sdk_1 = require("xrphone-sdk");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_jwt_1 = require("express-jwt");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const db_1 = require("./db");
dotenv_1.default.config();
const xrphone = new xrphone_sdk_1.XrphoneSdk();
const app = (0, express_1.default)();
const handleError = (middleware, req, res, next) => {
    middleware(req, res, (err) => {
        if (err)
            return res.sendStatus(400);
        next();
    });
};
const requiresAuth = (0, express_jwt_1.expressjwt)({
    secret: jwks_rsa_1.default.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.AUTH0_JWKS_URI,
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: process.env.AUTH0_ISSUER,
    algorithms: ["RS256"],
});
app.use((0, morgan_1.default)('combined'));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((req, res, next) => handleError(express_1.default.json(), req, res, next));
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.get("/ping", (req, res) => res.sendStatus(200));
app.post("/webhook/callback", requiresAuth, (req, res) => {
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
const invoiceLookup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestBody = req.body;
    const record = yield db_1.Accounting.findOne({ invoiceNumber: requestBody.invoiceNumber });
    if (record) {
        res.json(xrphone.createInvoiceLookupResponsePayload(record.amountDue, record.currency));
    }
    else {
        res.status(404).send('Invoice not found!');
    }
});
const invoicePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestBody = req.body;
    const record = yield db_1.Accounting.findOne({ invoiceNumber: requestBody.invoiceNumber });
    if (record === null || record === void 0 ? void 0 : record.payments) {
        record.payments.push({
            amount: requestBody.amount,
            currency: requestBody.fiatCurrency,
            memo: requestBody.memo
        });
        record.amountDue -= requestBody.amount;
        yield record.save();
        res.json(xrphone.createInvoicePaymentResponsePayload('success'));
    }
    else {
        res.json(xrphone.createInvoicePaymentResponsePayload('failure'));
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n XRPhone Custom App Example\n`);
    console.log(`  Server running at:`);
    console.log(`  - Local:   ${ansi_colors_1.default.cyan(`http://localhost:${ansi_colors_1.default.bold(PORT + '/')}`)}`);
});
