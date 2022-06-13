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
        this.state = {
            maps: getData('allowMaps', true),
            share: getData("shareStyle", "text"),
        }
        this.changeMap = this.changeMap.bind(this);
        this.changeShareStyle = this.changeShareStyle.bind(this);
    }

    getTitle() {
        return this.props.t("titles.settings");
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
        const t = this.props.t;
        const i18n = this.props.i18n;
        const guesses = getData('guess' + this.props.word.order);
        const guessing = guesses && guesses.length < 6 && guesses.filter(g => g.hint.language).length === 0;
        const scoring = guessing || !guesses;

        const languageChoices = Object.keys(siteLanguages).map(lang=>
            <li key={lang}><label>
                <input type="radio" name="language" value={lang}
                       checked={i18n.resolvedLanguage === lang}
                       onChange={(e) => {
                           if (e.target.checked) {
                               i18n.changeLanguage(lang)
                           }
                       }}
                />
                {siteLanguages[lang].endonym}
            </label></li>
        )

        return (<div>
            <fieldset disabled={guessing}>
                <legend>{t("settings.difficulty")}</legend>
                <label><input type="checkbox" name="map" onChange={this.changeMap}
                              checked={this.state.maps}/>
                    {t("settings.allowMaps", {context: guessing ? "off" : "on"})}
                </label>
            </fieldset>
            <br/>
            <fieldset>
                <legend>{t("settings.sharing")}</legend>
                <span>{scoring ? "" : t("settings.shareHint")}</span>
                <ul>
                    <li><label><input type="radio" name="style" value="text"
                                      onChange={this.changeShareStyle}
                                      disabled={!scoring}
                                      checked={this.state.share === "text"}/>
                        {t("settings.shareText")}
                    </label></li>
                    <li><label><input type="radio" name="style" value="spoiler"
                                      onChange={this.changeShareStyle}
                                      disabled={!scoring}
                                      checked={this.state.share === "spoiler"}/>
                        {t("settings.shareSpoilers")}
                    </label></li>
                    <li><label><input type="radio" name="style" value="image"
                                      onChange={this.changeShareStyle}
                                      disabled={!scoring}
                                      checked={this.state.share === "image"}/>
                        {t("settings.shareImage")}
                    </label></li>
                </ul>
            </fieldset>
            <br/>
            <fieldset>
                <legend>{t("settings.language")}</legend>
                <ul>
                    {languageChoices}
                </ul>
                <p>{t("settings.languageDisclaimer")}</p>
            </fieldset>
        </div>)
    }
}

export default withTranslation()(Settings);
