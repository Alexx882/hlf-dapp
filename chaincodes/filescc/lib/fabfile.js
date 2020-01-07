'use strict';

const { Contract } = require('fabric-contract-api');
const FabUser = require('./fabuser');
const Helper = require('./helper');
const FabSale = require('./fabsale');

class FabFile extends Contract {

    // Contracts to register products and availability for sellers
    async registerFile(ctx, filename, owner, type, price, available, hash) {
        try{
            const user = await new FabUser().getUser(ctx, owner);
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
        return await Helper.getAllData(ctx, this.getFileKeyPrefix());
    }

    // Methods for buyers to purchase products
    async buyFile(ctx, filename, buyername){
        const file = JSON.parse(await this.getFile(ctx, filename));

        if((file.available == 0))
            throw new Error(`${filename} is not available`);

        const file_owner = JSON.parse(await new FabUser().getUser(ctx, file.owner));
        const file_buyer = JSON.parse(await new FabUser().getUser(ctx, buyername));

        const file_price = parseFloat(file.price);
        const buyer_credit = parseFloat(file_buyer.credit);
        const seller_credit = parseFloat(file_owner.credit);

        if(buyer_credit < file_price)  
            throw new Error(`${buyername} has not sufficient funds (${buyer_credit} but needs ${file_price})`);

        // buyer can buy
        file_buyer.credit = buyer_credit - file_price;
        file_owner.credit = seller_credit + file_price;

        await new FabSale().addSale(ctx, filename, buyername, file_price);

        await new FabUser().putUser(ctx, file_buyer);
        await new FabUser().putUser(ctx, file_owner);
    }

    getFileKeyPrefix() {
        return "FILE_";
    }

    getFileCompositeKey(ctx, key) {
        return ctx.stub.createCompositeKey(this.getFileKeyPrefix(), [key]);
    }
}

module.exports = FabFile;
