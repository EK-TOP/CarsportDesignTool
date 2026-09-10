import PropTypes from 'prop-types';

const zoneForCategory = {
  aerodynamics: 'rear-aero',
  wheels: 'wheels'
};

export function ConfigurationPanel({ parts, placements, onToggle, onSave, saving, result }) {
  return <section className="configuration-options">
    <h3>Compatible parts</h3>
    {parts.map((part) => {
      const selected = placements.some((placement) => placement.partId === part.id);
      return <label className="part-option" key={part.id}>
        <input type="checkbox" checked={selected} onChange={() => onToggle(part.id, zoneForCategory[part.category])} />
        <span>{part.name}<small>{part.category} · €{(part.priceCents / 100).toFixed(2)}</small></span>
      </label>;
    })}
    <button type="button" disabled={saving} onClick={onSave}>{saving ? 'Validating...' : 'Save configuration'}</button>
    {result && <div className={`validation-result ${result.valid ? 'validation-valid' : 'validation-error'}`}>
      <strong>{result.valid ? 'Configuration is valid' : 'Configuration needs attention'}</strong>
      {result.warnings.map((item) => <p key={item.code}>Warning: {item.message}</p>)}
      {result.errors.map((item) => <p key={item.code}>Error: {item.message}</p>)}
    </div>}
  </section>;
}

ConfigurationPanel.propTypes = {
  parts: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, name: PropTypes.string.isRequired, category: PropTypes.string.isRequired, priceCents: PropTypes.number.isRequired })).isRequired,
  placements: PropTypes.arrayOf(PropTypes.shape({ partId: PropTypes.string.isRequired, zoneCode: PropTypes.string.isRequired })).isRequired,
  onToggle: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  result: PropTypes.shape({ valid: PropTypes.bool.isRequired, warnings: PropTypes.array.isRequired, errors: PropTypes.array.isRequired })
};
