import ServerComponent from "./ServerComponent";
import {directions, getData, isTouchOnly, setData} from "./utils";
import Share from "./Share";
import Map from "./Map";
import ReactMarkdown from "react-markdown";
import React from "react";
import Lookup from "./Lookup";
import {withTranslation} from "react-i18next";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NorthIcon from '@mui/icons-material/North';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import ExploreIcon from '@mui/icons-material/Explore';
import PersonIcon from '@mui/icons-material/Person';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

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
        this.mapRef = React.createRef();
        this.onSelect = this.onSelect.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.makeGuess = this.makeGuess.bind(this);
        this.onClick = this.onClick.bind(this);

        document.addEventListener("click", this.onClick);
    }

    onClick(event) {
        if (this.state.mapGuess) {
            if (!this.mapRef.current.contains(event.target)) {
                this.setState({mapGuess: null})
            }
        }
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
        const t = this.props.t;
        const lang = this.props.i18n.resolvedLanguage;
        const ariaHints = {
            [true]: t('guess.correct'),
            [false]: t('guess.incorrect'),
        }
        const mapAllowed = getData("allowMaps", true);
        const numbers = [0, 1, 2, 3, 4, 5];
        const guesses = numbers.map(n => this.state.guesses[n] || false);
        const self = this;
        const data = guesses.map(function (guess, n) {
            if (guess) {
                let arrow = <EmojiEventsIcon/>;
                let direction = "success";
                if (!guess.hint.language) {
                    direction = directions[Math.round(guess.hint.bearing / 22.5)];
                    arrow = <NorthIcon style={{transform: `rotate(${guess.hint.bearing}deg)`}}/>
                }
                return (
                    <tr className="Guess Hints" key={n} aria-live="polite">
                        <td className="Description">
                            {t("guess.description", {
                                guessNum: n,
                                language: guess.language,
                                correct: ariaHints[guess.hint.language],
                            })}
                        </td>
                        <td className="ToolTip" data-value={guess.hint.macroarea} title={guess.macroarea[lang] || guess.macroarea}>
                            <span className="Description">
                                {ariaHints[guess.hint.macroarea]}
                            </span>
                        </td>
                        <td className="ToolTip" data-value={guess.hint.family} title={guess.family[lang] || guess.family}>
                            <span className="Description">{ariaHints[guess.hint.family]}</span>
                        </td>
                        <td className="ToolTip" data-value={guess.hint.subfamily} title={guess.subfamily[lang] || guess.subfamily}>
                            <span className="Description">{ariaHints[guess.hint.subfamily]}</span>
                        </td>
                        <td className="ToolTip" data-value={guess.hint.genus} title={guess.genus[lang] || guess.genus}>
                            <span className="Description">{ariaHints[guess.hint.genus]}</span>
                        </td>
                        <td className="Language" data-value={guess.hint.language}>
                            {guess.language[lang] || guess.language}
                            <span className="Description">{`(${ariaHints[guess.hint.language]})`}</span>
                        </td>
                        <td className="Direction ToolTip" data-value={guess.hint.language} title={t('directions.'+direction)}
                            onClick={event => {
                                if (mapAllowed && !self.state.done && !guess.hint.language) {
                                    self.setState({mapGuess: guess});
                                    event.stopPropagation();
                                }
                            }}>
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
                lookup = <Solution answer={this.props.word.answer[lang] || this.props.word.answer}/>
                message = this.props.word.failure_message;
            }
            button = <Share success={this.state.success} guesses={this.state.guesses}
                            word={this.props.word}/>;
        } else {
            lookup = <Lookup onSelect={this.onSelect} key={this.state.guesses.length}
                             hiddenOptions={this.props.word.hidden_options}/>;
            button = <button tabIndex="0" className="MakeGuess Guess" onClick={this.makeGuess}
                             disabled={this.state.guessing || !this.state.guess}>{t('buttons.guess')}</button>;
        }
        let map = ""
        if (this.state.mapGuess) {
            let guess = this.state.mapGuess;
            map = <div className="MapWrapper" role="image" aria-hidden={this.state.mapGuess ? "false" : "true"}
                       ref={this.mapRef}
                       style={{
                           height: this.state.mapGuess ? 300 : 0
                       }}>
                <span className="MapClose" onClick={e => this.setState({mapGuess: null})} key="close">
                    <span className="Description">{t('buttons.close')}</span>
                    <HighlightOffIcon/>
                </span>
                <Map key="map" latitude={guess.latitude} longitude={guess.longitude} bearing={guess.hint.bearing}
                     width={300} height={300}/>
            </div>
        }
        let showTip = mapAllowed && !this.state.done && this.state.guesses.length > 0 && !this.state.knowsMaps;
        let mapTip = <div className="MapTip" aria-hidden={showTip ? "false" : "true"} aria-label="polite"
                          style={{
                              opacity: showTip ? 1 : 0
                          }}>{t("tips.mapPrompt", {context: isTouchOnly() ? "tap" : "click"})}</div>;
        if (showTip) {
            setTimeout(() => this.setState({knowsMaps: true}), 5000);
        }

        return (
            <div className={(mapAllowed && !this.state.done ? "Maps " : "") + "GuessWrapper"}>
                <table className="Guesses" aria-rowcount={this.state.guesses.length + 1}
                       aria-label={`guesses (${this.state.guesses.length} out of 6 made)`}>
                    <thead>
                    <tr className="GuessColumns">
                        <th className="Description">{t("guess.titles.result")}</th>
                        <th className="HintIcon ToolTip" data-title={t("tips.macro-area")}>
                            <span className="Description">{t("guess.titles.macro-area")}</span>
                            <PublicIcon/>
                        </th>
                        <th className="HintIcon ToolTip" data-title={t("tips.family")}>
                            <span className="Description">{t("guess.titles.family")}</span>
                            <GroupsIcon/>
                        </th>
                        <th className="HintIcon ToolTip" data-title={t("tips.sub-family")}>
                            <span className="Description">{t("guess.titles.sub-family")}</span>
                            <PeopleIcon/>
                        </th>
                        <th className="HintIcon ToolTip" data-title={t("tips.genus")}>
                            <span className="Description">{t("guess.titles.genus")}</span>
                            <PersonIcon/>
                        </th>
                        <th className="HintIcon Language ToolTip" data-title={t("tips.language")}>
                            <span className="Description">{t("guess.titles.name")}</span>
                            <RecordVoiceOverIcon/>
                        </th>
                        <th className="HintIcon ToolTip" data-title={t("tips.direction")}>
                            {mapTip}
                            <span className="Description">
                                {t("guess.titles.direction")}
                            </span>
                            <ExploreIcon/>
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

export default withTranslation()(Guesses);