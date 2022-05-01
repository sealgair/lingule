import React from 'react';
import './App.css';


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
        }
    }

    render() {
        return (
            <div className="Container">
                <header className="Header">Lingule</header>
                <Word word={this.state.word} ipa={this.state.ipa} meaning={this.state.meaning}/>
                <div className="Body">
                    <Guesses server={this.server} wordNumber={this.state.wordNumber} solution={this.state.solution}/>
                </div>
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
        this.state = {guess: null, guesses: [], done: false};
        this.onSelect = this.onSelect.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.makeGuess = this.makeGuess.bind(this);
        this.shareScore = this.shareScore.bind(this);
    }

    onSelect(guess) {
        this.setState({
            guess: guess,
            done: guess.success,
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
                    this.setState({
                        guesses: guesses,
                        done: result.success,
                        guess: null,
                    });
                    this.trigger('submit');
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    shareScore() {
        let score = this.state.guesses.map(guess => guess.hint);
        score.splice(0, 0, "#Lingule #"+this.props.wordNumber+": "+this.state.guesses.length+"/6");
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
            return (
                <div className="Guesses">
                    <ul>{list}</ul>
                    <button tabIndex="0" autoFocus className="Guess Share" onClick={this.shareScore}>Share</button>
                </div>
            );
        } else {
            return (
                <div className="Guesses" onKeyDown={this.handleKey}>
                    <ul>{list}</ul>
                    <Lookup server={this.server} onSelect={this.onSelect} key={this.state.guesses.length}/>
                    <button tabIndex="0" className="MakeGuess Guess" onClick={this.makeGuess} disabled={!this.state.guess}>Guess</button>
                </div>
            );
        }
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
        if (event.code === "Enter") {
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

export default App;
