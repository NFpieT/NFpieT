/*
.s5SSSs.  .s5SSSs.  .s5SSSs.  s.  
      SS.       SS.       SS. SS. 
sS    `:; sS    `:; sS    `:; S%S 
SS        SS        SS        S%S 
SSSs.     `:;;;;.   SS        S%S 
SS              ;;. SS        S%S 
SS              `:; SS   ``:; `:; 
SS    ;,. .,;   ;,. SS    ;,. ;,. 
`:;;;;;:' `:;;;;;:' `:;;;;;:' ;:' 
                                  
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFpieT is ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping (uint256 => string) private _tokenNames;
    mapping (uint256 => string) private _tokenAuthors;
    mapping (uint256 => bytes1[][]) private _tokenCodels;

    event TokenMinted(address emitter, string name, string author, string codels);

    constructor() ERC721("NFpieT", "NFP") Ownable() {
    }

    function _setTokenCredits(uint256 tokenId, string memory name, string memory author)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenNames[tokenId] = name;
        _tokenAuthors[tokenId] = author;
        // _tokenCodels[tokenId] = codels;
    }

    // will return true if parsing was successful, false otherwise(which stops the transactions, we ain't minting no invalid Piet code.)
    function _parsePiet(string memory codels, uint256 tokenId)
        internal
        returns(bool) 
    {
        uint8 x = 0;
        uint8 y = 0;
        bytes memory buffer = bytes(codels);

        uint16 c = 0;
        while (c < buffer.length) {
            if (buffer[c] == ']') {
                x = 0;
                y += 1;

                if (y >= 1 && _tokenCodels[tokenId][y].length != _tokenCodels[tokenId][y - 1].length) {
                    return false;
                }
            }  else if (buffer[c] != ',' && buffer[c] != '[') {
                _tokenCodels[tokenId][y][x] = buffer[c];
                x += 1;
            }

            ++c;
        }
        
        return true;
    }

    function mint(address owner, string memory name, string memory author, string memory codels)
        public
        returns (uint256)
    {



        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(owner, id);
        _setTokenCredits(id, name, author);
        // parses the piet and checks regularity at the same time
        require (_parsePiet(codels, id), "Piet code must be in a rectangular shape at least."); // requirement must be upper in the code 

        emit TokenMinted(msg.sender, name, author, codels);

        return id;
    }

    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        return _tokenNames[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
