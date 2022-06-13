import React from "react";
import {directions, cssVar, getData, isLightMode, isTouchOnly, setData, drawArrow} from "./utils";
import Canvas from "./Canvas";
import {withTranslation, Trans} from "react-i18next";

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
        const t = this.props.t;
        const style = getData("shareStyle", "text");
        return style === "image" ? t("buttons.copyAlt") : t("buttons.share");
    }

    toggleOptions() {
        this.setState(prev => ({options: !prev.options}));
    }

    alertShare(newName) {
        this.setState({shareName: newName});
        setTimeout(() => this.setState({shareName: this.baseShareName()}), 3000);
    }

    getScore(hardString, easyString) {
        const scores = getData('scores');
        let score = scores[this.props.word.order];
        const hard = score.toString().endsWith("*");
        if (hard) {
            score = score.substring(0, score.length - 1);
        }
        hardString = hardString || "*";
        easyString = easyString || "";
        return [score, hard ? hardString : easyString];
    }

    makeScoreImage() {
        const [score, hard] = this.getScore();
        const title = `Lingule #${this.props.word.order}: ${score}/6${hard}`;
        let word = this.props.word.word;
        if (this.props.word.romanization) {
            word = `${word} (${this.props.word.romanization})`
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
        const t = this.props.t;
        let description = [t('share.alt.title', {num: this.props.word.order})];
        description.push(t('share.alt.word', {word: this.wordText()}));
        const [score, hard] = this.getScore("hard", "normal");
        if (this.props.success) {
            description.push(t("share.alt.score", {score: score, context: hard}));
        } else {
            description.push(t("share.alt.miss", {context: hard}));
        }
        const correct = {
            [true]: "correct",
            [false]: "incorrect",
        }
        this.props.guesses.forEach(function (guess, i) {
            let line = t('share.alt.guessTitle', {num: i + 1});
            if (guess.hint.language) {
                line += t('share.alt.guessRight');
            } else {
                line += t('share.alt.macroArea', {context: guess.hint.macroarea ? 'right' : 'wrong'});
                if (guess.hint.family) {
                    if (guess.hint.subfamily) {
                        if (guess.hint.genus) {
                            line += t('share.alt.gotGenus');
                        } else {
                            line += t('share.alt.gotSubFamily');
                        }
                    } else {
                        line += t('share.alt.gotFamily');
                    }
                } else {
                    line += t('share.alt.missedFamily');
                }
                let direction = directions[Math.round(guess.hint.bearing / 22.5)];
                direction = t('directions.'+direction);
                line += t('share.alt.direction', {direction: direction});
            }
            description.push(line);
        });
        description.push(t('share.alt.link', {url: document.URL}));
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

        const wrong = isLightMode() ? '⬜' : '⬛';
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
        const t = this.props.t;
        let shareClass = "Guess Share";
        if (!this.props.success) {
            shareClass += " Fail";
        }
        let instructions = "";
        let image = "";
        if (this.state.style === "image") {
            instructions = t("share.instructions", {
                "context": isTouchOnly() ? "tap" : "click"
            })
            image = (<div className="ScoreImage Foldable" ref={this.scoreImage}>
                {this.makeScoreImage()}
            </div>)
        }
        let score = this.makeScore();
        if (this.state.style !== "image") {
            score = <pre role="image" aria-label={t("share.description")}>{score}</pre>;
        }
        return <div className="ShareBox">
            <button tabIndex="0" autoFocus className={shareClass}
                    onClick={this.shareScore}>{this.state.shareName}</button>
            <div className="ShareData Foldable" ref={this.options} aria-hidden={this.state.options ? "false" : "true"}
                 style={{height: 0, opacity: 0}} aria-live="polite">
                <div className="ShareOptions" aria-label={t("share.styleChoice")}>
                    <button className={"ShareOption" + ((this.state.style === "text") ? " Selected" : "")}
                            onClick={this.setTextStyle}>{t("share.textStyle")}
                    </button>
                    <button className={"ShareOption" + ((this.state.style === "spoiler") ? " Selected" : "")}
                            onClick={this.setSpoilerStyle}>{t("share.spoilerStyle")}
                    </button>
                    <button className={"ShareOption" + ((this.state.style === "image") ? " Selected" : "")}
                            onClick={this.setImageStyle}>{t("share.imageStyle")}
                    </button>
                </div>
                <div className="ShareContent" aria-live="polite">
                    {instructions}
                    {score}
                </div>
            </div>
            {image}
            <button className="ToggleShareOptions" onClick={this.toggleOptions}>
                <Trans i18nKey="share.options">Share<br/>Options</Trans>
            </button>
        </div>;
    }
}

export default withTranslation()(Share);