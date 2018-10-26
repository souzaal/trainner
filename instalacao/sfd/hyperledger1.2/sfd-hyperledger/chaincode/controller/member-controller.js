import { Member } from '../model/models';

export default (function(){

    return {

        /**
         * Method create a member.
         * 
         * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
         * @param {*} request - JSON
         */
        create: async function(stub, request){
    
            let name = stub.creator.mspid;
            let isRegulator = request.isRegulator === "true" ? true : false;
    
            let existingMember = await Member.findByKey(stub, name);
    
            if(existingMember) {

                throw new Error('The member ' + existingMember.name + ' already exists.');

            } else {
    
                if(isRegulator) {

                    let existingRegulator = await Member.findOne(stub, { isRegulator: true });

                    if(existingRegulator) {

                        throw new Error('The regulator already exists on network.');
                    }
                }

                existingMember = await Member.build({ name: name, isRegulator: isRegulator }).save(stub);

            }

            return existingMember;
        }
    }
})();
