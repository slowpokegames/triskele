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
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'left', padding: '0 16px' }}>
          <h2 style={{ textAlign: 'center' }}>How to Play</h2>
          <p style={{ lineHeight: 1.65 }}>
            Each card carries colored symbols arranged at specific positions. A valid match is a set
            of <strong>3, 4, or 5 cards</strong> whose symbols all follow the same underlying line
            — there is a hidden geometric pattern connecting them. Click cards to select; they glow
            purple when they belong to a valid group. Clicking a card that doesn&apos;t fit the
            current selection rotates it 120° — use rotations to reveal new arrangements.
            Press <strong>Hint!</strong> to check whether any match is available.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <tbody>
              <tr style={{ borderTop: '1px solid #ccc' }}>
                <td style={{ padding: '8px 12px 8px 0', fontWeight: 700, whiteSpace: 'nowrap', verticalAlign: 'top' }}>Easy · Medium · Hard</td>
                <td style={{ padding: '8px 0', lineHeight: 1.55 }}>
                  25 · 20 · 15 cards dealt from a shuffled deck. Take sets of 3–5 matching cards to score:
                  3 cards&nbsp;=&nbsp;1&nbsp;pt, 4&nbsp;=&nbsp;3&nbsp;pts, 5&nbsp;=&nbsp;6&nbsp;pts.
                  Matched cards are replaced from the deck.
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #ccc' }}>
                <td style={{ padding: '8px 12px 8px 0', fontWeight: 700, whiteSpace: 'nowrap', verticalAlign: 'top' }}>Spread</td>
                <td style={{ padding: '8px 0', lineHeight: 1.55 }}>
                  All 85 cards are dealt at once. Find all 17 complete lines of 5 that together
                  cover every card exactly once. Sets of 5 are taken automatically when selected.
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

        /* Spread mode: 46px cards, column count grows with viewport */
        #cards.spread { width: 260px; }
        #cards.spread .card { width: 46px; height: 46px; margin: 3px; }
        #cards.spread .c { width: 46px; height: 46px; }
        @media only screen and (min-width: 400px) {
          #cards.spread { width: 364px; }
        }
        @media only screen and (min-width: 540px) {
          #cards.spread { width: 520px; }
        }
        @media only screen and (min-width: 700px) {
          #cards.spread { width: 676px; }
        }
        @media only screen and (min-width: 900px) {
          #cards.spread { width: 884px; }
        }
      `}</style>
    </div>
  );
}
