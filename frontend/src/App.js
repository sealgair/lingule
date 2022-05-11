import React from 'react';
import './App.css';

const directions = [
    "north",
    "north-northeast",
    "northeast",
    "east-northeast",
    "east",
    "east-southeast",
    "southeast",
    "south-southeast",
    "south",
    "south-southwest",
    "southwest",
    "west-southwest",
    "west",
    "west-northwest",
    "northwest",
    "north-northwest",
    "north",
];

function isTouchOnly() {
    return window.matchMedia("(any-hover: none)").matches;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

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

function inClass(element, className) {
    if (element.classList.contains(className)) {
        return true;
    }
    if (element.parentElement) {
        return inClass(element.parentElement, className);
    }
    return false;
}

class ServerComponent extends React.Component {
    constructor(props) {
        super(props);
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            // development build code
            this.server = props.server || "http://" + window.location.host.split(':')[0] + ":8000";
            this.crossDomain = true;
        } else {
            // production build code
            this.server = props.server || "";
            this.crossDomain = false;
        }
        this.fetch = this.fetch.bind(this);
    }

    fetch(url, success, fail) {
        let headers = {};
        if (this.crossDomain) {
            headers = {
                crossDomain: true,
                headers: {'Content-Type': 'application/json'},
            };
        }
        fetch(this.server + url, headers)
            .then(res => res.json())
            .then(
                (result) => {
                    success(result)
                },
                (error) => {
                    if (fail) {
                        fail(error);
                    } else {
                        console.log(error);
                    }
                }
            );
    }
}

class App extends ServerComponent {
    constructor(props) {
        super(props);
        this.state = {
            word: "lingule",
            ipa: "/ˈlɪŋ.ɡwəl/",
            meaning: "a fun language game",
            modal: null,
        }

        this.openInfo = this.openInfo.bind(this);
        this.openHelp = this.openHelp.bind(this);
        this.openStats = this.openStats.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openInfo() {
        this.setState({modal: "info"});
    }

    openHelp() {
        this.setState({modal: "help"});
    }

    openStats() {
        this.setState({modal: "stats"});
    }

    closeModal() {
        this.setState({modal: null});
    }

    render() {
        let modal = "";
        if (this.state.modal === "stats") {
            modal = <Statistics onClose={this.closeModal}/>;
        } else if (this.state.modal === "help") {
            modal = <HowTo onClose={this.closeModal}/>;
        } else if (this.state.modal === "info") {
            modal = <Info onClose={this.closeModal}/>;
        }
        let font = "";
        if (this.state.font) {
            let fontFace = [
                "@font-face {",
                "font-family: \"NotoSans Script\";",
                "src: url(\"" + this.state.font + "\")",
                "}"
            ]
            font = <style>{fontFace.join("\n")}</style>
        }
        return (
            <div className="Container">
                {font}
                <div className="MainColumn">
                    <div className="Buffer"/>
                    <div className="ContentWrapper">
                        <header className="Header">
                            <span className="IconSet Left">
                                <span className="Help Icon TipBelow" title="How To Play" onClick={this.openHelp}>
                                    <i className="fa-solid fa-circle-question"></i>
                                </span>
                                <span className="Info Icon TipBelow" title="Credits" onClick={this.openInfo}>
                                    <i className="fa-solid fa-circle-info"></i>
                                </span>
                            </span>
                            <h1>Lingule</h1>
                            <span className="IconSet Right">
                                <span className="Stats Icon TipBelow" title="Score Data" onClick={this.openStats}>
                                    <i className="fa-solid fa-square-poll-horizontal"></i>
                                </span>
                            </span>
                        </header>
                        <Word word={this.state.word} romanization={this.state.romanization}
                              ipa={this.state.ipa} meaning={this.state.meaning}/>
                        <div className="Body">
                            <Guesses wordNumber={this.state.wordNumber} key={this.state.wordNumber}
                                     solution={this.state.solution} answer={this.state.answer}/>
                        </div>
                    </div>
                </div>
                {modal}
            </div>
        );
    }

    componentDidMount() {
        this.fetch("/solution/word.json?tz=" + new Date().getTimezoneOffset(),
            (result) => {
                this.setState({
                    solution: result.id,
                    word: result.word,
                    romanization: result.romanization,
                    font: result.font,
                    ipa: result.ipa,
                    meaning: result.meaning,
                    wordNumber: result.order,
                    answer: result.answer,
                });
            });
    }
}

class Word extends React.Component {
    render() {
        let romanization = "";
        if (this.props.romanization) {
            romanization = <div id="romanization" className="ToolTip Side"
                                title="romanization">{this.props.romanization}</div>;
        }
        return (
            <div className="WordContainer">
                <div id="word" className="ToolTip Side" title="mystery word">{this.props.word}</div>
                {romanization}
                <div id="ipa" className="ToolTip Side" title="ipa pronunciation">{this.props.ipa}</div>
                <div id="meaning" className="ToolTip Side" title="english translation">{this.props.meaning}</div>
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
            let data = getData('guess' + this.props.wordNumber);
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
            shareName: "Share",
        };
        this.onSelect = this.onSelect.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.makeGuess = this.makeGuess.bind(this);
        this.shareScore = this.shareScore.bind(this);
        this.alertShare = this.alertShare.bind(this);
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
        this.fetch("/solution/guess.json?" + params,
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
                    setData('guess' + this.props.wordNumber, this.state.guesses);
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
        );
    }

