// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title NumberWar
/// @notice Fully homomorphic encryption game where players win if the sum is even.
/// @dev The contract generates a pseudo random encrypted number between 1 and 10 for each player.
contract NumberWar is ZamaEthereumConfig {
    mapping(address => euint8) private _systemNumbers;
    mapping(address => bool) private _hasActiveRound;
    mapping(address => ebool) private _lastOutcome;

    uint256 private _nonce;

    event RoundPrepared(address indexed player);
    event RoundCompleted(address indexed player, bool hasActiveRound);

    /// @notice Starts a new round and returns the encrypted system number.
    /// @return The encrypted system number assigned to the caller.
    function joinGame() external returns (euint8) {
        uint8 randomValue = _generateRandom(msg.sender);
        euint8 encryptedValue = FHE.asEuint8(randomValue);

        _systemNumbers[msg.sender] = encryptedValue;
        _hasActiveRound[msg.sender] = true;

        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);

        emit RoundPrepared(msg.sender);

        return encryptedValue;
    }

    /// @notice Submits the player's encrypted number and returns the encrypted outcome.
    /// @param playerNumber The encrypted player number provided by the client.
    /// @param inputProof The zk-proof validating the encrypted input.
    /// @return Encrypted boolean indicating if the player won the round.
    function submitNumber(externalEuint8 playerNumber, bytes calldata inputProof) external returns (ebool) {
        require(_hasActiveRound[msg.sender], "NumberWar: no active round");

        euint8 systemNumber = _systemNumbers[msg.sender];
        euint8 encryptedPlayerNumber = FHE.fromExternal(playerNumber, inputProof);

        euint8 sum = FHE.add(systemNumber, encryptedPlayerNumber);
        euint8 remainder = FHE.rem(sum, 2);
        ebool playerWon = FHE.eq(remainder, FHE.asEuint8(0));

        _lastOutcome[msg.sender] = playerWon;
        _hasActiveRound[msg.sender] = false;

        FHE.allowThis(playerWon);
        FHE.allow(playerWon, msg.sender);

        emit RoundCompleted(msg.sender, _hasActiveRound[msg.sender]);

        return playerWon;
    }

    /// @notice Returns the encrypted system number assigned to a player.
    /// @param player Address of the player.
    /// @return Encrypted system number.
    function getSystemNumber(address player) external view returns (euint8) {
        require(_hasActiveRound[player], "NumberWar: round inactive");
        return _systemNumbers[player];
    }

    /// @notice Returns the encrypted outcome of the last round for a player.
    /// @param player Address of the player.
    /// @return Encrypted boolean representing the last outcome.
    function getLastOutcome(address player) external view returns (ebool) {
        return _lastOutcome[player];
    }

    /// @notice Indicates if a player currently has an active round.
    /// @param player Address of the player.
    /// @return True when the player must submit their number.
    function hasActiveRound(address player) external view returns (bool) {
        return _hasActiveRound[player];
    }

    function _generateRandom(address player) private returns (uint8) {
        _nonce += 1;
        uint256 randomHash = uint256(keccak256(abi.encode(block.prevrandao, block.timestamp, player, _nonce)));
        return uint8((randomHash % 10) + 1);
    }
}
