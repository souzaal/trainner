import { Asset, Member, Address, Wallet, Transfer, Transaction } from '../model/models';

export default (function(){

    return {

        /**
         * Method import an address.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON
         */
        import: async function(stub, request){

            let creatorKey = stub.creator.mspid;

            let creator = await Member.findByKey(stub, creatorKey);

            let query = { address: request.address }

            let existingAddress = await Address.findOne(stub, query);

            if(!existingAddress) {

                throw new Error('This address doesn\'t exist.');
            }

            let member = existingAddress.importedBy.find(function(member) {
                return member.name === creator.name;
            }, this);

            if(member) {

                throw new Error('This address already has been imported by this member.');
            }

            existingAddress.importedBy.push(creator);

            await Address.findOneAndUpdate(stub, { address: existingAddress.address }, { importedBy : existingAddress.importedBy });

            return "Address has been imported with success.";
        },

        /**
         * Method create an address.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         */
        create: async function(stub){

            let creatorKey = stub.creator.mspid;

            let creator = await Member.findByKey(stub, creatorKey);

            let result = await Address.build({ creator: creator, isBurn: false }).save(stub);

            return {
                address: result.address,
                isWatchOnly: false,
                assets: []
            };
        },

        /**
         * Method create a burn address.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         */
        createBurnAddress: async function(stub) {

            let query = {
                isBurn : true
            }

            let existingBurnAddress = await Address.findOne(stub, query);
    
            if(existingBurnAddress) {
    
                console.warn('The burn address already exists.');

            } else {

                existingBurnAddress = await Address.build({ "creator": { name: "none" }, isBurn: true }).save(stub);
                
            }

            return {
                address: existingBurnAddress.address,
                isWatchOnly: false,
                assets: []
            };
        },

        /**
         * Method find the burn address.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         */
        findBurnAddress: async function(stub) {

            let query = {
                isBurn : true
            }

            let existingBurnAddress = await Address.findOne(stub, query);

            if(!existingBurnAddress) {

                throw new Error('The burn address doesn\'t exist.');
            }

            return existingBurnAddress.address;
        },

        /**
         * Method find all addresses of the member wallet.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         */
        findAll: async function(stub){
    
            let creatorKey =  stub.creator.mspid;

            let query = { $or: [{ "creator": { name: creatorKey }}, {
                "importedBy": {
                   "$elemMatch": {
                      "name": creatorKey
                   }
                }
             }]}

            let existingAddresses = await Address.find(stub, query);

            if(Array.isArray(existingAddresses)) {

                let response = existingAddresses.map(async function(address){

                    let assets = [];

                    let wallets = await Wallet.find(stub, { "address.address": address.address});

                    wallets.forEach(function(wallet){

                        assets.push({ balance: wallet.balance, name: wallet.asset.name })

                    }, this);

                    return { 
                        address: address.address,
                        isWatchOnly: creatorKey == address.creator.name ? false : true,
                        assets: assets 
                    };
                    
                }, this);

                return await Promise.all(response);

            }

            return await result();
        },

        /**
         * Method find all addresses of the member wallet.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*address)
         */
        findOne: async function(stub, request){
    
            let creatorKey =  stub.creator.mspid;
            let address = request.address;

            let query = { 
                $and: [
                    { address: address }, 
                    {
                        $or: [
                            { "creator": { name: creatorKey }}, 
                            {
                                "importedBy": {
                                   "$elemMatch": {
                                      "name": creatorKey
                                   }
                                }
                             }
                        ]
                    }
                ]
            }

            let existingAddress = await Address.findOne(stub, query);

            if(!existingAddress){

                throw new Error('This address doesn\'t exist or doesn\'t belong to you.');

            } else  {

                let wallets = await Wallet.find(stub, { "address.address": existingAddress.address});

                let assets = [];

                wallets.forEach(function(wallet){

                    assets.push({ balance: wallet.balance, name: wallet.asset.name });

                }, this);

                return { 
                    address: existingAddress.address,
                    isWatchOnly: creatorKey == existingAddress.creator.name ? false : true,
                    assets: assets 
                };
            }
        },

        /**
         * Make a transfer by address to address.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*address)
         */
        transfer: async function(stub, request) {
            
            let creatorKey =  stub.creator.mspid;
            let address = request.address;
            let asset = request.asset;
            let destination = request.destination;
            let amount = request.amount;
            let metadata = request.metadata;
            let txId = stub.txId;

            let query = { 
                $and: [
                    { address: address }, 
                    { "creator": { name: creatorKey }},
                    { "isBurn" : false }
                ]
            }

            let existingAsset = await Asset.findByKey(stub, asset);
    
            if(!existingAsset) {
    
                throw new Error('This asset doesn\'t exist.');
            }

            let existingAddress = await Address.findOne(stub, query);

            if(!existingAddress) {

                throw new Error('This address doesn\'t exist or doesn\'t belong to you.');
            }

            query = {  address: destination }

            let existingDestination = await Address.findOne(stub, query);

            if(!existingDestination) {

                throw new Error('This destination address doesn\'t exist.');
            }

            let fromWallet = await Wallet.findOne(stub, { "address.address": address, "asset.name": asset });

            if(!fromWallet || fromWallet.balance < amount) {
                
                throw new Error('You don\'t have balance for this transfer.');
            }

            let toWallet = await Wallet.findOne(stub, { "address.address": destination, "asset.name": asset });

            if(!toWallet) {

                let creator = await Member.findByKey(stub, creatorKey);

                toWallet = await Wallet.build({ asset: existingAsset, address: existingDestination, balance: amount, owner: creator }).save(stub);

            } else {

                toWallet = await Wallet.findOneAndUpdate(stub, toWallet, { "balance": toWallet.balance + amount });
            }

            fromWallet = await Wallet.findOneAndUpdate(stub, fromWallet, { "balance": fromWallet.balance - amount });

            let transaction = await Transaction.build({ txID: txId, address: existingAddress.address, timestamp: Date.now(), isFinal: true }).save(stub);
            
            let transfer = await Transfer.build({ asset: existingAsset, origin: existingAddress, destination: existingDestination, amount: amount, metadata: metadata, txId: txId, isIssue: false, transaction: transaction }).save(stub);

            return { txID: txId };
            
        },

        /**
         * Find all transfers by an address.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*address)
         */
        findAllTransfers: async function (stub, request) {

            let address = request.address;
            let count = request.count;
            let skip = request.skip;
            let asset = request.asset;
            let options = {
                limit: request.count || 10000,
                skip: request.skip || 0,
                sort: [
                    {"transaction.timestamp": "asc"}
                ]
            }
            
            let result = [];

            let query = {
                $and: [
                    { "isIssue": false },
                    { $or: [
                        { "origin.address" : address },
                        { "destination.address" : address },
                    ] }
                ]
            }

            if(asset) {
                
                query.$and.push({ "asset.name" : asset });
            }

            let existingTranfers = await Transfer.find(stub, query, options);

            if(Array.isArray(existingTranfers)) {

                existingTranfers.forEach(function(transfer){

                    result.push({
                        "asset": transfer.asset.name,
                        "destination": transfer.destination.address,
                        "amount": transfer.amount,
                        "metadata": transfer.metadata,
                        "transaction": transfer.transaction
                      });

                }, this);
            }

            return result;
        },

        /**
         * Find a transfer by a transaction id.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*address)
         */
        findTransfer: async function(stub, request) {

            let address = request.address;
            let txId = request.txID;

            let query = {
                $and: [
                    { "isIssue": false },
                    { "txId" : txId },
                    { 
                        $or: [
                            { "origin.address" : address },
                            { "destination.address" : address },
                        ]
                    }
                ]
            }

            let transfer = await Transfer.findOne(stub, query);

            if(!transfer) {

                throw new Error('The transfer doesn\'t exist.');
            }

            return {
                "asset": transfer.asset.name,
                "destination": transfer.destination.address,
                "amount": transfer.amount,
                "metadata": transfer.metadata,
                "transaction": transfer.transaction
              }
        },

        /**
         * Find all issues by an address.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*address)
         */
        findAllIssues: async function (stub, request) {

            let address = request.address;
            let count = request.count;
            let skip = request.skip;
            let asset = request.asset;
            let options = {
                limit: request.count || 10000,
                skip: request.skip || 0
            }
            
            let result = [];

            let query = {
                $and: [
                    { "isIssue": true },
                    { $or: [
                        { "origin.address" : address },
                        { "destination.address" : address },
                    ]}
                ]
            }

            if(asset)
                query.$and.push({'asset.name' : asset});

            let existingTranfers = await Transfer.find(stub, query, options);

            if(Array.isArray(existingTranfers)) {

                existingTranfers.forEach(function(transfer){

                    result.push({
                        "asset": transfer.asset.name,
                        "destination": transfer.destination.address,
                        "amount": transfer.amount,
                        "metadata": transfer.metadata,
                        "transaction": transfer.transaction
                      });

                }, this);
            }

            return result;
        },

        /**
         * Find an issue by a transaction id.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*address)
         */
        findIssue: async function(stub, request) {

            let address = request.address;
            let txId = request.txID;

            let query = {
                $and: [
                    { "isIssue": true },
                    { "txId" : txId },
                    { 
                        $or: [
                            { "origin.address" : address },
                            { "destination.address" : address },
                        ]
                    }
                ]
            }

            let transfer = await Transfer.findOne(stub, query);

            if(!transfer) {

                throw new Error('The transfer doesn\'t exist.');
            }

            return {
                "asset": transfer.asset.name,
                "destination": transfer.destination.address,
                "amount": transfer.amount,
                "metadata": transfer.metadata,
                "transaction": transfer.transaction
              }
        }
    }
})();