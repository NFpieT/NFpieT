const truffleAssert = require('truffle-assertions');

const NFpieT = artifacts.require('NFpieT');

const waitForEvent = (result, eventType) => new Promise((resolve) => {
  truffleAssert.eventEmitted(result, eventType, resolve);
});

contract("nfpiet", (accounts) => {
  it("should create a new token", async () => {
    const instance = await NFpieT.deployed();

    const baseSupply = await instance.totalSupply();

    const newTokenurl = "blblbl" 
    await waitForEvent(
      await instance.mint("0x0Cc300DAF207894212e42181952A84Af0435E629", `bitmap_url=${newTokenurl}`),
      'Transfer',
    );

    const currentSupply = await instance.totalSupply();
    expect(baseSupply.toNumber() + 1).to.equal(currentSupply.toNumber());
    const created = await instance.getTokenURI(currentSupply)
    console.log(created)
    expect(created.bitmap_url.to.equal())
  });


  it("should get total supply", async () => {
    const instance = await NFpieT.deployed();
    const supply = await instance.totalSupply();
    console.log(supply);
  });
});