    alertShare(newName) {
        this.setState({shareName: newName});
        setTimeout(() => this.setState({shareName: "Share"}), 3000);
    }

    shareScore() {
        const squares = {[true]: '🟩', [false]: '⬛️'};
        const arrows = ['⬆️', '↗️️', '➡️️', '↘️️️', '⬇️️', '↙️️️', '⬅️', '↖️️️️', '⬆️'];
        const guessNum = this.state.success ? this.state.guesses.length : 'X';
        let score = this.state.guesses.map(function(guess) {
            let hint = [
                squares[guess.hint.macroarea],
                squares[guess.hint.family],
                squares[guess.hint.subfamily],
                squares[guess.hint.genus],
                squares[guess.hint.language],
            ];
            if (guess.hint.language) {
                hint.push('🏆');
            } else {
                hint.push(arrows[Math.round(guess.hint.bearing/45)]);
            }
            return hint.join("");
        });
        score.splice(0, 0, "#Lingule #" + this.props.wordNumber + ": " + guessNum + "/6");
        score.push(document.URL);
        const data = score.join("\n");
        if (isTouchOnly() && navigator.share) {
            navigator.share({
                title: "Lingule",
                text: data,
            }).then(r => this.alertShare("Shared"));
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(data).then(r => this.alertShare("Copied"));
        } else {
            alert("Could not copy to clipboard, copy manually here:\n\n" + data);
        }
    }

