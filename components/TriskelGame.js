import React, { useState, useEffect } from "react";
import Card from "./Card.js";

// GF(4) arithmetic (duplicated here for hint computation)
const GF4_MUL = [[0,0,0,0],[0,1,2,3],[0,2,3,1],[0,3,1,2]];
const GF4_INV = [0, 1, 3, 2];
const gf4Add = (a, b) => a ^ b;
const gf4Mul = (a, b) => GF4_MUL[a][b];

function normalize(v) {
  const first = v.find(x => x !== 0);
  if (first === undefined) return v;
  const inv = GF4_INV[first];
  return v.map(x => gf4Mul(inv, x));
}

function getVector(code) {
  return code.split('').map(Number);
}

function rankGF4(vectors) {
  const m = vectors.map(v => [...v]);
  let rank = 0;
  for (let col = 0; col < 4; col++) {
    let pivot = -1;
    for (let r = rank; r < m.length; r++) {
      if (m[r][col] !== 0) { pivot = r; break; }
    }
    if (pivot === -1) continue;
    [m[rank], m[pivot]] = [m[pivot], m[rank]];
    const inv = GF4_INV[m[rank][col]];
    for (let j = 0; j < 4; j++) m[rank][j] = gf4Mul(inv, m[rank][j]);
    for (let r = 0; r < m.length; r++) {
      if (r !== rank && m[r][col] !== 0) {
        const f = m[r][col];
        for (let j = 0; j < 4; j++) m[r][j] = gf4Add(m[r][j], gf4Mul(f, m[rank][j]));
      }
    }
    rank++;
  }
  return rank;
}

// Generate all 85 card codes: canonical points of PG(3,4)
// (first nonzero coordinate is 1, remaining coords are 0-3)
function generateCardIds() {
  const ids = ['0001'];
  for (let d = 0; d <= 3; d++) ids.push(`001${d}`);
  for (let c = 0; c <= 3; c++)
    for (let d = 0; d <= 3; d++)
      ids.push(`01${c}${d}`);
  for (let b = 0; b <= 3; b++)
    for (let c = 0; c <= 3; c++)
      for (let d = 0; d <= 3; d++)
        ids.push(`1${b}${c}${d}`);
  return ids;
}

// Map each visible card's normalized projective vector to its board id.
// Returns Map<vectorKey, [id]>
function buildVecMap(shown) {
  const map = new Map();
  shown.forEach((card, id) => {
    if (card.removed) return;
    const key = normalize(getVector(card.cardId)).join(',');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(id);
  });
  return map;
}

// Find the largest collinear set available on board.
// Returns 0 if no 3-card match, otherwise 3-5.
function findLargestMatch(shown) {
  const active = shown.map((c, i) => ({ ...c, id: i })).filter(c => !c.removed);
  if (active.length < 3) return 0;

  const vecMap = buildVecMap(shown);
  let best = 0;

  for (let i = 0; i < active.length; i++) {
    const v1 = normalize(getVector(active[i].cardId));
    for (let j = i + 1; j < active.length; j++) {
      const v2 = normalize(getVector(active[j].cardId));
      if (rankGF4([v1, v2]) < 2) continue;

      let count = 2;
      const usedIds = new Set([active[i].id, active[j].id]);

      for (let lambda = 1; lambda <= 3; lambda++) {
        const v3 = normalize(v1.map((x, k) => gf4Add(x, gf4Mul(lambda, v2[k]))));
        const key = v3.join(',');
        if (vecMap.has(key)) {
          const candidates = vecMap.get(key).filter(id => !usedIds.has(id));
          if (candidates.length > 0) {
            usedIds.add(candidates[0]);
            count++;
          }
        }
      }

      if (count > best) best = count;
      if (best >= 5) return 5;
    }
  }

  return best >= 3 ? best : 0;
}

