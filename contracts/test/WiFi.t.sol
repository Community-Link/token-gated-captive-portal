// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {WiFi} from "../src/WiFi.sol";

contract WiFiTest is Test {
    WiFi public wifi;

    address operator = address(0x1);
    address user = address(0x2);

    function setUp() public {
        wifi = new WiFi();
    }

    function testRegisterAp() public {
        vm.prank(operator);
        bytes32 apId = wifi.registerAp("MySSID", 1024, 100, WiFi.BillingModel.FLAT_DAILY);

        (string memory ssid, address op,, uint256 fee, WiFi.BillingModel billing,,) = wifi.accessPoints(apId);
        assertEq(ssid, "MySSID");
        assertEq(op, operator);
        assertEq(fee, 100);
        assertEq(uint256(billing), uint256(WiFi.BillingModel.FLAT_DAILY));
    }

    function testFailRegisterApAlreadyExists() public {
        vm.startPrank(operator);
        wifi.registerAp("MySSID", 1024, 100, WiFi.BillingModel.FLAT_DAILY);
        wifi.registerAp("MySSID", 1024, 100, WiFi.BillingModel.FLAT_DAILY);
        vm.stopPrank();
    }

    function testConnectUser() public {
        vm.prank(operator);
        bytes32 apId = wifi.registerAp("MySSID", 1024, 100, WiFi.BillingModel.FLAT_DAILY);

        vm.prank(user);
        wifi.connect(apId);

        (uint256 consumed, uint256 connectedAt, uint256 expiresAt, uint256 tokenId) = wifi.users(apId, user);
        assertEq(consumed, 0);
        assertEq(connectedAt > 0, true);
        assertEq(expiresAt > connectedAt, true);
        assertEq(wifi.ownerOf(tokenId), user);
    }

    function testFailConnectInvalidAp() public {
        vm.prank(user);
        wifi.connect(bytes32(0));
    }

    function testExtendConnection() public {
        vm.prank(operator);
        bytes32 apId = wifi.registerAp("MySSID", 1024, 100, WiFi.BillingModel.FLAT_DAILY);

        vm.prank(user);
        wifi.connect(apId);

        (,, uint256 initialExpiresAt,) = wifi.users(apId, user);
        vm.warp(block.timestamp + 1 days);
        vm.prank(user);
        wifi.extend(apId);

        (,, uint256 extendedExpiresAt,) = wifi.users(apId, user);
        assertEq(extendedExpiresAt > initialExpiresAt, true);
    }

    function testDepositAndWithdraw() public {
        vm.prank(user);
        wifi.deposit(1000);
        assertEq(wifi.balances(user), 1000);

        // Withdraw funds from the user's balance
        vm.prank(user);
        wifi.withdraw(500);
        assertEq(wifi.balances(user), 500);
    }

    function testFailWithdrawInsufficientBalance() public {
        vm.prank(user);
        wifi.deposit(1000);
        vm.prank(user);
        wifi.withdraw(1500); // Should fail
    }

    function testConsumeData() public {
        vm.prank(operator);
        bytes32 apId = wifi.registerAp("MySSID", 1024, 100, WiFi.BillingModel.PER_MB);

        vm.prank(user);
        wifi.connect(apId);
        vm.prank(user);
        wifi.deposit(1000);

        vm.prank(user);
        wifi.consumeData(apId, 5); // 5 MB * 100 fee = 500 fee units
        assertEq(wifi.balances(user), 500);

        (uint256 consumed,,,) = wifi.users(apId, user);
        assertEq(consumed, 5);
    }

    function testFailConsumeDataInsufficientBalance() public {
        vm.prank(operator);
        bytes32 apId = wifi.registerAp("MySSID", 1024, 100, WiFi.BillingModel.PER_MB);

        vm.prank(user);
        wifi.connect(apId);
        vm.prank(user);
        wifi.deposit(400);

        vm.prank(user);
        wifi.consumeData(apId, 5); // 5 MB * 100 fee = 500 (should fail)
    }

    function testFailDailyLimitExceeded() public {
        vm.prank(operator);
        bytes32 apId = wifi.registerAp("MySSID", 1, 100, WiFi.BillingModel.PER_MB); // 1 MB limit

        vm.prank(user);
        wifi.connect(apId);
        vm.prank(user);
        wifi.deposit(1000);

        vm.prank(user);
        wifi.consumeData(apId, 5); // Should fail cause of daily limit
    }
}
