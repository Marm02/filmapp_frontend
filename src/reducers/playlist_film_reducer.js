import { userConstants } from "../constants";

export function playlistFilm(state = {}, action) {

    switch (action.type) {
        case userConstants.PLAYLIST_FILM_ACTION:
            return { playlistFilm: action.operation};
        default:
            return state
    }
}