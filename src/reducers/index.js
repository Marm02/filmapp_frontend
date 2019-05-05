import { combineReducers } from "redux";

import { auth} from "./auth_reducer";
import { registration} from "./registration_reducer";
import { alert } from "./alert_reducer";
import { rate } from "./rating_reducer";
import { playlistFilm } from "./playlist_film_reducer";

const reducer = combineReducers({
    auth,
    registration,
    alert,
    rate,
    playlistFilm
});

export default reducer;