import React, {Component} from 'react';
import {Col} from "react-bootstrap";

class NotFoundComponent extends Component{


    render(){
        return(
            <Col xs={12} sm={12} className="embed-responsive embed-responsive-16by9">
                <img className="embed-responsive-item" src="https://cdn.shopify.com/s/files/1/0322/6897/files/404-permalink.png?432866230176278629"
                     alt="404 error" />
            </Col>
        )
    }
}

export default NotFoundComponent;