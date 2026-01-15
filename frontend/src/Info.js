import React from "react";
import ModalComponent from "./ModalComponent";
import {withTranslation} from "react-i18next";
import GitHubIcon from '@mui/icons-material/GitHub';

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
          <GitHubIcon/>
          {t("info.code")}
        </a>
      </p>
      <p>
        <a href="https://bsky.app/profile/chase.caster.quest" target="_new">
          <svg className="icon"
               focusable="false" aria-hidden="true" viewBox="0 0 600 530" data-testid="BlueskyIcon">
            <path
              d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/>
          </svg>
          {t("info.skeet")}
        </a>
      </p>
      <p>
        <a rel="me" href="https://peoplemaking.games/@chase" target="_new">
          <svg className="icon"
               focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="MastadonIcon">
            <path
              d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H6.026V8.903c0-1.074.273-1.927.823-2.558.566-.631 1.307-.955 2.228-.955 1.065 0 1.872.409 2.405 1.228l.518.869.519-.869c.533-.819 1.34-1.228 2.405-1.228.92 0 1.662.324 2.228.955.549.631.822 1.484.822 2.558v5.253z"/>
          </svg>
          {t("info.toot")}
        </a>
      </p>
      <p>
        {t("info.bugs")}
      </p>
      <hr/>
      <div className="links">
        <div className="title">{t("info.links")}</div>
        <a href="https://novle.ink" target="_blank" rel="noopener noreferrer">Novle</a>
        <span className="description">{t("info.novle")}</span>
      </div>
    </div>;
  }
}

export default withTranslation()(Info);