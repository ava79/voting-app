// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Updated to 0.8.20

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint256 votedForCandidateId;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    uint256 public candidatesCount;
    uint256[] public allCandidatesList; // To store all candidate IDs

    event Voted(address indexed voterAddress, uint256 indexed candidateId);
    event CandidateAdded(uint256 indexed candidateId, string name);

    constructor() Ownable(msg.sender) {
        // The Ownable constructor is now explicitly called with the deployer as the initial owner.
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        allCandidatesList.push(candidatesCount);
        emit CandidateAdded(candidatesCount, _name);
    }

    function vote(uint256 _candidateId) public {
        require(!voters[msg.sender].hasVoted, "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedForCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    function getCandidate(uint256 _candidateId) public view returns (uint256 id, string memory name, uint256 voteCount) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
        Candidate storage candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory _candidates = new Candidate[](allCandidatesList.length);
        for (uint i = 0; i < allCandidatesList.length; i++) {
            _candidates[i] = candidates[allCandidatesList[i]];
        }
        return _candidates;
    }

    function getVoterInfo(address _voterAddress) public view returns (bool hasVoted, uint256 votedForCandidateId) {
        Voter storage voter = voters[_voterAddress];
        return (voter.hasVoted, voter.votedForCandidateId);
    }
}
