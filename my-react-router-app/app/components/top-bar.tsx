import { useLocation } from "react-router";
import { Icon } from "./icon";

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/transactions": "Transactions",
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

  return (
    <header className="top-bar">
      <button aria-label="Open navigation" className="mobile-menu-button" onClick={onMenuClick}>
        <Icon name="menu" />
      </button>
      <div className="top-heading">
        <p className="welcome-line">Welcome back, Shawn <span>✦</span></p>
        <h1>{title}</h1>
      </div>
      <div className="top-actions">
        <label className="search-box">
          <Icon name="search" />
          <input aria-label="Search" placeholder="Search anything..." type="search" />
          <kbd>⌘ K</kbd>
        </label>
        <button aria-label="Notifications" className="notification-button">
          <Icon name="bell" />
          <span />
        </button>
        <button aria-label="Open Shawn Mendes's profile" className="profile-button">
          <span className="avatar">S</span>
          <span className="profile-name">Shawn Mendes</span>
          <Icon className="profile-chevron" name="chevron" />
        </button>
      </div>
    </header>
  );
}