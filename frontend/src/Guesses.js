import ServerComponent from "./ServerComponent";
import {directions, getData, isTouchOnly, setData} from "./utils";
import Share from "./Share";
import Map from "./Map";
import ReactMarkdown from "react-markdown";
import React from "react";
import Lookup from "./Lookup";

class Guesses extends ServerComponent {

    constructor(props, context) {
        super(props, context);
        let done = false;
        let success = false;
        let guesses = [];
        if (this.props.word) {
            let data = getData('guess' + this.props.word.order);
            if (Array.isArray(data)) {
                guesses = data;
                success = guesses[guesses.length - 1].success;
                done = success || guesses.length >= 6;
            }
        }
        this.state = {
            guess: null,
            guesses: guesses,
            guessing: false,
            done: done,
            success: success,
            mapGuess: null,
            knowsMaps: getData("knowsMaps", false),
        };
        this.onSelect = this.onSelect.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.makeGuess = this.makeGuess.bind(this);
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
        if (this.state.guessing) {
            return;
        }
        const params = new URLSearchParams({
            language: this.state.guess.id,
            solution: this.props.word.id,
        }).toString();
        this.setState({'guessing': true});
        this.fetch("/solution/guess.json?" + params,
            (result) => {
                let guesses = this.state.guesses;
                guesses.push(result);
                let done = result.success || guesses.length >= 6;
                this.setState({
                    guesses: guesses,
                    guessing: false,
                    done: done,
                    success: result.success,
                    guess: null,
                    sid: result.sid,
                    mapGuess: null,
                });
                if (this.props.word.order) {
                    setData('guess' + this.props.word.order, this.state.guesses);
                    if (done) {
                        let scores = getData('scores') || {};
                        let score;
                        if (result.success) {
                            score = guesses.length;
                        } else {
                            score = 'X';
                        }
                        if (!getData('allowMaps', true)) {
                            score = score + "*";
                        }
                        scores[this.props.word.order] = score;
                        setData('scores', scores);
                    }
                }
            },
            (error) => {
                this.setState({guessing: false});
            }
        );
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.knowsMaps !== prevState.knowsMaps) {
            setData("knowsMaps", this.state.knowsMaps);
        }
    }

    render() {
        const ariaHints = {
            [true]: 'correct',
            [false]: 'incorrect',
        }
        const mapAllowed = getData("allowMaps", true);
        const numbers = [0, 1, 2, 3, 4, 5];
        const guesses = numbers.map(n => this.state.guesses[n] || false);
        const self = this;
        const data = guesses.map(function (guess, n) {
            if (guess) {
                let arrow = <i className="fa-solid fa-trophy">trophy</i>;
                let direction = "you got it!";
                if (!guess.hint.language) {
                    direction = directions[Math.round(guess.hint.bearing / 22.5)];
                    arrow = <i className="fa-solid fa-arrow-up"
                               style={{transform: `rotate(${guess.hint.bearing}deg)`}}>arrow</i>
                }
                return (
                    <tr className="Guess Hints" key={n} aria-live="polite">
                        <td className="Description">
                            {`guess ${n} out of 6: ${guess.language} was ${ariaHints[guess.hint.language]}`}
                        </td>
                        <td className="ToolTip" data-value={guess.hint.macroarea} title={guess.macroarea}>
                            <span className="Description">
                                {ariaHints[guess.hint.macroarea]}
                            </span>
                        </td>
                        <td className="ToolTip" data-value={guess.hint.family} title={guess.family}>
                            <span className="Description">{ariaHints[guess.hint.family]}</span>
                        </td>
                        <td className="ToolTip" data-value={guess.hint.subfamily} title={guess.subfamily}>
                            <span className="Description">{ariaHints[guess.hint.subfamily]}</span>
                        </td>
                        <td className="ToolTip" data-value={guess.hint.genus} title={guess.genus}>
                            <span className="Description">{ariaHints[guess.hint.genus]}</span>
                        </td>
                        <td className="Language" data-value={guess.hint.language}>
                            {guess.language}
                            <span className="Description">{`(${ariaHints[guess.hint.language]})`}</span>
                        </td>
                        <td className="Direction ToolTip" data-value={guess.hint.language} title={direction}
                            onClick={event => (
                                mapAllowed &&
                                !self.state.done &&
                                !guess.hint.language &&
                                self.setState({mapGuess: guess})
                            )}>
                            <span className="Description">{guess.hint.language ? "trophy" : "arrow"}</span>
                            {arrow}
                        </td>
                    </tr>
                );
            } else {
                return (<tr className="Guess Empty" key={n}>
                    <td className="Description"/>
                    <td colSpan="6"/>
                </tr>);
            }
        });

        let lookup = "";
        let button = "";
        let message = "";
        if (this.state.done) {
            if (this.state.success) {
                message = this.props.word.victory_message;
            } else {
                lookup = <Solution answer={this.props.word.answer}/>
                message = this.props.word.failure_message;
            }
            button = <Share success={this.state.success} guesses={this.state.guesses}
                            word={this.props.word}/>;
        } else {
            lookup = <Lookup onSelect={this.onSelect} key={this.state.guesses.length}
                             hiddenOptions={this.props.word.hidden_options}/>;
            button = <button tabIndex="0" className="MakeGuess Guess" onClick={this.makeGuess}
                             disabled={this.state.guessing || !this.state.guess}>Guess</button>;
        }
        let map = ""
        if (this.state.mapGuess) {
            let guess = this.state.mapGuess;
            map = <div className="MapWrapper" role="image" aria-hidden={this.state.mapGuess ? "false" : "true"}
                       style={{
                           height: this.state.mapGuess ? 300 : 0
                       }}>
                <span className="MapClose" onClick={e => this.setState({mapGuess: null})} key="close">
                    <span className="Description">close</span>
                    <i className="fa-solid fa-circle-xmark"></i>
                </span>
                <Map key="map" latitude={guess.latitude} longitude={guess.longitude} bearing={guess.hint.bearing}
                     width={300} height={300}/>
            </div>
        }
        let showTip = mapAllowed && !this.state.done && this.state.guesses.length > 0 && !this.state.knowsMaps;
        let touchVerb = isTouchOnly() ? "Tap" : "Click";
        let mapTip = <div className="MapTip" aria-hidden={showTip ? "false" : "true"} aria-label="polite"
                          style={{
                              opacity: showTip ? 1 : 0
                          }}>{touchVerb} on the arrows to see a map</div>;
        if (showTip) {
            setTimeout(() => this.setState({knowsMaps: true}), 5000);
        }

        return (
            <div className={(mapAllowed && !this.state.done ? "Maps " : "") + "GuessWrapper"}>
                <table className="Guesses" aria-rowcount={this.state.guesses.length + 1}
                       aria-label={`guesses (${this.state.guesses.length} out of 6 made)`}>
                    <thead>
                    <tr className="GuessColumns">
                        <th className="Description">Guess Result</th>
                        <th className="HintIcon ToolTip" data-title="Macro-Area">
                            <span className="Description">Macro-Area of guessed language</span>
                            <i className="fa-solid fa-earth-asia"></i>
                        </th>
                        <th className="HintIcon ToolTip" data-title="Language Family">
                            <span className="Description">Language Family of guessed language</span>
                            <i className="fa-solid fa-mountain-sun"></i>
                        </th>
                        <th className="HintIcon ToolTip" data-title="Sub-Family">
                            <span className="Description">Sub-Family of guessed language</span>
                            <i className="fa-solid fa-mountain"></i>
                        </th>
                        <th className="HintIcon ToolTip" data-title="Genus">
                            <span className="Description">Genus of guessed language</span>
                            <i className="fa-solid fa-mound"></i>
                        </th>
                        <th className="HintIcon Language ToolTip" data-title="Language">
                            <span className="Description">Name of guessed language</span>
                            <i className="fa-regular fa-comments"></i>
                        </th>
                        <th className="HintIcon ToolTip" data-title="Map Direction">
                            {mapTip}
                            <span className="Description">
                                Compass direction from guessed language to target language
                            </span>
                            <i className="fa-regular fa-compass"></i>
                        </th>
                    </tr>
                    </thead>
                    <tbody>{data}</tbody>
                </table>
                <div className="LookupSection" onKeyDown={this.handleKey}>
                    {lookup}
                    {button}
                </div>
                {map}
                <div className="Message" aria-live="polite">
                    <ReactMarkdown>{message}</ReactMarkdown>
                </div>
            </div>
        );
    }
}

class Solution extends React.Component {
    render() {
        return (
            <div className="LookupWrapper" aria-live="polite">
                <input type="text" className="Guess Lookup" aria-label="correct answer"
                       disabled value={this.props.answer}/>
            </div>
        )
    }
}

export default Guesses;