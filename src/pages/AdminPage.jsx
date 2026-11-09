import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Container,
  Modal,
  Spinner,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";
import { useConcert } from "../context/ConcertContext";
import ConcertForm from "../components/ConcertForm";
import ArtistForm from "../components/ArtistForm";
import ScheduleForm from "../components/ScheduleForm";
import TicketForm from "../components/TicketForm";
import AdminBookings from "../components/AdminBookings";
import { getBookings } from "../services/bookingService";
import { getSold } from "../utils/booking";
import { formatMoney } from "../utils/formatters";

const editorNames = {
  artists: "nghệ sĩ",
  schedule: "tiết mục",
  ticketTypes: "hạng vé",
  concert: "chương trình",
};

export default function AdminPage() {
  const {
    concert,
    loading,
    error,
    reload,
    initialize,
    saveConcert,
    removeConcert,
  } = useConcert();
  const [activeTab, setActiveTab] = useState("info");
  const [initializing, setInitializing] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleInitialize() {
    if (initializing) return;
    setInitializing(true);
    setSetupError("");
    try {
      await initialize();
    } catch (error) {
      setSetupError(error.message);
    } finally {
      setInitializing(false);
    }
  }

  function openEditor(type, item = null) {
    setEditor({ type, item });
    setNotice("");
  }

  async function handleSaveItem(values) {
    setSaving(true);
    try {
      if (editor.type === "ticketTypes" && editor.item) {
        const bookings = await getBookings(concert.id);
        if (Number(values.capacity) < getSold(editor.item.id, bookings))
          throw new Error("Tổng số vé không được nhỏ hơn số vé đang được đặt.");
      }
      const item = {
        ...values,
        id: editor.item?.id || editor.type + "-" + Date.now(),
      };
      let items = editor.item
        ? concert[editor.type].map((current) =>
            current.id === item.id ? item : current,
          )
        : [...concert[editor.type], item];
      if (editor.type === "ticketTypes" && item.featured)
        items = items.map((current) => ({
          ...current,
          featured: current.id === item.id,
        }));
      await saveConcert({ ...concert, [editor.type]: items });
      setNotice("Đã lưu " + editorNames[editor.type] + ".");
      setEditor(null);
    } finally {
      setSaving(false);
    }
  }

  function openDelete(type, item) {
    setDeleteTarget({ type, item });
    setDeleteError("");
    setNotice("");
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      if (deleteTarget.type === "concert") {
        const bookings = await getBookings(concert.id);
        if (bookings.length > 0)
          throw new Error(
            "Concert đã có đơn đặt vé nên không được xóa. Bạn có thể chỉnh sửa hoặc ngừng mở bán hạng vé.",
          );
        await removeConcert();
      } else {
        if (deleteTarget.type === "ticketTypes") {
          const bookings = await getBookings(concert.id);
          if (getSold(deleteTarget.item.id, bookings) > 0)
            throw new Error(
              "Hạng vé còn đơn hiệu lực. Hãy ngừng mở bán thay vì xóa.",
            );
        }
        await saveConcert({
          ...concert,
          [deleteTarget.type]: concert[deleteTarget.type].filter(
            (item) => item.id !== deleteTarget.item.id,
          ),
        });
        setNotice("Đã xóa " + editorNames[deleteTarget.type] + ".");
      }
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading)
    return (
      <Container className="page-space">
        <div role="status">
          <Spinner size="sm" /> Đang tải dữ liệu quản lý...
        </div>
      </Container>
    );
  if (!concert)
    return (
      <Container className="page-space">
        <div className="page-heading compact">
          <span className="eyebrow">ADMIN / GET STARTED</span>
          <h1>Thiết lập chương trình.</h1>
        </div>
        <div className="surface-panel setup-panel">
          {(error || setupError) && (
            <Alert variant="danger">{setupError || error}</Alert>
          )}
          <h2 className="h4">Khởi tạo Midnight Live</h2>
          <p>
            Chuẩn bị hai resource <strong>events</strong> và{" "}
            <strong>bookings</strong> theo file <strong>MOCKAPI.md</strong>. URL
            của project đặt trong <strong>.env</strong>.
          </p>
          <p className="text-body-secondary">
            Nút bên dưới gửi dữ liệu concert, nghệ sĩ, lịch trình và hạng vé mẫu
            lên MockAPI. Các bản ghi cũ được giữ lại; mã chương trình do MockAPI
            tự sinh.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Button onClick={handleInitialize} disabled={initializing}>
              {initializing ? "Đang khởi tạo..." : "Khởi tạo dữ liệu mẫu"}
            </Button>
            <Button
              variant="outline-light"
              onClick={reload}
              disabled={initializing}
            >
              Tải lại dữ liệu
            </Button>
          </div>
        </div>
      </Container>
    );

  return (
    <Container className="page-space admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">BACKSTAGE / ADMIN</span>
          <h1>Quản lý concert.</h1>
          <p className="text-body-secondary">
            {concert.title} · ID {concert.id}
          </p>
        </div>
        <Button as={Link} to="/" variant="outline-light">
          Xem trang chủ →
        </Button>
      </div>
      <div className="stats-row">
        <div>
          <span>Nghệ sĩ tham gia</span>
          <strong>{concert.artists.length}</strong>
        </div>
        <div>
          <span>Tiết mục / hoạt động</span>
          <strong>{concert.schedule.length}</strong>
        </div>
        <div>
          <span>Tổng sức chứa</span>
          <strong>{concert.capacity}</strong>
        </div>
      </div>
      {notice && (
        <Alert variant="success" dismissible onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}
      <Tabs
        activeKey={activeTab}
        onSelect={(key) => {
          setActiveTab(key);
          setNotice("");
        }}
        className="admin-tabs"
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="info" title="Thông tin concert">
          <div className="surface-panel">
            <h2 className="h4 mb-4">Thông tin chương trình</h2>
            <ConcertForm
              key={concert.id}
              concert={concert}
              onSubmit={saveConcert}
            />
          </div>
          <div className="danger-zone">
            <div>
              <h3 className="h6">Xóa chương trình</h3>
              <p className="small text-body-secondary mb-0">
                Chỉ cho phép khi chưa có đơn đặt vé.
              </p>
            </div>
            <Button
              variant="outline-danger"
              onClick={() => openDelete("concert", { name: concert.title })}
            >
              Xóa chương trình
            </Button>
          </div>
        </Tab>
        <Tab eventKey="artists" title="Nghệ sĩ">
          <div className="admin-toolbar">
            <h2 className="h4 mb-0">Danh sách nghệ sĩ</h2>
            <Button onClick={() => openEditor("artists")}>
              ＋ Thêm nghệ sĩ
            </Button>
          </div>
          {concert.artists.length === 0 ? (
            <Alert variant="info">Chưa có nghệ sĩ.</Alert>
          ) : (
            <div className="table-panel">
              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nghệ sĩ</th>
                    <th>Thể loại</th>
                    <th>Giới thiệu</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {concert.artists.map((artist) => (
                    <tr key={artist.id}>
                      <td className="fw-semibold">{artist.name}</td>
                      <td>{artist.genre}</td>
                      <td className="description-cell">{artist.description}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => openEditor("artists", artist)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDelete("artists", artist)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Tab>
        <Tab eventKey="schedule" title="Lịch trình">
          <div className="admin-toolbar">
            <h2 className="h4 mb-0">Timeline chương trình</h2>
            <Button onClick={() => openEditor("schedule")}>
              ＋ Thêm tiết mục
            </Button>
          </div>
          {concert.schedule.length === 0 ? (
            <Alert variant="info">Chưa có lịch trình.</Alert>
          ) : (
            <div className="table-panel">
              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Khung giờ</th>
                    <th>Tiết mục</th>
                    <th>Nghệ sĩ / hoạt động</th>
                    <th>Loại</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {[...concert.schedule]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <tr key={slot.id}>
                        <td className="text-nowrap">
                          {slot.startTime} – {slot.endTime}
                        </td>
                        <td>{slot.title}</td>
                        <td>{slot.performer}</td>
                        <td>
                          <Badge
                            bg={
                              slot.type === "highlight"
                                ? "primary"
                                : "secondary"
                            }
                          >
                            {slot.type === "highlight"
                              ? "Đặc biệt"
                              : slot.type === "activity"
                                ? "Hoạt động"
                                : "Biểu diễn"}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-light"
                              size="sm"
                              onClick={() => openEditor("schedule", slot)}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDelete("schedule", slot)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}
        </Tab>
        <Tab eventKey="tickets" title="Hạng vé">
          <div className="admin-toolbar">
            <h2 className="h4 mb-0">Hạng vé & giá bán</h2>
            <Button onClick={() => openEditor("ticketTypes")}>
              ＋ Thêm hạng vé
            </Button>
          </div>
          {concert.ticketTypes.length === 0 ? (
            <Alert variant="info">Chưa có hạng vé.</Alert>
          ) : (
            <div className="table-panel">
              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Hạng vé</th>
                    <th>Giá</th>
                    <th>Tổng số vé</th>
                    <th>Mở bán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {concert.ticketTypes.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="fw-semibold">
                        {ticket.name}
                        {ticket.featured && (
                          <span
                            className="ms-2 text-accent"
                            aria-label="Nổi bật"
                          >
                            ✦
                          </span>
                        )}
                      </td>
                      <td className="text-nowrap">
                        {formatMoney(ticket.price)}
                      </td>
                      <td>{ticket.capacity}</td>
                      <td>
                        <Badge bg={ticket.active ? "success" : "secondary"}>
                          {ticket.active ? "Đang bán" : "Tạm ngừng"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => openEditor("ticketTypes", ticket)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDelete("ticketTypes", ticket)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Tab>
        <Tab eventKey="bookings" title="Đơn đặt vé">
          <AdminBookings concert={concert} />
        </Tab>
      </Tabs>

      <Modal
        show={Boolean(editor)}
        onHide={() => {
          if (!saving) setEditor(null);
        }}
        backdrop="static"
        keyboard={!saving}
        centered
        aria-labelledby="editor-title"
      >
        <Modal.Header closeButton={!saving} closeLabel="Đóng">
          <Modal.Title id="editor-title">
            {editor
              ? (editor.item ? "Sửa " : "Thêm ") + editorNames[editor.type]
              : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editor?.type === "artists" && (
            <ArtistForm
              artist={editor.item}
              onSubmit={handleSaveItem}
              onCancel={() => setEditor(null)}
            />
          )}
          {editor?.type === "schedule" && (
            <ScheduleForm
              slot={editor.item}
              schedule={concert.schedule}
              onSubmit={handleSaveItem}
              onCancel={() => setEditor(null)}
            />
          )}
          {editor?.type === "ticketTypes" && (
            <TicketForm
              ticket={editor.item}
              onSubmit={handleSaveItem}
              onCancel={() => setEditor(null)}
            />
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={Boolean(deleteTarget)}
        onHide={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        backdrop="static"
        keyboard={!deleting}
        centered
        aria-labelledby="delete-title"
      >
        <Modal.Header closeButton={!deleting} closeLabel="Đóng">
          <Modal.Title id="delete-title">
            Xóa {deleteTarget ? editorNames[deleteTarget.type] : ""}?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <p>
            Bạn muốn xóa{" "}
            <strong>
              {deleteTarget?.item.name || deleteTarget?.item.title}
            </strong>
            ?
          </p>
          <p className="small text-body-secondary mb-0">
            Thay đổi sẽ được lưu lên dữ liệu của chương trình.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-light"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
          >
            Quay lại
          </Button>
          <Button variant="danger" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
