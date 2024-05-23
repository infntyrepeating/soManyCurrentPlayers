document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo');
  const playButton = document.getElementById('play-btn');
  const gameScreen = document.getElementById('game-screen');
  const startScreen = document.getElementById('start-screen');
  const gameContainer = document.getElementById('game-container');
  const loadingScreen = document.getElementById('loading-screen');
  const comparisonText = document.getElementById('comparison-text');
  const game1NameElement = document.getElementById('game1-name');
  const game2NameElement = document.getElementById('game2-name');
  const firstImgElement = document.getElementById('first-img');
  const secondImgElement = document.getElementById('second-img');
  const firstTitleElement = document.getElementById('first-title');
  const secondTitleElement = document.getElementById('second-title');
  const firstValueElement = document.getElementById('first-value');
  const secondValueElement = document.getElementById('second-value');
  const resultElement = document.getElementById('result');
  const nextRoundButton = document.getElementById('next-round-btn');
  const higherButton = document.getElementById('higher-btn');
  const lowerButton = document.getElementById('lower-btn');

  let firstItem = null;
  let secondItem = null;
  let items = [];
  let savedInfo = [];
  let firstPlayerCount = 0;
  let secondPlayerCount = 0;
  let Score = 0;

  const steamAPIBaseURL = 'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/';
  const accessToken = 'eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInI6MEQ4RF8yMzc0NkIzRV83MTA2MCIsICJzdWIiOiAiNzY1NjExOTkwODc4NDczMDkiLCAiYXVkIjogWyAid2ViOnN0b3JlIiBdLCAiZXhwIjogMTcxNTk3OTgzOSwgIm5iZiI6IDE3MDcyNTI2OTYsICJpYXQiOiAxNzE1ODkyNjk2LCAianRpIjogIjE3NjhfMjQ2RURDMjBfQjQ0MjQiLCAib2F0IjogMTY5OTk2Mjc0NCwgInJ0X2V4cCI6IDE3MTc5MjA0NjIsICJwZXIiOiAwLCAiaXBfc3ViamVjdCI6ICIxOTMuMTM2LjQuODYiLCAiaXBfY29uZmlybWVyIjogIjg3LjEwMy41OC4yMTYiIH0.0rMKuHACar7JXiXGDvS7Nk4x4K6xuXcFUCJCGRvLY-fDHtOu7dxOqMjPZSvjSFDfaJuk9ma-ximip4aYgrHdDA';
  const steamStoreBaseURL = 'https://store.steampowered.com/api/appdetails?appids=';

  // Hide loading screen initially
  loadingScreen.classList.add('hidden');

  // Fade in logo
  setTimeout(() => {
    logo.classList.remove('hidden');
    logo.classList.add('visible');
  }, 500); // Start fading in after 500ms

  // Fade in play button after logo
  setTimeout(() => {
    playButton.classList.remove('hidden');
    playButton.classList.add('visible');
  }, 2500); // Start fading in after logo is fully visible

