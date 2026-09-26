import { NavLink } from "react-router";
import { Icon } from "./icon";

const walletLinks = [
  { label: "Home", to: "/", icon: "home" },
  { label: "Transactions", to: "/transactions", icon: "receipt" },
  { label: "Card", to: "/card", icon: "card" },
  { label: "Insights", to: "/insights", icon: "chart" },
  { label: "Recipient", to: "/recipient", icon: "users" },
] as const;

const paymentLinks = [
  { label: "Scheduled", to: "/scheduled", icon: "calendar" },
  { label: "Payment Request", to: "/payment-request", icon: "send" },
  { label: "Invoicing", to: "/invoicing", icon: "file" },
] as const;

type SidebarProps = { open: boolean; onClose: () => void };

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
          <span className="brand-mark">C</span>
          <span>cash<span className="brand-light">sync</span></span>
        </NavLink>
        <nav aria-label="Main navigation" className="side-navigation">
          <p className="nav-section-title">WALLET</p>
          <ul className="nav-list">
            {walletLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                  end={item.to === "/"}
                  onClick={onClose}
                  to={item.to}
                >
                  <Icon className="nav-icon" name={item.icon} />
                  <span>{item.label}</span>
                  {item.label === "Transactions" && <span className="nav-count">4</span>}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="nav-section-title payment-title">PAYMENT</p>
          <ul className="nav-list">
            {paymentLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
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
        <div className="sidebar-footer">
          <span className="security-dot" />
          <div><strong>All systems secure</strong><span>Your money is protected</span></div>
        </div>
      </aside>
    </>
  );
}