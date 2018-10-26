import Model from './model';

export default (function(){

    let memberModel = Model.define({

        /**
         * Name for this asset
         */
        name: {
            type: String,
            required: true,
            validators: []
        },

        /**
         * Boolean says if this member is the regulator.
         */
        isRegulator: {
            type: Boolean,
            required: true,
            default: false,
            validators: []
        }
    }, {
        
        key: "name",

        name: {
            singular: "member",
            plural: "members"
        }
    });

    /** 
     * This method is called before the save() function.
    */
   memberModel.beforeCreate = async function(stub){
       
   };

   /** 
     * This method is called after the save() function.
    */
   memberModel.afterCreate = async function(stub){
        
   };

   return memberModel;
})();
