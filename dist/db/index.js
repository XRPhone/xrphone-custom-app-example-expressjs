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
exports.Accounting = void 0;
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = require("mongoose");
const accounting_mock_1 = __importDefault(require("./mocks/accounting.mock"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const accountingSchema = new mongoose_1.Schema({
    invoiceNumber: { type: Number, required: true },
    initialAmount: { type: Number, required: false },
    amountDue: { type: Number, required: true },
    currency: { type: String, required: true },
    payments: { type: Array, required: false }
});
exports.Accounting = (0, mongoose_1.model)('Accounting', accountingSchema);
/**
 *  Load mock accounting sample data into the mongo memory server.
 *  Reminder that on server restarts the sample data will reset.
*/
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const [prefix, mongoLocalBaseUri, mongoLocalPort] = mongoServer.getUri().split(':');
        console.log(`  - Local:   ${ansi_colors_1.default.cyan(prefix + mongoLocalBaseUri + ':' + ansi_colors_1.default.bold(mongoLocalPort))}`);
        yield (0, mongoose_1.connect)(mongoServer.getUri());
        for (let x = 0; x < accounting_mock_1.default.length; x++) {
            const accountingRecord = accounting_mock_1.default[x];
            const accounting = new exports.Accounting(accountingRecord);
            yield accounting.save();
        }
    }
    catch (error) {
        yield (0, mongoose_1.disconnect)();
        console.log('mongodb-memory-server disconnected ==>', error.message);
    }
}))();
