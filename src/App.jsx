import { useEffect, useState } from "react";
import "./App.css";

const defaultRooms = [
  { id: 101, type: "Shared", capacity: 4, price: 2500, beds: 2 },
  { id: 102, type: "Private", capacity: 1, price: 4000, beds: 1 },
  { id: 103, type: "Shared", capacity: 4, price: 2500, beds: 0 },
  { id: 104, type: "Suite", capacity: 2, price: 5000, beds: 1 },
  { id: 105, type: "Private", capacity: 1, price: 4000, beds: 1 },
  { id: 106, type: "Shared", capacity: 3, price: 2200, beds: 2 },
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [page, setPage] = useState("Overview");
  const [role, setRole] = useState("Student");

  const [rooms, setRooms] = useState(() =>
    loadData("dormRooms", defaultRooms)
  );

  const [applications, setApplications] = useState(() =>
    loadData("dormApplications", [])
  );

  const [bills, setBills] = useState(() =>
    loadData("dormBills", [])
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    phone: "",
  });

  useEffect(() => {
    localStorage.setItem("dormRooms", JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(
      "dormApplications",
      JSON.stringify(applications)
    );
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("dormBills", JSON.stringify(bills));
  }, [bills]);

  function notify(text) {
    setMessage(text);
  }

  function submitApplication(event) {
    event.preventDefault();

    const application = {
      id: Date.now(),
      ...form,
      roomId: selectedRoom.id,
      price: selectedRoom.price,
      date: new Date().toLocaleDateString(),
      status: "Pending",
    };

    setApplications((previous) => [
      application,
      ...previous,
    ]);

    setSelectedRoom(null);
    setForm({ name: "", studentId: "", phone: "" });
    setPage("Applications");
    notify("Application submitted successfully!");
  }

  function updateStatus(application, status) {
    setApplications((previous) =>
      previous.map((item) =>
        item.id === application.id
          ? { ...item, status }
          : item
      )
    );

    if (status === "Approved") {
      setRooms((previous) =>
        previous.map((room) =>
          room.id === application.roomId
            ? { ...room, beds: Math.max(0, room.beds - 1) }
            : room
        )
      );

      setBills((previous) => [
        {
          id: Date.now(),
          student: application.name,
          studentId: application.studentId,
          roomId: application.roomId,
          amount: application.price,
          status: "Unpaid",
        },
        ...previous,
      ]);
    }

    notify(`Application ${status.toLowerCase()}!`);
  }

  function payBill(billId) {
    setBills((previous) =>
      previous.map((bill) =>
        bill.id === billId
          ? { ...bill, status: "Paid" }
          : bill
      )
    );

    notify("Payment recorded successfully!");
  }

  function updateBeds(roomId, amount) {
    setRooms((previous) =>
      previous.map((room) =>
        room.id === roomId
          ? {
              ...room,
              beds: Math.max(0, room.beds + amount),
            }
          : room
      )
    );

    notify("Room availability updated!");
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      String(room.id).includes(search) ||
      room.type.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      room.type === filter ||
      (filter === "Available" && room.beds > 0);

    return matchesSearch && matchesFilter;
  });

  const availableRooms = rooms.filter(
    (room) => room.beds > 0
  ).length;

  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const unpaidTotal = bills
    .filter((bill) => bill.status === "Unpaid")
    .reduce((total, bill) => total + bill.amount, 0);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🏠 DormEase</h2>
        <p>Dormitory Management</p>

        <label className="role-label">LOGIN AS</label>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option>Student</option>
          <option>Admin</option>
        </select>

        <nav>
          {["Overview", "Rooms", "Applications", "Billing"].map(
            (item) => (
              <button
                key={item}
                className={page === item ? "active" : ""}
                onClick={() => {
                  setPage(item);
                  setMessage("");
                }}
              >
                {item === "Overview" && "▦ "}
                {item === "Rooms" && "▤ "}
                {item === "Applications" && "▣ "}
                {item === "Billing" && "₱ "}
                {item}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <span>Simple Dormitory System</span>
          <small>React Front End</small>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h3>{page}</h3>
            <span>{role} Portal</span>
          </div>

          <span className="user-badge">
            {role === "Admin" ? "🛡️ Admin" : "🎓 Student"}
          </span>
        </header>

        <section className="content">
          {message && (
            <div className="message">
              {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {page === "Overview" && (
            <>
              <div className="welcome">
                <div>
                  <h1>Welcome to DormEase!</h1>
                  <p>
                    Manage rooms, applications, and dormitory
                    billing in one place.
                  </p>
                </div>

                <button
                  className="primary"
                  onClick={() => setPage("Rooms")}
                >
                  + Browse Rooms
                </button>
              </div>

              <div className="stats">
                <Stat
                  title="Total Rooms"
                  value={rooms.length}
                  icon="🏠"
                />
                <Stat
                  title="Available Rooms"
                  value={availableRooms}
                  icon="🛏️"
                />
                <Stat
                  title="Pending Applications"
                  value={pendingCount}
                  icon="📋"
                />
                <Stat
                  title="Unpaid Bills"
                  value={`₱${unpaidTotal.toLocaleString()}`}
                  icon="💰"
                />
              </div>

              <div className="panel">
                <h2>Quick Actions</h2>

                <div className="quick-actions">
                  <button onClick={() => setPage("Rooms")}>
                    🛏️ Browse available rooms
                  </button>

                  <button
                    onClick={() => setPage("Applications")}
                  >
                    📋 View applications
                  </button>

                  <button onClick={() => setPage("Billing")}>
                    💳 Manage billing
                  </button>
                </div>
              </div>

              <div className="panel">
                <h2>Recent Applications</h2>

                {applications.length === 0 ? (
                  <p className="empty">
                    No applications yet.
                  </p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Room</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 5).map((app) => (
                          <tr key={app.id}>
                            <td>{app.name}</td>
                            <td>Room {app.roomId}</td>
                            <td>
                              <Status value={app.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {page === "Rooms" && (
            <>
              <div className="page-title">
                <h1>Room Listings</h1>
                <p>Search and apply for a dormitory room.</p>
              </div>

              <div className="filters">
                <input
                  placeholder="Search room number or type..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                >
                  <option>All</option>
                  <option>Available</option>
                  <option>Shared</option>
                  <option>Private</option>
                  <option>Suite</option>
                </select>
              </div>

              <div className="room-grid">
                {filteredRooms.map((room) => (
                  <div className="room-card" key={room.id}>
                    <div className="room-picture">🛏️</div>

                    <div className="room-info">
                      <div className="room-heading">
                        <h3>Room {room.id}</h3>
                        <Status
                          value={
                            room.beds > 0 ? "Available" : "Full"
                          }
                        />
                      </div>

                      <p>{room.type} Room</p>
                      <p>Capacity: {room.capacity} person(s)</p>
                      <p>Available beds: {room.beds}</p>

                      <h3 className="price">
                        ₱{room.price.toLocaleString()}
                        <small> / month</small>
                      </h3>

                      {role === "Student" ? (
                        <button
                          className="primary full"
                          disabled={
                            room.beds === 0 ||
                            applications.some(
                              (app) =>
                                app.roomId === room.id &&
                                app.status !== "Rejected"
                            )
                          }
                          onClick={() => setSelectedRoom(room)}
                        >
                          {room.beds === 0
                            ? "Room Full"
                            : applications.some(
                                (app) =>
                                  app.roomId === room.id &&
                                  app.status !== "Rejected"
                              )
                            ? "Already Applied"
                            : "Apply for Room"}
                        </button>
                      ) : (
                        <div className="bed-controls">
                          <button
                            onClick={() => updateBeds(room.id, -1)}
                            disabled={room.beds === 0}
                          >
                            −
                          </button>
                          <span>{room.beds} beds</span>
                          <button
                            onClick={() => updateBeds(room.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredRooms.length === 0 && (
                <div className="panel empty">
                  No rooms match your search.
                </div>
              )}
            </>
          )}

          {page === "Applications" && (
            <>
              <div className="page-title">
                <h1>
                  {role === "Admin"
                    ? "Manage Applications"
                    : "My Applications"}
                </h1>
                <p>
                  {role === "Admin"
                    ? "Approve or reject student room requests."
                    : "Check the status of your room applications."}
                </p>
              </div>

              <div className="panel">
                {applications.length === 0 ? (
                  <p className="empty">
                    No applications available. Browse rooms to apply.
                  </p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Student ID</th>
                          <th>Room</th>
                          <th>Monthly Rent</th>
                          <th>Status</th>
                          {role === "Admin" && <th>Actions</th>}
                        </tr>
                      </thead>

                      <tbody>
                        {applications.map((app) => (
                          <tr key={app.id}>
                            <td>{app.name}</td>
                            <td>{app.studentId}</td>
                            <td>{app.roomId}</td>
                            <td>₱{app.price.toLocaleString()}</td>
                            <td>
                              <Status value={app.status} />
                            </td>

                            {role === "Admin" && (
                              <td>
                                {app.status === "Pending" ? (
                                  <div className="actions">
                                    <button
                                      className="approve"
                                      onClick={() =>
                                        updateStatus(app, "Approved")
                                      }
                                    >
                                      Approve
                                    </button>

                                    <button
                                      className="reject"
                                      onClick={() =>
                                        updateStatus(app, "Rejected")
                                      }
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="muted">
                                    Processed
                                  </span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {page === "Billing" && (
            <>
              <div className="page-title">
                <h1>
                  {role === "Admin" ? "Manage Billing" : "My Billing"}
                </h1>
                <p>Review dormitory rent and payment status.</p>
              </div>

              <div className="stats">
                <Stat
                  title="Total Bills"
                  value={bills.length}
                  icon="📄"
                />
                <Stat
                  title="Unpaid Amount"
                  value={`₱${unpaidTotal.toLocaleString()}`}
                  icon="💰"
                />
                <Stat
                  title="Paid Bills"
                  value={
                    bills.filter((bill) => bill.status === "Paid")
                      .length
                  }
                  icon="✅"
                />
              </div>

              <div className="panel">
                <h2>Billing Statements</h2>

                {bills.length === 0 ? (
                  <p className="empty">
                    No bills yet. Bills are created when an
                    application is approved.
                  </p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Room</th>
                          <th>Amount</th>
                          <th>Status</th>
                          {role === "Admin" && <th>Action</th>}
                        </tr>
                      </thead>

                      <tbody>
                        {bills.map((bill) => (
                          <tr key={bill.id}>
                            <td>{bill.student}</td>
                            <td>{bill.roomId}</td>
                            <td>₱{bill.amount.toLocaleString()}</td>
                            <td>
                              <Status value={bill.status} />
                            </td>

                            {role === "Admin" && (
                              <td>
                                {bill.status === "Unpaid" ? (
                                  <button
                                    className="approve"
                                    onClick={() => payBill(bill.id)}
                                  >
                                    Mark Paid
                                  </button>
                                ) : (
                                  "Completed"
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {selectedRoom && (
        <div
          className="modal-bg"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRoom(null);
            }
          }}
        >
          <form className="modal" onSubmit={submitApplication}>
            <button
              type="button"
              className="close"
              onClick={() => setSelectedRoom(null)}
            >
              ×
            </button>

            <h2>Apply for Room {selectedRoom.id}</h2>

            <p>
              {selectedRoom.type} Room · ₱
              {selectedRoom.price.toLocaleString()} / month
            </p>

            <label>
              Full Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Enter your full name"
              />
            </label>

            <label>
              Student ID
              <input
                required
                value={form.studentId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    studentId: event.target.value,
                  })
                }
                placeholder="Enter your student ID"
              />
            </label>

            <label>
              Contact Number
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="Enter your phone number"
              />
            </label>

            <button className="primary full" type="submit">
              Submit Application
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Status({ value }) {
  const className =
    value === "Approved" ||
    value === "Paid" ||
    value === "Available"
      ? "green-status"
      : value === "Rejected" || value === "Full"
      ? "red-status"
      : "yellow-status";

  return <span className={`status ${className}`}>{value}</span>;
}

export default App;