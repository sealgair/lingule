import React from "react";
import {getData, plural} from "./utils";
import ModalComponent from "./ModalComponent";

const FIRST_EASY = 11;

class Statistics extends ModalComponent {

    constructor(props, context) {
        super(props, context);
        const scores = getData('scores') || {};
        this.title = "Statistics"
        this.games = Object.keys(scores).length;
        this.wins = 0;
        this.hardWins = 0;
        this.maxScore = 0;
        this.scores = {};
        const self = this;

        // Calculate streaks
        this.cStreak = 0;
        this.mStreak = 0;

        Object.values(scores).forEach(function (s, i) {
            let hard = s.toString().endsWith("*");
            if (hard) {
                s = s.substring(0, s.length - 1);
            }
            let won = s !== 'X';
            if (won) {
                s = parseInt(s);
            }
            let c = self.scores[s] || 0;
            self.scores[s] = c + 1;
            self.maxScore = Math.max(self.maxScore, self.scores[s]);
            if (won) {
                self.wins += 1;
                if (hard || i < FIRST_EASY) {
                    self.hardWins += 1;
                }
            }
            if (s === 'X') {
                self.cStreak = 0;
            } else {
                self.cStreak += 1;
            }
            self.mStreak = Math.max(self.cStreak, self.mStreak);
        });

        this.onClick = this.onClick.bind(this);
    }

    contents() {
        let distribution = <h4>No Data</h4>;
        if (Object.keys(this.scores).length > 0) {
            const scores = [1, 2, 3, 4, 5, 6]
                .map(s => this.scores[s] || 0)
                .map((s, i) =>
                    <li style={{width: (s / this.maxScore * 100) + '%'}} key={i}
                        aria-label={`${s} game${plural(s, '', 's')} in ${i + 1} guess${plural(i + 1, '', 'es')}`}>
                        <div className="GraphLabel" aria-hidden="true">{s}</div>
                    </li>
                );
            distribution = (
                <ol className="Distribution" aria-label="Score distribution">
                    {scores}
                </ol>
            )
        }
        return (
            <div>
                <div className="StatsList">
                    <div className="StatBox">
                        <span className="Stat">{this.games}</span>
                        <span className="StatLabel">Games</span>
                    </div>
                    <div className="StatBox">
                        <span className="Stat">{this.wins}</span>
                        <span className="StatLabel">Wins</span>
                    </div>
                    <div className="StatBox">
                        <span className="Stat">{this.hardWins}</span>
                        <span className="StatLabel">Hard Wins</span>
                    </div>
                    <div className="StatBox">
                        <span className="Stat">{this.cStreak}</span>
                        <span className="StatLabel">Current Streak</span>
                    </div>
                    <div className="StatBox">
                        <span className="Stat">{this.mStreak}</span>
                        <span className="StatLabel">Max Streak</span>
                    </div>
                </div>
                <h2>Guess Distribution</h2>
                <hr/>
                {distribution}
            </div>
        )
    }
}

export default Statistics