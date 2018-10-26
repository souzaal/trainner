import { Transaction } from '../model/models';

export default (function(){

    return {

        /**
         * Method create a member.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - Request data
         */
        find: async function(stub, request){

            let txID = request.txID;
    
            let existingTransaction = await Transaction.findOne(stub, { txID: txID });
    
            if(!existingTransaction) {
    
                throw new Error('The transaction doesn\'t exist.');
            }

            return existingTransaction;
        }
    }
})();
