import React from "react";
import ModalComponent from "./ModalComponent";
import {withTranslation} from "react-i18next";

class Info extends ModalComponent {
    getTitle() {
        return this.props.t("titles.info");
    }

    contents() {
        const t = this.props.t;
        return <div className="InfoContent">
            <p>{t("info.credit")}</p>
            <p>
                <a href="https://github.com/sealgair/lingule" target="_new">
                    <i className="fa-brands fa-github Icon"></i>
                    {t("info.code")}
                </a>
            </p>
            <p>
                <a href="https://bsky.app/profile/chase.caster.quest" target="_new">
                    <i className="fa-solid fa-square Icon"></i>
                    {t("info.skeet")}
                </a>
            </p>
            <p>
                <a href="https://twitter.com/ChaseCaster" target="_new">
                    <i className="fa-brands fa-twitter Icon"></i>
                    {t("info.tweet")}
                </a>
            </p>
            <p>
                <a rel="me" href="https://peoplemaking.games/@chase" target="_new">
                    <i className="fa-brands fa-mastodon Icon"></i>
                    {t("info.toot")}
                </a>
            </p>
            <p>
                {t("info.bugs")}
            </p>
            <hr/>
            <div className="links">
                <div className="title">{t("info.links")}</div>
                <a href="https://novle.xyz" target="_blank" rel="noopener noreferrer">Novle</a>
                <span className="description">{t("info.novle")}</span>
            </div>
        </div>;
    }
}

export default withTranslation()(Info);