import React from "react";

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.image = React.createRef();
    }

    componentDidMount() {
        const context = this.canvas.current.getContext('2d');
        this.props.draw(context);
        this.image.current.src = this.canvas.current.toDataURL();
    }

    render() {
        const {draw, ...rest} = this.props;
        return <div className="CanvasContainer">
            <canvas ref={this.canvas} className="Hide" {...rest}/>
            <img ref={this.image} alt={this.props.title} style={{
                width: this.props.width, height: this.props.height
            }}/>
        </div>;
    }
}

export default Canvas;
