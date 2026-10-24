import { useEffect, useMemo, useState } from 'react'
import { ArrowDownWideNarrow, ArrowRight, Bike, Check, ChevronDown, Clock3, Heart, MapPin, Minus, Plus, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Star, Utensils, X } from 'lucide-react'
import { getRestaurants } from './services/restaurantService.js'

const categories = [
  { name: 'All', icon: '🍽️' }, { name: 'Biryani', icon: '🍛' }, { name: 'Pizza', icon: '🍕' },
  { name: 'Burgers', icon: '🍔' }, { name: 'Chinese', icon: '🥡' }, { name: 'South Indian', icon: '🥞' }, { name: 'Desserts', icon: '🍰' },
]
const fallbackPhotos = ['photo-1513104890138-7c749659a591','photo-1568901346375-23c9450c58cd','photo-1565299624946-b28f40a0ae38','photo-1569718212165-3a8278d5f624','photo-1567620905732-2d1ec7ab7445','photo-1555939594-58d7cb561ad1']

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('Recommended')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [onlyTopRated, setOnlyTopRated] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  async function loadRestaurants() {
    setLoading(true); setError('')
    try { setRestaurants(await getRestaurants()) }
    catch (cause) { setError(cause.message || 'Something went wrong while loading restaurants.') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadRestaurants() }, [])

  const visibleRestaurants = useMemo(() => {
    let list = restaurants.filter((item) => `${item.name} ${item.cuisine}`.toLowerCase().includes(query.toLowerCase()))
    if (category !== 'All') list = list.filter((item) => item.cuisine.toLowerCase().includes(category.toLowerCase().replace('burgers', 'burger')))
    if (onlyTopRated) list = list.filter((item) => Number(item.rating) >= 4.2)
    if (sort === 'Rating') list = [...list].sort((a, b) => Number(b.rating) - Number(a.rating))
    if (sort === 'Delivery time') list = [...list].sort((a, b) => Number(a.deliveryTime) - Number(b.deliveryTime))
    return list
  }, [restaurants, query, category, onlyTopRated, sort])
  const cartCount = cart.reduce((total, item) => total + item.qty, 0)
  const cartTotal = cart.reduce((total, item) => total + item.qty * item.price, 0)

  function addToCart(restaurant) {
    setCart((items) => {
      const existing = items.find((item) => item.id === restaurant.id)
      return existing ? items.map((item) => item.id === restaurant.id ? { ...item, qty: item.qty + 1 } : item) : [...items, { id: restaurant.id, name: restaurant.name, price: 249, qty: 1 }]
    })
  }
  function updateQty(id, delta) { setCart((items) => items.map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item).filter((item) => item.qty > 0)) }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="QuickBite home"><span className="brand-mark"><Utensils size={19} strokeWidth={2.6}/></span><span>quick<span className="brand-accent">bite</span><i>.</i></span></a>
      <button className="location-pill"><span className="location-icon"><MapPin size={16}/></span><span className="location-copy"><small>Delivering to</small><strong>Hyderabad, Telangana</strong></span><ChevronDown size={15}/></button>
      <nav className="top-links"><a href="#restaurants">Restaurants</a><a href="#why-us">How it works</a><a href="#footer">About</a></nav>
      <button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={17}/><span>My cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
    </header>
    <main id="top">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> GOOD FOOD, GOOD MOOD</div><h1>Your next<br/>great meal <span>starts here.</span></h1><p>From the neighborhood's best kitchens to your doorstep. Find your new favorite, one bite at a time.</p><div className="hero-points"><span><Check size={14}/> Carefully picked kitchens</span><span><Check size={14}/> Right to your door</span></div></div>
        <div className="hero-art"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-food">🍜</div><div className="floating-note note-top"><span>🥢</span><div><b>Made with love</b><small>Fresh from the kitchen</small></div></div><div className="floating-note note-bottom"><span className="note-star">★</span><div><b>4.9 <small>/ 5</small></b><small>Food lovers agree</small></div></div><div className="hero-spark spark-a">✦</div><div className="hero-spark spark-b">✦</div></div>
        <div className="hero-foot"><span className="hero-scroll">SCROLL TO EXPLORE <span>↓</span></span><span className="hero-index">01 <i>/</i> 03</span></div>
      </section>
      <section className="browse-section" id="restaurants"><div className="section-heading"><div><div className="eyebrow"><span className="live-dot"/> THE NEIGHBORHOOD EDIT</div><h2>Find your <em>flavor.</em></h2><p>Good things are cooking around you.</p></div><div className="search-wrap"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Dishes, restaurants, cravings…" aria-label="Search restaurants"/>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={15}/></button>}<kbd>⌘ K</kbd></div></div>
        <div className="category-list">{categories.map((item) => <button key={item.name} className={`category-chip ${category === item.name ? 'active' : ''}`} onClick={() => setCategory(item.name)}><span>{item.icon}</span>{item.name}</button>)}</div>
        <div className="results-toolbar"><div><strong>{loading ? 'Finding your favorites…' : `${visibleRestaurants.length} restaurants`}</strong><span> near Jubilee Hills</span></div><div className="toolbar-actions"><button className={`filter-btn ${onlyTopRated ? 'selected' : ''}`} onClick={() => setOnlyTopRated(!onlyTopRated)}><SlidersHorizontal size={14}/><span>Top rated</span></button><label className="sort-select"><ArrowDownWideNarrow size={15}/><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort restaurants"><option>Recommended</option><option>Rating</option><option>Delivery time</option></select><ChevronDown size={13}/></label></div></div>
        {loading ? <div className="restaurant-grid">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-photo"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}</div> : error ? <div className="state-card"><span className="state-icon">🥡</span><h3>We couldn't reach the kitchen</h3><p>{error} This can happen when the public proxy is busy.</p><button className="primary-button" onClick={loadRestaurants}>Try again <ArrowRight size={15}/></button></div> : visibleRestaurants.length === 0 ? <div className="state-card"><span className="state-icon">🔎</span><h3>No matches just yet</h3><p>Try another search or browse all the flavors.</p><button className="primary-button" onClick={() => { setQuery(''); setCategory('All'); setOnlyTopRated(false) }}>Show all restaurants <ArrowRight size={15}/></button></div> : <div className="restaurant-grid">{visibleRestaurants.map((restaurant, index) => <article className="restaurant-card" key={restaurant.id}><div className="restaurant-photo"><img src={restaurant.image || `https://images.unsplash.com/${fallbackPhotos[index % fallbackPhotos.length]}?auto=format&fit=crop&w=720&q=80`} alt={restaurant.name} loading="lazy"/><span className="photo-shade"/>{restaurant.offer && <span className="offer-tag">{restaurant.offer}</span>}<button className={`favorite-btn ${favorites.includes(restaurant.id) ? 'hearted' : ''}`} onClick={() => setFavorites((items) => items.includes(restaurant.id) ? items.filter((id) => id !== restaurant.id) : [...items, restaurant.id])} aria-label={favorites.includes(restaurant.id) ? 'Remove from favorites' : 'Add to favorites'}><Heart size={16} fill={favorites.includes(restaurant.id) ? 'currentColor' : 'none'}/></button><span className="photo-count">{String(index + 1).padStart(2, '0')} <i>/ {String(visibleRestaurants.length).padStart(2, '0')}</i></span></div><div className="restaurant-info"><div className="restaurant-title"><h3>{restaurant.name}</h3>{restaurant.promoted && <span className="promoted">POPULAR</span>}</div><p className="cuisine">{restaurant.cuisine}</p><div className="restaurant-meta"><span className="rating"><Star size={13} fill="currentColor"/>{restaurant.rating} <small>({restaurant.ratingCount || 'loved'})</small></span><span className="meta-separator"/><span><Clock3 size={13}/>{restaurant.deliveryTime} min</span><span className="meta-separator"/><span>{restaurant.cost}</span></div><button className="add-button" onClick={() => addToCart(restaurant)}><Plus size={15}/> Add to bag <span>₹249+</span></button></div></article>)}</div>}
        {!loading && !error && restaurants.length > 0 && <div className="list-source"><span/> Live picks from Swiggy · Hyderabad <button onClick={loadRestaurants}>Refresh <ArrowRight size={12}/></button></div>}
      </section>
      <section className="promise-section" id="why-us"><div className="promise-intro"><span className="eyebrow">A LITTLE MORE DELIGHT</span><h2>Food should feel<br/><em>like a love letter.</em></h2><p>We make finding a really good meal feel as good as eating one.</p></div><div className="promise-item"><div className="promise-icon peach"><Bike size={20}/></div><span className="promise-number">01 — DELIVERY</span><h3>At your door,<br/>right on time.</h3><p>Local kitchens, tracked deliveries, no guesswork.</p><ArrowRight size={18}/></div><div className="promise-item"><div className="promise-icon green"><ShieldCheck size={20}/></div><span className="promise-number">02 — QUALITY</span><h3>Only the good<br/>stuff makes it.</h3><p>Real ratings and crowd favorites worth returning to.</p><ArrowRight size={18}/></div><div className="promise-item"><div className="promise-icon yellow"><Heart size={20}/></div><span className="promise-number">03 — DISCOVERY</span><h3>A new favorite<br/>is waiting.</h3><p>Follow your craving and see where it takes you.</p><ArrowRight size={18}/></div></section>
    </main>
    <footer id="footer"><a className="brand" href="#top"><span className="brand-mark"><Utensils size={17}/></span><span>quick<span className="brand-accent">bite</span><i>.</i></span></a><span>Made for the love of a really good meal.</span><span>© 2025 QuickBite · Built with a little extra sauce.</span></footer>
    {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">YOUR ORDER</span><h2>A tasty choice.</h2></div><button className="close-drawer" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={18}/></button></div>{cart.length === 0 ? <div className="empty-cart"><span>🛍️</span><h3>Your bag is taking a nap.</h3><p>Add something delicious to wake it up.</p><button className="primary-button" onClick={() => { setCartOpen(false); document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' }) }}>Explore restaurants <ArrowRight size={15}/></button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-row" key={item.id}><div><strong>{item.name}</strong><small>QuickBite favorite</small></div><div className="quantity"><button onClick={() => updateQty(item.id, -1)} aria-label="Remove one"><Minus size={13}/></button><b>{item.qty}</b><button onClick={() => updateQty(item.id, 1)} aria-label="Add one"><Plus size={13}/></button></div><strong>₹{item.price * item.qty}</strong></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><b>₹{cartTotal}</b></div><div><span>Delivery</span><b>Free</b></div><div className="cart-total"><span>Total</span><b>₹{cartTotal}</b></div><button className="checkout-button" onClick={() => alert('Checkout is ready to connect to your ordering backend.')}>Continue to checkout <ArrowRight size={16}/></button><p>Taxes calculated at checkout.</p></div></>}</aside></div>}
  </div>
}

export default App
