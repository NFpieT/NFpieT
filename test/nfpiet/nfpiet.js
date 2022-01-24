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

  const svgForMetadataCodels = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 3 3"><rect x="0" y="0" width="1" height="1" fill="#000000"/><rect x="1" y="0" width="1" height="1" fill="#C0FFFF"/><rect x="2" y="0" width="1" height="1" fill="#C000C0"/><rect x="0" y="1" width="1" height="1" fill="#C0C0FF"/><rect x="1" y="1" width="1" height="1" fill="#C0FFC0"/><rect x="2" y="1" width="1" height="1" fill="#0000FF"/><rect x="0" y="2" width="1" height="1" fill="#FFFFC0"/><rect x="1" y="2" width="1" height="1" fill="#000000"/><rect x="2" y="2" width="1" height="1" fill="#C0C0FF"/></svg>'

  const invalid_codels_1 = [
    [1, 5, 19],
    [6, 4],
    [3, 1, 6],
  ]

  const invalid_codels_2 = [
    [1, 5, 19],
    [6, 4, 12],
    [3, 1,],
  ]

  const nfpietDescription = "NFpieT is a community generated token that represents a code in the esoteric language Piet."

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

    it("Should not mint a token with invalid codels #1", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);

      await expect(nfpiet.payToMint(
        recipient,
        metadata.name,
        JSON.stringify(invalid_codels_1),
        { value: ethers.utils.parseEther('0.05') }
      )).to.be.revertedWith("Invalid Piet code.")

      expect(await nfpiet.totalSupply()).to.equal(0);

    });

    it("Should not mint a token with invalid codels #2", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);

      await expect(nfpiet.payToMint(
        recipient,
        metadata.name,
        JSON.stringify(invalid_codels_2),
        { value: ethers.utils.parseEther('0.05') }
      )).to.be.revertedWith("Invalid Piet code.")


      expect(await nfpiet.totalSupply()).to.equal(0);

    });

    it("Should not deploy a token with a piet code that's been used already", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);

      await nfpiet.payToMint(
        recipient,
        metadata.name,
        JSON.stringify(metadata.codels),
        { value: ethers.utils.parseEther('0.05') }
      );

      expect(await nfpiet.totalSupply()).to.equal(1);
      
      await expect(nfpiet.payToMint(
        recipient,
        metadata.name,
        JSON.stringify(metadata.codels),
        { value: ethers.utils.parseEther('0.05') }
      )).to.be.revertedWith("Piet code already minted!")

      expect(await nfpiet.totalSupply()).to.equal(1);
    });
  });

  describe("TokenURI", function () {

    it("Should match its original data when decoded", async function () {
      expect(await nfpiet.totalSupply()).to.equal(0);
      const newlyMintedToken = await nfpiet.payToMint(
        recipient,
        metadata.name,
        JSON.stringify(metadata.codels),
        { value: ethers.utils.parseEther('0.05') }
      );

      // be sure id is 0
      expect(await nfpiet.totalSupply()).to.equal(1);

      // fetch uri for token 0
      const tokenURI = await nfpiet.tokenURI(0);

      // decode raw payload
      const decodedPayload = Buffer.from(tokenURI.replace('data:application/json;base64,', ''), 'base64').toString('utf-8')
      
      //parse decoded json from raw payload
      const parsedPayload = JSON.parse(decodedPayload);


      // check name 
      expect(parsedPayload.name).to.equal(metadata.name);

      //check description
      expect(parsedPayload.description).to.equal(nfpietDescription);

      // take image as base64 encoded svg and extract svg
      const decodedCodelsSvg = Buffer.from(
        parsedPayload.image
          .replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('utf-8')

      // compare svg to valid svg
      expect(decodedCodelsSvg).to.equal(svgForMetadataCodels);

    });
  });
})