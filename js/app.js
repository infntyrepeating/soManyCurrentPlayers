let firstItem = null;
let secondItem = null;
let items = [];

let firstPlayerCount = 0;
let secondPlayerCount = 0;

const firstItemElement = document.getElementById('first-item');
const secondItemElement = document.getElementById('second-item');
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

const steamAPIBaseURL = 'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/';
const accessToken = 'eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInI6MEQ4RF8yMzc0NkIzRV83MTA2MCIsICJzdWIiOiAiNzY1NjExOTkwODc4NDczMDkiLCAiYXVkIjogWyAid2ViOnN0b3JlIiBdLCAiZXhwIjogMTcxNTk3OTgzOSwgIm5iZiI6IDE3MDcyNTI2OTYsICJpYXQiOiAxNzE1ODkyNjk2LCAianRpIjogIjE3NjhfMjQ2RURDMjBfQjQ0MjQiLCAib2F0IjogMTY5OTk2Mjc0NCwgInJ0X2V4cCI6IDE3MTc5MjA0NjIsICJwZXIiOiAwLCAiaXBfc3ViamVjdCI6ICIxOTMuMTM2LjQuODYiLCAiaXBfY29uZmlybWVyIjogIjg3LjEwMy41OC4yMTYiIH0.0rMKuHACar7JXiXGDvS7Nk4x4K6xuXcFUCJCGRvLY-fDHtOu7dxOqMjPZSvjSFDfaJuk9ma-ximip4aYgrHdDA';
const steamStoreBaseURL = 'https://store.steampowered.com/api/appdetails?appids=';

function getRandomItem() {
  return items[Math.floor(Math.random() * items.length)];
}

async function getPlayerCount(appid) {
  const url = `${steamAPIBaseURL}?access_token=${accessToken}&appid=${appid}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.response.player_count;
}

async function getGameDetails(appid) {
  const url = `${steamStoreBaseURL}${appid}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data[appid].success) {
    return data[appid].data;
  } else {
    throw new Error('Failed to fetch game details');
  }
}

async function startNewRound() {
  console.log('Starting new round');

  firstItem = getRandomItem();
  console.log('First item:', firstItem);

  secondItem = getRandomItem();
  for (let i = 0; i < 10; i++){
    if(secondItem === firstItem){
      console.log('Second item is the same as the first, picking another one');
      secondItem = getRandomItem();
    }
  }
  console.log('Second item:', secondItem);

  if (!firstItem || !secondItem) {
    console.error('Invalid items or appid');
    console.error('First item:', firstItem);
    console.error('Second item:', secondItem);
    return;
  }

  firstPlayerCount = await getPlayerCount(firstItem);
  secondPlayerCount = await getPlayerCount(secondItem);
  console.log('First player count:', firstPlayerCount);
  console.log('Second player count:', secondPlayerCount);

  try {
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
    higherButton.disabled = false;
    lowerButton.disabled = false;
  } catch (error) {
    console.error('Error fetching game details:', error);
    resultElement.textContent = 'Error fetching game details. Please try again later.';
    resultElement.style.color = 'red';
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
  } else {
    resultElement.textContent = 'Wrong!';
    resultElement.style.color = 'red';
  }
  nextRoundButton.classList.remove('hidden');
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
    startNewRound();
  })
  .catch(error => {
    console.error('Error loading data:', error);
    resultElement.textContent = 'Error loading game data. Please try again later.';
    resultElement.style.color = 'red';
  });

window.onload = startNewRound;




