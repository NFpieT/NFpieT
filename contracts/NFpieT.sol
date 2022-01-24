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
import "hardhat/console.sol";
import "./Base64.sol";

contract NFpieT is ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) private _tokenNames;
    mapping(uint256 => address) private _tokenAuthors;
    mapping(uint256 => string) private _tokenCodelJsons;
    mapping(string => uint8) existingPIETs;

    string[] private _codelsColors = [
        "#FFFFFF",
        "#000000",
        "#FFC0C0",
        "#FFFFC0",
        "#C0FFC0",
        "#C0FFFF",
        "#C0C0FF",
        "#FFC0FF",
        "#FF0000",
        "#FFFF00",
        "#00FF00",
        "#00FFFF",
        "#0000FF",
        "#FF00FF",
        "#C00000",
        "#C0C000",
        "#00C000",
        "#00C0C0",
        "#0000C0",
        "#C000C0"
    ];

    event TokenMinted(
        address emitter,
        string name,
        address author,
        string codels
    );

    constructor() ERC721("NFpieT", "NFP") Ownable() {}

    function _setTokenCredits(
        uint256 tokenId,
        string memory name,
        address author,
        string memory codels
    ) internal virtual {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenNames[tokenId] = name;
        _tokenAuthors[tokenId] = author;
        _tokenCodelJsons[tokenId] = codels;
    }

    function append(
        string memory a,
        string memory b,
        string memory c,
        string memory d,
        string memory e
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c, d, e));
    }

    // function bytes2ToString(bytes2 data) internal returns (string memory) {
    //     bytes memory bytesString = new bytes(2);
    //     for (uint8 j = 0; j < 8; j++) {
    //         bytes1 char = bytes1(bytes32(uint(data) * 2**(8 * j)));
    //         if (char != 0) {
    //             bytesString[j] = char;
    //         }
    //     }

    //     return string(bytesString);
    // }

    function _buildSvgRectangle(
        string memory x,
        string memory y,
        uint8 color
    ) internal view returns (string memory) {
        string[11] memory parts;

        parts[0] = '<rect x="';
        parts[1] = x;
        parts[2] = '" y="';
        parts[3] = y;
        parts[4] = '" width="1" height="1" fill="';
        parts[5] = _codelsColors[color];
        parts[6] = '"/>';

        return
            string(
                abi.encodePacked(
                    parts[0],
                    parts[1],
                    parts[2],
                    parts[3],
                    parts[4],
                    parts[5],
                    parts[6],
                    "",
                    ""
                )
            );
    }

    function _buildSvgContent(
        string memory svgCodels,
        string memory width,
        string memory height
    ) internal pure returns (string memory) {
        string[7] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 ';
        parts[1] = width;
        parts[2] = " ";
        parts[3] = height;
        parts[4] = '">';
        parts[5] = svgCodels;
        parts[6] = "</svg>";

        return
            string(
                abi.encodePacked(
                    parts[0],
                    parts[1],
                    parts[2],
                    parts[3],
                    parts[4],
                    parts[5],
                    parts[6],
                    "",
                    ""
                )
            );
    }

    // will return true if parsing was successful, false otherwise(which stops the transactions, we ain't minting no invalid Piet code.)
    function _parsePiet(string memory codels)
        internal
        view
        returns (string memory)
    {
        string memory rectangles = "";


        uint8 x = 0;
        uint8 y = 0;

        uint8 prev_width = 0;

        // Bytes contain each a character, coded as utf-8.
        bytes memory buffer = bytes(codels);

        bytes memory yBytes = new bytes(1);
        bytes memory xBytes = new bytes(1);

        uint16 c = 0;
        while (c < buffer.length) {
            if (buffer[c] == "]") {
                if (y >= 1 && prev_width != x && buffer[c - 1] != "]") {
                    return "";
                }
                if (x != 0) {
                    prev_width = x;
                }
                
                x = 0;
                y += 1;
            } else if (buffer[c] >= "0" && buffer[c] <= "9") {
                // 48 is 0 in utf-8
                uint8 num = uint8(buffer[c]) - 48;
                // there might be a 2 digits number
                if (buffer[c + 1] >= "0" && buffer[c + 1] <= "9") {
                    num = 10 * num + (uint8(buffer[c + 1]) - 48);
                    ++c;
                }
                
                yBytes[0] = bytes1(y + 48);

                
                xBytes[0] = bytes1(x + 48);

                rectangles = append(
                    rectangles,
                    _buildSvgRectangle(string(xBytes), string(yBytes), num),
                    "",
                    "",
                    ""
                );
                x += 1;
            }

            ++c;
        }

        // store width and height in x and y buffers to save memory
        yBytes[0] = bytes1(y + 47);
        xBytes[0] = bytes1(prev_width + 48);

        return _buildSvgContent(rectangles, string(xBytes), string(yBytes));
    }

    function tokenURI(uint256 tokenId)
        override
        public
        view
        returns (string memory)
    {
        string[7] memory parts;

        parts[0] = '{ "name": "';
        parts[1] = _tokenNames[tokenId];
        parts[2] = '", "description": "NFpieT is a community generated token that represents a code in the esoteric language Piet.';
        parts[4] = '", "image": "data:image/svg+xml;base64,';
        parts[5] = Base64.encode(bytes(_parsePiet(_tokenCodelJsons[tokenId])));
        parts[6] = '"}';

        string memory json = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2],
                parts[3],
                parts[4],
                parts[5],
                parts[6],
                "",
                ""
            )
        );

        return string(abi.encodePacked('data:application/json;base64,', Base64.encode(bytes(json))));
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function payToMint(
        address recipient,
        string memory name,
        string memory codels
    ) public payable returns (uint256) {
        require(existingPIETs[codels] != 1, 'Piet code already minted!');
        require(bytes(name).length <= 32, "Name must be at most 32 bytes long.");
        require(bytes(name).length > 0, "Name must be at least 1 byte long.");
        require(bytes(codels).length > 0, "Codels must be given.");
        require(msg.value >= 0.05 ether, "Need to pay up!");
        require(
            bytes(_parsePiet(codels)).length > 0,
            "Invalid Piet code."
        ); // requirement must be upper in the code

        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();
        existingPIETs[codels] = 1;

        _safeMint(recipient, newItemId);
        _setTokenCredits(newItemId, name, recipient, codels);

        

        return newItemId;
    }
}
