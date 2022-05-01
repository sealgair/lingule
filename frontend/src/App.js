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
                    <Guesses server={this.server}/>
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
                        solution_id: result.id,
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

class Guesses extends React.Component {
    render() {
        const numbers = [1, 2, 3, 4, 5, 6];
        const list = numbers.map((n) =>
            <li className="Guess" key={n} value={n}/>
        );
        return (
            <div className="Guesses">
                <ul>
                    {list}
                </ul>
                <Lookup server={this.server}/>
            </div>
        );
    }
}

class Lookup extends ServerComponent {

    constructor(props) {
        super(props);
        this.languages = {};
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        // TODO
    }

    render() {
        let filtered = "";
        if (this.state.value !== "") {
            const patterns = this.state.value.split(" ").map(t => new RegExp('\\b'+t, 'gi'));
            console.log(patterns);
            const matches = this.languages.filter(lang => patterns.reduce(
                (p, pat) => p && lang.name.match(pat),
                true
            ));
            let list = matches.map(lang =>
                <li className="Lang" key={lang.id} value={lang.id}>{lang.name}</li>
            );
            filtered = (
                <ul className="LangList">
                    {list}
                </ul>
            )
        }
        return (
            <div className="LookupWrapper">
                <input type="text" className="Guess Lookup" placeholder="What language is it?" onChange={this.handleChange}/>
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
            )
    }
}

export default App;
