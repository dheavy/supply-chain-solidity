import './App.css';
import { ethers } from 'ethers';
import contractJSON from './utils/ItemManager.json';
import { useState, useEffect } from 'react';

const { abi } = contractJSON;

function App() {
  const [cost, setCost] = useState(0);
  const [name, setName] = useState('');
  const [walletError, setWalletError] = useState('');
  // const [isAppLoading, setAppLoading] = useState(false);
  const [isTxLoading, setTxLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  const getEthereum = () => {
    const { ethereum } = window;
    if (!ethereum) {
      setWalletError('A wallet is need to view this web app');
      throw new Error('Missing wallet');
    }
    return ethereum;
  };

  const checkWalletConnection = async () => {
    try {
      const eth = getEthereum();
      const accounts = await eth.request({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        console.log('Connected with', accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = async () => {
    try {
      const eth = getEthereum();
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const getContract = () => {
    const eth = getEthereum();
    const provider = new ethers.providers.Web3Provider(eth);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return contract
  };

  const clickHandler = async () => {
    try {
      const contract = getContract();
      const createItemTx = await contract.createItem(name, cost, { gasLimit: 300000 });
      console.log('Mining...', createItemTx.hash);
      await createItemTx.wait();
      console.log('Mined!', createItemTx.hash);
    } catch (error) {
      console.error(error);
    }
  };

  // const createItem = async (identifier, priceInWei) => {

  // };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <div className="App">
      <h1>Simple payment + supply chain demo</h1>
      <h4>Add item</h4>

      <div>
        {!currentAccount &&
        <button onClick={connectWallet}>Connect wallet</button>}
      </div>

      <main>
        <div>
          <label htmlFor="cost">Cost</label>
          <input type="number" name="cost" value={cost} placeholder="Cost in ETH" onChange={(e) => setCost(e.target.value)} />
        </div>

        <div>
          <label htmlFor="name">Item name</label>
          <input type="text" name="name" value={name} placeholder="Item name" onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <button
            disabled={isTxLoading}
            onClick={clickHandler}
          >
            Create new item
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