function TriskelGame({ options, setOptions, highScore, setHighScore }) {
  const spreadMode = options === 'spread';
  const [game, setGame] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [shown, setShown] = useState([]);
  const [topOfDeck, setTopOfDeck] = useState(0);
  const [score, setScore] = useState(0);
  const [setsFound, setSetsFound] = useState(0);
  const [hintMessage, setHintMessage] = useState('');
  const [hintOpacity, setHintOpacity] = useState(0);

  useEffect(() => {
    const cardIds = generateCardIds();
    const allCards = cardIds.map(id => ({ cardId: id, rotation: 0, removed: false }));
    if (spreadMode) {
      setGame(allCards);
      setShown(allCards.map(c => ({ ...c })));
      setTopOfDeck(allCards.length);
    } else {
      const shuffled = allCards.sort(() => Math.random() - 0.5);
      setGame(shuffled);
      setShown(shuffled.slice(0, options).map(c => ({ ...c })));
      setTopOfDeck(options);
    }
  }, []);

  useEffect(() => {
    if (!spreadMode && score > highScore) setHighScore(score);
  }, [score]);

  const takeMatch = () => {
    if (spreadMode) {
      if (selectedCount === 5) {
        setSetsFound(s => s + 1);
        setGame(g => [...g]);
        const newIndexes = [...selectedIndexes];
        newIndexes.push(false);
        setSelectedIndexes(newIndexes);
      } else {
        const newIndexes = [...selectedIndexes];
        newIndexes.push(true);
        setSelectedIndexes(newIndexes);
      }
    } else {
      const scoreMap = [0, 0, 0, 1, 3, 6];
      if (selectedCount >= 3) {
        setScore(x => x + scoreMap[selectedCount]);
        setGame(g => [...g]);
        const newIndexes = [...selectedIndexes];
        newIndexes.push(false);
        setSelectedIndexes(newIndexes);
      } else {
        const newIndexes = [...selectedIndexes];
        newIndexes.push(true);
        setSelectedIndexes(newIndexes);
      }
    }
  };

  const showHint = () => {
    const largest = findLargestMatch(shown);
    let msg;
    if (spreadMode) {
      if (largest === 5) msg = 'A complete line of 5 exists';
      else if (largest >= 3) msg = 'No complete lines — try restarting';
      else msg = 'No matches — restart required';
    } else {
      msg = largest >= 3 ? `Best available match: ${largest} cards` : 'No match available';
    }
    setHintMessage(msg);
    setHintOpacity(1);
    setTimeout(() => setHintOpacity(0), 3000);
  };

  if (game.length === 0) return <div>loading...</div>;

  if (spreadMode && setsFound === 17) {
    return (
      <div id="game">
        <h1>Spread Complete!</h1>
        <p>All 85 cards partitioned into 17 disjoint lines.</p>
        <button onClick={() => setOptions(null)}>Main Menu</button>
      </div>
    );
  }

  return (
    <div id="game">
      <h1>{spreadMode ? `Lines: ${setsFound} / 17` : `Score: ${score}`}</h1>
      <div id="cards" className={spreadMode ? 'spread' : ''}>
        {shown.map((card, index) => (
          <div className="card" key={index}>
            <Card
              id={index}
              game={game}
              shown={shown}
              setShown={setShown}
              selectedCount={selectedCount}
              setSelectedCount={setSelectedCount}
              selectedIndexes={selectedIndexes}
              setSelectedIndexes={setSelectedIndexes}
              topOfDeck={topOfDeck}
              setTopOfDeck={setTopOfDeck}
            />
          </div>
        ))}
      </div>
      <div id="match">
        <button
          className="match"
          style={{ opacity: (spreadMode ? selectedCount === 5 : selectedCount >= 3) ? 1 : 0.45 }}
          onClick={takeMatch}
        >
          Take Match!
        </button>
        <button className="match" onClick={showHint}>Hint!</button>
      </div>
      <div
        id="hint"
        style={{ opacity: hintOpacity, transition: 'opacity 1s', marginTop: '8px', fontSize: '1.1em' }}
      >
        {hintMessage}
      </div>
    </div>
  );
}

export default TriskelGame;