// Show game container when play button is clicked
  playButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameContainer.classList.remove('hidden');
    startNewRound();
  });

  // Helper function to check if the timestamp is older than a specified time
  function isTimestampOld(timestamp, delayInMinutes) {
    const delay = delayInMinutes * 60 * 1000;
    return (Date.now() - timestamp) > delay;
  }

  function getRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
  }

  async function getPlayerCount(appid) {
    const savedItem = savedInfo.find(item => item.appid === appid);

    if (savedItem && !isTimestampOld(savedItem.playerCountTimestamp, 10)) {
      console.log(`Using cached player count for appid ${appid}`);
      return savedItem.playerCount;
    }

    console.log(`Fetching new player count for appid ${appid}`);
    const url = `${steamAPIBaseURL}?access_token=${accessToken}&appid=${appid}`;
    const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
    const data = await response.json();
    const newJson = JSON.parse(data.contents);
    const playerCount = newJson.response.player_count;

    // Save the new player count with the current timestamp
    if (savedItem) {
      savedItem.playerCount = playerCount;
      savedItem.playerCountTimestamp = Date.now();
    } else {
      savedInfo.push({
        appid,
        playerCount,
        playerCountTimestamp: Date.now(),
        gameDetails: null,
        gameDetailsTimestamp: 0
      });
    }

    return playerCount;
  }

  async function getGameDetails(appid) {
    const savedItem = savedInfo.find(item => item.appid === appid);

    if (savedItem && savedItem.gameDetails && !isTimestampOld(savedItem.gameDetailsTimestamp, 1440)) { // 1440 minutes = 24 hours
      console.log(`Using cached game details for appid ${appid}`);
      return savedItem.gameDetails;
    }

    console.log(`Fetching new game details for appid ${appid}`);
    const url = `${steamStoreBaseURL}${appid}`;
    const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
    let data = await response.json();
    data = JSON.parse(data.contents);

    if (data[appid].success) {
      const gameDetails = data[appid].data;

      // Save the new game details with the current timestamp
      if (savedItem) {
        savedItem.gameDetails = gameDetails;
        savedItem.gameDetailsTimestamp = Date.now();
      } else {
        savedInfo.push({appid, playerCount: 0, playerCountTimestamp: 0, gameDetails, gameDetailsTimestamp: Date.now()});
      }

      return gameDetails;
    } else {
      throw new Error('Failed to fetch game details');
    }
  }

  async function startNewRound() {
    console.log('Starting new round');

    loadingScreen.classList.remove('hidden');

    firstItem = getRandomItem();
    console.log('First item:', firstItem);

    secondItem = getRandomItem();
    for (let i = 0; i < 10; i++) {
      if (secondItem === firstItem) {
        console.log('Second item is the same as the first, picking another one');
        secondItem = getRandomItem();
      }
    }
    console.log('Second item:', secondItem);

    if (!firstItem || !secondItem) {
      console.error('Invalid items or appid');
      console.error('First item:', firstItem);
      console.error('Second item:', secondItem);
      loadingScreen.classList.add('hidden');
      return;
    }

    try {
      firstPlayerCount = await getPlayerCount(firstItem);
      secondPlayerCount = await getPlayerCount(secondItem);
      console.log('First player count:', firstPlayerCount);
      console.log('Second player count:', secondPlayerCount);

      const firstGameDetails = await getGameDetails(firstItem);
      const secondGameDetails = await getGameDetails(secondItem);

      const firstImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${firstItem}/header.jpg`;
      const secondImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${secondItem}/header.jpg`;

      firstImgElement.src = firstImageUrl;
      firstTitleElement.textContent = firstGameDetails.name;
      firstValueElement.textContent = `Players: ${firstPlayerCount}`;

      secondImgElement.src = secondImageUrl;
      secondTitleElement.textContent = secondGameDetails.name;
      secondValueElement.classList.add('hidden');
      secondValueElement.textContent = `Players: ${secondPlayerCount}`;

      resultElement.textContent = '';
      nextRoundButton.classList.add('hidden');
      higherButton.classList.remove('hidden');
      lowerButton.classList.remove('hidden');
      higherButton.disabled = false;
      lowerButton.disabled = false;
      comparisonText.classList.remove('hidden');

      game1NameElement.textContent = firstGameDetails.name;
      game2NameElement.textContent = secondGameDetails.name;

    } catch (error) {
      console.error('Error fetching game details:', error);
      resultElement.textContent = 'Error fetching game details. Please try again later.';
      resultElement.style.color = 'red';
    } finally {
      loadingScreen.classList.add('hidden');
    }
  }

  function revealSecondValue() {
    secondValueElement.classList.remove('hidden');
  }

  function checkGuess(isHigher) {
    revealSecondValue();
    higherButton.disabled = true;
    lowerButton.disabled = true;

    console.log('First player count:', firstPlayerCount);
    console.log('Second player count:', secondPlayerCount);

    if ((isHigher && secondPlayerCount > firstPlayerCount) || (!isHigher && secondPlayerCount < firstPlayerCount)) {
      resultElement.textContent = 'Correct!';
      resultElement.style.color = 'green';
      Score += 1;
    } else {
      resultElement.textContent = 'Wrong!';
      resultElement.style.color = 'red';
      Score = 0;
    }
    nextRoundButton.classList.remove('hidden');
    higherButton.classList.add('hidden');
    lowerButton.classList.add('hidden');
    comparisonText.classList.add('hidden');
  }

  higherButton.addEventListener('click', () => checkGuess(true));
  lowerButton.addEventListener('click', () => checkGuess(false));
  nextRoundButton.addEventListener('click', startNewRound);

  fetch('data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('Data loaded:', data);
      items = data;
      if (items.length < 2) {
        throw new Error('Not enough items to play the game');
      }
    })
    .then(startNewRound) // Start the first round after data is loaded
    .catch(error => {
      console.error('Error loading data:', error);
      resultElement.textContent = 'Error loading game data. Please try again later.';
      resultElement.style.color = 'red';
    });

  window.onload = () => {
    loadingScreen.classList.add('hidden');
  };
}
)
