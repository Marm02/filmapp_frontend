import { userConstants } from "../constants";

export function rate(state = {}, action) {

    switch (action.type) {
        case userConstants.RATED:
            return { rated: action.meta};
        default:
           return state
    }
}