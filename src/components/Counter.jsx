import './Counter.css';

/**
 * Counter component displaying the AI mention count.
 *
 * @param {Object} props
 * @param {number} props.count - Number of AI mentions detected
 */
export function Counter({ count }) {
  return (
    <div className="counter">
      <div className="counter-value">{count}</div>
      <div className="counter-label">
        {count === 1 ? '"AI" mention' : '"AI" mentions'}
      </div>
    </div>
  );
}
