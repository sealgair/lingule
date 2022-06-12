import React from "react";
import Canvas from "./Canvas";

class ServerComponent extends React.Component {
    constructor(props) {
        super(props);
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            // development build code
            this.server = props.server || "http://" + window.location.host.split(':')[0] + ":8000";
            this.crossDomain = true;
        } else {
            // production build code
            this.server = props.server || "";
            this.crossDomain = false;
        }
        this.fetch = this.fetch.bind(this);
    }

    fetch(url, success, fail) {
        let headers = {};
        if (this.crossDomain) {
            headers = {
                crossDomain: true,
                headers: {'Content-Type': 'application/json'},
            };
        }
        fetch(this.server + url, headers)
            .then(res => res.json())
            .then(
                (result) => {
                    success(result)
                },
                (error) => {
                    if (fail) {
                        fail(error);
                    } else {
                        console.log(error);
                    }
                }
            );
    }
}

export default ServerComponent;
