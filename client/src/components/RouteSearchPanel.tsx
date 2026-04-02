import { useState } from "react";
import { useRouteSearch } from "../hooks/useRouteSearch";
import type { BusRoute } from "../types";

interface RouteSearchPanelProps {
  onSelectRoute: (route: BusRoute) => void;
  selectedRouteId: string | null;
}

export function RouteSearchPanel({ onSelectRoute, selectedRouteId }: RouteSearchPanelProps) {
  const [input, setInput] = useState("");
  const { routes, isLoading, error, search } = useRouteSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(input);
  };

  return (
    <div className="search-panel">
      <h1 className="panel-title">Poolbus</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="노선번호 (예: 360)"
          className="search-input"
        />
        <button type="submit" disabled={isLoading} className="search-btn">
          {isLoading ? "검색 중..." : "검색"}
        </button>
      </form>

      {error && <p className="search-error">{error}</p>}

      <ul className="route-list">
        {routes.map((route) => (
          <li
            key={route.routeid}
            role="button"
            tabIndex={0}
            className={`route-item ${selectedRouteId === route.routeid ? "selected" : ""}`}
            onClick={() => onSelectRoute(route)}
            onKeyDown={(e) => { if (e.key === "Enter") onSelectRoute(route); if (e.key === " ") { e.preventDefault(); onSelectRoute(route); } }}
          >
            <span className="route-no">{route.routeno}</span>
            <span className="route-type">{route.routetp}</span>
            <span className="route-terminals">
              {route.startnodenm} → {route.endnodenm}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
