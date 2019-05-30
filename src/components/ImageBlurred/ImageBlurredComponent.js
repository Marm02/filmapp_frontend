import React, {Component} from 'react';
import {config} from "../../config";

class ImageBlurredComponent extends Component {

    constructor(props){
        super(props);

        this.state = {image : ''}


    }


    componentDidMount() {
        const {image} = this.props;
        this.setState({image: image});
    }

    render() {


       return (

           <img
           onLoad={ () => {
               let {image} = this.state;
               image = image.replace("preview", "small");
               this.setState({image: image});
           }}
           alt=""
           className="embed-responsive-item image"
           src={this.state.image}
           onClick={() => this.props.setRedirect()}/>);
   }
}

export default ImageBlurredComponent;