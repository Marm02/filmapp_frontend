import React, {Component} from 'react';
import {Col} from "react-bootstrap";

import error_404 from '../../images/error-404.png'; // Tell Webpack this JS file uses this image

class NotFoundComponent extends Component{


    render(){
        return(
            <Col xs={12} sm={12} className="embed-responsive embed-responsive-16by9">
                <img className="embed-responsive-item" src={error_404}
                     alt="" />
            </Col>
        )
    }
}

export default NotFoundComponent;