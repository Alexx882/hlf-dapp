/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

// User smart contract that registers a user based on their name
class FabUser extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryUser(ctx, username) {
        const userAsBytes = await ctx.stub.getState(this.getKeyFromUsername(ctx, username));
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${username} does not exist`);
        }

        console.log(userAsBytes.toString());
        return userAsBytes.toString();
    }

    // add a new user with default value
    async createUser(ctx, username) {
        const user = {
            username: username,
            docType: 'user',
            value: this.getInitialValue(),
        };

        await ctx.stub.putState(this.getKeyFromUsername(ctx, username), Buffer.from(JSON.stringify(user)));
    }

    // get all the list of users and their values
    async queryAllUsers(ctx) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey(this.getKeyPrefix(), []);

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
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // transfer a value from one user to another
    async transferValue(ctx, unameFrom, unameTo, value) {
        if(parseFloat(value) < 0)
            throw new Error(`Value must be positive`);

        // check that both the users are registered
        const uFromAsBytes = await ctx.stub.getState(this.getKeyFromUsername(ctx, unameFrom));
        if (!uFromAsBytes || uFromAsBytes.length === 0)
            throw new Error(`${unameFrom} does not exist`);

        const uToAsBytes = await ctx.stub.getState(this.getKeyFromUsername(ctx, unameTo));
        if (!uToAsBytes || uToAsBytes.length === 0)
            throw new Error(`${unameTo} does not exist`);

        // check that sender has the right value to transfer
        const uFrom = JSON.parse(uFromAsBytes.toString());
        if (parseFloat(uFrom.value) < parseFloat(value))
            throw new Error(`${unameFrom} has not sufficient funds (${uFrom.value} but needs ${value})`);

        const uTo = JSON.parse(uToAsBytes.toString());

        // actual transfer
        uFrom.value = parseFloat(uFrom.value) - parseFloat(value);
        uTo.value = parseFloat(uTo.value) + parseFloat(value);

        await ctx.stub.putState(this.getKeyFromUsername(ctx, unameFrom), Buffer.from(JSON.stringify(uFrom)));
        await ctx.stub.putState(this.getKeyFromUsername(ctx, unameTo), Buffer.from(JSON.stringify(uTo)));
    }

    // update the value available with the user
    async updateUserValue(ctx, username, newValue) {
        if(parseFloat(newValue) < 0)
            throw new Error(`New value must be positive`);

        const userAsString = await this.queryUser(ctx, username);
        const user = JSON.parse(userAsString);
        user.value = newValue;

        await ctx.stub.putState(this.getKeyFromUsername(ctx, username), Buffer.from(JSON.stringify(user)));
    }

    getKeyFromUsername(ctx, username) {
        return ctx.stub.createCompositeKey(this.getKeyPrefix(), [username]);
    }

    getKeyPrefix(){
        return "USER_";
    }

    // Initialize a static 100 value with them
    getInitialValue(){
        return 100;
    }

}

module.exports = FabUser;
