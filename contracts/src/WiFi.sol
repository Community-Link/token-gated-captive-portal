// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract WiFi is ERC721URIStorage {
    enum BillingModel {
        NONE,
        PER_MB,
        PER_GB,
        FLAT_HOURLY,
        FLAT_DAILY,
        FLAT_MONTHLY
    }

    struct AP {
        string ssid;
        address operator;
        uint256 userDailyLimit;
        uint256 fee;
        BillingModel billing;
        uint256 joined;
        uint256 lastActivity;
    }

    struct User {
        uint256 consumed;
        uint256 connectedAt;
        uint256 expiresAt;
        uint256 tokenId;
    }

    uint256 public nextTokenId;
    mapping(address => uint256) public balances;
    mapping(bytes32 => AP) public accessPoints;
    mapping(bytes32 => mapping(address => User)) public users;

    event AccessPointRegistered(
        bytes32 indexed apId, string ssid, uint256 fee, BillingModel billing, address indexed operator
    );
    event AccessPointUpdated(bytes32 indexed apId, uint256 fee, BillingModel billing, address indexed operator);
    event UserConnected(bytes32 indexed apId, address indexed user, uint256 tokenId, uint256 connectedAt);
    event UserRenewed(bytes32 indexed apId, address indexed user, uint256 connectedAt);
    event DataConsumed(bytes32 indexed apId, address indexed user, uint256 amount);
    event BalanceAdded(address indexed user, uint256 amount);
    event BalanceDeducted(address indexed user, uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    error RestrictedToApOperator();
    error ApAlreadyExists();
    error InvalidAp();
    error InsufficientBalance();

    constructor() ERC721("WiFi Access Token", "WAT") {
        nextTokenId = 1;
    }

    modifier onlyOperator(bytes32 apId) {
        if (accessPoints[apId].operator != msg.sender) revert RestrictedToApOperator();
        _;
    }

    modifier checkDailyLimit(bytes32 apId, address user, uint256 amount) {
        require(users[apId][user].consumed + amount <= accessPoints[apId].userDailyLimit, "Daily limit exceeded");
        _;
    }

    //////////// Access Point ////////////

    function registerAp(string calldata ssid, uint256 userDailyLimit, uint256 fee, BillingModel billing)
        external
        returns (bytes32)
    {
        bytes32 apId = keccak256(abi.encodePacked(ssid, msg.sender));
        if (accessPoints[apId].operator != address(0)) revert ApAlreadyExists();
        accessPoints[apId] = AP(ssid, msg.sender, userDailyLimit, fee, billing, block.timestamp, block.timestamp);

        emit AccessPointRegistered(apId, ssid, fee, billing, msg.sender);

        return apId;
    }

    function updateAp(bytes32 apId, uint256 userDailyLimit, uint256 fee, BillingModel billing)
        external
        onlyOperator(apId)
    {
        AP storage accessPoint = accessPoints[apId];
        accessPoint.userDailyLimit = userDailyLimit;
        accessPoint.fee = fee;
        accessPoint.billing = billing;

        emit AccessPointUpdated(apId, fee, billing, msg.sender);
    }

    //////////// User ////////////

    function connect(bytes32 apId) external {
        if (accessPoints[apId].operator == address(0)) revert InvalidAp();

        // Mint a new NFT for this connection
        uint256 newTokenId = nextTokenId++;
        _mint(msg.sender, newTokenId);

        // Store user details and link with the token ID
        User storage user = users[apId][msg.sender];
        user.connectedAt = block.timestamp;
        user.expiresAt = block.timestamp + 1 days;
        user.tokenId = newTokenId;

        // Set the token URI with metadata (can include JSON metadata schema)
        string memory tokenURI = generateTokenURI(apId, user.expiresAt);
        _setTokenURI(newTokenId, tokenURI);

        emit UserConnected(apId, msg.sender, newTokenId, block.timestamp);
    }

    function extend(bytes32 apId) external {
        if (accessPoints[apId].operator == address(0)) revert InvalidAp();

        User storage user = users[apId][msg.sender];
        user.expiresAt = block.timestamp + 1 days;

        // Update token URI with the new expiration time
        string memory tokenURI = generateTokenURI(apId, user.expiresAt);
        _setTokenURI(user.tokenId, tokenURI);

        emit UserRenewed(apId, msg.sender, block.timestamp);
    }

    function deposit(uint256 amount) external {
        // TODO: Integrate with ERC20 transfer

        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        // TODO: Integrate with ERC20 transfer

        balances[msg.sender] -= amount;
        emit Withdraw(msg.sender, amount);
    }

    function consumeData(bytes32 apId, uint256 amount) external checkDailyLimit(apId, msg.sender, amount) {
        User storage user = users[apId][msg.sender];
        AP storage ap = accessPoints[apId];

        uint256 cost = calculateCost(ap.billing, amount, ap.fee, user.connectedAt);
        if (balances[msg.sender] < cost) revert InsufficientBalance();

        balances[msg.sender] -= cost;
        user.consumed += amount;

        emit DataConsumed(apId, msg.sender, amount);
        emit BalanceDeducted(msg.sender, cost);
    }

    function calculateCost(BillingModel billing, uint256 amount, uint256 fee, uint256 lastConnected)
        internal
        view
        returns (uint256)
    {
        uint256 duration = block.timestamp - lastConnected;

        if (billing == BillingModel.PER_MB) {
            return amount * fee;
        } else if (billing == BillingModel.PER_GB) {
            return (amount * fee) / 1024;
        } else if (billing == BillingModel.FLAT_HOURLY) {
            uint256 h = (duration + 3599) / 3600;
            return h * fee;
        } else if (billing == BillingModel.FLAT_DAILY) {
            uint256 d = (duration + 86399) / 86400;
            return d * fee;
        } else if (billing == BillingModel.FLAT_MONTHLY) {
            uint256 months = (duration + 2591999) / 2592000;
            return months * fee;
        }

        return 0;
    }

    function generateTokenURI(bytes32 apId, uint256 expiresAt) internal pure returns (string memory) {
        // This is where you could build a JSON metadata string for the NFT
        return
            string(abi.encodePacked('{"apId":"', bytes32ToString(apId), '", "expiresAt":"', uint2str(expiresAt), '"}'));
    }

    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i * 2] = _byteToHexChar(uint8(_bytes32[i]) / 16);
            bytesArray[i * 2 + 1] = _byteToHexChar(uint8(_bytes32[i]) % 16);
        }
        return string(bytesArray);
    }

    function _byteToHexChar(uint8 _byte) internal pure returns (bytes1) {
        if (_byte < 10) {
            return bytes1(_byte + 0x30);
        } else {
            return bytes1(_byte + 0x57);
        }
    }

    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
