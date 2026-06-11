import React, { useState } from "react";
import Head from 'next/head';
import TriskelGame from "../components/TriskelGame";

export default function App() {
  const [options, setOptions] = useState(null);
  const [highScore, setHighScore] = useState(0);

  return (
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, height=device-height" />
        <title>Triskele</title>
      </Head>

      <div className="container">
        <div className="row">
          <div className="col-4" />
          <div className="col-3">{options !== 'spread' ? `High Score: ${highScore}` : 'Spread Mode'}</div>
          <div className="col-5">
            {options === null ? (
              <>
                <button onClick={() => setOptions(25)}>Easy</button>
                <button onClick={() => setOptions(20)}>Medium</button>
                <button onClick={() => setOptions(15)}>Hard</button>
                <button onClick={() => setOptions('spread')}>Spread</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    const prev = options;
                    setOptions(null);
                    setTimeout(() => setOptions(prev), 5);
                  }}
                >
                  Start Over
                </button>
                <button onClick={() => setOptions(null)}>Main Menu</button>
              </>
            )}
          </div>
        </div>
      </div>

      {options ? (
        <TriskelGame
          options={options}
          setOptions={setOptions}
          highScore={highScore}
          setHighScore={setHighScore}
        />
      ) : (
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'left', padding: '0 16px' }}>
          <h2 style={{ textAlign: 'center' }}>How to Play</h2>

          {/* Orientation */}
          <p style={{ lineHeight: 1.65 }}>
            Each card encodes a geometric point. <strong>Orientation doesn&apos;t matter</strong> — the same
            card rotated looks different but belongs to exactly the same matches. Clicking a card that
            doesn&apos;t fit the current selection (or deselecting) rotates it 120°; use rotations to
            explore different arrangements.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 18px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img src="cards/1020.png" style={{ width: 72, borderRadius: '50%' }} alt="" />
            <img src="cards/1020.png" style={{ width: 72, borderRadius: '50%', transform: 'rotateZ(120deg)' }} alt="" />
            <img src="cards/1020.png" style={{ width: 72, borderRadius: '50%', transform: 'rotateZ(240deg)' }} alt="" />
            <span style={{ color: '#666', fontStyle: 'italic', fontSize: '0.95em' }}>— all the same card</span>
          </div>

          {/* Matching rule */}
          <p style={{ lineHeight: 1.65 }}>
            A <strong>match</strong> is 3–5 cards on the same line. Any two cards determine their full
            line of 5. To find a third card from two, compare each symbol type across both cards:
          </p>
          <ul style={{ lineHeight: 1.8, margin: '4px 0 10px', paddingLeft: 22 }}>
            <li><strong>Same symbol, same position in both</strong> → cancels (absent from result)</li>
            <li><strong>Same symbol, different positions</strong> → moves to the remaining third position
              <div style={{ fontSize: '0.9em', color: '#555', marginTop: 2 }}>top + bottom-left = bottom-right &nbsp;·&nbsp; top + bottom-right = bottom-left &nbsp;·&nbsp; bottom-left + bottom-right = top</div>
            </li>
            <li><strong>Symbol in only one card</strong> → stays at that position</li>
          </ul>

          {/* Example box */}
          <div style={{ background: '#f4f0fa', borderRadius: 10, padding: '14px 16px', margin: '4px 0 16px' }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Example — finding the third card</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <img src="cards/1020.png" style={{ width: 72, borderRadius: '50%' }} alt="" />
              <span style={{ fontSize: '1.5em', color: '#6a3faa' }}>+</span>
              <img src="cards/1030.png" style={{ width: 72, borderRadius: '50%' }} alt="" />
              <span style={{ fontSize: '1.5em', color: '#6a3faa' }}>→</span>
              <img src="cards/0010.png" style={{ width: 72, borderRadius: '50%' }} alt="" />
            </div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 22, lineHeight: 1.75, fontSize: '0.95em' }}>
              <li>Blue swirl at top in both → <strong>cancels</strong></li>
              <li>Red triskelion: bottom-left (left card) + bottom-right (middle card) → <strong>top</strong></li>
            </ul>
            <p style={{ margin: '10px 0 0', fontSize: '0.9em', color: '#555', lineHeight: 1.6 }}>
              The remaining two cards on this line are found by rotating one of the cards 120° (or 240°)
              and applying the same rule again.
            </p>
          </div>

          {/* Modes */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderTop: '1px solid #ccc' }}>
                <td style={{ padding: '8px 12px 8px 0', fontWeight: 700, whiteSpace: 'nowrap', verticalAlign: 'top' }}>Easy · Medium · Hard</td>
                <td style={{ padding: '8px 0', lineHeight: 1.55 }}>
                  25 · 20 · 15 cards dealt from a shuffled deck. Take sets of 3–5 matching cards to score:
                  3 cards = 1 pt, 4 = 3 pts, 5 = 6 pts. Matched cards are replaced. Press <strong>Hint!</strong> to
                  check whether any match exists.
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px 12px 8px 0', fontWeight: 700, whiteSpace: 'nowrap', verticalAlign: 'top' }}>Spread</td>
                <td style={{ padding: '8px 0', lineHeight: 1.55 }}>
                  All 85 cards are dealt at once. Find all 17 complete lines of 5 that partition every card
                  exactly once. Sets are taken automatically when 5 matching cards are selected.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <style jsx global>{`
        body {
          text-align: center;
          font-family: -apple-system, sans-serif;
        }
        .container {
          width: 90%;
          margin: 0 auto;
        }
        button {
          background: #6a3faa;
          border-radius: 4px;
          font-weight: 700;
          color: #fff;
          border: none;
          padding: 7px 15px;
          margin-left: 8px;
          cursor: pointer;
        }
        button:hover { background: #4e2d80; }
        button:focus { outline: 0; }

        #game { margin-top: 12px; }
        h1 { margin: 4px 0 10px; }

        #cards {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: 0 auto;
          width: 310px;
        }
        .card {
          position: relative;
          width: 56px;
          height: 56px;
          margin: 4px;
        }
        .c {
          position: absolute;
          top: 0; left: 0;
          width: 56px;
          height: 56px;
          cursor: pointer;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          will-change: transform, opacity;
        }
        .back {
          background-color: #5b3691;
        }
        .front {
          background-color: transparent;
          transition: box-shadow 0.12s ease;
        }

        @media only screen and (min-width: 400px) {
          #cards { width: 380px; }
          .card { width: 68px; height: 68px; margin: 4px; }
          .c { width: 68px; height: 68px; }
        }
        @media only screen and (min-width: 520px) {
          #cards { width: 510px; }
          .card { width: 92px; height: 92px; margin: 5px; }
          .c { width: 92px; height: 92px; }
        }
        @media only screen and (min-width: 700px) {
          #cards { width: 630px; }
          .card { width: 116px; height: 116px; margin: 6px; }
          .c { width: 116px; height: 116px; }
        }
        @media only screen and (min-width: 900px) {
          #cards { width: 780px; }
          .card { width: 144px; height: 144px; margin: 6px; }
          .c { width: 144px; height: 144px; }
        }

        #match {
          margin-top: 16px;
        }
        .match {
          background: #6a3faa;
          border-radius: 10px;
          font-weight: 1000;
          font-size: 1.2em;
          color: #fff;
          border: none;
          padding: 14px 24px;
          margin: 0 8px;
          cursor: pointer;
        }
        .match:hover { background: #4e2d80; }

        .row::after { content: ""; clear: both; display: table; }
        [class*="col-"] { float: left; padding: 10px; width: 100%; }
        @media only screen and (min-width: 560px) {
          .col-3 { width: 25%; }
          .col-4 { width: 33.33%; }
          .col-5 { width: 41.66%; }
        }
        img { max-width: 100%; height: auto; }

        /* Spread mode: 64px cards, column count grows with viewport */
        #cards.spread { width: 288px; }
        #cards.spread .card { width: 64px; height: 64px; margin: 4px; }
        #cards.spread .c { width: 64px; height: 64px; }
        @media only screen and (min-width: 400px) {
          #cards.spread { width: 360px; }
        }
        @media only screen and (min-width: 520px) {
          #cards.spread { width: 504px; }
        }
        @media only screen and (min-width: 700px) {
          #cards.spread { width: 648px; }
        }
        @media only screen and (min-width: 900px) {
          #cards.spread { width: 864px; }
        }
      `}</style>
    </div>
  );
}
