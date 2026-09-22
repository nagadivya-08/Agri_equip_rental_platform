import Loader from './Loader';

/**
 * Universal animated agricultural truck loader used across the entire platform.
 * Delegates to the custom animated truck loader with customizable messages and captions.
 * 
 * @param {Object} props
 * @param {string} [props.message='Loading...'] - Status caption beneath truck loader
 * @param {string} [props.submessage] - Secondary subcaption
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Size hint (optional)
 * @param {boolean} [props.fullPage=false] - Whether to center on full viewport
 */
const Spinner = ({
  message = 'Loading verified agricultural equipment...',
  submessage = 'Connecting to AgriRent machinery network...',
  size = 'medium',
  fullPage = false,
}) => {
  return (
    <Loader
      message={message}
      submessage={submessage}
      fullPage={fullPage}
    />
  );
};

export default Spinner;
