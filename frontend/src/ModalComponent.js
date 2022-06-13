import React from "react";
import {inClass} from "./utils";

class ModalComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.title = "Modal"
        this.state = {on: false};
        this.close = this.close.bind(this);
        this.onClick = this.onClick.bind(this);
        this.contents = this.contents.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        return {on: props.on};
    }

    close(event) {
        this.props.onClose(event);
    }

    onClick(event) {
        if (inClass(event.target, "Close") || event.target.classList.contains("Overlay")) {
            this.close();
        }
    }

    render() {
        const t = this.props.t || ((s) => s); // needs to be injected in subclasses
        let opacity = this.state.on ? 1 : 0;
        let height = this.state.on ? "100vh" : 0;
        return (
            <div className="Overlay" onClick={this.onClick} style={{
                opacity: opacity, height: height
            }} aria-hidden={this.state.on ? "false" : "true"} aria-live="polite">
                <div className="ModalContainer">
                    <h1>{this.title}</h1>
                    <hr/>
                    {this.contents()}
                    <a className="Close Icon">
                        <span className="Description">{t('buttons.close')}</span>
                        <i className="fa-solid fa-circle-xmark"></i>
                    </a>
                </div>
            </div>
        )
    }

    contents() {
    }
}

export default ModalComponent;