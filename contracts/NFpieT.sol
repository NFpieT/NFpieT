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
    mapping (uint256 => uint8[][]) private _tokenCodels;

    event TokenMinted(address emitter);

    constructor() ERC721("NFpieT", "NFP") Ownable() {
    }

    function _setTokenData(uint256 tokenId, string memory name, string memory author, string memory codels)
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

    function _checkPietRegularity(string memory codels)
        pure
        internal
        returns(bool) 
    {
        uint8 inception = 0;
        uint8 prevNcols = 0;
        uint8 nCols = 0;
        bool firstIt = true;
        bytes memory buffer = bytes(codels);

        uint16 c = 0;
        while (c < buffer.length) {
            if (buffer[c] == '[') {
                inception += 1;
            } else if (buffer[c] == ']') {
                inception -= 1;
                if (!firstIt && nCols != prevNcols) {
                    return false;
                }
                prevNcols = nCols;
                nCols = 0;
            } else if (buffer[c] != ',') {
                nCols++;
            } 

            ++c;
        }

        return true;
    }

    function mint(address owner, string memory name, string memory author, string memory codels)
        public
        returns (uint256)
    {
        require (_checkPietRegularity(codels), "Piet code must be in a rectangular shape at least.");


        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(owner, id);
        _setTokenData(id, name, author, codels);
        emit TokenMinted(msg.sender);

        return id;
    }

    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        return _tokenNames[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
