import Model from './model';

export default (function(){

    let assetModel = Model.define({

        /**
         * Name for this asset
         */
        name: {
            type: String,
            required: true,
            validators: []
        },

        /**
         * The smallest transactable unit
         */
        units: {
            type: Number,
            default: 0.01
        },

        /**
         * If the asset is open to any node send,receive
         */
        open: {
            type: Boolean,
            default: true
        },

        /**
        * Transaction ID for this element
         */
        txId: {
            type: String,
            required: true
        }
    }, {
        key: "name",
        name: {
            singular: "asset",
            plural: "assets"
        }
    });

    /** 
     * This method is called before the save() function.
    */
   assetModel.beforeCreate = async function(stub){
       
   };

   /** 
     * This method is called after the save() function.
    */
   assetModel.afterCreate = async function(stub){
        
   };

   return assetModel;
})();