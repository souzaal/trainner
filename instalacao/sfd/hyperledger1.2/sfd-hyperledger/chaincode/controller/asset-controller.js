import { Asset, Address, Wallet, Member, Transfer, Transaction } from '../model/models';

export default (function(){

    return {

        /**
         * Method create an asset.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*name, *amount, *address, units, open)
         */
        create: async function(stub, request){
    
            let creatorKey = stub.creator.mspid;
            let name = request.name;
            let amount = request.amount;
            let address = request.address;
            let units = request.units;
            let open = request.open;
            let txId = stub.txId;
    
            let existingAsset = await Asset.findByKey(stub, name);
    
            if(existingAsset) {
    
                throw new Error('This asset already exists.');
            }

            let existingAddress = await Address.findOne(stub, { address: address, "creator.name": stub.creator.mspid });

            if(!existingAddress) {

                throw new Error('This address doesn\'t exist or doesn\'t belong to you.');
            }

            let creator = await Member.findByKey(stub, creatorKey);

            let a = await Asset.build({ name: name, amount: amount, creatorAddress: address, units: units, open: open, txId: txId }).save(stub);

            let w = await Wallet.build({ asset: a, address: existingAddress, balance: amount, owner: creator }).save(stub);
            
            let t = await Transaction.build({ txID: txId, address: address, timestamp: Date.now(), isFinal: true }).save(stub);

            return { txID: txId };
        },

        /**
         * Method find all assets.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         */
        findAll: async function(stub){
    
            let result = [];

            let existingAssets = await Asset.findAll(stub);

            if(Array.isArray(existingAssets)) {

                existingAssets.forEach(function(asset){

                    result.push({
                        "txID": asset.txId,
                        "name": asset.name,
                        "qty": asset.amount,
                        "units": asset.units,
                        "open": asset.open
                      });
                }, this);
            }

            return result;
        },

        /**
         * Method issue more asset.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON (*name, *amount, *address, units, open)
         */
        issueMore: async function(stub, request){
    
            let creatorKey = stub.creator.mspid;
            let name = request.name;
            let amount = request.amount;
            let address = request.address;
            let metadata = request.metadata;
            let txId = stub.txId;
    
            let existingAsset = await Asset.findByKey(stub, name);
    
            if(!existingAsset) {
    
                throw new Error('This asset doesn\'t exist.');
            }

            let query = { address: address }

            let existingAddress = await Address.findOne(stub, query);

            if(!existingAddress) {

                throw new Error('This address doesn\'t exist or doesn\'t belong to you.');
            }

            let creator = await Member.findByKey(stub, creatorKey);
            
            if(!creator.isRegulator) {
                
                throw new Error('You aren\'t the regulator. You can\'t issue more asset.');
            }
            
            let originAddress = await Address.retrieveOriginAddress(stub, creator);

            existingAsset = await Asset.findOneAndUpdate(stub, { "name": existingAsset.name }, { amount: existingAsset.amount + amount });

            let existingWallet = await Wallet.findOne(stub, { "address.address": address, "asset.name": name });

            if(!existingWallet) {

                existingWallet = await Wallet.build({ asset: existingAsset, address: existingAddress, balance: amount, owner: creator }).save(stub);
            
            } else {

                existingWallet = await Wallet.findOneAndUpdate(stub, { "address.address": address, "asset.name": name }, { balance: existingWallet.balance + amount, asset : existingAsset });
            }

            let transaction = await Transaction.build({ txID: txId, address: originAddress.address, timestamp: Date.now(), isFinal: true }).save(stub);

            let transfer = await Transfer.build({ asset: existingAsset, origin: originAddress, destination: existingAddress, amount: amount, metadata: metadata, txId: txId, isIssue: true, transaction: transaction }).save(stub);

            return { txID: txId };
        }
    }
})();