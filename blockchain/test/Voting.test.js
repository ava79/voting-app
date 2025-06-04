const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
    let Voting;
    let voting;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Voting = await ethers.getContractFactory("Voting");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy a new instance of the Voting contract before each test.
        voting = await Voting.deploy();
        // await voting.deployed(); // Not strictly necessary for tests with hardhat-ethers
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await voting.owner()).to.equal(owner.address);
        });
    });

    describe("addCandidate", function () {
        it("Owner should be able to add a candidate", async function () {
            await expect(voting.connect(owner).addCandidate("Candidate 1"))
                .to.emit(voting, "CandidateAdded")
                .withArgs(1, "Candidate 1");

            const candidate = await voting.candidates(1);
            expect(candidate.name).to.equal("Candidate 1");
            expect(candidate.voteCount).to.equal(0);
            expect(await voting.candidatesCount()).to.equal(1);

            const allCandidates = await voting.getAllCandidates();
            expect(allCandidates.length).to.equal(1);
            expect(allCandidates[0].id).to.equal(1); // Check ID as well
            expect(allCandidates[0].name).to.equal("Candidate 1");
            expect(allCandidates[0].voteCount).to.equal(0);
        });

        it("Non-owner should not be able to add a candidate", async function () {
            await expect(
                voting.connect(addr1).addCandidate("Candidate 2")
            ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount").withArgs(addr1.address);
        });
    });

    describe("vote", function () {
        beforeEach(async function() {
            // Add a candidate first by the owner
            await voting.connect(owner).addCandidate("Candidate 1");
        });

        it("Should allow a user to vote", async function () {
            await expect(voting.connect(addr1).vote(1))
                .to.emit(voting, "Voted")
                .withArgs(addr1.address, 1);

            const candidate = await voting.candidates(1);
            expect(candidate.voteCount).to.equal(1);

            const voterInfo = await voting.voters(addr1.address);
            expect(voterInfo.hasVoted).to.equal(true);
            expect(voterInfo.votedForCandidateId).to.equal(1);
        });

        it("Should prevent voting twice", async function () {
            await voting.connect(addr1).vote(1);
            await expect(
                voting.connect(addr1).vote(1)
            ).to.be.revertedWith("You have already voted.");
        });

        it("Should prevent voting for a non-existent candidate ID (too high)", async function () {
            await expect(
                voting.connect(addr1).vote(99)
            ).to.be.revertedWith("Invalid candidate ID.");
        });

        it("Should prevent voting for candidate ID 0", async function () {
            await expect(
                voting.connect(addr1).vote(0)
            ).to.be.revertedWith("Invalid candidate ID.");
        });
    });

    describe("Getter Functions", function () {
        beforeEach(async function() {
            // Add candidates by the owner
            await voting.connect(owner).addCandidate("Candidate A"); // ID 1
            await voting.connect(owner).addCandidate("Candidate B"); // ID 2
            // addr1 votes for Candidate A (ID 1)
            await voting.connect(addr1).vote(1);
        });

        it("getCandidate should return correct candidate details", async function () {
            const candidate = await voting.getCandidate(1);
            expect(candidate.id).to.equal(1);
            expect(candidate.name).to.equal("Candidate A");
            expect(candidate.voteCount).to.equal(1); // Vote count from addr1
        });

        it("getCandidate should revert for invalid ID (too high)", async function () {
            await expect(voting.getCandidate(99)).to.be.revertedWith("Invalid candidate ID.");
        });

        it("getCandidate should revert for ID 0", async function () {
            await expect(voting.getCandidate(0)).to.be.revertedWith("Invalid candidate ID.");
        });

        it("getAllCandidates should return all candidates", async function () {
            const allCandidates = await voting.getAllCandidates();
            expect(allCandidates.length).to.equal(2);
            expect(allCandidates[0].name).to.equal("Candidate A");
            expect(allCandidates[0].id).to.equal(1);
            expect(allCandidates[0].voteCount).to.equal(1);
            expect(allCandidates[1].name).to.equal("Candidate B");
            expect(allCandidates[1].id).to.equal(2);
            expect(allCandidates[1].voteCount).to.equal(0);
        });

        it("getAllCandidates should return empty array if no candidates", async function () {
            // Deploy a new contract with no candidates
            const newVoting = await Voting.deploy();
            const allCandidates = await newVoting.getAllCandidates();
            expect(allCandidates.length).to.equal(0);
        });

        it("getVoterInfo should return correct voter details for one who voted", async function () {
            const voter1Info = await voting.getVoterInfo(addr1.address);
            expect(voter1Info.hasVoted).to.equal(true);
            expect(voter1Info.votedForCandidateId).to.equal(1);
        });

        it("getVoterInfo should return correct voter details for one who has not voted", async function () {
            const voter2Info = await voting.getVoterInfo(addr2.address);
            expect(voter2Info.hasVoted).to.equal(false);
            expect(voter2Info.votedForCandidateId).to.equal(0); // Default is 0
        });
    });
});
