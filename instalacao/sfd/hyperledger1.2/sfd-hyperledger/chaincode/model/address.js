import crypto from 'crypto';
import Model from './model';

export default (function(){

    let addressModel = Model.define({

        /**
         * Address
         */
        address: {
            type: String,
            required: true
        },

        /**
         * The creator for this address
         */
        creator: {
            type: Object,
            required: true
        },

        isBurn: {
            type: Boolean,
            required: true,
            default: false
        },

        /**
         * This array stores the members keys
         */
        importedBy: {
            type: Array,
            required: true,
            default: []
        }
    }, {
        key: "address",
        name: {
            singular: "address",
            plural: "addresses"
        }
    });

    /** 
     * This method is called before the save() function.
    */
   addressModel.beforeCreate = async function(stub){
       
        let newAddress = createNewAddress();
        let existingAddress = await this.findByKey(stub, newAddress);

        while(existingAddress) {
            
            newAddress = createNewAddress();

            let existingAddress = await this.findByKey(stub, newAddress);
        }

        this.address = newAddress;
   };

   /** 
     * This method is called after the save() function.
    */
   addressModel.afterCreate = async function(stub){
        
   };

   addressModel.retrieveOriginAddress = async function(stub, creator) {

    let query = { "creator": { "name": creator.name } }

    return this.findOne(stub, query);
   }

   return addressModel;
})();

/** 
 * This method generates a random address.
*/
function createNewAddress(){
    
    let current_date = (new Date()).valueOf().toString();
    let random = Math.random().toString();
    let newAddress = crypto.createHash('sha1').update(current_date + random).digest('hex');
    
    return newAddress;
}