const cryptoJs = require('crypto-js'),
  EC = require('elliptic').ec;

module.exports = function () {

  const ec = new EC('secp256k1');
  const keyPair = ec.genKeyPair();

  const pubKey = keyPair.getPublic(false, 'hex').slice(2);
  const pubKeyWordArray = cryptoJs.enc.Hex.parse(pubKey);
  const hash = cryptoJs.SHA3(pubKeyWordArray, { outputLength: 256 });
  const address = hash.toString(cryptoJs.enc.Hex).slice(24);

  return `0x${address}`;
};