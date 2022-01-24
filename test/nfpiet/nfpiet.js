const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Token contract", function () {

  let NFpieT;
  let nfpiet;

  const recipient = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

  const metadata = {
    "name": "hello_world",
    "codels": [
      [1, 5, 19],
      [6, 4, 12],
      [3, 1, 6]
    ]
  }

  const invalid_codels_1 = [
    [1, 5, 19],
    [6, 4],
    [3, 1, 6],
  ]

  const invalid_codels_2 = [
    [1, 5, 19],
    [6, 4, 12],
    [3, 1, ],
  ]

  beforeEach(async function () {
    NFpieT = await ethers.getContractFactory("NFpieT");
    nfpiet = await NFpieT.deploy();
    await nfpiet.deployed();
  });

  describe("Deployment", function () {
    it("Total supply of tokens", async function () {

      expect(await nfpiet.totalSupply()).to.equal(0);
    });
  });

  describe("Transactions", function () {
    it("Should mint a token and transfer to its author", async function () {
      let balance = await nfpiet.balanceOf(recipient);
      expect(balance).to.equal(0);

      const newlyMintedToken = await nfpiet.payToMint(
        recipient,
        metadata.name,
        JSON.stringify(metadata.codels),
        { value: ethers.utils.parseEther('0.05') }
      );

      await newlyMintedToken.wait();

      // check the token was minted
      expect(await nfpiet.totalSupply()).to.equal(1);

      // Check the guy received his token
      balance = await nfpiet.balanceOf(recipient);
      expect(balance).to.equal(1);


      //check the owner of the token is the right guy
      expect((await nfpiet.ownerOf(0)).toLowerCase()).to.equal(recipient);
    });

    it("Should not mint a token with no name", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);

      await expect(nfpiet.payToMint(
        recipient,
        "",
        JSON.stringify(metadata.codels),
        { value: ethers.utils.parseEther('0.05') }
      )).to.be.revertedWith("Name must be at least 1 byte long.")


      expect(await nfpiet.totalSupply()).to.equal(0);

    });

    it("Should not mint a token with no codels", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);

      await expect(nfpiet.payToMint(
        recipient,
        metadata.name,
        "",
        { value: ethers.utils.parseEther('0.05') }
      )).to.be.revertedWith("Codels must be given.")


      expect(await nfpiet.totalSupply()).to.equal(0);

    });

    // WIP
    it("Should not mint a token with invalid codels #1", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);

      await expect(nfpiet.payToMint(
        recipient,
        metadata.name,
        invalid_codels_1,
        { value: ethers.utils.parseEther('0.05') }
      )).to.be.reverted

      expect(await nfpiet.totalSupply()).to.equal(0);

    });

    // WIP
    it("Should not mint a token with invalid codels #2", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);

      const test = await nfpiet.payToMint(
        recipient,
        metadata.name,
        invalid_codels_2,
        { value: ethers.utils.parseEther('0.05') }
      );

      expect(await nfpiet.totalSupply()).to.equal(0);

    });

    it("Should decoded tokenURI match the data", async function () {
      const newlyMintedToken = await nfpiet.callStatic.payToMint(
        recipient,
        metadata.name,
        JSON.stringify(metadata.codels),
        { value: ethers.utils.parseEther('0.05') }
      );

      expect(newlyMintedToken).to.equal(0);

      const data = '{ name: "", Descripiton: " NFpieT is a community generated token that represents a code in the esoteric language Piet.", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAwIC8iPjwvc3ZnPg===="}'

      let tokenUri = await nfpiet.tokenURI(newlyMintedToken);

      let decodedPayload = Buffer.from(tokenUri.replace('data:application/json;base64,', ''), 'base64').toString('utf-8');

      expect(decodedPayload).to.equal(data);
    });
  });
})