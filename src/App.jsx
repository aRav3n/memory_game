import { useState, useEffect } from "react";
import "./App.css";

function buildGameplayObject(objectToClone, deck, clickedCards) {
  const gameplayObject = {};
  if (arguments.length === 0) {
    gameplayObject.deck = [];
    gameplayObject.currentScore = 0;
    gameplayObject.highScore = 0;
    gameplayObject.clickedCards = [];
  } else {
    gameplayObject.deck = objectToClone.deck;
    gameplayObject.currentScore = objectToClone.clickedCards.length;
    gameplayObject.highScore = objectToClone.highScore;
    gameplayObject.clickedCards = objectToClone.clickedCards;

    if (deck !== undefined) {
      gameplayObject.deck = deck;
    }
    if (clickedCards !== undefined) {
      gameplayObject.clickedCards = clickedCards;
      gameplayObject.currentScore = clickedCards.length;
    }
  }
  if (gameplayObject.currentScore > gameplayObject.highScore) {
    gameplayObject.highScore = gameplayObject.currentScore;
  }

  return gameplayObject;
}

// Array of multiverse ID numbers of the 12 cards I want in the deck
const cardArray = [];

// source: https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg/revision/latest?cb=20140813141013
const placeHolderImgSrc = "./src/placeholder.webp";

// https://docs.magicthegathering.io
function getUrlForCard(multiverseId) {
  return `https://api.magicthegathering.io/v1/cards/${multiverseId}`;
}

function buildCardObject(multiverseId, imgSrc, name) {
  const cardObject = {};
  cardObject.id = multiverseId;
  if (!imgSrc) {
    cardObject.imgSrc = placeHolderImgSrc;
  }
  if (!name) {
    cardObject.name = "Loading...";
  }
  return cardObject;
}

function addCardToInitialArray(multiverseId) {
  const card = buildCardObject(multiverseId);
  cardArray.push(card);
}

function populateInitialDeck() {
  addCardToInitialArray(82950);
  addCardToInitialArray(443073);
  addCardToInitialArray(25596);
  addCardToInitialArray(13031);
  addCardToInitialArray(13039);
  addCardToInitialArray(11268);
  addCardToInitialArray(26409);
  addCardToInitialArray(23069);
  addCardToInitialArray(11386);
  addCardToInitialArray(210557);
  addCardToInitialArray(13147);
  addCardToInitialArray(598899);
}

async function buildCardFromApi(multiverseId) {
  try {
    const url = getUrlForCard(multiverseId);
    const response = await fetch(url, { mode: "cors" });
    const cardJson = await response.json();
    const builtCard = buildCardObject(
      multiverseId,
      await cardJson.card.imageUrl,
      await cardJson.card.name
    );
    // console.log(cardJson.card);
    console.log(builtCard);
    return builtCard;
  } catch (error) {
    console.log(error);
  }
}

function buildDeckFromApi() {
  for (let i = 0; i < cardArray.length; i++) {
    const multiverseId = cardArray[i].id;
    const newCardObject = buildCardFromApi(multiverseId);
    cardArray[i] = newCardObject;
  }
}

function shuffleDeck(gameplay, setGameplay) {
  const localGameplayObject = buildGameplayObject(gameplay);
  const deck = localGameplayObject.deck;
  const shuffledCards = [];
  shuffledCards.length = deck.length;

  function getNewPosition() {
    let position = Math.floor(Math.random() * shuffledCards.length);
    if (shuffledCards[position] !== undefined) {
      position = getNewPosition();
    }
    return position;
  }

  for (let i = 0; i < shuffledCards.length; i++) {
    shuffledCards[getNewPosition()] = deck[i];
  }

  localGameplayObject.deck = shuffledCards;

  setGameplay(localGameplayObject);
}

// App title heading as well as footer display
function Heading() {
  return (
    <header>
      <h1>MTG Memory Game</h1>
    </header>
  );
}

function Footing() {
  return <footer>&copy; Andy Ryan 2024</footer>;
}

function updateGameState(newState, playerInfo, setContentToDisplay) {
  if (playerInfo.name !== undefined && playerInfo.difficulty !== undefined) {
    setContentToDisplay(newState);
  } else if (playerInfo.name === undefined) {
    const nameField = document.querySelector("#name");
    nameField.classList.add("missing");
  } else {
    const difficultyField = document.querySelector("fieldset");
    difficultyField.classList.add("missing");
  }
}

