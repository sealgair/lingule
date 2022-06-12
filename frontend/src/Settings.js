import {getData, setData} from "./utils";
import {withTranslation} from "react-i18next";
import React from "react";
import ModalComponent from "./ModalComponent";

const siteLanguages = {
  en: { endonym: 'English' },
  es: { endonym: 'Español' },
  fr: { endonym: 'Français' }
};

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
        const i18n = this.props.i18n;
        const guesses = getData('guess' + this.props.word.order);
        const guessing = guesses && guesses.length < 6 && guesses.filter(g => g.hint.language).length === 0;
        const scoring = guessing || !guesses;

        const languageChoices = Object.keys(siteLanguages).map(lang=>
            <li key={lang}><label>
                <input type="radio" name="language" value={lang}
                       checked={i18n.resolvedLanguage === lang}
                       onClick={(e) => i18n.changeLanguage(lang)}
                />
                {siteLanguages[lang].endonym}
            </label></li>
        )

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
            <fieldset>
                <legend>Language</legend>
                <ul>
                    {languageChoices}
                </ul>
                <p>All translations are from english, and entirely amateur. Any and all corrections welcome.</p>
            </fieldset>
        </div>)
    }
}

export default withTranslation()(Settings);
