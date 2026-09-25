const EquipmentIcon = ({ icon, alt = '', className = '', style = {} }) => {
  if (!icon) return null;

  if (
    typeof icon === 'string' &&
    (icon.startsWith('/') ||
      icon.startsWith('http') ||
      icon.endsWith('.svg') ||
      icon.endsWith('.png'))
  ) {
    return (
      <img
        src={icon}
        alt={alt || 'Equipment Icon'}
        className={`equip-img-icon ${className}`.trim()}
        style={{
          width: '1em',
          height: '1em',
          objectFit: 'contain',
          verticalAlign: '-0.12em',
          display: 'inline-block',
          ...style,
        }}
      />
    );
  }

  return <span className={className} style={style}>{icon}</span>;
};

export default EquipmentIcon;
