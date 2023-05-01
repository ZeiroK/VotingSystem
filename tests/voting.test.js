const VotingSystem = artifacts.require("VotingSystem");

contract("VotingSystem", accounts => {
  let votingSystem;

  beforeEach(async () => {
    votingSystem = await VotingSystem.new();
    await votingSystem.addCandidate("Candidate 1");
    await votingSystem.addCandidate("Candidate 2");
    await votingSystem.addBill("Bill 1");
    await votingSystem.addBill("Bill 2");
    await votingSystem.registerVoter({ from: accounts[0] });
  });

  it("should add a candidate", async () => {
    const candidateCountBefore = await votingSystem.getCandidatesCount();

    await votingSystem.addCandidate("Candidate 3");

    const candidateCountAfter = await votingSystem.getCandidatesCount();
    assert.equal(candidateCountAfter, candidateCountBefore + 1);
  });

  it("should add a bill", async () => {
    const billCountBefore = await votingSystem.getBillsCount();

    await votingSystem.addBill("Bill 3");

    const billCountAfter = await votingSystem.getBillsCount();
    assert.equal(billCountAfter, billCountBefore + 1);
  });

  it("should register a voter", async () => {
    await votingSystem.registerVoter({ from: accounts[1] });
    const voter = await votingSystem.voters(accounts[1]);

    assert.equal(voter.hasVoted, false);
  });

  it("should vote for a candidate", async () => {
    await votingSystem.voteForCandidate(0, { from: accounts[0] });
    const candidate = await votingSystem.candidates(0);

    assert.equal(candidate.voteCount, 1);
  });

  it("should vote for a bill", async () => {
    await votingSystem.voteForBill(0, true, { from: accounts[0] });
    const bill = await votingSystem.bills(0);

    assert.equal(bill.yesCount, 1);
  });

  it("should not allow a voter to vote twice for a candidate", async () => {
    await votingSystem.voteForCandidate(0, { from: accounts[0] });

    try {
      await votingSystem.voteForCandidate(1, { from: accounts[0] });
      assert.fail("Expected an error, but none was thrown");
    } catch (error) {
      assert(error.toString().includes("Voter has already voted for a candidate"));
    }
  });

  it("should not allow a voter to vote twice for a bill", async () => {
    await votingSystem.voteForBill(0, true, { from: accounts[0] });

    try {
      await votingSystem.voteForBill(1, false, { from: accounts[0] });
      assert.fail("Expected an error, but none was thrown");
    } catch (error) {
      assert(error.toString().includes("Voter has already voted for this bill"));
    }
  });

  it("should return whether a voter has voted for a bill", async () => {
    await votingSystem.voteForBill(0, true, { from: accounts[0] });
    const hasVoted = await votingSystem.hasVotedForBill(accounts[0], 0);

    assert.equal(hasVoted, true);
  });
});
