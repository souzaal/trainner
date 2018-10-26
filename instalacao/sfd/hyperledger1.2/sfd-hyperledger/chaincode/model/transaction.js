import Model from './model';

export default (function(){

    let transactionModel = Model.define({

        /**
         * Unique ID
         */
        id: {
            type: String,
            required: true,
            unique: true
        },

        /**
         * Transaction ID for this element
         */
        txID: {
            type: String,
            required: true
        },

        /**
         * Address who did and start the transaction
         */
        address: {
            type: String,
            required: true
        },

        /**
         * Timestamp of the transaction
         */
        timestamp: {
            type: Number,
            required: true
        },

        /**
         * Timestamp of the creation of the block on blockchain
         */
        blocktime: {
            type: Number,
            required: false
        },

        /**
         * Indicates weather this element is final
         */
        isFinal: {
            type: Boolean,
            required: true,
            default: true
        }
    }, {
        key: "id",
        name: {
            singular: "transaction",
            plural: "transactions"
        }
    });

    /** 
     * This method is called before the save() function.
    */
   transactionModel.beforeCreate = async function(stub){
       
   };

   /** 
     * This method is called after the save() function.
    */
   transactionModel.afterCreate = async function(stub){
        
   };

   return transactionModel;
})();
