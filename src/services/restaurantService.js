const RESTAURANT_API = 'https://corsproxy.io/?key=webdemo1&url=https%3A%2F%2Fwww.swiggy.com%2Fdapi%2Frestaurants%2Flist%2Fv5%3Flat%3D17.38430%26lng%3D78.45830%26is-seo-homepage-enabled%3Dtrue%26page_type%3DDESKTOP_WEB_LISTING'

function findRestaurantCards(payload) {
  const cards = payload?.data?.cards ?? []
  const restaurantsCard = cards.find((card) => card?.card?.card?.gridElements?.infoWithStyle?.restaurants)
  return restaurantsCard?.card?.card?.gridElements?.infoWithStyle?.restaurants ?? []
}

export async function getRestaurants(signal) {
  const response = await fetch(RESTAURANT_API, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Restaurant service returned ${response.status}`)
  const payload = await response.json()
  const restaurants = findRestaurantCards(payload).map(({ info }) => ({
    id: info.id,
    name: info.name,
    cuisine: info.cuisines?.join(', ') || 'Local favorites',
    rating: info.avgRating || '—',
    ratingCount: info.totalRatingsString || '',
    deliveryTime: info.sla?.deliveryTime ?? '—',
    cost: info.costForTwo || 'Price varies',
    image: info.cloudinaryImageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_600/${info.cloudinaryImageId}` : '',
    promoted: Boolean(info.promoted),
    offer: info.aggregatedDiscountInfoV3?.header || '',
  })).filter((restaurant) => restaurant.id && restaurant.name)
  if (!restaurants.length) throw new Error('The restaurant list was empty or had an unexpected format.')
  return restaurants
}
