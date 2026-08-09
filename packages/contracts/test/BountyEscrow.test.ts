import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import type { BountyEscrow } from "../typechain-types";

enum BountyStatus {
  Draft,
  Active,
  Paused,
  Closed,
}

describe("BountyEscrow", () => {
  async function deployFixture() {
    const [owner, org, researcher, stranger] = await ethers.getSigners();
    const BountyEscrow = await ethers.getContractFactory("BountyEscrow");
    const escrow = (await BountyEscrow.deploy()) as unknown as BountyEscrow;
    await escrow.waitForDeployment();
    return { escrow, owner, org, researcher, stranger };
  }

  const BOUNTY_ID = 1n;
  const REWARD = ethers.parseEther("1");

  describe("createBounty", () => {
    it("registers a bounty with the correct creator and deadline", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 3600;

      await expect(escrow.createBounty(BOUNTY_ID, org.address, deadline))
        .to.emit(escrow, "BountyCreated")
        .withArgs(BOUNTY_ID, org.address, deadline);

      const bounty = await escrow.getBounty(BOUNTY_ID);
      expect(bounty.creator).to.equal(org.address);
      expect(bounty.deadline).to.equal(deadline);
      expect(bounty.status).to.equal(BountyStatus.Draft);
    });

    it("reverts when the bounty already exists", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await expect(escrow.createBounty(BOUNTY_ID, org.address, 0)).to.be.revertedWithCustomError(
        escrow,
        "BountyAlreadyExists",
      );
    });

    it("reverts on a zero creator address", async () => {
      const { escrow } = await loadFixture(deployFixture);
      await expect(escrow.createBounty(BOUNTY_ID, ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
        escrow,
        "ZeroAddress",
      );
    });
  });

  describe("fundBounty", () => {
    it("deposits funds into escrow", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);

      await expect(escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD }))
        .to.emit(escrow, "BountyFunded")
        .withArgs(BOUNTY_ID, org.address, REWARD);

      const bounty = await escrow.getBounty(BOUNTY_ID);
      expect(bounty.rewardBalance).to.equal(REWARD);
      expect(bounty.totalDeposited).to.equal(REWARD);
    });

    it("reverts on a nonexistent bounty", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await expect(escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD })).to.be.revertedWithCustomError(
        escrow,
        "BountyNotFound",
      );
    });

    it("reverts on zero funding", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await expect(escrow.connect(org).fundBounty(BOUNTY_ID, { value: 0 })).to.be.revertedWithCustomError(
        escrow,
        "ZeroAmount",
      );
    });

    it("reverts funding after the deadline", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 10;
      await escrow.createBounty(BOUNTY_ID, org.address, deadline);
      await time.increaseTo(deadline + 1);

      await expect(escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD })).to.be.revertedWithCustomError(
        escrow,
        "DeadlinePassed",
      );
    });

    it("reverts funding a closed bounty", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });
      await escrow.connect(org).setBountyStatus(BOUNTY_ID, BountyStatus.Closed);

      await expect(escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD })).to.be.revertedWithCustomError(
        escrow,
        "BountyClosed",
      );
    });
  });

  describe("setBountyStatus", () => {
    it("only the creator can change status", async () => {
      const { escrow, org, stranger } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await expect(
        escrow.connect(stranger).setBountyStatus(BOUNTY_ID, BountyStatus.Active),
      ).to.be.revertedWithCustomError(escrow, "NotCreator");
    });

    it("cannot activate an unfunded bounty", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await expect(escrow.connect(org).setBountyStatus(BOUNTY_ID, BountyStatus.Active)).to.be.revertedWithCustomError(
        escrow,
        "BountyNotFunded",
      );
    });

    it("emits the status change", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await expect(escrow.connect(org).setBountyStatus(BOUNTY_ID, BountyStatus.Paused))
        .to.emit(escrow, "BountyStatusChanged")
        .withArgs(BOUNTY_ID, BountyStatus.Paused);
    });
  });

  describe("releaseReward", () => {
    it("releases the reward to the approved researcher", async () => {
      const { escrow, org, researcher } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });

      const balanceBefore = await ethers.provider.getBalance(researcher.address);

      await expect(escrow.connect(org).releaseReward(BOUNTY_ID, researcher.address, REWARD))
        .to.emit(escrow, "RewardReleased")
        .withArgs(BOUNTY_ID, researcher.address, REWARD);

      expect(await escrow.releasedAmount(BOUNTY_ID, researcher.address)).to.equal(REWARD);

      const balanceAfter = await ethers.provider.getBalance(researcher.address);
      expect(balanceAfter - balanceBefore).to.equal(REWARD);

      const bounty = await escrow.getBounty(BOUNTY_ID);
      expect(bounty.totalReleased).to.equal(REWARD);
      expect(bounty.rewardBalance).to.equal(0);
    });

    it("reverts unauthorized approval by a non-creator", async () => {
      const { escrow, org, researcher, stranger } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });

      await expect(
        escrow.connect(stranger).releaseReward(BOUNTY_ID, researcher.address, REWARD),
      ).to.be.revertedWithCustomError(escrow, "NotCreator");
    });

    it("prevents duplicate reward distribution to the same researcher", async () => {
      const { escrow, org, researcher } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });
      await escrow.connect(org).releaseReward(BOUNTY_ID, researcher.address, REWARD);

      await expect(escrow.connect(org).releaseReward(BOUNTY_ID, researcher.address, REWARD)).to.be.revertedWithCustomError(
        escrow,
        "AlreadyReleased",
      );
    });

    it("reverts when escrow balance is insufficient", async () => {
      const { escrow, org, researcher } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });

      await expect(
        escrow.connect(org).releaseReward(BOUNTY_ID, researcher.address, REWARD + 1n),
      ).to.be.revertedWithCustomError(escrow, "InsufficientBalance");
    });

    it("reverts for a closed bounty", async () => {
      const { escrow, org, researcher } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });
      await escrow.connect(org).setBountyStatus(BOUNTY_ID, BountyStatus.Closed);

      await expect(escrow.connect(org).releaseReward(BOUNTY_ID, researcher.address, REWARD)).to.be.revertedWithCustomError(
        escrow,
        "BountyClosed",
      );
    });

    it("reverts when the deadline has passed", async () => {
      const { escrow, org, researcher } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 100;
      await escrow.createBounty(BOUNTY_ID, org.address, deadline);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });
      await time.increaseTo(deadline + 1);

      await expect(escrow.connect(org).releaseReward(BOUNTY_ID, researcher.address, REWARD)).to.be.revertedWithCustomError(
        escrow,
        "DeadlinePassed",
      );
    });

    it("reverts on a zero researcher or zero amount", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });

      await expect(
        escrow.connect(org).releaseReward(BOUNTY_ID, ethers.ZeroAddress, REWARD),
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");

      await expect(escrow.connect(org).releaseReward(BOUNTY_ID, org.address, 0)).to.be.revertedWithCustomError(
        escrow,
        "ZeroAmount",
      );
    });
  });

  describe("withdrawRemainder", () => {
    it("returns unused funds to the creator and closes the bounty", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await escrow.connect(org).fundBounty(BOUNTY_ID, { value: REWARD });

      await expect(escrow.connect(org).withdrawRemainder(BOUNTY_ID))
        .to.emit(escrow, "BountyRefunded")
        .withArgs(BOUNTY_ID, org.address, REWARD);

      const bounty = await escrow.getBounty(BOUNTY_ID);
      expect(bounty.rewardBalance).to.equal(0);
      expect(bounty.status).to.equal(BountyStatus.Closed);
    });

    it("reverts when there is nothing to withdraw", async () => {
      const { escrow, org } = await loadFixture(deployFixture);
      await escrow.createBounty(BOUNTY_ID, org.address, 0);
      await expect(escrow.connect(org).withdrawRemainder(BOUNTY_ID)).to.be.revertedWithCustomError(
        escrow,
        "InsufficientBalance",
      );
    });
  });
});
