import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import AppLayout from "../layouts/AppLayout";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import "./Canteen.css";

const STATUS_LABELS = {
  placed: "Order placed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Canteen() {
  const showToast = useToast();
  const [canteens, setCanteens] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  const [openCanteen, setOpenCanteen] = useState(null);
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [placing, setPlacing] = useState(false);

  const [orders, setOrders] = useState([]);

  const fetchMyEntry = useCallback(async () => {
    const res = await api.get("/canteen/queues/me");
    setMyEntry(res.data);
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await api.get("/canteen/orders/mine");
    setOrders(res.data);
  }, []);

  useEffect(() => {
    api.get("/canteen/canteens").then((res) => setCanteens(res.data));
    fetchMyEntry();
    fetchOrders();

    const interval = setInterval(fetchMyEntry, 5000);
    return () => clearInterval(interval);
  }, [fetchMyEntry, fetchOrders]);

  async function handleJoin(canteenId) {
    setError("");
    setJoiningId(canteenId);
    try {
      await api.post("/canteen/queues/join", { canteenId });
      await fetchMyEntry();
      showToast("You're in the queue!");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to join queue";
      setError(message);
      showToast(message, "error");
    } finally {
      setJoiningId(null);
    }
  }

  async function handleLeave() {
    setError("");
    try {
      await api.delete(`/canteen/queues/${myEntry._id}`);
      setMyEntry(null);
      showToast("Left the queue");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to leave queue";
      setError(message);
      showToast(message, "error");
    }
  }

  async function openMenu(canteen) {
    setError("");
    setCart({});
    if (openCanteen?._id === canteen._id) {
      setOpenCanteen(null);
      return;
    }
    setOpenCanteen(canteen);
    setMenuLoading(true);
    try {
      const res = await api.get(`/canteen/canteens/${canteen._id}/menu`);
      setMenu(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu");
    } finally {
      setMenuLoading(false);
    }
  }

  function changeQuantity(item, delta) {
    setCart((prev) => {
      const current = prev[item._id]?.quantity || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[item._id];
      } else {
        updated[item._id] = { item, quantity: next };
      }
      return updated;
    });
  }

  const cartEntries = Object.values(cart);
  const cartTotal = cartEntries.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const cartCount = cartEntries.reduce((sum, { quantity }) => sum + quantity, 0);

  async function placeOrder() {
    setError("");
    setNotice("");
    setPlacing(true);
    try {
      await api.post("/canteen/orders", {
        canteenId: openCanteen._id,
        items: cartEntries.map(({ item, quantity }) => ({ menuItemId: item._id, quantity })),
      });
      setNotice(`Order placed at ${openCanteen.name}!`);
      showToast(`Order placed at ${openCanteen.name}! 🎉`);
      setCart({});
      setOpenCanteen(null);
      await fetchOrders();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to place order";
      setError(message);
      showToast(message, "error");
    } finally {
      setPlacing(false);
    }
  }

  async function cancelOrder(orderId) {
    setError("");
    try {
      await api.delete(`/canteen/orders/${orderId}`);
      await fetchOrders();
      showToast("Order cancelled");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to cancel order";
      setError(message);
      showToast(message, "error");
    }
  }

  return (
    <AppLayout>
      <div className="canteen-page">
      <section className="canteen-hero">
        <div>
          <p className="canteen-eyebrow">GOOD FOOD, LESS WAITING</p>
          <h1>Something delicious is close.</h1>
          <p>Order ahead or check the queue before you head over. Lunch break, reclaimed.</p>
        </div>
        <div className="canteen-hero-illustration" aria-hidden="true">
          <span className="canteen-plate">🍛</span>
          <span className="canteen-hero-spark canteen-spark-one">✳</span>
          <span className="canteen-hero-spark canteen-spark-two">✦</span>
          <span className="canteen-hero-sticker">made for<br />the break</span>
        </div>
      </section>

      <div className="canteen-section-heading">
        <div><p className="canteen-eyebrow">ON CAMPUS</p><h2>Where to eat</h2></div>
        <span>Pick a spot, then let us handle the line.</span>
      </div>

      {error && <p className="text-error" style={{ marginTop: "1rem" }}>{error}</p>}
      {notice && <p className="text-success" style={{ marginTop: "1rem" }}>{notice}</p>}

      {myEntry && (
        <div className="card queue-status">
          <h2>{myEntry.canteen.name}</h2>
          <p>{myEntry.canteen.location}</p>
          <div className="queue-stats">
            <div>
              <span className="queue-stat-value">#{myEntry.position}</span>
              <span className="queue-stat-label">your position</span>
            </div>
            <div>
              <span className="queue-stat-value">{myEntry.estimatedWaitMinutes}m</span>
              <span className="queue-stat-label">estimated wait</span>
            </div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleLeave}>
            Leave queue
          </button>
        </div>
      )}

      <div className="canteen-list">
        {canteens.map((canteen) => (
          <div key={canteen._id} className="canteen-block">
            <div className="card canteen-row">
              <div>
                <div className="canteen-title-row">
                  <h2>{canteen.name}</h2>
                  {canteen.isOpen ? <span className="open-pill"><span /> Open now</span> : null}
                </div>
                <p>{canteen.location}</p>
                <span className="canteen-serving-note">~{canteen.avgServingMinutes || "A few"} min average service</span>
              </div>
              <div className="canteen-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!canteen.isOpen || !!myEntry || joiningId === canteen._id}
                  onClick={() => handleJoin(canteen._id)}
                >
                  Join queue
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={!canteen.isOpen}
                  onClick={() => openMenu(canteen)}
                >
                  {openCanteen?._id === canteen._id ? "Close menu" : "Order food"}
                </button>
              </div>
              {!canteen.isOpen && <span className="closed-pill">Closed</span>}
            </div>

            {openCanteen?._id === canteen._id && (
              <motion.div
                className="card menu-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25 }}
              >
                {menuLoading ? (
                  <p>Loading menu...</p>
                ) : menu.length === 0 ? (
                  <p>No menu items available yet.</p>
                ) : (
                  <div className="menu-grid">
                    {menu.map((item, i) => (
                      <motion.div
                        key={item._id}
                        className="menu-item"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                      >
                        {item.image && <img src={item.image} alt={item.name} className="menu-item-image" />}
                        <div className="menu-item-body">
                          <div className="menu-item-title">
                            <span className={`veg-dot ${item.isVeg ? "veg" : "nonveg"}`} />
                            <h3>{item.name}</h3>
                          </div>
                          <p className="menu-item-description">{item.description}</p>
                          <div className="menu-item-footer">
                            <span className="menu-item-price">₹{item.price}</span>
                            <div className="qty-stepper">
                              <button type="button" onClick={() => changeQuantity(item, -1)}>
                                −
                              </button>
                              <span>{cart[item._id]?.quantity || 0}</span>
                              <button type="button" onClick={() => changeQuantity(item, 1)}>
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {cartCount > 0 && (
                  <div className="cart-bar">
                    <span>
                      {cartCount} item{cartCount > 1 ? "s" : ""} · ₹{cartTotal}
                    </span>
                    <button type="button" className="btn" disabled={placing} onClick={placeOrder}>
                      {placing ? "Placing order..." : "Place order"}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
        {canteens.length === 0 && <p>No canteens available yet.</p>}
      </div>

      <h2 className="orders-heading">My Orders</h2>
      {orders.length === 0 ? (
        <div className="canteen-empty-orders"><span>🥢</span><p>No orders yet. Your next good meal is just above.</p></div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="card order-card">
              <div className="order-card-header">
                <div>
                  <h3>{order.canteen?.name}</h3>
                  <p>{order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</p>
                </div>
                <div className="order-card-meta">
                  <span className={`status-pill status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  <span className="order-total">₹{order.totalAmount}</span>
                </div>
              </div>
              {order.status === "placed" && (
                <button type="button" className="btn btn-secondary" onClick={() => cancelOrder(order._id)}>
                  Cancel order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </AppLayout>
  );
}
