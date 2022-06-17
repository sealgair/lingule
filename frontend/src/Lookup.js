import ServerComponent from "./ServerComponent";
import {compare, escapeRegExp, removeDiacritics} from "./utils";
import {withTranslation} from "react-i18next";
import React from "react";

class Lookup extends ServerComponent {

    constructor(props) {
        super(props);
        this.languages = [];
        this.state = {value: "", selected: 0};

        this.handleKeypress = this.handleKeypress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.selectLang = this.selectLang.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.loadLanguages = this.loadLanguages.bind(this);
    }

    handleKeypress(event) {
        let selected = this.state.selected;
        let langs = this.filteredLangs();
        let lcount = langs.length;

        if (event.code === "ArrowDown") {
            if (selected === null) {
                selected = lcount - 1;
            } else {
                selected -= 1;
            }
            if (selected < 0) {
                selected = null;
            }
        } else if (event.code === "ArrowUp") {
            if (selected === null) {
                selected = 0;
            } else {
                selected += 1;
            }
            if (selected >= lcount) {
                selected = null;
            }
        }
        if (event.code === "Enter") {
            if (selected === null) {
                selected = 0;
            } else {
                let lang = langs[selected];
                this.selectLang(lang);
            }
        }
        this.setState({selected: selected});
    }

    handleChange(event) {
        this.guessId = null;
        this.setState({value: event.target.value, selected: null});
        this.props.onSelect();
    }

    handleSelect(event) {
        this.selectLang({id: event.target.value, name: event.target.textContent});
    }

    handleBlur(event) {
    }

    selectLang(lang) {
        if (lang) {
            this.guessId = lang.id;
            this.setState({value: lang.name});
            this.props.onSelect(lang);
        }
    }

    filteredLangs() {
        const rd = removeDiacritics;
        const query = rd(this.state.value);
        const patterns = query.split(" ").map(t => new RegExp('\\b' + escapeRegExp(t), 'gi'));
        const narrowPattern = new RegExp(`\\b${escapeRegExp(query)}.*`, 'gi');
        return this.languages.filter(lang => patterns.reduce(
            (p, pat) => p && rd(lang.name).match(pat),
            true
        ) || lang.other_names.reduce(
            (n, name) => n || rd(name).match(narrowPattern),
            false
        ));
    }

    render() {
        let filtered = "";
        let selected = null;
        if (!this.guessId && this.state.value) {
            const self = this;
            let list = this.filteredLangs().map(function (lang, i) {
                let classes = "Lang";
                if (i === self.state.selected) {
                    classes += " Selected";
                    selected = lang;
                }
                return (
                    <li className={classes} key={lang.id} value={lang.id} role="option"
                        onClick={self.handleSelect} id={"lang-" + lang.id}>
                        {lang.name}
                    </li>);
            });
            filtered = (
                <ul className="LangList" id="languages" aria-label="languages" role="listbox">
                    {list}
                </ul>
            )
        }
        const t = this.props.t;
        return (
            <div className="LookupWrapper">
                <label className="Hidden" htmlFor="guess-lookup">{t("lookup.description")}</label>
                <input id="guess-lookup" type="text" className="Guess Lookup" autoFocus role="combobox"
                       placeholder={t("lookup.prompt")} value={this.state.value}
                       aria-controls="languages"
                       aria-autocomplete="list"
                       aria-expanded={filtered ? "true" : "false"}
                       aria-activedescendant={selected ? "lang-" + selected.id : "none"}
                       onBlur={this.handleBlur}
                       onChange={this.handleChange} onKeyDown={this.handleKeypress}/>
                {filtered}
            </div>
        )
    }

    componentWillUnmount() {
        this.languages = [];
    }

    loadLanguages() {
        this.fetch("/language/all.json?language="+this.props.i18n.resolvedLanguage,
            (result) => {
                this.languages = result;
                if (this.props.hiddenOptions && this.props.hiddenOptions.length > 0) {
                    this.languages = this.languages.concat(this.props.hiddenOptions);
                    this.languages.sort((a, b) => compare(
                        a.name.toLowerCase(),
                        b.name.toLowerCase()
                    ));
                }
            }
        );
    }

    componentDidMount() {
        this.loadLanguages();
        this.props.i18n.on('languageChanged', () => {
            this.loadLanguages();
        });
    }
}

export default withTranslation()(Lookup);
