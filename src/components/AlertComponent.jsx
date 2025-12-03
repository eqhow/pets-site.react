import React, { useContext } from 'react';
import { AlertContext } from '../App';

function AlertComponent() {
  const { alerts } = useContext(AlertContext);

  if (alerts.length === 0) return null;

  return (
    <div className="alert-container" id="alert-container">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`alert alert-${alert.type} alert-dismissible fade show`}
          role="alert"
        >
          {alert.message}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          />
        </div>
      ))}
    </div>
  );
}

export default AlertComponent;