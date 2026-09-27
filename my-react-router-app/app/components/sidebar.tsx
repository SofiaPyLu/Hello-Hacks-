import { NavLink } from "react-router";
import { Icon } from "./icon";
import ezMoneyLogo from "../../src/assets/gemini-logo.png";

const walletLinks = [
  { label: "Home", to: "/", icon: "home" },
  { label: "Transactions", to: "/transactions", icon: "receipt" },
  { label: "Ledger", to: "/ledger", icon: "table" },
  { label: "Insights", to: "/insights", icon: "chart" },

] as const;

const paymentLinks = [
  { label: "Scheduled", to: "/scheduled", icon: "calendar" },
  { label: "Forecast", to: "/forecast", icon: "chart" },
] as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <button
        aria-label="Close navigation"
        className={`sidebar-backdrop${open ? " is-visible" : ""}`}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />

      <aside className={`sidebar${open ? " is-open" : ""}`}>
        <NavLink className="brand-lockup" onClick={onClose} to="/">
          <img
            className="sidebar-brand-logo"
            src={ezMoneyLogo}
            alt="EZ Money logo"
          />
        </NavLink>

        <nav aria-label="Main navigation" className="side-navigation">
          <p className="nav-section-title">MONEY MANAGEMENT</p>
          <ul className="nav-list">
            {walletLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link${isActive ? " is-active" : ""}`
                  }
                  end={item.to === "/"}
                  onClick={onClose}
                  to={item.to}
                >
                  <Icon className="nav-icon" name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="nav-section-title payment-title">FORECASTING</p>
          <ul className="nav-list">
            {paymentLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link${isActive ? " is-active" : ""}`
                  }
                  onClick={onClose}
                  to={item.to}
                >
                  <Icon className="nav-icon" name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

      </aside>
    </>
  );
}