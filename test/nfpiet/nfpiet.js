// const truffleAssert = require('truffle-assertions');
const { expect } = require('chai');
const { ethers } = require('hardhat');

// const NFpieT = artifacts.require('NFpieT');

// const waitForEvent = (result, eventType) => new Promise((resolve) => {
//   truffleAssert.eventEmitted(result, eventType, resolve);
// });

describe("NFpieT", function() {
  it("mint and transfer it to someone", async function () {
    const NFpieT = await ethers.getContractFactory("NFpieT");
    const nfpiet = await NFpieT.deploy();
    await nfpiet.deployed();

    const recipient = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

    const metadata =
    {
      "name": "hello_world",
      "author": "JeanCupidon",
      "codels": "[[1, 5, 19],[6, 4, 12],[3, 1, 6]]"
    }

    let balance = await nfpiet.balanceOf(recipient);
    expect(balance).to.equal(0);

    const newlyMintedToken = await nfpiet.payToMint(
      recipient, 
      metadata.name, 
      metadata.author, 
      metadata.codels, 
      { value: ethers.utils.parseEther('0.05') }
      );

    console.log(newlyMintedToken);
  });
});