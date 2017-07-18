pragma solidity ^0.4.4;

import "./stringUtils.sol";

contract UserStore {
	mapping(string => string) Users;

	event RegisterEvent(string name);

	function Register(string name, string passwordHash) {
		if(!StringUtils.equal(Users[name], "")) {
			throw;
		}
		else {
			Users[name] = passwordHash;
			RegisterEvent(name);
		}
	}

	function GetPasswordHash(string name) returns (string) {
		return Users[name];
	}
}