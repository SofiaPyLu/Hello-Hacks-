import { useState } from "react";
import { useLocation } from "react-router";
import { Icon } from "./icon";

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/transactions": "Transactions",
  "/ledger": "Ledger",
  "/insights": "Insights",
  
  "/scheduled": "Scheduled payments",
  "/payment-request": "Payment requests",
  "/invoicing": "Invoicing",
  "/forecast": "Forecasting",
  "/scenarios": "Scenarios",
  "/cash-gap": "Cash Gap",
};

type TopBarProps = { onMenuClick: () => void };

export function TopBar({ onMenuClick }: TopBarProps) {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? "Overview";
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-bar">
      <button aria-label="Open navigation" className="mobile-menu-button" onClick={onMenuClick}>
        <Icon name="menu" />
      </button>
      <div className="top-heading">
        <p className="welcome-line">EZ Money</p>
        <h1>{title}</h1>
      </div>
      <div className="top-actions">
        <label className="search-box">
          <Icon name="search" />
          <input aria-label="Search" placeholder="Search anything..." type="search" />
          <kbd>⌘ K</kbd>
        </label>
        <div className="notification-wrap">
          <button
            aria-controls="notification-message"
            aria-expanded={showNotifications}
            aria-label="Notifications"
            className="notification-button"
            onClick={() => setShowNotifications((visible) => !visible)}
            type="button"
          >
            <Icon name="bell" />
          </button>
          {showNotifications ? (
            <div className="notification-message" id="notification-message" role="status">
              No notifications for now
            </div>
          ) : null}
        </div>
        <button aria-label="Open Shawn Mendes's profile" className="profile-button">
          <span className="avatar">S</span>
          <span className="profile-name">Shawn Mendes</span>
          <Icon className="profile-chevron" name="chevron" />
        </button>
      </div>
    </header>
  );
}
