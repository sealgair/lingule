import React from 'react';
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            word: "lingule",
            ipa: "ˈlɪŋ.ɡwəl",
            meaning: "a fun language game",
        }
        this.server = "http://localhost:8000"
    }

    render() {
        return (
            <div className="Container">
                <header className="Header">Lingule</header>
                <Word word={this.state.word} ipa={this.state.ipa} meaning={this.state.meaning}/>
                <div className="Body">
                    <Guesses/>
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
                <div id="word">{this.props.word}</div>
                <div id="ipa">{this.props.ipa}</div>
                <div id="meaning">{this.props.meaning}</div>
            </div>
        )
    }
}

function Guesses() {
    const numbers = [1, 2, 3, 4, 5, 6];
    const list = numbers.map((n) =>
        <li className="Guess" value={n}/>
    );
    return (
        <div className="Guesses">
            <ul>
                {list}
            </ul>
            <Lookup/>
        </div>
    );
}

function Lookup() {
    return (
        <input type="text" className="Guess Lookup" placeholder="Language..."/>
    )
}

export default App;
