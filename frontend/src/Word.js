import React from "react";
import {withTranslation} from "react-i18next";
import {getTextProportion} from "./utils";

class Word extends React.Component {
    render() {
        const t = this.props.t;
        const i18n = this.props.i18n;
        let romanization = "";
        if (this.props.romanization) {
            const romWidth = getTextProportion(this.props.word, 'NotoSerif');
            romanization = <div id="romanization" className="ToolTip Side"
                                title={t("tips.romanization")}  style={{
                    "font-size": `min(35px, ${romWidth})`
                }}>{this.props.romanization}</div>;
        }
        let vert = this.props.vertical ? "vertical" : "";
        const wordWidth = getTextProportion(this.props.word, 'NotoScript');
        return (
            <div className="WordContainer">
                <span id="word" className={`ToolTip Side ${vert}`} title={t("tips.word")} style={{
                    "font-size": `min(50px, ${wordWidth})`
                }}>{this.props.word}</span>
                {romanization}
                <span id="ipa" className="ToolTip Side" title={t("tips.ipa")}>{this.props.ipa}</span>
                <span id="meaning" className="ToolTip Side" title={t("tips.meaning")}>
                    {this.props.meaning[i18n.resolvedLanguage] || this.props.meaning.en}
                </span>
            </div>
        )
    }
}

export default withTranslation()(Word);