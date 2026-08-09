// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BountyEscrow
 * @notice Trust-critical escrow for BountyNex bug bounty rewards on Ethereum Sepolia.
 * @dev    Holds bounty reward funds and releases them only to approved researchers.
 *         The bounty creator (organization) is the only actor authorized to
 *         release rewards. Each bounty can only ever pay a researcher once.
 */
contract BountyEscrow is Ownable, ReentrancyGuard {
    enum BountyStatus {
        Draft,
        Active,
        Paused,
        Closed
    }

    struct Bounty {
        address creator;
        uint256 deadline; // unix timestamp, 0 = no deadline
        uint256 rewardBalance;
        uint256 totalDeposited;
        uint256 totalReleased;
        BountyStatus status;
        bool exists;
    }

    struct BountyInfo {
        address creator;
        uint256 deadline;
        uint256 rewardBalance;
        uint256 totalDeposited;
        uint256 totalReleased;
        BountyStatus status;
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => mapping(address => uint256)) public releasedTo;

    event BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 deadline);
    event BountyFunded(uint256 indexed bountyId, address indexed funder, uint256 amount);
    event BountyStatusChanged(uint256 indexed bountyId, BountyStatus status);
    event RewardReleased(uint256 indexed bountyId, address indexed researcher, uint256 amount);
    event BountyRefunded(uint256 indexed bountyId, address indexed to, uint256 amount);

    error BountyNotFound(uint256 bountyId);
    error BountyAlreadyExists(uint256 bountyId);
    error NotCreator(uint256 bountyId);
    error BountyClosed(uint256 bountyId);
    error DeadlinePassed(uint256 bountyId);
    error BountyNotFunded(uint256 bountyId);
    error InsufficientBalance();
    error AlreadyReleased(uint256 bountyId, address researcher);
    error ZeroAddress();
    error ZeroAmount();

    modifier bountyExists(uint256 bountyId) {
        if (!bounties[bountyId].exists) revert BountyNotFound(bountyId);
        _;
    }

    modifier onlyCreator(uint256 bountyId) {
        if (msg.sender != bounties[bountyId].creator) revert NotCreator(bountyId);
        _;
    }

    modifier notClosed(uint256 bountyId) {
        if (bounties[bountyId].status == BountyStatus.Closed) revert BountyClosed(bountyId);
        _;
    }

    modifier notPastDeadline(uint256 bountyId) {
        uint256 deadline = bounties[bountyId].deadline;
        if (deadline != 0 && block.timestamp > deadline) revert DeadlinePassed(bountyId);
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers a bounty in the escrow. Permissionless by design so that
     *         any organization can register; the recorded creator becomes the
     *         only authorized account for managing that bounty.
     */
    function createBounty(uint256 bountyId, address creator, uint256 deadline) external {
        if (bounties[bountyId].exists) revert BountyAlreadyExists(bountyId);
        if (creator == address(0)) revert ZeroAddress();

        bounties[bountyId] = Bounty({
            creator: creator,
            deadline: deadline,
            rewardBalance: 0,
            totalDeposited: 0,
            totalReleased: 0,
            status: BountyStatus.Draft,
            exists: true
        });

        emit BountyCreated(bountyId, creator, deadline);
    }

    /**
     * @notice Deposits the reward pool into escrow. Can be funded before or
     *         after activation, but never when closed or after the deadline.
     */
    function fundBounty(uint256 bountyId) external payable bountyExists(bountyId) notClosed(bountyId) notPastDeadline(bountyId) {
        if (msg.value == 0) revert ZeroAmount();

        Bounty storage b = bounties[bountyId];
        b.rewardBalance += msg.value;
        b.totalDeposited += msg.value;

        emit BountyFunded(bountyId, msg.sender, msg.value);
    }

    /**
     * @notice Changes the bounty lifecycle status. Only the bounty creator can
     *         call this. A bounty cannot be activated while it has no funds.
     */
    function setBountyStatus(uint256 bountyId, BountyStatus status)
        external
        bountyExists(bountyId)
        onlyCreator(bountyId)
    {
        if (status == BountyStatus.Active && bounties[bountyId].rewardBalance == 0) {
            revert BountyNotFunded(bountyId);
        }

        bounties[bountyId].status = status;
        emit BountyStatusChanged(bountyId, status);
    }

    /**
     * @notice Releases a reward to an approved researcher.
     * @dev    Only the bounty creator (organization) may call. Guards against:
     *         closed bounties, past deadlines, duplicate payments, insufficient
     *         funds and reentrancy. Emits RewardReleased on success.
     */
    function releaseReward(uint256 bountyId, address payable researcher, uint256 amount)
        external
        nonReentrant
        bountyExists(bountyId)
        onlyCreator(bountyId)
        notClosed(bountyId)
        notPastDeadline(bountyId)
    {
        if (researcher == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (releasedTo[bountyId][researcher] != 0) revert AlreadyReleased(bountyId, researcher);

        Bounty storage b = bounties[bountyId];
        if (b.rewardBalance < amount) revert InsufficientBalance();

        b.rewardBalance -= amount;
        b.totalReleased += amount;
        releasedTo[bountyId][researcher] += amount;

        (bool ok, ) = researcher.call{ value: amount }("");
        require(ok, "BountyEscrow: transfer failed");

        emit RewardReleased(bountyId, researcher, amount);
    }

    /**
     * @notice Returns the remaining escrow balance to the creator and closes
     *         the bounty. Only the creator may withdraw.
     */
    function withdrawRemainder(uint256 bountyId)
        external
        nonReentrant
        bountyExists(bountyId)
        onlyCreator(bountyId)
        notClosed(bountyId)
    {
        Bounty storage b = bounties[bountyId];
        uint256 amount = b.rewardBalance;
        if (amount == 0) revert InsufficientBalance();

        b.rewardBalance = 0;
        b.status = BountyStatus.Closed;

        (bool ok, ) = payable(b.creator).call{ value: amount }("");
        require(ok, "BountyEscrow: transfer failed");

        emit BountyRefunded(bountyId, b.creator, amount);
    }

    function getBounty(uint256 bountyId)
        external
        view
        bountyExists(bountyId)
        returns (BountyInfo memory)
    {
        Bounty storage b = bounties[bountyId];
        return BountyInfo({
            creator: b.creator,
            deadline: b.deadline,
            rewardBalance: b.rewardBalance,
            totalDeposited: b.totalDeposited,
            totalReleased: b.totalReleased,
            status: b.status
        });
    }

    function releasedAmount(uint256 bountyId, address researcher) external view returns (uint256) {
        return releasedTo[bountyId][researcher];
    }
}