    render() {
        const numbers = [0, 1, 2, 3, 4, 5];
        const guesses = numbers.map(n => this.state.guesses[n] || false);
        const data = guesses.map(function (guess, n) {
            if (guess) {
                let arrow = <i className="fa-solid fa-trophy"/>;
                let direction = "you got it!";
                if (!guess.hint.language) {
                    direction = directions[Math.round(guess.hint.bearing/22.5)];
                    arrow = <i className="fa-solid fa-arrow-up" style={{transform: "rotate("+guess.hint.bearing+"deg)"}}/>
                }
                return (
                    <tr className="Guess Hints" key={n}>
                        <td className="ToolTip" data-value={guess.hint.macroarea} title={guess.macroarea}/>
                        <td className="ToolTip" data-value={guess.hint.family} title={guess.family}/>
                        <td className="ToolTip" data-value={guess.hint.subfamily} title={guess.subfamily}/>
                        <td className="ToolTip" data-value={guess.hint.genus} title={guess.genus}/>
                        <td className="Language" data-value={guess.hint.language}>{guess.language}</td>
                        <td className="Direction ToolTip" data-value={guess.hint.language} title={direction}>
                            {arrow}
                        </td>
                    </tr>
                );
            } else {
                return (<tr className="Guess Empty" key={n}>
                    <td colSpan="6"></td>
                </tr>);
            }
        });

        let lookup = "";
        let button = ""
        if (this.state.done) {
            let shareClass = "Guess Share";
            if (!this.state.success) {
                lookup = <Solution answer={this.props.answer}/>
                shareClass += " Fail";
            }
            button = <button tabIndex="0" autoFocus className={shareClass}
                             onClick={this.shareScore}>{this.state.shareName}</button>
        } else {
            lookup = <Lookup onSelect={this.onSelect} key={this.state.guesses.length}/>;
            button = <button tabIndex="0" className="MakeGuess Guess" onClick={this.makeGuess}
                             disabled={!this.state.guess}>Guess</button>;
        }
        if (lookup) {
            lookup = <tr>
                <td colSpan="6">
                    {lookup}
                </td>
            </tr>;
        }
        return (
            <div>
                <table className="Guesses" onKeyDown={this.handleKey}>
                    <thead>
                    <tr className="GuessColumns">
                        <th className="HintIcon ToolTip" title="Macro-Area">
                            <span className="Description">Macro-Area of guessed language</span>
                            <i className="fa-solid fa-earth-asia"></i>
                        </th>
                        <th className="HintIcon ToolTip" title="Language Family">
                            <span className="Description">Language Family of guessed language</span>
                            <i className="fa-solid fa-mountain-sun"></i>
                        </th>
                        <th className="HintIcon ToolTip" title="Sub-Family">
                            <span className="Description">Sub-Family of guessed language</span>
                            <i className="fa-solid fa-mountain"></i>
                        </th>
                        <th className="HintIcon ToolTip" title="Genus">
                            <span className="Description">Genus of guessed language</span>
                            <i className="fa-solid fa-mound"></i>
                        </th>
                        <th className="HintIcon Language ToolTip" title="Language">
                            <span className="Description">Name of guessed language</span>
                            <i className="fa-regular fa-comments"></i>
                        </th>
                        <th className="HintIcon ToolTip" title="Map Direction">
                            <span
                                className="Description">Compass direction from guessed langauge to target language</span>
                            <i className="fa-regular fa-compass"></i>
                        </th>
                    </tr>
                    </thead>
                    <tbody>{data}</tbody>
                    <tfoot>
                    {lookup}
                    <tr>
                        <td colSpan="6">
                            {button}
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        );
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
        this.handleBlur = this.handleBlur.bind(this);
    }

    handleKeypress(event) {
        let selected = this.state.selected;
        let langs = this.filteredLangs();
        let lcount = langs.length;
        if (event.code === "ArrowDown") {
            selected -= 1;
            if (selected < 0) {
                selected += lcount;
            }
        } else if (event.code === "ArrowUp") {
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
        this.setState({value: event.target.value, selected: 0});
        this.props.onSelect();
    }

    handleSelect(event) {
        this.selectLang({id: event.target.value, name: event.target.textContent});
    }

    handleBlur(event) {
    }

    selectLang(lang) {
        if (lang) {
            this.guessId = lang.id;
            this.setState({value: lang.name});
            this.props.onSelect(lang);
        }
    }

    filteredLangs() {
        const patterns = this.state.value.split(" ").map(t => new RegExp('\\b' + escapeRegExp(t), 'gi'));
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
                <label htmlFor="guess-lookup">Look up language</label>
                <input id="guess-lookup" type="text" className="Guess Lookup" autoFocus
                       placeholder="What language is it?" value={this.state.value}
                       onBlur={this.handleBlur}
                       onChange={this.handleChange} onKeyDown={this.handleKeypress}/>
                {filtered}
            </div>
        )
    }

    componentWillUnmount() {
        this.languages = [];
    }

    componentDidMount() {
        this.fetch("/language/all.json",
            (result) => {
                this.languages = result;
            }
        );
    }
}

class ModalComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.title = "Modal"
        this.onClick = this.onClick.bind(this);
        this.contents = this.contents.bind(this);
    }

    onClick(event) {
        if (inClass(event.target, "Close") || event.target.classList.contains("Overlay")) {
            this.props.onClose(event);
        }
    }

    render() {
        return (
            <div className="Overlay" onClick={this.onClick}>
                <div className="ModalContainer">
                    <span className="Close">
                        <i className="fa-solid fa-circle-xmark"></i>
                    </span>
                    <h1>{this.title}</h1>
                    <hr/>
                    {this.contents()}
                </div>
            </div>
        )
    }

    contents() {
    }
}

