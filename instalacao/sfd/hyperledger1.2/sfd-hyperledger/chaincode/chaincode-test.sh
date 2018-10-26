#!/bin/bash
SLEEP=3
QUERY='peer chaincode query -n mycc -C mychannel -c '\''JSON'\'' -o orderer.example.com:7050'
INVOKE='peer chaincode invoke -n mycc -C mychannel -c '\''JSON'\'' -o orderer.example.com:7050'
DOCKER_EXEC='docker exec -ti -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com'

function yellow() {
    echo -e "\x1b[1;33m$1\x1b[0m"
}

function query() {
    yellow "$1"
    JSON=$(eval $(echo $DOCKER_EXEC $QUERY | sed -E "s/JSON/$2/"))
    echo $JSON | sed -E 's/\\//g'
}

function invoke() {
    yellow "$1"
    JSON=$(eval $(echo $DOCKER_EXEC $INVOKE | sed -E "s/JSON/$2/"))
    echo $JSON | sed -E 's/\\//g'
    INVOKE_RESULT=$(echo "$JSON" | grep -Eo -e '(\w{40,64})')
    sleep $SLEEP
}


invoke '1/20] CRIANDO PRIMEIRO ENDEREÇO' '{"Args":["createAddress"]}'
ADDRESS1=$INVOKE_RESULT

invoke '2/20] CRIANDO SEGUNDO ENDEREÇO' '{"Args":["createAddress"]}'
ADDRESS2=$INVOKE_RESULT

ASSET="BRL-$RANDOM"
invoke "3/20] CRIANDO ASSET PARA O ENDERECO $ADDRESS1" "$(echo '{"Args":["createAsset", "{\\"name\\":\\"ARG1\\",\\"amount\\":1000,\\"address\\":\\"ARG2\\"}"]}' | sed -E "s/ARG1/$ASSET/" | sed -E "s/ARG2/$ADDRESS1/")"

invoke "4/20] EMITINDO MAIS ASSET PARA O ENDERECO $ADDRESS1" "$(echo '{"Args":["issueMoreAsset", "{\\"name\\":\\"ARG1\\",\\"amount\\":100,\\"address\\":\\"ARG2\\", \\"metadata\\":\\"Cunhagem\\"}"]}' | sed -E "s/ARG1/$ASSET/" | sed -E "s/ARG2/$ADDRESS1/")"
ISSUE=$INVOKE_RESULT

invoke "5/20] TRANSFERINDO ASSET DE $ADDRESS1 PARA $ADDRESS2" "$(echo '{"Args":["transferAsset", "{\\"address\\":\\"ARG1\\", \\"asset\\":\\"ARG2\\", \\"destination\\":\\"ARG3\\", \\"amount\\":100, \\"metadata\\":\\"Depósito\\"}"]}' | sed -E "s/ARG1/$ADDRESS1/" | sed -E "s/ARG2/$ASSET/" | sed -E "s/ARG3/$ADDRESS2/")"
TRANSFER=$INVOKE_RESULT

STREAM="STREAM-$RANDOM"
invoke '6/20] CADASTRANDO STREAM' "$(echo '{"Args":["createStream","{\\"name\\": \\"ARG1\\", \\"anyoneCanWrite\\": true}"]}' | sed -E "s/ARG1/$STREAM/")"

KEY="KEY-$RANDOM"
invoke '7/20] CADASTRANDO KEY/VALUE' "$(echo '{"Args":["createStreamKeyValue","{\\"stream\\": \\"ARG1\\", \\"key\\": \\"ARG2\\", \\"value\\": {\\"attr\\" : \\"VALOR ARG2\\"}}"]}' | sed -E "s/ARG1/$STREAM/" | sed -E "s/ARG2/$KEY/g")"

query '8/20] BUSCANDO ASSETS' '{"Args":["findAllAssets"]}'

query '9/20] BUSCANDO ADDRESSES' '{"Args":["findAllAddresses"]}'

query "10/20] BUSCANDO ADDRESSES $ADDRESS1" "$(echo '{"Args":["findAddress", "{\\"address\\":\\"ARG1\\"}"]}' | sed -E "s/ARG1/$ADDRESS1/")"

query "11/20] BUSCANDO TRANSFERS DE $ADDRESS1" "$(echo '{"Args":["findAllTransfers", "{\\"address\\":\\"ARG1\\", \\"count\\" : 10}"]}' | sed -E "s/ARG1/$ADDRESS1/")"

query "12/20] BUSCANDO ISSUES DE $ADDRESS1" "$(echo '{"Args":["findAllIssues", "{\\"address\\":\\"ARG1\\", \\"count\\" : 10}"]}' | sed -E "s/ARG1/$ADDRESS1/")"

query "13/20] BUSCANDO TRANSFER $TRANSFER" "$(echo '{"Args":["findTransfer", "{\\"address\\":\\"ARG1\\", \\"txID\\" : \\"ARG2\\"}"]}' | sed -E "s/ARG1/$ADDRESS1/" | sed -E "s/ARG2/$TRANSFER/")"

query "14/20] BUSCANDO ISSUE $ISSUE DE $ADDRES1" "$(echo '{"Args":["findIssue", "{\\"address\\":\\"ARG1\\", \\"txID\\" : \\"ARG2\\"}"]}' | sed -E "s/ARG1/$ADDRESS1/" | sed -E "s/ARG2/$ISSUE/")"

query "15/20] BUSCANDO BURN-ADDRESS" '{"Args":["findBurnAddress"]}'

query "16/20] BUSCANDO TRANSACTION $ISSUE" "$(echo '{"Args":["findTransaction", "{\\"txID\\":\\"ARG1\\"}"]}' | sed -E "s/ARG1/$ISSUE/")"

query "17/20] BUSCANDO STREAMS" '{"Args":["findAllStreams"]}'

query "18/20] BUSCANDO ITEMS DA STREAM $STREAM" "$(echo '{"Args":["findStreamItems", "{\\"stream\\": \\"ARG1\\"}"]}' | sed -E "s/ARG1/$STREAM/")"

query "19/20] BUSCANDO KEYS DA STREAM $STREAM" "$(echo '{"Args":["findStreamKey", "{\\"stream\\": \\"ARG1\\"}"]}' | sed -E "s/ARG1/$STREAM/")"

query "20/20] BUSCANDO VALUES DA KEY $KEY DA STREAM $STREAM" "$(echo '{"Args":["findStreamValuesByKey", "{\\"stream\\": \\"ARG1\\", \\"key\\": \\"ARG2\\"}"]}' | sed -E "s/ARG1/$STREAM/" | sed -E "s/ARG2/$KEY/")"
