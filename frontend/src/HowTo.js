import Word from "./Word";
import React from "react";
import ModalComponent from "./ModalComponent";

class HowTo extends ModalComponent {
    constructor(props, context) {
        super(props, context);
        this.title = "How To Play";
    }

    contents() {
        return (
            <div>
                <p>
                    Every day you'll get a new <span className="Title">Lingule</span>. You get six guesses to
                    figure out what language the mystery word is.
                </p>
                <Word word="target word" romanization="romanization"
                      ipa="/ipa pronunciation/" meaning="english translation"/>
                <p>After each guess, you'll see how close you got in 6 columns:</p>
                <ul className="HelpList">
                    <li>
                        <i className="fa-solid fa-earth-asia"></i>
                        Macro-Area (e.g. "North America" or "Eurasia")
                    </li>
                    <li>
                        <i className="fa-solid fa-mountain-sun"></i>
                        Language Family (e.g. "Indo-European" or "Afro-Asiatic")
                    </li>
                    <li>
                        <i className="fa-solid fa-mountain"></i>
                        Language Sub-Family (e.g. "Eastern Malayo-Polynesian" or "Benue-Congo")
                    </li>
                    <li>
                        <i className="fa-solid fa-mound"></i>
                        Language Genus (e.g. "Semitic" or "Romance")
                    </li>
                    <li>
                        <i className="fa-regular fa-comments"></i>
                        Language (Will only be green on the correct answer)
                    </li>
                    <li>
                        <i className="fa-regular fa-compass"></i>
                        Geographical direction from guess to target language
                    </li>
                </ul>
                <p>
                    Note that language isolates or near-isolates (e.g. Japanese, Georgian, Basque) will not match the
                    other languages except in macro-area.
                </p>
                <p>
                    Some words may exist in multiple closely-related languages. In those cases, any of those languages
                    will be accepted as the correct answer, but only if the word has the same spelling and meaning
                    (even if it is pronounced differently).
                </p>
                <p>
                    Direction is based on the (approximate) geographical point of origin of a language, even if
                    it is widely spoken. For example, the location for English is England, and Spanish is Spain.
                </p>
                <p>
                    All language data is supplied by <a href="https://wals.info/languoid" target="_new">The World
                    Atlas of Language Structures</a>
                </p>
            </div>
        )
    }
}

export default HowTo;