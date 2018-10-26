import uuidv4 from 'uuid/v4';
import StubUtils from '../util/stub-utils';
import BufferUtils from '../util/buffer-utils';

/** 
 * Array of registered models
*/
let models = [];

export default class Model{

    constructor(definitions, options){

        this.definitions = definitions;
        this.options = options;
    }

    /**
     * This method register the new model definition in an array of models.
     * 
     * @param {*} definitions - The model's definitions.
     * @param {*} options - The model's options.
     */
    static define(definitions, options){

        definitions.createdAt = {
            type: Date,
            required: true,
            default: new Date()
        }

        let model = new this( definitions, options );

        try {

            if(validateOptions(models, model, definitions)){
    
                models.push(model);
            }
            
            return model;

        } catch( exception ) {
    
            throw exception;
    
        }
    }

    /**
     * This method build a model's object.
     * 
     * @param {*} attributes - Attributes
     */
    build(attributes) {

        let clone = Object.assign( Object.create( Object.getPrototypeOf(this)), this);

        Object.keys(attributes).forEach(function(attribute){

            clone[attribute] = attributes[attribute];

        }, this);

        return clone;
    }

    /**
     * This method find a model objects on the blockchain by the key.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} key - Name of the key
     */
    async findByKey(stub, key){

        let pluralName = this.options.name.plural;

        let existingValue = await StubUtils.getState(stub, key);

        return existingValue;
    }

    /**
     * This method find a model objects on the blockchain by the key.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} key - Name of the key
     */
    async findHistoryByKey(stub, key){

        let response = [];

        let pluralName = this.options.name.plural;

        let result = await StubUtils.getHistoryForKey(stub, key);

        let element = await result.next();

        while(element.value){

            response.push(BufferUtils.toJson(element.value.value.buffer.slice(element.value.value.offset, element.value.value.limit)));

            element = await result.next();
        }
    
        return response;
    }


    /**
     * This method find a model's object according to the query on the blockchain.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} query - Query object.
     * @param {*} options - Query options object.
     */
    async find(stub, query = {}, options = {}){
        
        let response = [];
        
        let pluralName = this.options.name.plural;

        query.docType = pluralName;

        let queryObject = options;

        queryObject.selector = query;

        let queryString = JSON.stringify(queryObject);

        let result = await StubUtils.getQueryResult(stub, queryString);

        let element = await result.next();

        while(element.value){

            response.push(BufferUtils.toJson(element.value.value.buffer.slice(element.value.value.offset, element.value.value.limit)));

            element = await result.next();
        }
    
        return response;
    }

    /**
     * This method find an model's object on the blockchain.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} query - Query object.
     * @param {*} options - Query options object.
     */
    async findOne(stub, query, options){

        let result = await this.find(stub, query, options);
        
        return result[0];
    }

    /**
     * This method find an model's object on the blockchain and update it.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     * @param {*} query - Query object.
     * @param {*} updateObject - JSON to update.
     */
    async findOneAndUpdate(stub, query, updateObject){

        let result = await this.find(stub, query);
        
        result = result[0];

        if(!result) {

            throw new Error('There is no result.');
        }

        result['createdAt'] = undefined;
        
        Object.keys(updateObject).forEach(function(attribute){
            
            result[attribute] = updateObject[attribute];
            
        }, this);
        
        let object = new Model(this.definitions, this.options);

        object = object.build(result);

        return await updateLedger(stub, object, true);
    }

    /**
     * This method find all model's objects on the blockchain.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
     */
    async findAll(stub){
        
        return this.find(stub, {});
    }

    /** 
     * This method save the model instance on stub.
     * 
     * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
    */
    async save(stub){

        return await updateLedger(stub, this, false);

    }

    /** 
     * This method is called before the save() function.
    */
    async beforeCreate(){}

    /** 
     * This method is called after the save() function.
    */
    async afterCreate(){}
}

/**
 * This method validates the options of a model.
 * 
 * @param {*} models - Array of existing models
 * @param {*} newModel - New model
 * @param {*} definitions - Definitions
 */
function validateOptions(models, newModel, definitions){

    if(!newModel.options || !newModel.options.name || !newModel.options.name.singular || !newModel.options.name.plural) {
        throw new Error('Required option: The singular or plural can\'t be undefined.');
    }

    if(!newModel.options || !newModel.options.key) {
        throw new Error('Required option: The key can\'t be undefined.');
    } else if(newModel.options.key && typeof newModel.options.key !== 'string') {
        throw new Error('The key must be a String.');
    } else if(!definitions[newModel.options.key]) {
        throw new Error('The key must be exists in the definitions.');
    }

    let existingModel = models.find(function(model){
        return model.options.name.singular === this.options.name.singular || 
                model.options.name.plural === this.options.name.plural;
    }, newModel);

    if(existingModel) {
        throw new Error('Option: The singular or plural name already exist.');
    }

    return true;
}


