export const initialConcertState = { concert: null, loading: true, error: "" };

export function concertReducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: "" };
    case "LOAD_SUCCESS":
      return { concert: action.payload, loading: false, error: "" };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SAVE_CONCERT":
      return { ...state, concert: action.payload, error: "" };
    default:
      return state;
  }
}
