const hre = require("hardhat");

async function main() {

    const NFpieT = await ethers.getContractFactory("NFpieT");
    const nfpiet = await NFpieT.deploy();
    await nfpiet.deployed();

    console.log("My NFT deployed to:", nfpiet.address);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });