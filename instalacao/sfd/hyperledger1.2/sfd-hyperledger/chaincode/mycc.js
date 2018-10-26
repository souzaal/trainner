import shim from 'fabric-shim';
import StubUtils from './util/stub-utils';
import AssetController from './controller/asset-controller';
import AddressController from './controller/address-controller';
import MemberController from './controller/member-controller';
import StreamController from './controller/stream-controller';
import TransactionController from './controller/transaction-controller';

class Chaincode {

    /**
     * Method called on instantiate.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     */
    async Init(stub){

        try {

            let args = stub.getFunctionAndParameters().params;

            await AddressController.createBurnAddress(stub);
    
            return StubUtils.success('Initialized Successfully!');

        } catch(error) {

            return StubUtils.error(error.message);
        }

    }

    /**
     * Method called on every transaction.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     */
    async Invoke(stub){

        let ret = stub.getFunctionAndParameters();
        
        let fcn = this[ret.fcn];
        
        let params = ret.params[0] ? JSON.parse(ret.params[0]) : {};

        return fcn(stub, params);
    }

    /**
     * Method register a member.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async register(stub, request) {

        try {
            
            let result = await MemberController.create(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method create an asset.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async createAddress(stub, request) {

        try {
    
            let result = await AddressController.create(stub);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find all addresses.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findAllAddresses(stub, request) {

        try {
    
            let result = await AddressController.findAll(stub);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find an address.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON (*address)
     */
    async findAddress(stub, request) {

        try {
    
            let result = await AddressController.findOne(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method create an asset.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON (*name, *amount, *address, units, open)
     */
    async createAsset(stub, request) {

        try {
    
            let result = await AssetController.create(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method issue more asset to an address.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON (*name, *amount, *address, *metadata)
     */
    async issueMoreAsset(stub, request) {

        try {
    
            let result = await AssetController.issueMore(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find all assets.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findAllAssets(stub, request) {

        try {
    
            let result = await AssetController.findAll(stub);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method transfer assets between addresses.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON (*address, *asset, *destination, *amount, *metadata)
     */
    async transferAsset(stub, request) {

        try {
    
            let result = await AddressController.transfer(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find all transfers.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findAllTransfers(stub, request) {

        try {
    
            let result = await AddressController.findAllTransfers(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find a transfer by an address.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findTransfer(stub, request) {

        try {
    
            let result = await AddressController.findTransfer(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find all issues.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findAllIssues(stub, request) {

        try {
    
            let result = await AddressController.findAllIssues(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find an issue by an address.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findIssue(stub, request) {

        try {
    
            let result = await AddressController.findIssue(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find the only burn address.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findBurnAddress(stub, request) {

        try {
    
            let result = await AddressController.findBurnAddress(stub);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Method find a transaction by txID.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findTransaction(stub, request) {

        try {
    
            let result = await TransactionController.find(stub, request);
    
            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Create a stream.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async createStream(stub, request) {

        try {

            let result = await StreamController.create(stub, request);

            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Find all streams.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findAllStreams(stub, request) {
        try {

            let result = await StreamController.findAll(stub, request);

            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Create a key and value for a stream.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async createStreamKeyValue(stub, request) {

        try {

            let result = await StreamController.createKeyValue(stub, request);

            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Find all Streams Key-Value.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findStreamKey(stub, request) {
        try {

            let result = await StreamController.findStreamKey(stub, request);

            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Find Streams Key-Value.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findStreamItems(stub, request) {

        try {

            let result = await StreamController.findStreamItems(stub, request);

            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Find all values by Stream key.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async findStreamValuesByKey(stub, request) {
        try {

            let result = await StreamController.findStreamValuesByKey(stub, request);

            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }

    /**
     * Import an address
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} request - JSON
     */
    async importAddress(stub, request) {

        try {

            let result = await AddressController.import(stub, request);

            return StubUtils.success(result);

        } catch(error) {

            return StubUtils.error(error.message);
        }
    }
}

shim.start(new Chaincode());