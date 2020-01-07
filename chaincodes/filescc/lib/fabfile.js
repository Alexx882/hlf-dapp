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
        const user = JSON.parse(await this.getUser(ctx, username));
        user.credit = credit;

        await ctx.stub.putState(this.getUserCompositeKey(ctx, username), Buffer.from(JSON.stringify(user)));
    }

    async updateUserTradingType(ctx, username, tradingType){
        const user = JSON.parse(await this.getUser(ctx, username));
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

    async putUser(ctx, user){
        await ctx.stub.putState(this.getUserCompositeKey(ctx, user.username), Buffer.from(JSON.stringify(user)));
    }

    async getAllUsers(ctx){
        return await this.getAllData(ctx, this.getUserKeyPrefix());
    }

    // Contracts to register products and availability for sellers
    async registerFile(ctx, filename, owner, type, price, available, hash) {
        try{
            const user = await this.getUser(ctx, owner);
        }
        catch(error){
            throw new Error(`Owner ${owner} does not exist`);
        }

        const file = {
            docType: "file",
            filename,
            owner,
            type,
            price,
            available,
            hash
        };

        await ctx.stub.putState(this.getFileCompositeKey(ctx, filename), Buffer.from(JSON.stringify(file)));
    }

    async updateFileAvailability(ctx, filename, available) {
        const file = JSON.parse(await this.getFile(ctx, filename));
        file.available = available;

        await ctx.stub.putState(this.getFileCompositeKey(ctx, filename), Buffer.from(JSON.stringify(file)));
    }

    async updateFilePrice(ctx, filename, price) {
        const file = JSON.parse(await this.getFile(ctx, filename));
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

    async getAllFiles(ctx){
        return await this.getAllData(ctx, this.getFileKeyPrefix());
    }

    // Methods for buyers to purchase products
    async buyFile(ctx, filename, buyername){
        const file = JSON.parse(await this.getFile(ctx, filename));

        if((file.available == 0))
            throw new Error(`${filename} is not available`);

        const file_owner = JSON.parse(await this.getUser(ctx, file.owner));
        const file_buyer = JSON.parse(await this.getUser(ctx, buyername));

        const file_price = parseFloat(file.price);
        const buyer_credit = parseFloat(file_buyer.credit);
        const seller_credit = parseFloat(file_owner.credit);

        if(buyer_credit < file_price)  
            throw new Error(`${buyername} has not sufficient funds (${buyer_credit} but needs ${file_price})`);

        // buyer can buy
        file_buyer.credit = buyer_credit - file_price;
        file_owner.credit = seller_credit + file_price;

        this.putUser(ctx, file_buyer);
        this.putUser(ctx, file_owner);
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

    async getAllData(ctx, keyPrefix) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey(keyPrefix, []);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }
}

module.exports = FabFile;
