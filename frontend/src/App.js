import React from 'react'
import ReactMarkdown from 'react-markdown'
import {
    Marker,
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup
} from "react-simple-maps";
import './App.css';

const FIRST_EASY = 11;

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

function randomInt(r, f) {
    f = f || 0;
    return Math.floor(Math.random() * r) + f
}

function randomChoice(arr) {
    return arr[randomInt(arr.length)];
}

function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name);
}

function isTouchOnly() {
    return window.matchMedia("(any-hover: none)").matches;
}

function isLightMode() {
    return window.matchMedia("(prefers-color-scheme: light)").matches;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getData(key, def) {
    let value = localStorage.getItem(key);
    try {
        value = JSON.parse(value);
    } catch {
    }
    if (value === null) {
        value = def;
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

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.image = React.createRef();
    }

    componentDidMount() {
        const context = this.canvas.current.getContext('2d');
        this.props.draw(context);
        this.image.current.src = this.canvas.current.toDataURL();
    }

    render() {
        const {draw, ...rest} = this.props;
        return <div className="CanvasContainer">
            <canvas ref={this.canvas} className="Hide" {...rest}/>
            <img ref={this.image} alt={this.props.title} style={{
                width: this.props.width, height: this.props.height
            }}/>
        </div>;
    }
}

function drawArrow(ctx, s) {
    ctx.lineWidth = 2;
    const y = (s / 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(0, -(y - 2));
    ctx.lineTo(-y / 2, 0);
    ctx.moveTo(0, -(y - 2));
    ctx.lineTo(y / 2, 0);
    ctx.closePath();
    ctx.stroke();
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
            word: {
                word: "lingule",
                ipa: "/ˈlɪŋ.ɡwəl/",
                meaning: "a fun language game",
            },
            modal: null,
        }

        this.openInfo = this.openInfo.bind(this);
        this.openHelp = this.openHelp.bind(this);
        this.openSettings = this.openSettings.bind(this);
        this.openStats = this.openStats.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openInfo() {
        this.setState({modal: "info"});
    }

    openHelp() {
        this.setState({modal: "help"});
    }

    openSettings() {
        this.setState({modal: "settings"});
    }

    openStats() {
        this.setState({modal: "stats"});
    }

    closeModal() {
        this.setState({modal: null});
    }

    render() {
        let font = "";
        if (this.state.word.font) {
            let fontFace = [
                "@font-face {",
                "font-family: \"NotoSans Script\";",
                "src: url(\"" + this.state.word.font + "\")",
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
                                <span className="Settings Icon TipBelow" title="Settings" onClick={this.openSettings}>
                                    <i className="fa-solid fa-gear"></i>
                                </span>
                                <span className="Stats Icon TipBelow" title="Score Data" onClick={this.openStats}>
                                    <i className="fa-solid fa-square-poll-horizontal"></i>
                                </span>
                            </span>
                        </header>
                        <Word word={this.state.word.word} romanization={this.state.word.romanization}
                              ipa={this.state.word.ipa} meaning={this.state.word.meaning}/>
                        <div className="Body">
                            <Guesses key={this.state.word.order}
                                     word={this.state.word}/>
                        </div>
                    </div>
                </div>
                <Info on={this.state.modal === "info"} onClose={this.closeModal}/>
                <HowTo on={this.state.modal === "help"} onClose={this.closeModal}/>
                <Settings on={this.state.modal === "settings"} word={this.state.word} onClose={this.closeModal}/>
                <Statistics on={this.state.modal === "stats"} onClose={this.closeModal}/>
            </div>
        );
    }

    componentDidMount() {
        this.fetch("/solution/word.json?tz=" + new Date().getTimezoneOffset(),
            (result) => {
                this.setState({
                    word: result,
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

class Share extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style: getData("shareStyle", "text"),
            shareName: this.baseShareName(),
            options: false,
        };
        this.options = React.createRef();
        this.scoreImage = React.createRef();
        this.toggleOptions = this.toggleOptions.bind(this);
        this.shareScore = this.shareScore.bind(this);
        this.getScore = this.getScore.bind(this);
        this.makeScore = this.makeScore.bind(this);
        this.makeScoreImage = this.makeScoreImage.bind(this);
        this.makeScoreDescription = this.makeScoreDescription.bind(this);
        this.alertShare = this.alertShare.bind(this);
        this.setTextStyle = this.setTextStyle.bind(this);
        this.setSpoilerStyle = this.setSpoilerStyle.bind(this);
        this.setImageStyle = this.setImageStyle.bind(this);
        this.setStyle = this.setStyle.bind(this);
        this.wordText = this.wordText.bind(this);
    }

    baseShareName() {
        const style = getData("shareStyle", "text");
        return style === "image" ? "Copy Alt Text" : "Share";
    }

    toggleOptions() {
        this.setState(prev => ({options: !prev.options}));
    }

    alertShare(newName) {
        this.setState({shareName: newName});
        setTimeout(() => this.setState({shareName: this.baseShareName()}), 3000);
    }

    getScore(hardString) {
        const scores = getData('scores');
        let score = scores[this.props.word.order];
        const hard = score.toString().endsWith("*");
        if (hard) {
            score = score.substring(0, score.length - 1);
        }
        hardString = hardString || "*";
        return [score, hard ? hardString : ""];
    }

    makeScoreImage() {
        const [score, hard] = this.getScore();
        const title = "Lingule #" + this.props.word.order + ": " + score + "/6" + hard;
        let word = this.props.word.word;
        if (this.props.word.romanization) {
            word = word + " (" + this.props.word.romanization + ")"
        }
        const guesses = this.props.guesses;
        const size = 30;
        const ox = 10;
        const ix = 10;
        const oy = 30;
        const ly = 10;
        return <Canvas draw={function (ctx) {
            let y = oy;
            ctx.fillStyle = cssVar('--bg-color');
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = cssVar('--text-color');
            ctx.font = '25px NotoTitle';
            ctx.fillText(title, ox, y);
            y += 30;
            ctx.font = '25px NotoScript';
            ctx.fillText(word, ox * 2, y);
            y += 20;

            const boxColors = {
                [true]: cssVar('--correct-color'),
                [false]: cssVar('--guess-bg-color'),
            }
            ctx.strokeStyle = cssVar('--text-color');
            guesses.forEach(function (guess, i) {
                let x = ox + ix;
                ctx.fillStyle = cssVar('--text-color');
                ctx.fillRect(x - 1, y - 1,
                    (size + 1) * 6 + 1, size + 2);

                ctx.fillStyle = boxColors[guess.hint.macroarea];
                ctx.fillRect(x, y, size, size);
                x += size + 1;
                ctx.fillStyle = boxColors[guess.hint.family];
                ctx.fillRect(x, y, size, size);
                x += size + 1;
                ctx.fillStyle = boxColors[guess.hint.subfamily];
                ctx.fillRect(x, y, size, size);
                x += size + 1;
                ctx.fillStyle = boxColors[guess.hint.genus];
                ctx.fillRect(x, y, size, size);
                x += size + 1;
                ctx.fillStyle = boxColors[guess.hint.language];
                ctx.fillRect(x, y, size, size);
                x += size + 1;

                if (guess.hint.language) {
                    ctx.font = '18px mono';
                    ctx.fillStyle = boxColors[true];
                    ctx.fillRect(x, y, size, size);
                    ctx.fillText("🏆", x + 5, y + 22);
                } else {
                    ctx.fillStyle = cssVar('--arrow-color');
                    ctx.fillRect(x, y, size, size);
                    ctx.fillStyle = cssVar('--text-color');
                    ctx.translate(x + size / 2, y + size / 2);
                    ctx.rotate(guess.hint.bearing * (Math.PI / 180));
                    drawArrow(ctx, size - 10);
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                }
                y += size + ly;
            });

            ctx.fillStyle = cssVar('--text-color');
            ctx.font = '20px NotoSans';
            ctx.fillText(document.URL, ox, y + 20);
        }} width={(size + 1) * 6 + (ox + ix) * 2} height={(size + ly) * (guesses.length) + 70 + oy + ly}
                       title={this.makeScoreDescription()}/>
    }

    makeScoreDescription() {
        let description = ["Scorecard for Lingule #" + this.props.word.order];
        description.push("Mystery word was \"" + this.wordText() + "\"");
        const [score, hard] = this.getScore(" (on hard mode)");
        if (this.props.success) {
            description.push("Got it in " + score + hard);
        } else {
            description.push("Didn't get it" + hard)
        }
        const correct = {
            [true]: "correct",
            [false]: "incorrect",
        }
        this.props.guesses.forEach(function (guess, i) {
            let line = "Guess #" + (i + 1) + ": ";
            if (guess.hint.language) {
                line += "language correct!";
            } else {
                line += correct[guess.hint.macroarea] + " macro-area, ";
                if (guess.hint.family) {
                    if (guess.hint.subfamily) {
                        if (guess.hint.genus) {
                            line += "correct language genus";
                        } else {
                            line += "correct language sub-family";
                        }
                    } else {
                        line += "correct language family";
                    }
                } else {
                    line += "incorrect language family";
                }
                line += ", solution is " + directions[Math.round(guess.hint.bearing / 22.5)] + " of guess.";
            }
            description.push(line);
        });
        description.push("Played at " + document.URL);
        return description.join("\n");
    }

    wordText() {
        return this.props.word.romanization || this.props.word.word;
    }

    makeScore() {
        const style = this.state.style;
        const [score, hard] = this.getScore();
        const title = "#Lingule #" + this.props.word.order + " \"" + this.wordText() + "\": " + score + "/6" + hard;
        if (style === "image") {
            return this.makeScoreImage();
        }

        const wrong = isLightMode() ? '⬜️' : '⬛️';
        const squares = {[true]: '🟩', [false]: wrong};
        const arrows = ['⬆️', '↗️️', '➡️️', '↘️️️', '⬇️️', '↙️️️', '⬅️', '↖️️️️', '⬆️'];
        let scoreCard = this.props.guesses.map(function (guess) {
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
                hint.push(arrows[Math.round(guess.hint.bearing / 45)]);
            }
            if (style === "spoiler") {
                let lang = guess.language.substring(0, 12);
                while (lang.length < 12) {
                    lang += " ";
                }
                hint.push(" ||`" + lang + "`||")
            }
            return hint.join("");
        });
        scoreCard.splice(0, 0, title);
        scoreCard.push(document.URL);
        return scoreCard.join("\n");
    }

    shareScore() {
        let data = this.makeScore();
        if (this.state.style === "image") {
            data = this.makeScoreDescription();
        }
        if (isTouchOnly() && this.state.style !== "image" && navigator.share) {
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

    setStyle(style) {
        setData("shareStyle", style)
        this.setState({
            style: style,
            shareName: this.baseShareName(),
        });
    }

    setTextStyle() {
        this.setStyle("text");
    }

    setSpoilerStyle() {
        this.setStyle("spoiler");
    }

    setImageStyle() {
        this.setStyle("image");
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let height = 0;
        let opacity = 0;
        if (this.state.options) {
            height = Math.max(
                this.options.current.children[0].scrollHeight + 10,
                this.options.current.children[1].scrollHeight,
            ) + 'px';
            opacity = 1;
        }
        this.options.current.style = "height: " + height + "; opacity: " + opacity + ";";
        if (this.scoreImage.current) {
            height = 0;
            opacity = 0;
            if (!this.state.options) {
                height = this.scoreImage.current.scrollHeight + 'px';
                opacity = 1;
            }
            this.scoreImage.current.style = "height: " + height + "; opacity: " + opacity + ";";
        }
    }

    render() {
        let shareClass = "Guess Share";
        if (!this.props.success) {
            shareClass += " Fail";
        }
        let instructions = "";
        let image = "";
        if (this.state.style === "image") {
            let verb = "";
            if (isTouchOnly()) {
                instructions = "Tap and hold";
                verb = "tap";
            } else {
                instructions = "Right click";
                verb = "click";
            }
            instructions += " to copy the image below, " + verb + " \"copy alt text\" to copy text description";
            image = (<div className="ScoreImage Foldable" ref={this.scoreImage}>
                {this.makeScoreImage()}
            </div>)
        }
        return <div className="ShareBox">
            <button tabIndex="0" autoFocus className={shareClass}
                    onClick={this.shareScore}>{this.state.shareName}</button>
            <div className="ShareData Foldable" ref={this.options} style={{height: 0, opacity: 0}}>
                <div className="ShareOptions">
                    <button className={"ShareOption" + ((this.state.style === "text") ? " Selected" : "")}
                            onClick={this.setTextStyle}>Text
                    </button>
                    <button className={"ShareOption" + ((this.state.style === "spoiler") ? " Selected" : "")}
                            onClick={this.setSpoilerStyle}>Spoiler
                    </button>
                    <button className={"ShareOption" + ((this.state.style === "image") ? " Selected" : "")}
                            onClick={this.setImageStyle}>Image
                    </button>
                </div>
                <div className="ShareContent">
                    {instructions}
                    <pre>{this.makeScore()}</pre>
                </div>
            </div>
            {image}
            <button className="ToggleShareOptions" onClick={this.toggleOptions}>Share<br/>Options</button>
        </div>;
    }
}

class Map extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-50m.json";
    }

    render() {
        return (
            <ComposableMap style={{backgroundColor: "#e1feff"}}
                           width={this.props.width} height={this.props.height}>
                <ZoomableGroup zoom={5} maxZoom={16} center={[this.props.longitude, this.props.latitude]}>
                    <Geographies geography={this.geoUrl}
                                 strokeWidth="0.2"
                                 stroke="#86B197"
                                 fill="#a9dfbf">
                        {({geographies}) =>
                            geographies.map(geo => (
                                <Geography key={geo.rsmKey} geography={geo}/>
                            ))
                        }
                    </Geographies>
                    <Marker coordinates={[this.props.longitude, this.props.latitude]}>
                        <g transform={"rotate(" + this.props.bearing + ")"} stroke="#C30000" fill="#C30000"
                           strokeWidth="0">
                            <circle r="1.2"/>
                            <path d="M 0,0  l 0,-4" strokeWidth="1"/>
                            <path d="M 0,-8 l -1.25,4 l 2.5,0 z"/>
                        </g>
                    </Marker>
                </ZoomableGroup>
            </ComposableMap>
        );
    }
}

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
        const params = new URLSearchParams({
            language: this.state.guess.id,
            solution: this.props.word.id,
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
        );
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.knowsMaps !== prevState.knowsMaps) {
            setData("knowsMaps", this.state.knowsMaps);
        }
    }

    render() {
        const mapAllowed = getData("allowMaps", true);
        const numbers = [0, 1, 2, 3, 4, 5];
        const guesses = numbers.map(n => this.state.guesses[n] || false);
        const self = this;
        const data = guesses.map(function (guess, n) {
            if (guess) {
                let arrow = <i className="fa-solid fa-trophy"/>;
                let direction = "you got it!";
                if (!guess.hint.language) {
                    direction = directions[Math.round(guess.hint.bearing / 22.5)];
                    arrow = <i className="fa-solid fa-arrow-up"
                               style={{transform: "rotate(" + guess.hint.bearing + "deg)"}}/>
                }
                return (
                    <tr className="Guess Hints" key={n}>
                        <td className="ToolTip" data-value={guess.hint.macroarea} title={guess.macroarea}/>
                        <td className="ToolTip" data-value={guess.hint.family} title={guess.family}/>
                        <td className="ToolTip" data-value={guess.hint.subfamily} title={guess.subfamily}/>
                        <td className="ToolTip" data-value={guess.hint.genus} title={guess.genus}/>
                        <td className="Language" data-value={guess.hint.language}>{guess.language}</td>
                        <td className="Direction ToolTip" data-value={guess.hint.language} title={direction}
                            onClick={event => (
                                mapAllowed &&
                                !self.state.done &&
                                !guess.hint.language &&
                                self.setState({mapGuess: guess})
                            )}>
                            {arrow}
                        </td>
                    </tr>
                );
            } else {
                return (<tr className="Guess Empty" key={n}>
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
        let map = ""
        if (this.state.mapGuess) {
            let guess = this.state.mapGuess;
            map = <div className="MapWrapper" style={{
                height: this.state.mapGuess ? 300 : 0
            }}>
                <span className="MapClose" onClick={e => this.setState({mapGuess: null})} key="close">
                    <i className="fa-solid fa-circle-xmark"></i>
                </span>
                <Map key="map" latitude={guess.latitude} longitude={guess.longitude} bearing={guess.hint.bearing}
                     width={300} height={300}/>
            </div>
        }
        let showTip = mapAllowed && !this.state.done && this.state.guesses.length > 0 && !this.state.knowsMaps;
        let touchVerb = isTouchOnly() ? "Tap" : "Click";
        let mapTip = <div className="MapTip" style={{
            opacity: showTip ? 1 : 0
        }}>{touchVerb} on the arrows to see a map</div>;
        if (showTip) {
            setTimeout(() => this.setState({knowsMaps: true}), 5000);
        }

        return (
            <div className={(mapAllowed && !this.state.done ? "Maps " : "") + "GuessWrapper"}>
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
                            {mapTip}
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
                {map}
                <p className="Message">
                    <ReactMarkdown>{message}</ReactMarkdown>
                </p>
            </div>
        );
    }
}

class Solution extends React.Component {

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
                <label className="Hidden" htmlFor="guess-lookup">Look up language</label>
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
        this.state = {on: false};
        this.close = this.close.bind(this);
        this.onClick = this.onClick.bind(this);
        this.contents = this.contents.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        return {on: props.on};
    }

    close(event) {
        this.props.onClose(event);
    }

    onClick(event) {
        if (inClass(event.target, "Close") || event.target.classList.contains("Overlay")) {
            this.close();
        }
    }

    render() {
        let opacity = this.state.on ? 1 : 0;
        let height = this.state.on ? "100vh" : 0;
        return (
            <div className="Overlay" onClick={this.onClick} style={{
                opacity: opacity, height: height
            }}>
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
            <p>
                <a href="https://github.com/sealgair/lingule" target="_new">
                    <i className="fa-brands fa-github Icon"></i>
                    See the code
                </a>
            </p>
            <p>
                <a href="https://twitter.com/ChaseCaster" target="_new">
                    <i className="fa-brands fa-twitter Icon"></i>
                    Tweet at me
                </a>
            </p>
            <p>
                <a rel="me" href="https://weirder.earth/@chase" target="_new">
                    <i className="fa-brands fa-mastodon Icon"></i>
                    Toot at me
                </a>
            </p>
            <p>
                The only thing I like more than compliments is bug reports!
            </p>
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

class Settings extends ModalComponent {
    constructor(props, context) {
        super(props, context);
        this.title = "Settings"
        this.state = {
            maps: getData('allowMaps', true),
            share: getData("shareStyle", "text"),
        }
        this.changeMap = this.changeMap.bind(this);
        this.changeShareStyle = this.changeShareStyle.bind(this);
    }

    changeMap(event) {
        let allowed = event.target.checked;
        setData('allowMaps', allowed);
        this.setState({maps: allowed})
    }

    changeShareStyle(event) {
        let style = event.target.value;
        setData('shareStyle', style);
        this.setState({share: style});
    }

    contents() {
        const guesses = getData('guess' + this.props.word.order);
        const guessing = guesses && guesses.length < 6 && guesses.filter(g => g.hint.language).length === 0;
        const scoring = guessing || !guesses;
        return (<div>
            <fieldset disabled={guessing}>
                <legend>Difficulty</legend>
                <label><input type="checkbox" name="map" onChange={this.changeMap}
                              checked={this.state.maps}/>
                    Allow maps {guessing ? "(can't change mid-game)" : "(disable for hard mode)"}
                </label>
            </fieldset>
            <br/>
            <fieldset>
                <legend>Sharing Options</legend>
                <span>{scoring ? "" : "(use \"share options\" in bottom right to change"}</span>
                <ul>
                    <li><label><input type="radio" name="style" value="text"
                                      onChange={this.changeShareStyle}
                                      disabled={!scoring}
                                      checked={this.state.share === "text"}/>
                        Emoji text
                    </label></li>
                    <li><label><input type="radio" name="style" value="spoiler"
                                      onChange={this.changeShareStyle}
                                      disabled={!scoring}
                                      checked={this.state.share === "spoiler"}/>
                        Emoji text with discord style spoilers
                    </label></li>
                    <li><label><input type="radio" name="style" value="image"
                                      onChange={this.changeShareStyle}
                                      disabled={!scoring}
                                      checked={this.state.share === "image"}/>
                        Image and alt text
                    </label></li>
                </ul>
            </fieldset>
            <br/>
        </div>)
    }
}

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

export default App;
