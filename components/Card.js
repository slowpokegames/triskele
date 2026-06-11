import React, { useState, useEffect } from "react";
import { useSpring, animated as a } from "react-spring";

// GF(4) = {0,1,α,α+1} encoded as {0,1,2,3}, char 2, α²=α+1
const GF4_MUL = [[0,0,0,0],[0,1,2,3],[0,2,3,1],[0,3,1,2]];
const GF4_INV = [0, 1, 3, 2];
const gf4Add = (a, b) => a ^ b;
const gf4Mul = (a, b) => GF4_MUL[a][b];

// Normalize projective vector so first nonzero element is 1
function normalize(v) {
  const first = v.find(x => x !== 0);
  if (first === undefined) return v;
  const inv = GF4_INV[first];
  return v.map(x => gf4Mul(inv, x));
}

// Card identity is fixed regardless of visual rotation
function getVector(code) {
  return code.split('').map(Number);
}

// Gaussian elimination over GF(4); returns rank
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

function Card({
  id,
  game,
  shown,
  setShown,
  selectedCount,
  setSelectedCount,
  selectedIndexes,
  setSelectedIndexes,
  topOfDeck,
  setTopOfDeck,
}) {
  const [selected, setSelect] = useState(false);
  const [flipped, setFlip] = useState(false);
  const [tilt, setTilt] = useState(0);

  // rotation is cumulative (never mod'd) so spring always animates forward
  const rotation = shown[id]?.rotation ?? 0;
  const rotDeg = rotation * 120;

  const { transform, opacity } = useSpring({
    opacity: flipped ? 0 : 1,
    transform: `perspective(600px) rotateY(${flipped ? 0 : 180}deg) scale(${selected ? 1.12 : 1}) rotateZ(${-(rotDeg + tilt * 5)}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  useEffect(() => {
    // selectedIndexes last element signals result: true=reject, false=accept
    const result = selectedIndexes[selectedCount];
    if (result === true && selectedIndexes.indexOf(id) > -1) {
      setTimeout(() => {
        rejectAnimation();
        setSelect(false);
        setSelectedCount(0);
        setSelectedIndexes([]);
      }, 10);
    } else if (result === false && selectedIndexes.indexOf(id) > -1) {
      setFlip(true);
      setSelectedCount(0);
      setSelectedIndexes([]);
      setTimeout(() => {
        const sii = selectedIndexes.indexOf(id);
        if (topOfDeck + sii < game.length) {
          shown[id].cardId = game[topOfDeck + sii].cardId;
          shown[id].rotation = Math.floor(Math.random() * 3);
          setShown([...shown]);
          setTopOfDeck(tod => tod + 1);
          setFlip(false);
          setSelect(false);
        } else {
          shown[id].removed = true;
          setShown([...shown]);
          setSelect(false);
        }
      }, 1000);
    }
  }, [selectedIndexes]);

  const rejectAnimation = () => {
    setTilt(3);
    setTimeout(() => setTilt(-3), 100);
    setTimeout(() => setTilt(3), 200);
    setTimeout(() => setTilt(-3), 300);
    setTimeout(() => setTilt(0), 400);
  };

  // Check that all indexes are collinear in PG(3,4): must span exactly rank 2
  // rank < 2 means two cards are the same projective point (aliased by rotation)
  // rank > 2 means not all on one line
  const isCollinear = (indexes) => {
    if (indexes.length < 2) return true;
    const vectors = indexes.map(i => getVector(shown[i].cardId));
    return rankGF4(vectors) === 2;
  };

  const onCardClick = () => {
    if (flipped) return;
    if (!selected) {
      if (selectedCount >= 5) {
        shown[id].rotation = (shown[id].rotation ?? 0) + 1;
        setShown([...shown]);
        rejectAnimation();
        return;
      }
      const newIndexes = [...selectedIndexes, id];
      if (isCollinear(newIndexes)) {
        setSelect(true);
        setSelectedCount(selectedCount + 1);
        setSelectedIndexes(newIndexes);
      } else {
        shown[id].rotation = (shown[id].rotation ?? 0) + 1;
        setShown([...shown]);
        rejectAnimation();
      }
    } else {
      // Deselect: remove from selection and rotate 120° CW
      setSelect(false);
      setSelectedCount(selectedCount - 1);
      setSelectedIndexes(selectedIndexes.filter(i => i !== id));
      shown[id].rotation = (shown[id].rotation ?? 0) + 1;
      setShown([...shown]);
    }
  };

  if (shown[id]?.removed) return null;

  return (
    <div onClick={onCardClick}>
      <a.div
        className="c back"
        style={{
          opacity: opacity.to(o => 1 - o),
          transform,
        }}
      />
      <a.div
        className="c front"
        style={{
          opacity,
          transform: transform.to(t => `${t} rotateY(180deg)`),
          backgroundImage: `url(cards/${shown[id]?.cardId ?? ''}.png)`,
          boxShadow: selected
            ? '0 0 0 4px #6a3faa, 0 0 14px 4px rgba(106,63,170,0.45)'
            : 'none',
        }}
      />
    </div>
  );
}

export default Card;