/**
 * This method is called to validate the instance object.
 * 
 * @param {*} object - Object to be validate
 * @param {*} isUpdate - True if it's an update
 */
async function validateBeforeSave(object, isUpdate = false){

    let definitions = object.definitions;
    
    Object.keys(definitions).forEach(function(attribute){
    
        try {

            let definition = definitions[attribute];
    
            validateAttribute(attribute, definition, object, isUpdate);
    
        } catch(error) {
    
            throw error;
        }
    
    }, this);

}

/**
 * This method validate a field referenced by attribute in a json object.
 * 
 * @param {*} attribute - Field
 * @param {*} definition - Object definitions
 * @param {*} object - Object
 * @param {*} isUpdate - True if it's an update
 */
function validateAttribute(attribute, definition, object, isUpdate) {

    applyDefaultValue(attribute, definition, object);
    
    if(!isUpdate) {
        
        applyUniqueValue(attribute, definition, object);
    }
        
    validateRequiredField(attribute, definition, object);

    validateTypeField(attribute, definition, object);

    executeValidators(attribute, definition, object);
}

/**
 * This method apply the default value in the json object.
 * 
 * @param {*} attribute - Field
 * @param {*} definition - Object definitions
 * @param {*} object - Object
 */
function applyDefaultValue(attribute, definition, object) {

    if( !object[attribute] && typeof definition.default !== 'undefined' ) {
        object[attribute] = definition.default;
    }
}

/**
 * This method apply the unique value in the json object.
 * 
 * @param {*} attribute - Field
 * @param {*} definition - Object definitions
 * @param {*} object - Object
 */
function applyUniqueValue(attribute, definition, object) {

    if( typeof definition.unique !== 'undefined' &&  definition.unique ) {
        object[attribute] = uuidv4();
    }
}

/**
 * This method validate required field in the json object.
 * 
 * @param {*} attribute - Field
 * @param {*} definition - Object definitions
 * @param {*} object - Object
 */
function validateRequiredField(attribute, definition, object) {

    if( definition.required && typeof object[attribute] === 'undefined' ) {
        throw new Error('The field ' + attribute + ' is required.');
    }
}

/**
 * This method validate type field in the json object.
 * 
 * @param {*} attribute - Field
 * @param {*} definition - Object definitions
 * @param {*} object - Object
 */
function validateTypeField(attribute, definition, object) {

    if( object[attribute] && 
        ((definition.type.name.toUpperCase() !== 'ARRAY' && definition.type.name.toUpperCase() !== 'DATE' && (definition.type.name.toUpperCase() !== (typeof object[attribute]).toUpperCase())) || 
            (definition.type.name.toUpperCase() === 'ARRAY' && !Array.isArray(object[attribute]) || 
                (definition.type.name.toUpperCase() === 'DATE' && !(object[attribute] instanceof Date))))) {
        throw new Error('The field ' + attribute + ' must be ' + definition.type.name + '.');
    }
}

/**
 * This method executes the validators registered on model definitions.
 * 
 * @param {*} attribute - Field
 * @param {*} definition - Object definitions
 * @param {*} object - Object
 */
function executeValidators(attribute, definition, object) {

    if(object[attribute]) {

        let validators = definition.validators;
    
        if(Array.isArray(validators)) {
    
            validators.forEach(function(validator){
    
                try {
    
                    let isValid = validator(object[attribute]);
    
                    if(!isValid) {
    
                        throw new Error('The field \'' + attribute + '\' was not validate by own validator.');
                    }
                    
                } catch(error) {
        
                    throw error;
                }
    
            }, this);
        }
    }
}

/**
 * This method update the state on blockchain ledger.
 * 
 * @param {*} stub - The stub encapsulates the APIs between the chaincode implementation and the Fabric peer
 * @param {*} object - Object
 * @param {*} isUpdate - True if it's an update
 */
async function updateLedger(stub, object, isUpdate = false) {

        let singularName = object.options.name.singular;
        let pluralName = object.options.name.plural;

        object.docType = pluralName;

        await object.beforeCreate(stub);

        await validateBeforeSave(object, isUpdate);

        let oldObject = object;

        let resultObject = Object.assign({}, oldObject, { definitions: undefined, options: undefined });

        if(!isUpdate) {

            let existingModel = await object.findByKey(stub, resultObject[oldObject.options.key]);
    
            if(existingModel) {
        
                throw new Error('This ' + singularName + ' already exists.');
            }
        }

        await StubUtils.putState(stub, resultObject[oldObject.options.key], resultObject);

        await object.afterCreate(stub);

        return resultObject;
}