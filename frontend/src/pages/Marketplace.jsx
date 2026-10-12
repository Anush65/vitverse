
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./Marketplace.css";

const categories = [
  "All",
  "Academic",
  "Electronics",
  "Essentials",
  "Clothing",
  "Sports",
  "Other",
];

export default function Marketplace() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Academic",
    type: "sell",
    price: "",
    rentalPeriod: "hour",
    condition: "Good",
    imageUrl: "",
  });
  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Choose a JPG, PNG, or WebP image.");
        event.target.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setError("Image must be 5 MB or smaller.");
        event.target.value = "";
        return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
}

  async function fetchListings() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/listings", {
        params: { search, category, type, minPrice, maxPrice },
      });
      setListings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load listings. Check that your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, [search, category, type, minPrice, maxPrice]);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
        let images = [];
        if (imageFile) {
            const uploadData = new FormData();
            uploadData.append("image", imageFile);

            const uploadResponse = await api.post("/uploads", uploadData);

            images = [
                `http://localhost:5000${uploadResponse.data.imageUrl}`,
            ];
        }

        await api.post("/listings", {
            ...form,
            price: Number(form.price),
            images,
        });


      setForm({
        title: "",
        description: "",
        category: "Academic",
        type: "sell",
        price: "",
        rentalPeriod: "hour",
        condition: "Good",
        imageUrl: "",
      });

      setShowForm(false);
      await fetchListings();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create listing. Please log in again if your session has expired.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="marketplace-page">
      <Navbar />

      <main className="marketplace-container">
        <section className="marketplace-heading">
          <div>
            <p className="marketplace-eyebrow">THE VIT STUDENT COMMUNITY</p>
            <h1>Campus Marketplace</h1>
            <p>Buy, sell, and rent essentials from fellow students.</p>
          </div>
          <button
            className="marketplace-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "+ List an Item"}
          </button>
        </section>

        {showForm && (
          <form className="listing-form" onSubmit={handleSubmit}>
            <h2>Create a listing</h2>

            <label>
              Item name
              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                maxLength={100}
                required
                placeholder="e.g. Scientific calculator"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                maxLength={2000}
                required
                placeholder="Describe the item and its condition"
              />
            </label>

            <div className="marketplace-form-grid">
              <label>
                Category
                <select name="category" value={form.category} onChange={updateForm}>
                  {categories.filter((item) => item !== "All").map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                Listing type
                <select name="type" value={form.type} onChange={updateForm}>
                  <option value="sell">For sale</option>
                  <option value="rent">For rent</option>
                </select>
              </label>

              <label>
                Price (₹)
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={updateForm}
                  required
                />
              </label>

              {form.type === "rent" && (
                <label>
                  Rental duration
                  <select name="rentalPeriod" value={form.rentalPeriod} onChange={updateForm}>
                    <option value="hour">Per hour</option>
                    <option value="day">Per day</option>
                    <option value="week">Per week</option>
                  </select>
                </label>
              )}

              <label>
                Condition
                <select name="condition" value={form.condition} onChange={updateForm}>
                  {["New", "Like New", "Good", "Fair"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                Upload item photo
                <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                />
               {imagePreview && (
                <img
                src={imagePreview}
                alt="Selected item preview"
                style={{
                    width: "180px",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginTop: "8px",
                }}
                />
              )}
             </label>
            </div>

            <button className="marketplace-primary" disabled={saving}>
              {saving ? "Publishing..." : "Publish Listing"}
            </button>
          </form>
        )}

        <section className="marketplace-filters">
          <input
            aria-label="Search listings"
            placeholder="Search books, electronics, essentials..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>

          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Buy or rent</option>
            <option value="sell">For sale</option>
            <option value="rent">For rent</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />

          <input
            type="number"
            min="0"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </section>

        {error && <p className="marketplace-error">{error}</p>}

        {loading ? (
          <p className="marketplace-message">Loading marketplace...</p>
        ) : listings.length === 0 ? (
          <div className="marketplace-empty">
            <h2>No listings found</h2>
            <p>Try different filters or be the first to list an item.</p>
          </div>
        ) : (
          <section className="listing-grid">
            {listings.map((item) => (
              <article className="listing-card" key={item._id}>
                {item.images?.[0] ? (
                  <img
                    className="listing-image"
                    src={item.images[0]}
                    alt={item.title}
                  />
                ) : (
                  <div className="listing-image-placeholder">No image</div>
                )}

                <div className="listing-card-content">
                  <div className="listing-tags">
                    <span>{item.category}</span>
                    <span>{item.type === "rent" ? "For rent" : "For sale"}</span>
                  </div>

                  <h2>{item.title}</h2>
                  <p className="listing-description">{item.description}</p>

                  <p className="listing-price">
                    ₹{item.price}
                    {item.type === "rent" && (
                      <span> / {item.rentalPeriod}</span>
                    )}
                  </p>

                  <p className="listing-condition">
                    Condition: {item.condition || "Good"}
                  </p>
                  <p className="listing-seller">
                    Seller: {item.seller?.name || "VIT student"}
                  </p>

                  <button
                    className="marketplace-secondary"
                    onClick={() => {
                      if (item.seller?._id) {
                        alert(`Contact ${item.seller.name || "the seller"}: ${item.seller.email || "Email unavailable"}`);
                      } else {
                        alert("Seller contact details are unavailable.");
                      }
                    }}
                  >
                    Contact Seller
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
