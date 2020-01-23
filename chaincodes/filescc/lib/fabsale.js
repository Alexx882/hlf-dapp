'use strict';

const { Contract } = require('fabric-contract-api');
const Helper = require('./helper');

class FabSale extends Contract {

    async addSale(ctx, filename, hash, buyername, price){
        const sale = {
            docType: 'sale',
            filename,
            hash,
            buyername,
            price,
            timestamp: Date.now()
        }

        await ctx.stub.putState(this.getCompositeKey(ctx, [filename, buyername]), Buffer.from(JSON.stringify(sale)));
    }

    getKeyPrefix() {
        return "SALE_";
    }

    getCompositeKey(ctx, keys) {
        return ctx.stub.createCompositeKey(this.getKeyPrefix(), keys);
    }

    async getAllSales(ctx){
        return await Helper.getAllData(ctx, this.getKeyPrefix());
    }

}

module.exports = FabSale;