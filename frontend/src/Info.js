import React from "react";
import ModalComponent from "./ModalComponent";

class Info extends ModalComponent {
    constructor(props, context) {
        super(props, context);
        this.title = "Info";
    }

    contents() {
        return <div className="InfoContent">
            <p>This game was created by Chase Caster</p>
            <p>
                <a href="https://github.com/sealgair/lingule" target="_new">
                    <i className="fa-brands fa-github Icon"></i>
                    See the code
                </a>
            </p>
            <p>
                <a href="https://twitter.com/ChaseCaster" target="_new">
                    <i className="fa-brands fa-twitter Icon"></i>
                    Tweet at me
                </a>
            </p>
            <p>
                <a rel="me" href="https://weirder.earth/@chase" target="_new">
                    <i className="fa-brands fa-mastodon Icon"></i>
                    Toot at me
                </a>
            </p>
            <p>
                The only thing I like more than compliments is bug reports!
            </p>
        </div>;
    }
}

export default Info