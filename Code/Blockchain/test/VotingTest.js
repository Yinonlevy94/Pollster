const Voting = artifacts.require("Voting");
const truffleAssert = require('truffle-assertions');

contract("Voting", (accounts) => {
  const [admin, voter1, voter2] = accounts;

  it("allows an account to vote once", async () => {
    const instance = await Voting.deployed();
    const encryptedVote = "0x123";

    // Cast the first vote
    await instance.castVote(encryptedVote, { from: voter1 });

    // Try casting another vote from the same address
    try {
      await instance.castVote(encryptedVote, { from: voter1 });
      assert.fail("The same account was able to vote more than once.");
    } catch (error) {
      assert.include(error.message, "revert", "Expected vote to be rejected");
    }

    // Cast a vote from a second address and check the event
    const voteCastTx = await instance.castVote(encryptedVote, { from: voter2 });
    truffleAssert.eventEmitted(voteCastTx, 'VoteCast', (ev) => {
      return ev.voter === voter2;
    }, "VoteCast event should be emitted with the voter's address");
  });
});
