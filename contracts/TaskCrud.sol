// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract TaskCrud {
    
    struct Data {
        uint id;
        bytes32 contentHash;
        string descripcion;
    }
    
    Data[] jsons;

    uint nextId; // default value 0, add public to see the value
    
    
    
    function createHash(string memory _description) internal pure returns (bytes32){
        return keccak256(abi.encodePacked(_description));
    }

    function findIndex(uint _id) internal view returns (uint) {
        for (uint i = 0; i < jsons.length; i++) {
            if (jsons[i].id == _id) {                
                return i;
            }
        }
        revert("Task not found");
    }

    function findByHash(bytes32 _contentHash) internal view returns (uint) {
        for (uint i = 0; i < jsons.length; i++) {
            if (jsons[i].contentHash == _contentHash) {                
                return i;
            }
        }
        revert("Task not found");
    }

    function createTask(string memory _description) public{
        bytes32 contentHash = createHash(_description);
        jsons.push(Data(nextId, contentHash, _description));
        nextId++;
    }
    
    function updateTask(uint _id, string memory _description) public returns (uint, bytes32, string memory){
        uint index =  findIndex(_id);
        bytes32 contentHash = createHash(_description);
        jsons[index].contentHash= contentHash;
        jsons[index].descripcion = _description;
        return (jsons[index].id, jsons[index].contentHash, jsons[index].descripcion);
    }
    
    function readTask(uint _id) public view returns (uint, bytes32,string memory) {
        uint index = findIndex(_id);
        return (jsons[index].id, jsons[index].contentHash, jsons[index].descripcion);
    }

    function readTaskByHash(bytes32 _hash) public view returns (uint, bytes32,string memory) {
        uint index = findByHash(_hash);
        return (jsons[index].id, jsons[index].contentHash, jsons[index].descripcion);
    }
    
    
    function deleteTask(uint _id) public{
        uint index = findIndex(_id);
        delete jsons[index];
    }
    
}