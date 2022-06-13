import Word from "./Word";
import React from "react";
import ModalComponent from "./ModalComponent";
import {withTranslation, Trans} from "react-i18next";

class HowTo extends ModalComponent {
    constructor(props, context) {
        super(props, context);
        this.title = this.props.t("titles.how-to");
    }

    contents() {
        const t = this.props.t;
        return (
            <div>
                <p><Trans i18nKey="howto.intro">
                    Every day you'll get a new <span className="Title">Lingule</span>. You get six guesses to
                    figure out what language the mystery word is.
                </Trans></p>
                <Word word={t("howto.target")} romanization={t("howto.romanization")}
                      ipa={t("howto.ipa")} meaning={t("howto.meaning")}/>
                <p>{t("howto.afterGuess")}</p>
                <ul className="HelpList">
                    <li>
                        <i className="fa-solid fa-earth-asia"></i>
                        {t("howto.macroArea")}
                    </li>
                    <li>
                        <i className="fa-solid fa-mountain-sun"></i>
                        {t("howto.family")}
                    </li>
                    <li>
                        <i className="fa-solid fa-mountain"></i>
                        {t("howto.subFamily")}
                    </li>
                    <li>
                        <i className="fa-solid fa-mound"></i>
                        {t("howto.genus")}
                    </li>
                    <li>
                        <i className="fa-regular fa-comments"></i>
                        {t("howto.language")}
                    </li>
                    <li>
                        <i className="fa-regular fa-compass"></i>
                        {t("howto.direction")}
                    </li>
                </ul>
                <p>{t("howto.isolates")}</p>
                <p>{t("howto.multiMatch")}</p>
                <p>{t("howto.directionMeans")}</p>
                <p>
                    <Trans i18nKey="howto.dataSource">
                        All language data is supplied by <a href="https://wals.info/languoid" target="_new">The World
                        Atlas of Language Structures</a>
                    </Trans>
                </p>
            </div>
        )
    }
}

export default withTranslation()(HowTo);