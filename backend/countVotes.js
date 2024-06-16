const {Web3} = require('web3');
const fs = require('fs');

(async () => {
  const { default: open } = await import('open');

  const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

  const candidates = {
    "Benny Gantz": {
      address: "0xE39D1B37d13b696100BB1c4F3AB11486D6A25229",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Benny_Gantz_2019_%28cropped%29.jpg/220px-Benny_Gantz_2019_%28cropped%29.jpg"
    },
    "Bibi Netanyahu": {
      address: "0x4c3b6fF9D5410119972eEbC2ebd230924fb9C845",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Benjamin_Netanyahu%2C_February_2023.jpg/220px-Benjamin_Netanyahu_February_2023.jpg"
    },
    "Naftali Bennet": {
      address: "0x8AF840F5AB447F965F371C2EEa070611c790F8f4",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Naftali_Bennett_official_portrait.jpg/220px-Naftali_Bennett_official_portrait.jpg"
    }
  };

  const TOTAL_MANDATES = 120;

  async function countVotes() {
    try {
      const balances = await Promise.all(Object.values(candidates).map(async (candidate) => {
        const balanceWei = await web3.eth.getBalance(candidate.address);
        return web3.utils.fromWei(balanceWei, 'ether');
      }));

      const adjustedBalances = balances.map(balance => balance - 100);

      const totalVotes = adjustedBalances.reduce((sum, balance) => sum + balance, 0);

      const results = Object.keys(candidates).reduce((acc, candidate, index) => {
        const percentage = (adjustedBalances[index] / totalVotes) * 100;
        const mandates = Math.round((percentage / 100) * TOTAL_MANDATES);
        acc[candidate] = {
          votes: adjustedBalances[index],
          percentage: percentage.toFixed(2), 
          mandates: mandates,
          img: candidates[candidate].img
        };
        return acc;
      }, {});

      const sortedResults = Object.entries(results).sort((a, b) => b[1].votes - a[1].votes);
      const [winner, secondPlace, thirdPlace] = sortedResults;

      console.log('Election Results:');
      sortedResults.forEach(([candidate, { votes, percentage, mandates }]) => {
        console.log(`${candidate}: ${votes} votes (${percentage}%), ${mandates} mandates`);
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Election Results</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: linear-gradient(135deg, #72EDF2 10%, #5151E5 100%);
              font-family: Arial, sans-serif;
              margin: 0;
            }
            .results-container {
              text-align: center;
              background: rgba(0, 0, 0, 0.6);
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
              color: #fff;
              animation: fadeIn 1s ease-in-out;
            }
            .results-container img {
              width: 150px;
              border-radius: 50%;
              animation: bounceIn 1s ease;
            }
            .results-container h1 {
              font-size: 2.5em;
              margin: 20px 0;
            }
            .results-container p {
              font-size: 1.2em;
              margin: 10px 0;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes bounceIn {
              from { transform: scale(0.5); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="results-container">
            <h1>Election Results</h1>
            <div>
              <h2>Winner</h2>
              <img src="${winner[1].img}" alt="${winner[0]}">
              <h1>Congratulations, ${winner[0]}!</h1>
              <p>You have won the election with ${winner[1].votes} votes (${winner[1].percentage}%) and ${winner[1].mandates} mandates.</p>
            </div>
            <div>
              <h2>Second Place</h2>
              <img src="${secondPlace[1].img}" alt="${secondPlace[0]}">
              <p>${secondPlace[0]} received ${secondPlace[1].votes} votes (${secondPlace[1].percentage}%) and ${secondPlace[1].mandates} mandates.</p>
            </div>
            <div>
              <h2>Third Place</h2>
              <img src="${thirdPlace[1].img}" alt="${thirdPlace[0]}">
              <p>${thirdPlace[0]} received ${thirdPlace[1].votes} votes (${thirdPlace[1].percentage}%) and ${thirdPlace[1].mandates} mandates.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      fs.writeFileSync('election_winner.html', htmlContent, 'utf8');

      await open('election_winner.html');

    } catch (error) {
      console.error('Error counting votes:', error);
    }
  }

  countVotes();
})();
