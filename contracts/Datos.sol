// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Datos{

  uint nextId;

  struct Dato{
      uint id;
      string name;
      string description;
  }

  Dato[] datos;



  function meterDatos() public{
    datos.push(Dato(0, "DATO1","HOLA!"));
  }
 
  function leerDato(uint _id) public view returns (uint, string memory, string memory){
    return (datos[_id].id, datos[_id].name, datos[_id].description);
  }

}
