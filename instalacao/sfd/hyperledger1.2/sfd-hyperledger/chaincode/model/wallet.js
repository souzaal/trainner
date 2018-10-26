import crypto from 'crypto';
import Model from './model';

export default (function(){

    let walletModel = Model.define({

        id: {
            type: String,
            required: true,
            unique: true
        },

        /**
         * Address for this wallet
         */
        address: {
            type: Object,
            required: true
        },

        /**
         * Asset for this wallet
         */
        asset: {
            type: Object,
            required: true
        },

        /**
         * Balance for this wallet
         */
        balance: {
            type: Number,
            required: true
        },

        /**
         * The owner for this wallet
         */
        owner: {
            type: Object,
            required: true
        }
    }, {
        key: "id",
        name: {
            singular: "wallet",
            plural: "wallets"
        }
    });

    /** 
     * This method is called before the save() function.
    */
   walletModel.beforeCreate = async function(stub){

   };

   /** 
     * This method is called after the save() function.
    */
   walletModel.afterCreate = async function(stub){

   };

   return walletModel;
})();