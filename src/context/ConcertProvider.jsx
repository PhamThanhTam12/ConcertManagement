import { useEffect, useReducer, useState } from "react";
import { ConcertContext } from "./ConcertContext";
import {
  concertReducer,
  initialConcertState,
} from "../reducers/concertReducer";
import {
  getConcert,
  createConcert,
  updateConcert,
  deleteConcert,
} from "../services/concertService";
import { useAuth } from "./AuthContext";
import seed from "../data/concertSeed";

export default function ConcertProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(concertReducer, initialConcertState);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: "LOAD_START" });

    async function load() {
      try {
        const data = await getConcert(controller.signal);
        if (!controller.signal.aborted)
          dispatch({ type: "LOAD_SUCCESS", payload: data });
      } catch (error) {
        if (!controller.signal.aborted) {
          dispatch({ type: "LOAD_ERROR", payload: error.message });
        }
      }
    }

    load();
    return () => controller.abort();
  }, [reloadCount]);

  function reload() {
    setReloadCount((current) => current + 1);
  }

  async function initialize() {
    if (user?.role !== "admin")
      throw new Error("Chỉ quản trị viên được khởi tạo chương trình.");
    // Kiểm tra trước để tránh tạo thêm khi concert đã tồn tại.
    const existing = await getConcert();
    const saved = existing || (await createConcert(seed));
    dispatch({ type: "SAVE_CONCERT", payload: saved });
    return saved;
  }

  async function saveConcert(concert) {
    if (user?.role !== "admin")
      throw new Error("Chỉ quản trị viên được cập nhật chương trình.");
    const saved = await updateConcert(concert);
    dispatch({ type: "SAVE_CONCERT", payload: saved });
    return saved;
  }

  async function removeConcert() {
    if (user?.role !== "admin")
      throw new Error("Chỉ quản trị viên được xóa chương trình.");
    await deleteConcert(state.concert.id);
    dispatch({ type: "SAVE_CONCERT", payload: null });
  }

  return (
    <ConcertContext.Provider
      value={{ ...state, reload, initialize, saveConcert, removeConcert }}
    >
      {children}
    </ConcertContext.Provider>
  );
}
