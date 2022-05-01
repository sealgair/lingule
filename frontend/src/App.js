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
                    <Guesses server={this.server} solution={this.state.solution}/>
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
        this.makeGuess = this.makeGuess.bind(this);
    }

    onSelect(guess) {
        this.setState({
            guess: guess
        });
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
                    });
                },
                (error) => {
                    console.log(error);
                }
            );
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
        let guessName = ""
        if (this.state.guess) {
            guessName = this.state.guess.name;
        }
        return (
            <div className="Guesses">
                <ul>
                    {list}
                </ul>
                <Lookup server={this.server} value={guessName} onSelect={this.onSelect}/>
                <button className="MakeGuess Guess" onClick={this.makeGuess} disabled={!this.state.guess}>Guess</button>
            </div>
        );
    }
}

class Lookup extends ServerComponent {

    constructor(props) {
        super(props);
        this.languages = {};
        this.state = {value: props.value};

        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.guessId = null;
        this.setState({value: event.target.value});
        this.props.onSelect();
    }

    handleSelect(event) {
        this.guessId = event.target.value;
        const name = event.target.textContent;
        this.setState({value: name});
        this.props.onSelect({id: this.guessId, name: name});
    }

    handleSubmit(event) {
        // TODO: make best guess from filtered?
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
            let list = this.filteredLangs().map(lang =>
                <li className="Lang" key={lang.id} value={lang.id} onClick={this.handleSelect}>{lang.name}</li>
            );
            filtered = (
                <ul className="LangList">
                    {list}
                </ul>
            )
        }
        return (
            <div className="LookupWrapper">
                <input type="text" className="Guess Lookup" placeholder="What language is it?" value={this.state.value}
                       onChange={this.handleChange}/>
                {filtered}
            </div>
        )
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