// Form displays for user to input their name and select a difficulty level
function UserInfoForm({
  contentToDisplay,
  setContentToDisplay,
  playerInfo,
  setPlayerInfo,
  gameplay,
  setGameplay,
}) {
  if (contentToDisplay !== "form") {
    return;
  }

  populateInitialDeck();

  function buildPlayerObject(name, difficulty) {
    const playerObject = {};
    playerObject.name = name;
    playerObject.difficulty = difficulty;
    return playerObject;
  }

  function updatePlayerName(e) {
    const difficulty = playerInfo.difficulty;
    const newPlayerObject = buildPlayerObject(e.target.value, difficulty);
    setPlayerInfo(newPlayerObject);
  }

  function updatePlayerDifficulty(e) {
    const name = playerInfo.name;
    const newPlayerObject = buildPlayerObject(name, e.target.value);
    setPlayerInfo(newPlayerObject);
  }

  function changeToGameplay() {
    const difficultyStateArray = cardArray;
    const difficulty = playerInfo.difficulty;
    if (difficulty === "easy") {
      difficultyStateArray.length = 6;
    } else if (difficulty === "medium") {
      difficultyStateArray.length = 9;
    }
    for (let i = 0; i < difficultyStateArray.length; i++) {
      difficultyStateArray[i].name += ` - ${i}`;
    }

    function buildButton(card) {
      function checkIfAlreadyClicked(clickedKey) {
        const clickedCardArray = [...gameplay.clickedCards];
        if (clickedCardArray.includes(clickedKey)) {
          return true;
        }
        return false;
      }

      function updateScore(key) {
        const localGameplayObject = buildGameplayObject(gameplay);
        const clickedCardArray = [...gameplay.clickedCards];
        if (checkIfAlreadyClicked(key)) {
          localGameplayObject.clickedCards.length = 0;
        } else {
          clickedCardArray.push(key);
          localGameplayObject.clickedCards.push(key);
        }

        setGameplay(localGameplayObject);
      }

      function cardClickAction() {
        const key = card.name;
        updateScore(key);
      }

      return (
        <button
          key={card.name}
          type="button"
          className="cardButton"
          onClick={cardClickAction}
        >
          <img src={card.imgSrc} alt={card.name} className="cardButton" />
          <p className="cardButton">{card.name}</p>
        </button>
      );
    }

    const dummyDeck = [];
    for (let i = 0; i < difficultyStateArray.length; i++) {
      const card = difficultyStateArray[i];
      dummyDeck[i] = buildButton(card);
    }

    const localGameplayObject = Object.assign({}, gameplay);
    localGameplayObject.deck = dummyDeck;

    setGameplay(localGameplayObject);
    updateGameState("gameplay", playerInfo, setContentToDisplay);
  }

  return (
    <form>
      <label htmlFor="name">
        Player Name:
        <input type="text" name="name" id="name" onChange={updatePlayerName} />
      </label>
      <fieldset onChange={updatePlayerDifficulty}>
        <legend>Difficulty</legend>
        <label htmlFor="easy">
          Easy
          <input value="easy" type="radio" name="difficulty" id="easy" />
        </label>
        <label htmlFor="medium">
          Medium
          <input value="medium" type="radio" name="difficulty" id="medium" />
        </label>
        <label htmlFor="hard">
          Hard
          <input value="hard" type="radio" name="difficulty" id="hard" />
        </label>
      </fieldset>
      <button type="button" onClick={changeToGameplay}>
        Let&apos;s Go!
      </button>
    </form>
  );
}

function PlayState({
  contentToDisplay,
  setContentToDisplay,
  gameplay,
  setGameplay,
  playerInfo,
}) {
  if (contentToDisplay !== "gameplay") {
    return;
  }
  const player = playerInfo.name;

  function shuffleThisDeck(e) {
    const classOfObject = e.nativeEvent.explicitOriginalTarget.className;
    if (classOfObject === "cardButton") {
      shuffleDeck(gameplay, setGameplay);
    }
  }

  return (
    <>
      <div>
        <h2>Good luck {player}!</h2>
        <h3>Don&apos;t click on the same image twice</h3>
        <div className="scoreBoard">
          <p>Current score: {gameplay.currentScore}</p>
          <p>High score: {gameplay.highScore}</p>
        </div>
      </div>
      <div id="cardGrid" onClick={shuffleThisDeck}>
        {gameplay.deck}
      </div>
    </>
  );
}

// Pull X number of images from an API with useEffect where X is determined by selected difficulty level. X = [6 (easy), 9 (medium), or 12 (hard)] cards.
// https://api.magicthegathering.io/v1/cards/[multiverseId]

// Reusable function placeCardsAtRandom() to place images at random spots in an array

// Brief description of how to play appears on screen. Remember to have a highly visible X button to close it.

// RAM css grid appears displaying all cards placed in random positions via placeCardsAtRandom(). Cards are all button elements

// h2 displaying both current score and best score

// When user clicks a card it gets added to an array of clicked cards via useState()

// Click also triggers another placeCardsAtRandom(). If successful then current score = current score++

// Round ends when user has selected all cards and wins or accidentally selects a card twice and loses. Either way the top score will go into the h2 that displays best score

// overlay that appears when a round is over

function App() {
  const [gameplay, setGameplay] = useState(buildGameplayObject());
  const [contentToDisplay, setContentToDisplay] = useState("form");
  const [playerInfo, setPlayerInfo] = useState("");
  /*
  // followed tutorial by Ghost Together: https://www.youtube.com/watch?v=ZRFwuGpiLl4
  useEffect(() => {
    const fetchData = async (multiverseId) => {
      const result = await fetch(getUrlForCard(multiverseId));
      console.log(result);
    };
    for (let i = 0; i < cardArray.length; i++) {
      if(cardArray[i].id)
      const object = fetchData(cardArray[i].id);
      cardArray[i] = object;
    }
  }, []);
  */

  return (
    <>
      <Heading />
      <UserInfoForm
        contentToDisplay={contentToDisplay}
        setContentToDisplay={setContentToDisplay}
        playerInfo={playerInfo}
        setPlayerInfo={setPlayerInfo}
        gameplay={gameplay}
        setGameplay={setGameplay}
      />
      <PlayState
        contentToDisplay={contentToDisplay}
        setContentToDisplay={setContentToDisplay}
        gameplay={gameplay}
        setGameplay={setGameplay}
        playerInfo={playerInfo}
      />
      <Footing />
    </>
  );
}

export default App;
