import React from 'react'
import {withTranslation} from "react-i18next";

import ServerComponent from "./ServerComponent";
import Word from "./Word";
import Guesses from "./Guesses";

import './App.css';
import Info from "./Info";
import HowTo from "./HowTo";
import Settings from "./Settings";
import Statistics from "./Statistics";

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
        let t = this.props.t;
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
                <div className="MainColumn" aria-hidden={this.state.modal ? "true" : "false"}>
                    <div className="Buffer"/>
                    <div className="ContentWrapper">
                        <header className="Header">
                            <span className="IconSet Left">
                                <a className="Help Icon TipBelow" title={t("titles.how-to")} onClick={this.openHelp}>
                                    <i className="fa-solid fa-circle-question"></i>
                                </a>
                                <a className="Info Icon TipBelow" title={t("titles.credits")} onClick={this.openInfo}>
                                    <i className="fa-solid fa-circle-info"></i>
                                </a>
                            </span>
                            <h1>Lingule</h1>
                            <span className="IconSet Right">
                                <a className="Settings Icon TipBelow" title={t("titles.settings")} onClick={this.openSettings}>
                                    <i className="fa-solid fa-gear"></i>
                                </a>
                                <a className="Stats Icon TipBelow" title={t("titles.score")} onClick={this.openStats}>
                                    <i className="fa-solid fa-square-poll-horizontal"></i>
                                </a>
                            </span>
                        </header>
                        <Word word={this.state.word.word} romanization={this.state.word.romanization}
                              vertical={this.state.word.vertical}
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

export default withTranslation()(App);