class Info extends ModalComponent {
    constructor(props, context) {
        super(props, context);
        this.title = "Info";
    }

    contents() {
        return <div className="InfoContent">
            <p>This game was created by Chase Caster</p>
            <p><a href="https://github.com/sealgair/lingule" target="_new">See the code</a></p>
            <p><a href="https://twitter.com/ChaseCaster" target="_new">Tweet at me</a></p>
            <p><a href="https://weirder.earth/@chase" target="_new">Toot at me</a></p>
        </div>;
    }
}

class HowTo extends ModalComponent {
    constructor(props, context) {
        super(props, context);
        this.title = "How To Play";
    }

    contents() {
        return (
            <div>
                <p>Every day you'll get a new <span className="Title">Lingule</span>.</p>
                <Word word="target word" romanization="romanization"
                      ipa="/ipa pronunciation/" meaning="english translation"/>
                <p>After each guess, you'll see how close you got in 6 columns:</p>
                <ul className="HelpList">
                    <li>
                        <i className="fa-solid fa-earth-asia"></i>
                        Macro-Area (e.g. "North America" or "Eurasia")
                    </li>
                    <li>
                        <i className="fa-solid fa-mountain-sun"></i>
                        Language Family (e.g. "Indo-European" or "Afro-Asiatic")
                    </li>
                    <li>
                        <i className="fa-solid fa-mountain"></i>
                        Language Sub-Family (e.g. "Eastern Malayo-Polynesian" or "Benue-Congo")
                    </li>
                    <li>
                        <i className="fa-solid fa-mound"></i>
                        Language Genus (e.g. "Semitic" or "Romance")
                    </li>
                    <li>
                        <i className="fa-regular fa-comments"></i>
                        Language (Will only be green on the correct answer)
                    </li>
                    <li>
                        <i className="fa-regular fa-compass"></i>
                        Geographical direction from guess to target language
                    </li>
                </ul>
                <p>
                    Note that language isolates or near-isolates (e.g. Japanese, Georgian, Basque) will not match the
                    other languages except in macro-area.
                </p>
                <p>
                    Some words may exist in multiple closely-related languages. In those cases, any of those languages
                    will be accepted as the correct answer, but only if the word has the same spelling and meaning
                    (even if it is pronounced differently).
                </p>
                <p>
                    Direction is based on the (approximate) geographical point of origin of a language, even if
                    it is widely spoken. For example, the location for English is England, and Spanish is Spain.
                </p>
                <p>
                    All language data is supplied by <a href="https://wals.info/languoid" target="_new">The World
                    Atlas of Language Structures</a>
                </p>
            </div>
        )
    }
}

class Statistics extends ModalComponent {

    constructor(props, context) {
        super(props, context);
        const scores = getData('scores') || {};
        this.title = "Statistics"
        this.games = Object.keys(scores).length;
        this.wins = 0;
        this.maxScore = 0;
        this.scores = {};
        const self = this;
        Object.values(scores).forEach(function (s) {
            let c = self.scores[s] || 0;
            self.scores[s] = c + 1;
            self.maxScore = Math.max(self.maxScore, self.scores[s]);
            if (s !== 'X') {
                self.wins += 1;
            }
        });

        // Calculate streaks
        let minWord = Math.min(...Object.keys(scores));
        let maxWord = Math.max(...Object.keys(scores));
        this.cStreak = 0;
        this.mStreak = 0;
        let prev = null;
        for (let i = minWord - 1; i <= maxWord; i++) {
            prev = scores[i];
            if (prev && prev !== 'X') {
                this.cStreak += 1;
            } else {
                this.cStreak = 0;
            }
            this.mStreak = Math.max(this.cStreak, this.mStreak);
        }

        this.onClick = this.onClick.bind(this);
    }

    contents() {
        let distribution = <h4>No Data</h4>;
        if (Object.keys(this.scores).length > 0) {
            const scores = [1, 2, 3, 4, 5, 6]
                .map(s => this.scores[s] || 0)
                .map((s, i) =>
                    <li style={{width: (s / this.maxScore * 100) + '%'}} key={i}>
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

export default App;
