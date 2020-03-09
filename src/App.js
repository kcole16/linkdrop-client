import React from 'react';
import './App.css';
import { connect, KeyPair, keyStores } from 'nearlib';

const config = {
  networkId: 'default',                                             // this can be any label to namespace user accounts
  nodeUrl: "https://rpc.nearprotocol.com",                          // this endpoint must point to the network you want to reach
  walletUrl: "http://wallet.nearprotocol.com",
  masterAccount: 'linkdrop-test-1',                      // this endpoint must exist for the wallet to work
  deps: {
      keyStore: new keyStores.BrowserLocalStorageKeyStore() // keys are stored as plaintext in LocalStorage
  }
};


const LINKDROP_CONTRACT_ID = 'linkdrop-test-1';
const BOATLOAD_OF_GAS = '10000000000000000';

async function completeFunding(accountId, fundingKey) {
  const near = await connect(config);
  window.localStorage.setItem(`nearlib:keystore:linkdrop-test-1:default`, 'ed25519:'+fundingKey)
  const contract = await near.loadContract(LINKDROP_CONTRACT_ID, {
    viewMethods: [],
    changeMethods: ['create_account_and_claim', 'claim'],
    sender: 'linkdrop-test-1'
  });
  const keypair = KeyPair.fromRandom('ed25519'); 
  const publicKey = keypair.publicKey.toString().split(':')[1]
  const result = await contract.create_account_and_claim({new_account_id: accountId, new_public_key: publicKey}, BOATLOAD_OF_GAS).catch(err => console.log(err));
  console.log(`nearlib:keystore:${accountId}:default`)
  console.log(keypair.secretKey.toString())
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      fundingKey: null,
      accountId: '',
      error: null
    }
  }

  async componentWillMount() {
    await fetch("http://localhost:3000/")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            fundingKey: result.fundingKey,
          });
        },
        (error) => {
          this.setState({
            error
          });
        }
      )
  }

  handleSubmit() {
    completeFunding(this.state.accountId, this.state.fundingKey)
  }

  render () {
    return (
      <div className="App">
        <header className="App-header">
          <input 
            type="text" 
            name="account" 
            value={this.state.accountId} 
            onChange={(e) => this.setState({accountId: e.target.value})}/>
          <button onClick={this.handleSubmit}>Submit</button>
        </header>
      </div>
    );
  }
}

