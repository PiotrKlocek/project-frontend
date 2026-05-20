import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProducts() {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    }

    loadProducts().catch(() => {
      setMessage('Nie udało się pobrać produktów.');
    });
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, product) => sum + product.price, 0),
    [cart]
  );

  function addToCart(product) {
    setCart((currentCart) => [...currentCart, product]);
    setMessage(`${product.name} dodano do koszyka.`);
  }

  function removeFromCart(productId) {
    setCart((currentCart) => {
      const index = currentCart.findIndex((product) => product.id === productId);

      if (index === -1) {
        return currentCart;
      }

      return currentCart.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function submitOrder(event) {
    event.preventDefault();

    if (customerName.trim().length < 2 || cart.length === 0) {
      setMessage('Podaj imię i dodaj produkt do koszyka.');
      return;
    }

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerName,
        items: cart.map((product) => product.id)
      })
    });

    if (!response.ok) {
      setMessage('Nie udało się złożyć zamówienia.');
      return;
    }

    setCart([]);
    setCustomerName('');
    setMessage('Zamówienie zostało złożone.');
  }

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Simple Shop</p>
        </div>
      </header>

      {message && <p className="message">{message}</p>}

      <section className="layout">
        <div className="products">
          {products.map((product) => (
            <article className="card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div className="card-body">
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <strong>{product.price} zł</strong>
                <button type="button" onClick={() => addToCart(product)}>
                  Dodaj do koszyka
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart">
          <h2>Koszyk</h2>
          {cart.length === 0 ? (
            <p>Koszyk jest pusty.</p>
          ) : (
            <ul>
              {cart.map((product, index) => (
                <li key={`${product.id}-${index}`}>
                  <span>{product.name}</span>
                  <button type="button" onClick={() => removeFromCart(product.id)}>
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="total">Razem: {total} zł</p>

          <form onSubmit={submitOrder}>
            <label htmlFor="customerName">Imię klienta</label>
            <input
              id="customerName"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Jan"
            />
            <button type="submit">Złóż zamówienie</button>
          </form>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
