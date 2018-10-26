import { Address, Stream, StreamKey, StreamKeyValue, Transaction } from '../model/models';

export default (function () {

    return {

        /**
         * Method create a stream.
         *
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON to create the stream
         */
        create: async function (stub, request) {

            let stream = request;
            let txId = stub.txId;

            let creatorAddress = await getCreatorAddress(stub, stream.creator);

            stream.creator = creatorAddress.address;

            let transaction = await Transaction.build({ txID: txId, address: stream.creator, timestamp: Date.now(), isFinal: true }).save(stub);

            stream.transaction = transaction;

            await Stream.build(stream).save(stub);

            return {
                "txID": stub.txId
            }
        },

        /**
         * Method create a key and value for stream.
         * Create a new value for this key.
         *
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON to create the relationshipt Strem with key and value
         *
         */
        createKeyValue: async function (stub, request) {

            let streamKeyValue = request;
            let txId = stub.txId;

            let stream = await getStream(stub, streamKeyValue.stream);

            let creatorKey = stub.creator.mspid;

            let queryGetAddress = {
                "creator": { name: creatorKey }
            }
    
            let publisher = await Address.findOne(stub, queryGetAddress);

            if(stream.anyoneCanWrite == false && !publisher.creator.isRegulator) {

                throw new Error('You are not allowed to create this record');
            }

            let streamKeyRequest = {
                keyName: stream.name + '.' + request.key,
                key: request.key,
                stream: stream
            }

            let streamKey = await StreamKey.findOne(stub, { keyName: streamKeyRequest.keyName });

            if(!streamKey) {

                streamKey = await StreamKey.build(streamKeyRequest).save(stub);
            }

            streamKeyValue.streamKey = streamKey;

            streamKeyValue.keyName = stream.name + '.' + request.key;

            streamKeyValue.publisher = publisher.address;

            streamKeyValue.stream = stream;

            let transaction = await Transaction.build({ txID: txId, address: streamKeyValue.publisher, timestamp: Date.now(), isFinal: true }).save(stub);

            streamKeyValue.transaction = transaction;

            await StreamKeyValue.build(streamKeyValue).save(stub);

            return {
                "txID": txId
            }
        },

        /**
         * Returns all keys for this stream.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON
         */
        findStreamKey: async function (stub, request) {
            
            let query = {
                "stream.name": request.stream
            };

            let options = {
                "fields": [
                    "key"
                ]
            };

            let result = await StreamKey.find(stub, query, options);

            let response = [];

            if(result) {

                result.forEach(function(r){
    
                    response.push(r.key)
    
                }, this);
            }

            return response;
        },

        /**
         * Returns stream items.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON
         */
        findStreamItems: async function (stub, request) {
            
            let query = {
                "stream.name": request.stream
            };

            let options = {
                "fields": [
                    "transaction",
                    "key",
                    "value"
                ],
                limit: request.count || 10000,
                skip: request.start || 0,
                sort: [
                    {"transaction.timestamp": "asc"}
                ]
            };

            let result = await StreamKeyValue.find(stub, query, options);

            return result;
        },

        /**
         * Returns all values for this key.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON
         */
        //TODO deve retornar o publisher
        findStreamValuesByKey: async function (stub, request) {

            let query = {
                "keyName": request.stream + '.' + request.key
            };

            let result = await StreamKeyValue.find(stub, query);
            
            let count = request.count;
            let skip  = request.start || -1;
            let inicio = 0;
            let fim = result.length;

            if(skip) {
                if(skip < 0){
                    result.reverse();
                    skip = (skip == -1) ? 0 : skip;
                }
                skip = Math.abs(skip);
                inicio = skip;
            }
            
            if(count) {
                count = Math.abs(count);
                fim = inicio + count;
            }
            
            return result.slice(inicio, fim);
        },

        /**
         * Method find all stream of the member wallet.
         * Returns all streams.
         *
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON
         */
        findAll: async function (stub, request) {
            let options = {
                "fields": [
                    "transaction",
                    "creator",
                    "name",
                    "anyoneCanWrite"
                ],
                limit: request.count || 10000,
                skip: request.start || 0
            };

            let result = await Stream.find(stub, {}, options);

            return {
                result
            };

        }
    }
})();

async function getCreatorAddress (stub, address) {

    let creatorKey = stub.creator.mspid;

    if (address) {

        let queryCheckAddress = {
            $and: [
                { "address" : address },
                { "creator" : { name : creatorKey } }
            ]
        };

        let existingAddress = await Address.findOne(stub, queryCheckAddress);

        if (!existingAddress) {

            throw new Error('This address doesn\'t exist or doesn\'t belong to you.');
            
        } else {

            return existingAddress;
        }

    } else {

        let queryGetAddress = {
            "creator": { name: creatorKey}
        }

        let existingAddresses = await Address.findOne(stub, queryGetAddress);

        if(!existingAddresses) {

            throw new Error('Any address can\'t be found.');
        }
        
        return existingAddresses;
    }

}

async function getStream(stub, stream) {

    return await Stream.findByKey(stub, stream);
}