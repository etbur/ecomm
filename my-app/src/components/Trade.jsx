import React from 'react';

const Trade = () => {
  return (
    <section id="trade" className="page">
      <div className="container">
        <h2 className="page-title">Advanced Trading</h2>
        <p className="page-subtitle">Trade with advanced tools and low fees</p>

        <div className="trade-container">
          <div className="trade-widget">
            <h3>Spot Trading</h3>
            <div className="form-group">
              <label htmlFor="buy-amount">Buy Amount</label>
              <input type="text" id="buy-amount" className="form-control" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label htmlFor="buy-currency">Currency</label>
              <select id="buy-currency" className="form-control">
                <option>BTC</option>
                <option>ETH</option>
                <option>BNB</option>
                <option>ADA</option>
              </select>
            </div>
            <button className="btn" style={{ width: '100%' }}>Buy Now</button>
          </div>

          <div className="trade-widget">
            <h3>Sell Order</h3>
            <div className="form-group">
              <label htmlFor="sell-amount">Sell Amount</label>
              <input type="text" id="sell-amount" className="form-control" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label htmlFor="sell-currency">Currency</label>
              <select id="sell-currency" className="form-control">
                <option>BTC</option>
                <option>ETH</option>
                <option>BNB</option>
                <option>ADA</option>
              </select>
            </div>
            <button className="btn" style={{ width: '100%', backgroundColor: '#ff5252' }}>Sell Now</button>
          </div>
        </div>

        <div className="market-data">
          <h3>Market Prices</h3>
          <table className="market-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>24h Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>BTC/USDT</td>
                <td>$42,150.25</td>
                <td className="positive">+2.45%</td>
                <td>$18.2B</td>
              </tr>
              <tr>
                <td>ETH/USDT</td>
                <td>$2,850.75</td>
                <td className="positive">+1.82%</td>
                <td>$9.8B</td>
              </tr>
              <tr>
                <td>BNB/USDT</td>
                <td>$320.50</td>
                <td className="negative">-0.75%</td>
                <td>$1.2B</td>
              </tr>
              <tr>
                <td>ADA/USDT</td>
                <td>$0.52</td>
                <td className="positive">+3.25%</td>
                <td>$480M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Trade;