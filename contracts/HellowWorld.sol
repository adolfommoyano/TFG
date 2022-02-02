// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract HelloWorld{
    uint data = 15;

    function getData() public view returns(uint){
        return data;
    }
}