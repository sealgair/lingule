import Word from "./Word";
import React from "react";
import ModalComponent from "./ModalComponent";
import {withTranslation, Trans} from "react-i18next";
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ExploreIcon from '@mui/icons-material/Explore';
import SettingsIcon from '@mui/icons-material/Settings';

class HowTo extends ModalComponent {
  getTitle() {
    return this.props.t("titles.how-to");
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
            <PublicIcon/>
            {t("howto.macroArea")}
          </li>
          <li>
            <GroupsIcon/>
            {t("howto.family")}
          </li>
          <li>
            <PeopleIcon/>
            {t("howto.subFamily")}
          </li>
          <li>
            <PersonIcon/>
            {t("howto.genus")}
          </li>
          <li>
            <RecordVoiceOverIcon/>
            {t("howto.language")}
          </li>
          <li>
            <ExploreIcon/>
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
        <p>
          <Trans i18nKey="howto.hardMode">
            Hard mode verbiage (<SettingsIcon fontSize="small"/>)
          </Trans>
        </p>
      </div>
    )
  }
}

export default withTranslation()(HowTo);