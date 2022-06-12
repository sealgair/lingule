import React from "react";
import {ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "react-simple-maps";

class Map extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-50m.json";
    }

    render() {
        return (
            <ComposableMap style={{backgroundColor: "#e1feff"}}
                           width={this.props.width} height={this.props.height}>
                <ZoomableGroup zoom={5} maxZoom={16} center={[this.props.longitude, this.props.latitude]}>
                    <Geographies geography={this.geoUrl}
                                 strokeWidth="0.2"
                                 stroke="#86B197"
                                 fill="#a9dfbf">
                        {({geographies}) =>
                            geographies.map(geo => (
                                <Geography key={geo.rsmKey} geography={geo}/>
                            ))
                        }
                    </Geographies>
                    <Marker coordinates={[this.props.longitude, this.props.latitude]}>
                        <g transform={"rotate(" + this.props.bearing + ")"} stroke="#C30000" fill="#C30000"
                           strokeWidth="0">
                            <circle r="1.2"/>
                            <path d="M 0,0  l 0,-4" strokeWidth="1"/>
                            <path d="M 0,-8 l -1.25,4 l 2.5,0 z"/>
                        </g>
                    </Marker>
                </ZoomableGroup>
            </ComposableMap>
        );
    }
}

export default Map