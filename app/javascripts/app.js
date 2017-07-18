// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import { default as bcrypt } from 'bcryptjs'

// Import our contract artifacts and turn them into usable abstractions.
import userstore_artifacts from '../../build/contracts/UserStore.json'


var UserStore = contract(userstore_artifacts);

 
var accounts;
var account;

window.App = {
	start: function() {
		var self = this;

		// Bootstrap the abstraction for Use.
		UserStore.setProvider(web3.currentProvider);

		// Get the initial account balance so it can be displayed.
		web3.eth.getAccounts(function(err, accs) {
			if (err != null) {
				alert("There was an error fetching your accounts.");
				return;
			}

			if (accs.length == 0) {
				alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
				return;
			}

			accounts = accs;
			account = accounts[0];
		});
	},

	setStatus: function(message) {
		var status = document.getElementById("status");
		status.innerHTML = message;
	},

	login: function() {
		var self = this;

		var email = document.getElementById("login_email").value;
		var password = document.getElementById("login_password").value;

		UserStore.deployed().then(function(instance) {
			return instance.GetPasswordHash.call(email, {from: account});
		}).then(function(passwordHash) {
			return bcrypt.compare(password, passwordHash);
		}).then(function(valid) {
			var statusMsg = valid ? "Login Success" : "Login Failed";
			self.setStatus(statusMsg);

			document.getElementById("login_email").value = "";
			document.getElementById("login_password").value = "";
		}).catch(function(e) {
			console.log(e);
			self.setStatus("Error logging in; see log.");
		});
	},

	register: function() {
		var self = this;

		var email = document.getElementById("register_email").value;
		var password = document.getElementById("register_password").value;

		bcrypt.hash(password, 10).then(function(passwordHash) {
			return UserStore.deployed().then(function(instance) {
				return instance.Register(email, passwordHash, {from: account}).then(function() {
					return new Promise(function(resolve, reject) {
						instance.RegisterEvent({name: email}, function(err, res) {
  							if(err) {
  								return reject(err);
  							}

  							resolve();
						});
					});
				});
			});
		})
		.then(function() {	
			self.setStatus("Register Success");

			document.getElementById("register_email").value = "";
			document.getElementById("register_password").value = "";
		}).catch(function(e) {
			console.log(e);
			self.setStatus("Error registering; see log.");
		});
	}
};

window.addEventListener('load', function() {
	// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	if (typeof web3 !== 'undefined') {
		console.warn("Using web3 detected from external source. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
		// Use Mist/MetaMask's provider
		window.web3 = new Web3(web3.currentProvider);
	} else {
		console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}

	App.start();
});
