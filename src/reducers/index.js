import { combineReducers } from "redux";

import { auth} from "./auth_reducer";
import { registration} from "./registration_reducer";
import { alert } from "./alert_reducer";
import { playlistFilm } from "./playlist_film_reducer";

const reducer = combineReducers({
    auth,
    registration,
    alert,
    playlistFilm
});

export default reducer;