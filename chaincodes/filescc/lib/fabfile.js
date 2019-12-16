'use strict';

const { Contract } = require('fabric-contract-api');

class FabFile extends Contract {

    async initLedger(ctx) { }

    // For users of type buyer and seller
    async registerUser(ctx, username, credit, tradingType, admin){
        const user = {
            docType: 'user',
            username,
            credit,
            tradingType,
            admin
        }

        await ctx.stub.putState(this.getUserCompositeKey(ctx, username), Buffer.from(JSON.stringify(user)));
    }

    async updateUserCredit(ctx, username, credit){
        const user = await this.getUser(ctx, username);
        user.credit = credit;

        await ctx.stub.putState(this.getUserCompositeKey(ctx, username), Buffer.from(JSON.stringify(user)));
    }

    async updateUserTradingType(ctx, username, tradingType){
        const user = await this.getUser(ctx, username);
        user.tradingType = tradingType;

        await ctx.stub.putState(this.getUserCompositeKey(ctx, username), Buffer.from(JSON.stringify(user)));
    }

    async getUser(ctx, username){
        const bUser = await ctx.stub.getState(this.getUserCompositeKey(ctx, username));

        if (!bUser || bUser.length === 0)
            throw new Error(`${username} does not exist`);

        else
            return bUser.toString();
    }

    // Contracts to register products and availability for sellers
    async registerFile(ctx, filename, type, price, available) {
        const file = {
            docType: "file",
            filename,
            type,
            price,
            available
        };

        await ctx.stub.putState(this.getFileCompositeKey(ctx, filename), Buffer.from(JSON.stringify(file)));
    }

    async updateFileAvailability(ctx, filename, available) {
        const file = await this.getFile(ctx, filename);
        file.available = available;

        await ctx.stub.putState(this.getFileCompositeKey(ctx, filename), Buffer.from(JSON.stringify(file)));
    }

    async updateFilePrice(ctx, filename, price) {
        const file = await this.getFile(ctx, filename);
        file.price = price;

        await ctx.stub.putState(this.getFileCompositeKey(ctx, filename), Buffer.from(JSON.stringify(file)));
    }

    async getFile(ctx, filename) {
        const bFile = await ctx.stub.getState(this.getFileCompositeKey(ctx, filename));

        if (!bFile || bFile.length === 0)
            throw new Error(`${filename} does not exist`);

        else
            return bFile.toString();
    }

    // Methods for buyers to purchase products
    async buyFile(ctx, filename, buyer){
        
    }

    // Use your imagination

    // Helper
    getFileCompositeKey(ctx, key) {
        return ctx.stub.createCompositeKey(this.getFileKeyPrefix(), [key]);
    }

    getUserCompositeKey(ctx, key) {
        return ctx.stub.createCompositeKey(this.getUserKeyPrefix(), [key]);
    }

    getFileKeyPrefix() {
        return "FILE_";
    }

    getUserKeyPrefix() {
        return "USER_";
    }
}

module.exports = FabFile;
