/**
 * Sleek loading spinner component with agricultural accents.
 * 
 * @param {Object} props
 * @param {string} [props.message] - Optional message beneath spinner
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Spinner size
 * @param {boolean} [props.fullPage=false] - Whether to center on entire page
 */
const Spinner = ({ message = 'Loading...', size = 'medium', fullPage = false }) => {
  const containerClass = fullPage ? 'spinner-full-page' : 'spinner-container';

  return (
    <div className={containerClass}>
      <div className={`spinner-ring spinner-${size}`}>
        <div className="spinner-inner-circle"></div>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default Spinner;
