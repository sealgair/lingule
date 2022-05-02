import React from 'react';
import './App.css';

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getData(key) {
    let value = localStorage.getItem(key);
    try {
        value = JSON.parse(value);
    } catch {
    }
    return value;
}

class ServerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.server = props.server || "http://localhost:8000"
    }
}

class App extends ServerComponent {
    constructor(props) {
        super(props);
        this.state = {
            word: "lingule",
            ipa: "ˈlɪŋ.ɡwəl",
            meaning: "a fun language game",
            stats: false,
        }

        this.openStats = this.openStats.bind(this);
        this.closeStats = this.closeStats.bind(this);
    }

    openStats() {
        this.setState({stats: true});
    }

    closeStats() {
        this.setState({stats: false});
    }

    render() {
        let stats = "";
        if (this.state.stats) {
            stats = <Statistics onClose={this.closeStats}/>;
        }
        return (
            <div className="Container">
                <header className="Header">
                    <span className="Help Icon">❓</span>
                    <h1>Lingule</h1>
                    <span className="Stats Icon" onClick={this.openStats}>📊</span>
                </header>
                <Word word={this.state.word} ipa={this.state.ipa} meaning={this.state.meaning}/>
                <div className="Body">
                    <Guesses server={this.server} wordNumber={this.state.wordNumber} key={this.state.wordNumber}
                             solution={this.state.solution} answer={this.state.answer}/>
                </div>
                {stats}
            </div>
        );
    }

    componentDidMount() {
        fetch(this.server + "/solution/word.json", {
            crossDomain: true,
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        solution: result.id,
                        word: result.word,
                        ipa: result.ipa,
                        meaning: result.meaning,
                        wordNumber: result.order,
                        answer: result.answer,
                    });
                },
                (error) => {
                    console.log(error);
                }
            )
    }
}

class Word extends React.Component {

    render() {
        return (
            <div className="WordContainer">
                <div id="word" title="mystery word">{this.props.word}</div>
                <div id="ipa" title="ipa pronunciation guide">{this.props.ipa}</div>
                <div id="meaning" title="english translation">{this.props.meaning}</div>
            </div>
        )
    }
}

class Guesses extends ServerComponent {

    constructor(props, context) {
        super(props, context);
        let done = false;
        let success = false;
        let guesses = [];
        if (this.props.wordNumber) {
            let data = getData('guesses' + this.props.wordNumber);
            if (Array.isArray(data)) {
                guesses = data;
                success = guesses[guesses.length - 1].success;
                done = success || guesses.length >= 6;
            }
        }
        this.state = {
            guess: null,
            guesses: guesses,
            done: done,
            success: success,
        };
        this.onSelect = this.onSelect.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.makeGuess = this.makeGuess.bind(this);
        this.shareScore = this.shareScore.bind(this);
    }

    onSelect(guess) {
        this.setState({
            guess: guess,
            done: guess ? guess.success : false,
        });
    }

    handleKey(event) {
        if (this.state.guess && event.code === "Enter" && event.target.classList.contains("Lookup")) {
            this.makeGuess();
            event.preventDefault();
        }
    }

