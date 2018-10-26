import Model from './model';

export default (function(){

    let transferModel = Model.define({

        /**
        * Transaction ID for this element
         */
        txId: {
            type: String,
            required: true
        },

        /**
         * Name of the asset
         */
        asset: {
            type: Object,
            required: true
        },

        /**
         * Transfer origin address
         */
        origin: {
            type: Object,
            required: true
        },

        /**
         * Transfer destination address
         */
        destination: {
            type: Object,
            required: true
        },

        /**
         * Mount of this transfer
         */
        amount: {
            type: Number,
            required: true
        },

        /**
         * Metadata
         */
        metadata: {
            type: String,
            required: true
        },

        /**
         * If true this transfer is an issue
         */
        isIssue: {
            type: Boolean,
            required: true,
            default: false
        },

        /**
         * Transaction generated for this transfer
         */
        transaction: {
            type: Object,
            required: true
        }
    }, {
        key: "txId",
        name: {
            singular: "transfer",
            plural: "transfers"
        }
    });

    /** 
     * This method is called before the save() function.
    */
   transferModel.beforeCreate = async function(stub){
       
   };

   /** 
     * This method is called after the save() function.
    */
   transferModel.afterCreate = async function(stub){
        
   };

   return transferModel;
})();
