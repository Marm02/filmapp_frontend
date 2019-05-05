import {Redirect, Route} from "react-router";
import React from "react";
import {config} from "../config";

let pathName = config.pathName;

export const PrivateRoute = ({component: Component, ...rest}) => {
    return <Route
        {...rest}
        render={props =>
            localStorage.getItem("user") ? (
                <Component {...props} />
            ) : (
                <Redirect to={{
                    pathname: `${pathName}login`,
                    state: {from: props.location}
                }}/>
            )
        }/>
};