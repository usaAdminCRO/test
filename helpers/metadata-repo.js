const { ethers } = require('ethers')
const ERC721_ABI = require('../contracts/ERC721.json')
const CacheService = require('../cache')
const fetch = require('node-fetch');

const ttl = 30; //cache for 30 seconds by default, overriden to 0 (unlimited) for getById below;
const cache = new CacheService(ttl);

const rpcurl = "https://evm.cronos.org";
const provider = new ethers.providers.JsonRpcProvider(rpcurl);
const erc721Contract = new ethers.Contract("0x9Df5C42919eB4D9bc56fBdE357416F259Fe2a609", ERC721_ABI.abi, provider);

const MetadataRepo = {
  getAll() {
    return cache.get("TotalSupply", () => erc721Contract.totalSupply().then((bigNumber) => bigNumber.toNumber()))
      .then((total) => {
        console.log(total);
        return total;
      });
  },
  
  getById(id) {
    return cache.get(`Token_${id}`, () => {
        return erc721Contract
          .ownerOf(id)
          .then(() => true)
          .catch(() => false);
      }, 0)
      .then((exists) => {
        console.log(exists)
        if (exists) {
          return fetch(`${process.env.SOURCE_BASE_URI}${id}`+'.json', {method: 'GET'})
            .then(res => {
              return res.json();
            })
            .then((data) => {
              return data;
            })
        } else {
          return { error: `Token ${id} doesn't exist`};
        }
      });
  }
};

module.exports = MetadataRepo;
