import React from "react";

class Word extends React.Component {
    render() {
        let romanization = "";
        if (this.props.romanization) {
            romanization = <div id="romanization" className="ToolTip Side"
                                title="romanization">{this.props.romanization}</div>;
        }
        return (
            <div className="WordContainer">
                <span id="word" className="ToolTip Side" title="mystery word">{this.props.word}</span>
                {romanization}
                <span id="ipa" className="ToolTip Side" title="IPA pronunciation">{this.props.ipa}</span>
                <span id="meaning" className="ToolTip Side" title="english translation">{this.props.meaning}</span>
            </div>
        )
    }
}

export default Word;