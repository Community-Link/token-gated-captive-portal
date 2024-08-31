// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WiFi {
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
    }

    mapping(address => uint256) public balances;
    mapping(bytes32 => AP) public accessPoints;
    mapping(bytes32 => mapping(address => User)) public users;

    event AccessPointRegistered(
        bytes32 indexed apId, string ssid, uint256 fee, BillingModel billing, address indexed operator
    );
    event AccessPointUpdated(bytes32 indexed apId, uint256 fee, BillingModel billing, address indexed operator);
    event UserConnected(bytes32 indexed apId, address indexed user, uint256 connectedAt);
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

    modifier onlyOperator(bytes32 apId) {
        if (accessPoints[apId].operator != msg.sender) revert RestrictedToApOperator();
        _;
    }

    modifier checkDailyLimit(bytes32 apId, address user, uint256 amount) {
        require(users[apId][user].consumed + amount <= accessPoints[apId].userDailyLimit, "Daily limit exceeded");
        _;
    }

    //////////// Access Point ////////////

    function registerAp(string calldata ssid, uint256 userDailyLimit, uint256 fee, BillingModel billing) external returns(bytes32) {
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

        User storage user = users[apId][msg.sender];
        user.connectedAt = block.timestamp;
        user.expiresAt = block.timestamp + 1 days;

        emit UserConnected(apId, msg.sender, block.timestamp);
    }

    function extend(bytes32 apId) external {
        if (accessPoints[apId].operator == address(0)) revert InvalidAp();

        User storage user = users[apId][msg.sender];
        user.expiresAt = block.timestamp + 1 days;

        emit UserRenewed(apId, msg.sender, block.timestamp);
    }

    function deposit(uint256 amount) external {
        // TODO token transfer

        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        // TODO token transfer

        balances[msg.sender] -= amount;
        emit Withdraw(msg.sender, amount);
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
}
