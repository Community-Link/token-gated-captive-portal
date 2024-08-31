// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {WiFi} from "../src/WiFi.sol";

contract WiFiTest is Test {
    WiFi public wifi;
    string public ssid = "TestAP";
    uint16 public userDailyLimit;
    uint256 public fee;
    WiFi.BillingModel public billing;
    bytes32 public apId;

    function setUp() public {
        wifi = new WiFi();
        userDailyLimit = 500;
        fee = 1000;
        billing = WiFi.BillingModel.PER_MB;

        wifi.registerAp(ssid, userDailyLimit, fee, billing);

        apId = keccak256(abi.encodePacked(ssid, address(this)));
    }

    function testRegisterAp() public {
        (
            string memory ssidStored,
            address operator,
            uint16 dailyLimit,
            uint256 feeStored,
            WiFi.BillingModel billingStored,
            ,
        ) = wifi.accessPoints(apId);

        assertEq(ssidStored, ssid);
        assertEq(operator, address(this));
        assertEq(dailyLimit, userDailyLimit);
        assertEq(feeStored, fee);
        assertEq(uint256(billingStored), uint256(billing));
    }

    function testConnect() public {
        wifi.connect(apId);

        (uint16 consumed, uint256 connectedAt, uint256 lastActivity) = wifi.users(apId, address(this));
        assertEq(consumed, 0);
        assertGt(connectedAt, 0);
        assertEq(connectedAt, lastActivity);
    }

    function testDepositAndWithdraw() public {
        uint256 depositAmount = 1000;

        wifi.deposit(depositAmount);
        assertEq(wifi.balances(address(this)), depositAmount);

        wifi.withdraw(depositAmount);
        assertEq(wifi.balances(address(this)), 0);
    }

    function testConsumeData() public {
        wifi.connect(apId);
        uint16 amountToConsume = 100;
        uint256 depositAmount = fee * amountToConsume;
        wifi.deposit(depositAmount);

        uint256 initialBalance = wifi.balances(address(this));
        console.log("Initial balance:", initialBalance);

        // Get the AP details
        (,,,, WiFi.BillingModel billing,,) = wifi.accessPoints(apId);

        wifi.consumeData(apId, amountToConsume);

        uint256 finalBalance = wifi.balances(address(this));
        assertEq(finalBalance, depositAmount - amountToConsume * fee);

        (uint16 consumed,,) = wifi.users(apId, address(this));
        assertEq(consumed, amountToConsume);
    }

    function testConsumeDataExceedsDailyLimit() public {
        wifi.connect(apId);

        uint256 depositAmount = 10000;
        wifi.deposit(depositAmount);

        uint16 amountToConsume = 600; // Exceeds daily limit

        vm.expectRevert();
        wifi.consumeData(apId, amountToConsume);
    }

    function testConsumeDataInsufficientBalance() public {
        wifi.connect(apId);
        uint16 amountToConsume = 100;
        vm.expectRevert(WiFi.InsufficientBalance.selector);
        wifi.consumeData(apId, amountToConsume);
    }
}
