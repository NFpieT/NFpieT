const truffleAssert = require('truffle-assertions');

const NFpieT = artifacts.require('NFpieT');

const waitForEvent = (result, eventType) => new Promise((resolve) => {
  truffleAssert.eventEmitted(result, eventType, resolve);
});


contract("NFpieT", (accounts) => {
  it("should create a new token if metadata are valid", async () => {
    const metadata =
    {
      "name": "hello_world",
      "author": "JeanCupidon",
      "codels": [
        [1, 5, 19],
        [6, 4, 12],
        [3, 1, 6]
      ]
    }


    const emitter = accounts[0]

    const instance = await NFpieT.deployed()
console.log(instance.constructor._json.deployedBytecode.length);

    // console.log(instance)
    const response = await instance.mint(emitter, metadata.name, metadata.author, JSON.stringify(metadata.codels))
    // console.log(response)

    console.log(response)
    truffleAssert.eventEmitted(response, 'TokenMinted', {
      emitter,
      name: metadata.name,
      author: metadata.author,
      codels: metadata.codels
    })
  });


  // it("should create a new token", async () => {
  //   const instance = await NFpieT.deployed();

  //   const baseSupply = await instance.totalSupply();

  //   const newTokenurl = "blblbl"
  //   await waitForEvent(
  //     await instance.mint("0x0Cc300DAF207894212e42181952A84Af0435E629", `bitmap_url=${newTokenurl}`),
  //     'Transfer',
  //   );

  //   const currentSupply = await instance.totalSupply();
  //   expect(baseSupply.toNumber() + 1).to.equal(currentSupply.toNumber());
  //   const created = await instance.getTokenURI(currentSupply)
  //   console.log(created)
  //   expect(created.bitmap_url.to.equal(newTokenurl))
  // });


  // it("should get total supply", async () => {
  //   const instance = await NFpieT.deployed();
  //   const supply = await instance.totalSupply();

  // });

  // it("should be burnable", async () => {
  //   const id = 1
  //   const instance = await NFpieT.deployed();
  //   const supply = await instance.totalSupply();
  //   expect()

  // })
});