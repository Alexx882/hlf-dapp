'use strict';

const { Contract } = require('fabric-contract-api');
const Helper = require('./helper');

class FabUser extends Contract {

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
        return await Helper.getAllData(ctx, this.getUserKeyPrefix());
    }

    getUserKeyPrefix() {
        return "USER_";
    }

    getUserCompositeKey(ctx, key) {
        return ctx.stub.createCompositeKey(this.getUserKeyPrefix(), [key]);
    }

}

module.exports = FabUser;