    makeGuess() {
        const params = new URLSearchParams({
            language: this.state.guess.id,
            solution: this.props.solution,
        }).toString();
        fetch(this.server + "/solution/guess.json?" + params, {
            crossDomain: true,
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => res.json())
            .then(
                (result) => {
                    let guesses = this.state.guesses;
                    guesses.push(result);
                    let done = result.success || guesses.length >= 6;
                    this.setState({
                        guesses: guesses,
                        done: done,
                        success: result.success,
                        guess: null,
                        sid: result.sid,
                    });
                    if (this.props.wordNumber) {
                        setData('guesses' + this.props.wordNumber, this.state.guesses);
                        if (done) {
                            let scores = getData('scores') || {};
                            if (result.success) {
                                scores[this.props.wordNumber] = guesses.length;
                            } else {
                                scores[this.props.wordNumber] = 'X';
                            }
                            setData('scores', scores);
                        }
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    shareScore() {
        let guessNum = this.state.success ? this.state.guesses.length : 'X';
        let score = this.state.guesses.map(guess => guess.hint);
        score.splice(0, 0, "#Lingule #" + this.props.wordNumber + ": " + guessNum + "/6");
        score.push(document.URL);
        navigator.clipboard.writeText(score.join("\n")).then(() => {
            alert("Copied score to clipboard");
        });
    }

    render() {
        const numbers = [0, 1, 2, 3, 4, 5];
        const self = this;
        const list = numbers.map(function (n) {
            const guess = self.state.guesses[n];
            if (guess) {
                return (
                    <li className="Guess Tried" key={n} value={n}>
                        <span className="Language">{guess.language}</span>
                        <span className="Hint">{guess.hint}</span>
                    </li>
                );
            } else {
                return (<li className="Guess" key={n} value={n}/>);
            }
        });
        if (this.state.done) {
            let shareClass = "Guess Share";
            let lookup = "";
            if (!self.state.success) {
                lookup = <Solution answer={this.props.answer}/>
                shareClass += " Fail";
            }

            return (
                <div className="Guesses">
                    <ul>{list}</ul>
                    {lookup}
                    <button tabIndex="0" autoFocus className={shareClass} onClick={this.shareScore}>Share</button>
                </div>
            );
        } else {
            return (
                <div className="Guesses" onKeyDown={this.handleKey}>
                    <ul>{list}</ul>
                    <Lookup server={this.server} onSelect={this.onSelect} key={this.state.guesses.length}/>
                    <button tabIndex="0" className="MakeGuess Guess" onClick={this.makeGuess}
                            disabled={!this.state.guess}>Guess
                    </button>
                </div>
            );
        }
    }
}

class Solution extends ServerComponent {

    render() {
        return (
            <div className="LookupWrapper">
                <input type="text" className="Guess Lookup" disabled value={this.props.answer}/>
            </div>
        )
    }
}

class Lookup extends ServerComponent {

    constructor(props) {
        super(props);
        this.languages = [];
        this.state = {value: "", selected: 0};

        this.handleKeypress = this.handleKeypress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.selectLang = this.selectLang.bind(this);
    }

    handleKeypress(event) {
        let selected = this.state.selected;
        let langs = this.filteredLangs();
        let lcount = langs.length;
        if (event.code === "ArrowUp") {
            selected -= 1;
            if (selected < 0) {
                selected += lcount;
            }
        } else if (event.code === "ArrowDown") {
            selected += 1;
            if (selected >= lcount) {
                selected -= lcount;
            }
        }
        this.setState({selected: selected});
        if (event.code === "Enter" && this.state.value) {
            let lang = langs[selected];
            this.selectLang(lang);
        }
    }

    handleChange(event) {
        this.guessId = null;
        this.setState({value: event.target.value});
        this.props.onSelect();
    }

    handleSelect(event) {
        this.selectLang({id: event.target.value, name: event.target.textContent});
    }

    selectLang(lang) {
        this.guessId = lang.id;
        this.setState({value: lang.name});
        this.props.onSelect(lang);
    }

    filteredLangs() {
        const patterns = this.state.value.split(" ").map(t => new RegExp('\\b' + t, 'gi'));
        return this.languages.filter(lang => patterns.reduce(
            (p, pat) => p && lang.name.match(pat),
            true
        ));
    }

    render() {
        let filtered = "";
        if (!this.guessId && this.state.value) {
            const self = this;
            let list = this.filteredLangs().map(function (lang, i) {
                let classes = "Lang";
                if (i === self.state.selected) {
                    classes += " Selected";
                }
                return (
                    <li className={classes} key={lang.id} value={lang.id} onClick={self.handleSelect}>
                        {lang.name}
                    </li>);
            });
            filtered = (
                <ul className="LangList">
                    {list}
                </ul>
            )
        }
        return (
            <div className="LookupWrapper">
                <input type="text" className="Guess Lookup" autoFocus
                       placeholder="What language is it?" value={this.state.value}
                       onChange={this.handleChange} onKeyDown={this.handleKeypress}/>
                {filtered}
            </div>
        )
    }

    componentWillUnmount() {
        this.languages = [];
    }

    componentDidMount() {
        fetch(this.server + "/language/all.json", {
            crossDomain: true,
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.languages = result;
                },
                (error) => {
                    console.log(error);
                }
            );
    }
}

class Statistics extends React.Component {

    constructor(props, context) {
        super(props, context);
        const scores = getData('scores') || {};
        this.games = Object.keys(scores).length;
        this.wins = 0;
        this.maxScore = 0;
        this.scores = {};
        const self = this;
        Object.values(scores).forEach(function (s) {
            let c = self.scores[s] || 0;
            self.scores[s] = c + 1;
            self.maxScore = Math.max(self.maxScore, self.scores[s]);
            if (s != 'X') {
                self.wins += 1;
            }
        });
        // TODO: streaks
        this.cStreak = 0;
        this.mStreak = 0;

        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        if (event.target.classList.contains("Close") || event.target.classList.contains("StatsOverlay")) {
            this.props.onClose(event);
        }
    }

    render() {
        let distribution = <h4>No Data</h4>;
        if (this.scores) {
            const scores = [1, 2, 3, 4, 5, 6]
                .map(s => this.scores[s] || 0)
                .map((s, i) =>
                    <li style={{width: (s/this.maxScore * 100) + '%'}} key={i}>
                        <div className="GraphLabel">{s}</div>
                    </li>
                );
            distribution = (
                <ol className="Distribution">
                    {scores}
                </ol>
            )
        }
        return (
            <div className="StatsOverlay" onClick={this.onClick}>
                <div className="StatsContainer" onClick={e => e.preventDefault()}>
                    <h1>Statistics</h1> <span className="Close">Ⓧ</span>
                    <hr/>
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
            </div>
        )
    }
}

export default App;
